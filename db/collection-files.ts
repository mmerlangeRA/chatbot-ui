import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert } from "@/supabase/types"

export const getCollectionFilesByCollectionId = async (
  collectionId: string
) => {
  console.log("collectionId", collectionId)
  const { data: collectionFiles, error } = await supabase
    .from("collections")
    .select(
      `
        id, 
        name, 
        files ( id, name, type )
      `
    )
    .eq("id", collectionId)
    .single()

  if (!collectionFiles) {
    console.log("NO collectionFiles")
    throw new Error(error.message)
  }
  console.log("collectionFiles", collectionFiles)
  return collectionFiles
}

export const getCollectionFileIdsByCollectionId = async (
  collectionId: string
) => {
  console.log("getCollectionFileIdsByCollectionId", collectionId)
  /*   const { data, error } = await supabase
    .from("collection_files")
    .select()

  console.log(data)
  console.log(error)
  const collectionFileIds = data */
  const { data: collectionFileIds, error } = await supabase
    .from("collection_files")
    .select(`file_id`)
    .eq("collection_id", collectionId)

  if (!collectionFileIds) {
    console.log("NO collectionFiles")
    throw new Error(error.message)
  }
  console.log("collectionFileIds", collectionFileIds)
  return collectionFileIds
}

export const createCollectionFile = async (
  collectionFile: TablesInsert<"collection_files">
) => {
  const { data: createdCollectionFile, error } = await supabase
    .from("collection_files")
    .insert(collectionFile)
    .select("*")

  if (!createdCollectionFile) {
    throw new Error(error.message)
  }

  return createdCollectionFile
}

export const createCollectionFiles = async (
  collectionFiles: TablesInsert<"collection_files">[]
) => {
  const { data: createdCollectionFiles, error } = await supabase
    .from("collection_files")
    .insert(collectionFiles)
    .select("*")

  if (!createdCollectionFiles) {
    throw new Error(error.message)
  }

  return createdCollectionFiles
}

export const deleteCollectionFile = async (
  collectionId: string,
  fileId: string
) => {
  const { error } = await supabase
    .from("collection_files")
    .delete()
    .eq("collection_id", collectionId)
    .eq("file_id", fileId)

  if (error) throw new Error(error.message)

  return true
}
