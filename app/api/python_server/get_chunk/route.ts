const serverUrl = process.env.NOCODE_SERVER
const token = process.env.NOCODE_SERVER_TOKEN
const apiURL = `${serverUrl}/rag/get_chunk`

export async function POST(request: Request) {
  const formData = await request.formData()
  const chunk_id = formData.get("chunk_id") as string
  const calledUrl = apiURL + "/" + chunk_id
  try {
    const response = await fetch(calledUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
    if (!response.ok) {
      throw new Error("Could not chunk info " + response.statusText)
    }
    console.log(response)
    const results = await response.json()
    console.log(results)
    return new Response(JSON.stringify(results), {
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
