import { fetchChatResponse } from "@/components/chat/chat-helpers"
import { Chunk } from "@/components/interfaces"
import {
  buildFinalMessages,
  buildGoogleGeminiFinalMessages
} from "@/lib/build-prompt"
import { openapiToFunctions } from "@/lib/openapi-conversion"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Tables } from "@/supabase/types"
import { ChatMessage, ChatPayload, ChatSettings, LLM } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { fi } from "date-fns/locale"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

const serverUrl = process.env.NOCODE_SERVER
const token = process.env.NOCODE_SERVER_TOKEN

function removeDuplicateChunks(chunks: Chunk[]) {
  const uniqueChunks = new Map()
  for (const chunk of chunks) {
    uniqueChunks.set(chunk.id, chunk)
  }
  return Array.from(uniqueChunks.values())
}

export async function POST(request: Request) {
  const json = await request.json()
  const {
    chatSettings,
    messages,
    selectedTools,
    modelData,
    profile,
    payload,
    newAbortController,
    setIsGenerating,
    setChatMessages
  } = json as {
    chatSettings: ChatSettings
    messages: any[]
    selectedTools: Tables<"tools">[]
    modelData: LLM
    profile: Tables<"profiles">
    payload: ChatPayload
    newAbortController: AbortController
    setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  }
  console.log("payload", payload)
  try {
    let sources: Chunk[] = []

    let allTools: OpenAI.Chat.Completions.ChatCompletionTool[] = []
    let allRouteMaps = {}
    let schemaDetails = []

    for (const selectedTool of selectedTools) {
      try {
        const convertedSchema = await openapiToFunctions(
          JSON.parse(selectedTool.schema as string)
        )
        console.log("trying " + selectedTool.name)
        console.log(JSON.stringify(convertedSchema))
        console.log(convertedSchema.functions[0].function)
        console.log(
          convertedSchema.functions[0].function.parameters.properties
            .requestBody
        )
        const tools = convertedSchema.functions || []
        allTools = allTools.concat(tools)

        const routeMap = convertedSchema.routes.reduce(
          (map: Record<string, string>, route) => {
            map[route.path.replace(/{(\w+)}/g, ":$1")] = route.operationId
            return map
          },
          {}
        )

        allRouteMaps = { ...allRouteMaps, ...routeMap }

        schemaDetails.push({
          title: convertedSchema.info.title,
          description: convertedSchema.info.description,
          url: convertedSchema.info.server,
          headers: selectedTool.custom_headers,
          routeMap,
          requestInBody: convertedSchema.routes[0].requestInBody
        })
      } catch (error: any) {
        console.error("Error converting schema", error)
      }
    }
    console.log(messages)
    console.log("allTools", allTools)

    const apiURL = `${serverUrl}/completion/firstresponse`
    const firstResponse = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        include_sources: true,
        stream: false,
        messages: messages,
        tools: allTools
      })
    })
    const firstResponseJson = await firstResponse.json()
    console.log("firstResponseJson", firstResponseJson)
    console.log("firstResponseJson.choices is ", firstResponseJson.choices)
    console.log(typeof firstResponseJson.choices)
    const firstChoice = firstResponseJson.choices[0]
    console.log("firstResponseJson.choices[0] is ", firstChoice)
    //@ts-ignore
    const message = firstChoice.message
    console.log("message", message)
    messages.push(message)
    //console.log(message)
    const toolCalls = message.tool_calls || []

    if (toolCalls.length === 0) {
      console.log("no tool calls")
      return new Response(message.content, {
        headers: {
          "Content-Type": "application/json"
        }
      })
    }
    let data = {}
    if (toolCalls.length > 0) {
      console.log("I will call " + toolCalls.length + " tools")
      for (const toolCall of toolCalls) {
        const functionCall = toolCall.function
        const functionName = functionCall.name
        console.log("moving on calling " + functionName)
        const argumentsString = toolCall.function.arguments.trim()
        const parsedArgs = JSON.parse(argumentsString)

        // Find the schema detail that contains the function name
        const schemaDetail = schemaDetails.find(detail =>
          Object.values(detail.routeMap).includes(functionName)
        )

        if (!schemaDetail) {
          throw new Error(`Function ${functionName} not found in any schema`)
        }

        const pathTemplate = Object.keys(schemaDetail.routeMap).find(
          key => schemaDetail.routeMap[key] === functionName
        )

        if (!pathTemplate) {
          throw new Error(`Path for function ${functionName} not found`)
        }

        const path = pathTemplate.replace(/:(\w+)/g, (_, paramName) => {
          const value = parsedArgs.parameters[paramName]
          if (!value) {
            throw new Error(
              `Parameter ${paramName} not found for function ${functionName}`
            )
          }
          return encodeURIComponent(value)
        })

        if (!path) {
          throw new Error(`Path for function ${functionName} not found`)
        }

        // Determine if the request should be in the body or as a query
        const isRequestInBody = schemaDetail.requestInBody

        if (isRequestInBody) {
          // If the type is set to body
          let headers = {
            "Content-Type": "application/json"
          }

          // Check if custom headers are set
          const customHeaders = schemaDetail.headers // Moved this line up to the loop
          // Check if custom headers are set and are of type string
          if (customHeaders && typeof customHeaders === "string") {
            let parsedCustomHeaders = JSON.parse(customHeaders) as Record<
              string,
              string
            >

            headers = {
              ...headers,
              ...parsedCustomHeaders
            }
          }

          const fullUrl = schemaDetail.url + path
          console.log("full url " + fullUrl)

          //console.log("calling " + fullUrl)

          const bodyContent = parsedArgs.requestBody || parsedArgs

          console.log(bodyContent)

          const requestInit = {
            method: "POST",
            headers,
            body: JSON.stringify(bodyContent) // Use the extracted requestBody or the entire parsedArgs
          }

          const response = await fetch(fullUrl, requestInit)
          console.log(
            "##################################GOT RESPONSE FROM POST TOOL!"
          )

          if (!response.ok) {
            data = {
              error: response.statusText
            }
            //console.log(data)
          } else {
            data = await response.json()
          }
          console.log(data)
        } else {
          // If the type is set to query
          const queryParams = new URLSearchParams(
            parsedArgs.parameters
          ).toString()
          const fullUrl =
            schemaDetail.url + path + (queryParams ? "?" + queryParams : "")

          let headers = {}

          // Check if custom headers are set
          const customHeaders = schemaDetail.headers
          if (customHeaders && typeof customHeaders === "string") {
            headers = JSON.parse(customHeaders)
          }

          const response = await fetch(fullUrl, {
            method: "GET",
            headers: headers
          })

          console.log("GOT RESPONSE FROM GET TOOL")
          if (!response.ok) {
            data = {
              error: response.statusText
            }
          } else {
            data = await response.json()
          }
        }

        if (Array.isArray(data) && data.length > 0 && data[0].file_id) {
          sources = sources.concat(data)
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(data)
        })
      }
    }
    const provider =
      modelData.provider === "openai" && profile.use_azure_openai
        ? "azure"
        : modelData.provider

    let formattedMessages = []

    /*  if (provider === "google") {
      formattedMessages = await buildGoogleGeminiFinalMessages(
        payload,
        profile,
        []
      )
    } else {
      formattedMessages = await buildFinalMessages(payload, profile, [])
    }
 */
    const apiEndpoint =
      "http://localhost:3000" +
      (provider === "custom" ? "/api/chat/custom" : `/api/chat/${provider}`)

    const requestBody = {
      chatSettings: payload.chatSettings,
      messages: messages,
      customModelId: provider === "custom" ? modelData.hostedId : ""
    }
    console.log("apiEndpoint=" + apiEndpoint)
    const response = await fetchChatResponse(
      apiEndpoint,
      requestBody,
      true,
      newAbortController,
      setIsGenerating,
      setChatMessages
    )
    /*     const secondResponse = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      stream: true
    })

    const stream = OpenAIStream(secondResponse)

    const response = new StreamingTextResponse(stream) */
    //console.log(response)

    if (sources.length > 0) {
      console.log("sending sources")
      const uniqueSources = removeDuplicateChunks(sources)
      const serializedArray = JSON.stringify(uniqueSources)
      const base64EncodedArray = Buffer.from(serializedArray).toString("base64")
      response.headers.set("fileitems", base64EncodedArray)
    }
    console.log("returning response")
    return response
  } catch (error: any) {
    console.log(error)
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
