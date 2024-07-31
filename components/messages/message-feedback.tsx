"use client"

import { updateMessageAction } from "@/actions/messages"
import { submitFeedback } from "@/actions/not-diamond/submit-feedback"
import { NDLLMProvider } from "@/lib/not-diamond/select-random-model"
import { cn } from "@/lib/utils"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { FC, HTMLAttributes } from "react"
import { ACTION_ICON_SIZE, MessageActionButton } from "./message-action-button"

interface MessageFeedbackProps extends HTMLAttributes<HTMLDivElement> {
  messageId: string
  thumbsUp: boolean | null
  sessionId: string | null
  provider: NDLLMProvider
  onFeedbackUpdate: (messageId: string, thumbsUp: boolean) => void
}

export const MessageFeedback: FC<MessageFeedbackProps> = ({
  messageId,
  thumbsUp,
  sessionId,
  provider,
  onFeedbackUpdate,
  ...props
}) => {
  const handleFeedback = async (thumbsUp: boolean) => {
    const thumbs = thumbsUp ? 1 : -1

    onFeedbackUpdate(messageId, thumbsUp)

    if (sessionId) {
      await submitFeedback(sessionId, thumbs, provider)
    }

    await updateMessageAction(messageId, { thumbsUp })
  }

  return (
    <div className={cn("flex items-center gap-2", props.className)}>
      <MessageActionButton
        onClick={() => handleFeedback(true)}
        icon={
          <ThumbsUp
            className={`size-${ACTION_ICON_SIZE} ${thumbsUp === true || thumbsUp === null ? "" : "opacity-25"}`}
          />
        }
        isActive={thumbsUp === true}
      />
      <MessageActionButton
        onClick={() => handleFeedback(false)}
        icon={
          <ThumbsDown
            className={`size-${ACTION_ICON_SIZE} ${thumbsUp === false || thumbsUp === null ? "" : "opacity-25"}`}
          />
        }
        isActive={thumbsUp === false}
      />
    </div>
  )
}
