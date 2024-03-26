import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })
    const isStream = true
    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens: chatSettings.model === "gpt-4-vision-preview" ? 4096 : null, // TODO: Fix
      stream: true
    })
    /*  const isStream = true
    const WS = new WebSocket("ws://localhost:8001/ws");
    const response = await fetch("http://localhost:8001/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTk1Nzk5NzQsImlhdCI6MTcxMDkzOTk3NCwic2NvcGUiOnsibW9kZWxzIjpbImdwdC0zLjUtdHVyYm8iXX19.guWlEHOW2YNdvJjueLWWDHwBNFz3iNv3I9ABHR7klww`
      },
      body: JSON.stringify({
        model: chatSettings.model,
        messages,
        max_tokens:
          chatSettings.model === "gpt-4-vision-preview" ? 4096 : null,
        stream: isStream
      })
    } as any) */
    if (isStream) {
      const stream = OpenAIStream(response)

      return new StreamingTextResponse(stream)
    } else {
      /*       const json = await response.json()
      console.log(json)
      const retour = json.choices[0].message.content
      console.log(retour) */
      return response
    }
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
