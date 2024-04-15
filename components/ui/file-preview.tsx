import { cn } from "@/lib/utils"
import { ChatFile, MessageImage } from "@/types"
import { IconFileFilled } from "@tabler/icons-react"
import Image from "next/image"
import { FC } from "react"
import { DrawingCanvas } from "../utility/drawing-canvas"
import { Dialog, DialogContent, DialogTitle } from "./dialog"
import { Chunk } from "../interfaces"
import { DialogDescription } from "@radix-ui/react-dialog"

interface FilePreviewProps {
  type: "image" | "file" | "file_item"
  item: ChatFile | MessageImage | Chunk
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

type Item = Chunk | ChatFile | MessageImage

function isChunk(item: any): item is Chunk {
  return item && item.file_name
}

interface Props {
  item: Item // Use the union type here
}

const MyTitle: React.FC<Props> = ({ item }) => {
  return <>{isChunk(item) && <DialogTitle>{item.file_name}</DialogTitle>}</>
}

export const FilePreview: FC<FilePreviewProps> = ({
  type,
  item,
  isOpen,
  onOpenChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex items-center justify-center outline-none",
          "border-transparent bg-transparent"
        )}
      >
        <MyTitle item={item} />
        <DialogDescription>
          {(() => {
            if (type === "image") {
              const imageItem = item as MessageImage

              return imageItem.file ? (
                <DrawingCanvas imageItem={imageItem} />
              ) : (
                <Image
                  className="rounded"
                  src={imageItem.base64 || imageItem.url}
                  alt="File image"
                  width={2000}
                  height={2000}
                  style={{
                    maxHeight: "67vh",
                    maxWidth: "67vw"
                  }}
                />
              )
            } else if (type === "file_item") {
              const fileItem = item as Chunk
              return (
                <div className="bg-background text-primary h-[50vh] min-w-[700px] overflow-auto whitespace-pre-wrap rounded-xl p-4">
                  <div>{fileItem.content}</div>
                  <hr />
                  <div>page:{fileItem.page + 1}</div>
                </div>
              )
            } else if (type === "file") {
              return (
                <div className="rounded bg-blue-500 p-2">
                  <IconFileFilled />
                </div>
              )
            }
          })()}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
