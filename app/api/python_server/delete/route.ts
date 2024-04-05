import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database, Tables } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serverUrl = process.env.NOCODE_SERVER
const token = process.env.NOCODE_SERVER_TOKEN
const apiURL = `${serverUrl}/rag/delete_chunks_by_file_id/`

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file_id = formData.get("file_id") as string

    const response = await fetch(apiURL + file_id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    return new NextResponse("Delete Successful", {
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
