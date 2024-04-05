import { ACCEPTED_FILE_TYPES } from "@/components/chat/chat-hooks/use-select-file-handler"
import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChatbotUIContext } from "@/context/context"
import { FILE_DESCRIPTION_MAX, FILE_NAME_MAX } from "@/db/limits"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState } from "react"

interface CreateFileProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateFile: FC<CreateFileProps> = ({ isOpen, onOpenChange }) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[] | []>([])

  const handleSelectedFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return

    setSelectedFiles(Array.from(e.target.files))
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
  }

  if (!profile) return null
  if (!selectedWorkspace) return null

  return (
    <SidebarCreateItem
      contentType="batchFiles"
      createState={
        {
          files: selectedFiles,
          user_id: profile.user_id,
          name,
          description,
          file_path: "",
          size: selectedFile?.size || 0,
          tokens: 0,
          type: selectedFile?.type || 0
        } as TablesInsert<"files">
      }
      isOpen={isOpen}
      isTyping={isTyping}
      onOpenChange={onOpenChange}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>File</Label>

            <Input
              type="file"
              onChange={handleSelectedFiles}
              accept={ACCEPTED_FILE_TYPES}
              multiple
            />
          </div>
          {selectedFiles.length === 1 && (
            <div className="space-y-1">
              <Label>Name</Label>

              <Input
                placeholder="File name..."
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={FILE_NAME_MAX}
              />
            </div>
          )}
          {selectedFiles.length === 1 && (
            <div className="space-y-1">
              <Label>Description</Label>

              <Input
                placeholder="File description..."
                value={name}
                onChange={e => setDescription(e.target.value)}
                maxLength={FILE_DESCRIPTION_MAX}
              />
            </div>
          )}
        </>
      )}
    />
  )
}
