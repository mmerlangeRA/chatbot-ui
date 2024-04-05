import { generateLocalEmbedding } from "@/lib/generate-local-embedding"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const serverUrl = process.env.NOCODE_SERVER
const token = process.env.NOCODE_SERVER_TOKEN
const apiURL = `${serverUrl}/rag/query`

export async function POST(request: Request) {
  const json = await request.json()
  const { userInput, fileIds, embeddingsProvider, sourceCount } = json as {
    userInput: string
    fileIds: string[]
    embeddingsProvider: "openai" | "local"
    sourceCount: number
  }

  const uniqueFileIds = [...new Set(fileIds)]

  try {
    const profile = await getServerProfile()

    if (embeddingsProvider === "openai") {
      if (profile.use_azure_openai) {
        checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")
      } else {
        checkApiKey(profile.openai_api_key, "OpenAI")
      }
    }

    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        query: userInput,
        file_ids: uniqueFileIds,
        source_count: sourceCount
      })
    })

    const parsed = await response.json()

    let mostSimilarChunks = parsed.results
    console.log(mostSimilarChunks)
    mostSimilarChunks.forEach(element => {
      element.content = element.page_content
      element.file_id = element.metadata["file_id"]
      element.user_id = element.metadata["user_id"]
      element.id = element.metadata["id"]
      element.page = element.metadata["page"]
      delete element.page_content
      delete element.metadata
    })
    return new Response(JSON.stringify({ results: mostSimilarChunks }), {
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
