import { Chunk } from "@/components/interfaces"
import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert } from "@/supabase/types"

const serverUrl = "http://127.0.0.1:8001/v1"
const token = process.env.NOCODE_SERVER_TOKEN
const apiURL = `${serverUrl}/rag/get_chunk`

export const getChunk = async (chunk_id: string) => {
  console.log("getChunk")
  const raw = await fetch(`${apiURL}/${chunk_id}`)
  const responses = await raw.json()
  const pageContent = responses.documents[0]
  const metadata = responses.metadatas[0]
  console.log(metadata)
  const chunk: Chunk = {
    content: pageContent,
    file_id: metadata["file_id"],
    id: metadata["id"],
    page: metadata["page"] || 0
  }

  return chunk
}

export const getMessageFileItemsByMessageId = async (messageId: string) => {
  const { data: messageFileItems, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      message_file_items (*)
    `
    )
    .eq("id", messageId)
    .single()

  if (!messageFileItems) {
    throw new Error(error.message)
  }
  //@ts-ignore
  messageFileItems.file_items = []
  messageFileItems.message_file_items.forEach(async m => {
    const chunk = await getChunk(m.file_item_id)
    console.log(chunk)
    //@ts-ignore
    messageFileItems.file_items.push(chunk)
  })

  return messageFileItems
}

export const createMessageFileItems = async (
  messageFileItems: TablesInsert<"message_file_items">[]
) => {
  const { data: createdMessageFileItems, error } = await supabase
    .from("message_file_items")
    .insert(messageFileItems)
    .select("*")

  if (!createdMessageFileItems) {
    throw new Error(error.message)
  }

  return createdMessageFileItems
}
