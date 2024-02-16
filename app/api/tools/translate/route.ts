import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

const DEEPL_KEY = process.env.DEEPL_KEY

export async function GET() {
  return new Response(JSON.stringify({ message: "hello" }))
}

const chatSettings = {
  model: "gpt-3.5-turbo-0125"
}

export async function POST(request: Request) {
  const json = await request.json()
  const { parameters } = json as {
    parameters: {
      text: string
      language: string
    }
  }
  const language = parameters.language as string
  const textToTranslate = parameters.text as string
  console.log("text=" + textToTranslate)
  console.log("language=" + language)
  if (language !== "it") {
    const profile = await getServerProfile()
    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })
    const messages = [
      {
        role: "user",
        content:
          "Translate the following text into " +
          language +
          " Just return the translation. The text is " +
          textToTranslate
      }
    ]

    const firstResponse = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: 0,
      max_tokens: chatSettings.model === "gpt-4-vision-preview" ? 4096 : null, // TODO: Fix
      stream: false
    })
    const message = firstResponse.choices[0].message
    return new Response(JSON.stringify({ translation: message }), {
      status: 200
    })
  }
  try {
    const headers = {
      Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }

    const body = new URLSearchParams()
    body.append("text", textToTranslate)
    body.append("target_lang", language.toUpperCase())

    const requestForTask = await fetch(
      "https://api-free.deepl.com/v2/translate",
      {
        method: "POST",
        headers: headers,
        body: body
      }
    )

    const response = await requestForTask.json()
    const text = response.translations[0].text

    return new Response(JSON.stringify({ translation: text }), {
      status: 200
    })
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
