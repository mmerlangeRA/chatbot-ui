import { Tables } from "@/supabase/types"
import { ChatMessage, LLMID } from "."
import { Chunk } from "@/components/interfaces"

export interface ChatSettings {
  model: LLMID
  prompt: string
  temperature: number
  contextLength: number
  includeProfileContext: boolean
  includeWorkspaceInstructions: boolean
  embeddingsProvider: "openai" | "local"
}

export interface ChatPayload {
  chatSettings: ChatSettings
  workspaceInstructions: string
  chatMessages: ChatMessage[]
  assistant: Tables<"assistants"> | null
  messageFileItems: Chunk[]
  chatFileItems: Chunk[]
}

export interface ChatAPIPayload {
  chatSettings: ChatSettings
  messages: Tables<"messages">[]
}
