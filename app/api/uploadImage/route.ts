const serverUrl = process.env.NOCODE_SERVER

export async function POST(request: Request) {
  const data = await request.json()
  const imageUrl = await uploadImageAndGetUrl(data.dataUrl)
  return new Response(JSON.stringify({ imageUrl }))
}

async function uploadImageAndGetUrl(dataUrl: string): Promise<string> {
  const response = await fetch(serverUrl + "/uploadImage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data_url: dataUrl })
  })

  if (!response.ok) {
    throw new Error("Failed to upload image: " + (await response.text()))
  }

  const data = await response.json()
  console.log(data)
  return `${serverUrl}/static/${data.filename}`
}
