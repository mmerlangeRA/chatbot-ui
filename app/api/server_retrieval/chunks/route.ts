const serverUrl = process.env.NOCODE_SERVER
const token = process.env.NOCODE_SERVER_TOKEN
const apiURL = `${serverUrl}/rag/file_items_from_file`

export async function POST(request: Request) {
  const json = await request.json()

  const { url, file_id, embeddingsProvider, user_id } = json as {
    url: string
    file_id: string
    embeddingsProvider: "openai" | "local"
    user_id: string
  }
  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ url, file_id, embeddingsProvider, user_id })
    })
    const results = await response.json()
    return new Response(JSON.stringify({ results: results }), {
      status: 200
    })
  } catch (error: any) {
    console.log(error)
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
