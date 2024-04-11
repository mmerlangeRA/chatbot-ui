import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { NextResponse } from "next/server"
const serverUrl = process.env.NOCODE_SERVER
const token = process.env.NOCODE_SERVER_TOKEN
const apiURL = `${serverUrl}/rag/ingest`

const CHATBOT_URL = process.env.CHATBOT_URL

export async function POST(req: Request) {
  try {
    const profile = await getServerProfile()

    const formData = await req.formData()

    const file_url = formData.get("file_url") as File
    const file_name = formData.get("file_name") as string
    const user_id = formData.get("user_id") as string
    const file_id = formData.get("file_id") as string
    const embeddingsProvider = formData.get("embeddingsProvider") as string

    if (embeddingsProvider === "openai") {
      if (profile.use_azure_openai) {
        checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")
      } else {
        checkApiKey(profile.openai_api_key, "OpenAI")
      }
    }

    console.log("server_process", apiURL)
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        file_url,
        file_id,
        file_name,
        embeddingsProvider,
        user_id
      })
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    /*
    url:str = Field(default=None)
    file_id:str = Field(default=None)
    embeddingsProvider:str = Field(default=None)
    user_id:str = Field(default=None)
    */
    /*     const results = await response.json()
    console.log(results) */

    return new NextResponse("Embed Successful", {
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
