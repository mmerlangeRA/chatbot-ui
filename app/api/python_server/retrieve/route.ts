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
  try {
    console.log("qerying with " + userInput)
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        query: userInput
      })
    })
    const { results } = await response.json()
    console.log(results)
    return new Response(JSON.stringify({ results }), {
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
