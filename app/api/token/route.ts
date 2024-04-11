import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database, Tables } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serverUrl = process.env.NOCODE_SERVER
const token = process.env.NOCODE_SERVER_TOKEN
const apiURL = `${serverUrl}/token`

export async function GET(request: Request) {
  try {
    const profile = await getServerProfile()
    const user_id = profile.id

    const body = {
      admin_key: "admin",
      user_rights: {
        models: ["gpt-3.5-turbo", "gpt-4-turbo-preview"]
      },
      user_id: user_id
    }

    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(body)
    })
    const results = await response.json()

    return new NextResponse("Got token", {
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
