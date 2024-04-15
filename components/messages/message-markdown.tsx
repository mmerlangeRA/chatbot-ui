import React, { FC, useContext, useEffect } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { MessageCodeBlock } from "./message-codeblock"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
import rehypeRaw from "rehype-raw"

interface MessageMarkdownProps {
  content: string
}

function _formatChunkSources(inputString: string): string {
  let index = 1 // Start index from 1 or 0 as per your requirement
  const regex = /<<([^>]*)>>/g // Simplified and corrected regex for matching <<id>>

  const modified = inputString.replace(regex, (match, id) => {
    const replacement = `<a href="#" data-chunk-id="${id}" class="references">${index}</a>`
    index++ // Increment the index for the next match
    return replacement
  })

  return modified
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
  const formattedContent = _formatChunkSources(content)

  return (
    <MessageMarkdownMemoized
      className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw] as any}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        img({ node, ...props }) {
          return <img className="max-w-[67%]" {...props} />
        },
        code({ node, className, children, ...props }) {
          const childArray = React.Children.toArray(children)
          const firstChild = childArray[0] as React.ReactElement
          const firstChildAsString = React.isValidElement(firstChild)
            ? (firstChild as React.ReactElement).props.children
            : firstChild

          if (firstChildAsString === "▍") {
            return <span className="mt-1 animate-pulse cursor-default">▍</span>
          }

          if (typeof firstChildAsString === "string") {
            childArray[0] = firstChildAsString.replace("`▍`", "▍")
          }

          const match = /language-(\w+)/.exec(className || "")

          if (
            typeof firstChildAsString === "string" &&
            !firstChildAsString.includes("\n")
          ) {
            return (
              <code className={className} {...props}>
                {childArray}
              </code>
            )
          }

          return (
            <MessageCodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(childArray).replace(/\n$/, "")}
              {...props}
            />
          )
        }
      }}
    >
      {formattedContent}
    </MessageMarkdownMemoized>
  )
}
