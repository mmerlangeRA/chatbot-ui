export const runtime = "edge"

export async function GET() {
  return new Response(JSON.stringify({ message: "hello" }))
}
export async function POST(request: Request) {
  const json = await request.json()
  const { parameters } = json as {
    parameters: {
      prompt: string
    }
  }
  const prompt = parameters.prompt as string
  console.log("promppt=" + prompt)
  const apiKey =
    "aabf80a680312755e7ad40ac9b10f0cb063573fbcfbfe2438ca5fe8020419d6f"
  try {
    const requestForTask = await fetch(
      "https://api.midjourneyapi.xyz/mj/v2/imagine",
      {
        method: "POST", // Specify the method
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY":
            "aabf80a680312755e7ad40ac9b10f0cb063573fbcfbfe2438ca5fe8020419d6f" // Include API key in the headers
        },
        body: JSON.stringify({
          prompt: prompt,
          process_mode: "fast"
        }) // Convert the data to a JSON string
      }
    )
    const response = await requestForTask.json()
    console.log(response)
    const task_id = response.task_id

    const requestForImage = await fetch(
      "https://api.midjourneyapi.xyz/mj/v2/imagine",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY":
            "aabf80a680312755e7ad40ac9b10f0cb063573fbcfbfe2438ca5fe8020419d6f" // Include API key in the headers
        },
        body: JSON.stringify({
          task_id: task_id
        }) // Convert the data to a JSON string
      }
    )

    const imageResponse = await requestForImage.json()
    const imageUrl = imageResponse.task_result.image_url

    return new Response(JSON.stringify({ imageUrl: imageUrl }), {
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
