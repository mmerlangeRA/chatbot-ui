import { supabase } from "@/lib/supabase/browser-client"
import { toast } from "sonner"

export const uploadFile = async (
  file: File,
  payload: {
    name: string
    user_id: string
    file_id: string
  }
) => {
  const SIZE_LIMIT = 30000000 // 10MB

  if (file.size > SIZE_LIMIT) {
    throw new Error(`File must be less than ${SIZE_LIMIT / 1000000}MB`)
  }

  const filePath = `${payload.user_id}/${Buffer.from(payload.file_id).toString("base64")}`

  const { error } = await supabase.storage
    .from("files")
    .upload(filePath, file, {
      upsert: true
    })

  if (error) {
    console.error(`Error uploading file with path: ${filePath}`, error)
    throw new Error("Error uploading file")
  }

  return filePath
}

export const deleteFileFromStorage = async (filePath: string) => {
  const { error } = await supabase.storage.from("files").remove([filePath])

  if (error) {
    toast.error("Failed to remove file!")
    return
  }
}

export const getFileFromStorage = async (filePath: string) => {
  const expiresIn =
    parseInt(process.env.NEXT_PUBLIC_SIGNED_IN_FILE_EXPIRE_IN || "") | 86400
  const isPublicURL = process.env.NEXT_PUBLIC_FILE_URL == "true"
  if (isPublicURL) {
    const { data } = await supabase.storage.from("files").getPublicUrl(filePath)

    return data.publicUrl
  }
  const { data, error } = await supabase.storage
    .from("files")
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    throw new Error("Error downloading file")
  }
  return data.signedUrl
}
