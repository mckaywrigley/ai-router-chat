"use client"

import { updateTurnPreferenceAction } from "@/actions/messages"
import { updateProfile } from "@/db/queries/profiles"
import { SelectMessage } from "@/db/schema/messages"
import { AppContext } from "@/lib/context/app-context"
import { cn } from "@/lib/utils"
import { BotIcon } from "lucide-react"
import { FC, HTMLAttributes, useContext } from "react"
import { CopyMessage } from "./copy-message"
import { MessageFeedback } from "./message-feedback"
import { MessageMarkdown } from "./message-markdown"
import { MessagePreference } from "./message-preference"
import { MessageStats } from "./message-stats"
import { RegenerateMessage } from "./regenerate-message"
import { RegenerateMessageFromModel } from "./regenerate-message-from-model"

interface AssistantMessageProps extends HTMLAttributes<HTMLDivElement> {
  message: SelectMessage
  isLast: boolean
  isGenerating: boolean
  turnHasPreferenceSelection: boolean
  sessionId: string | null
  onFeedbackUpdate: (messageId: string, thumbsUp: boolean) => void
  onPreferenceUpdate: (messageId: string) => void
  onRegenerate: (modelId: string) => void
}

export const AssistantMessage: FC<AssistantMessageProps> = ({
  message,
  isLast,
  isGenerating,
  turnHasPreferenceSelection,
  sessionId,
  onFeedbackUpdate,
  onPreferenceUpdate,
  onRegenerate,
  ...props
}) => {
  const isArenaMessage = message.arenaMessage
  const isPreferred = message.isPreferred
  const needsPreferenceSelection = isArenaMessage && !turnHasPreferenceSelection

  const { profile, setProfile } = useContext(AppContext)

  const handlePreference = async () => {
    if (!profile) return

    if (needsPreferenceSelection && profile.routerProgress < 10) {
      setProfile({ ...profile, routerProgress: profile.routerProgress + 1 })
      await updateProfile(profile.id, {
        ...profile,
        routerProgress: profile.routerProgress + 1
      })
    }

    onPreferenceUpdate(message.id)
    await updateTurnPreferenceAction(message.chatId, message.id, message.turn)
  }

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isArenaMessage && "w-1/2 rounded-xl border p-4",
        isPreferred && "border-black",
        isArenaMessage && isPreferred === false && "opacity-50",
        needsPreferenceSelection && "cursor-pointer border hover:border-black",
        props.className
      )}
      onClick={() => {
        if (needsPreferenceSelection) {
          handlePreference()
        }
      }}
    >
      {!isArenaMessage && (
        <BotIcon className="min-h-7 min-w-7 rounded-full border p-1" />
      )}

      <div className="flex w-full flex-col gap-1">
        <MessageMarkdown content={message.content} />

        <div className="min-h-7">
          {isGenerating || needsPreferenceSelection ? (
            <div></div>
          ) : (
            <div className="flex gap-2">
              <CopyMessage content={message.content} />
              {isLast && !isArenaMessage && (
                <RegenerateMessage
                  onRegenerate={() => onRegenerate(message.model)}
                />
              )}
              {isLast && !isArenaMessage && (
                <RegenerateMessageFromModel
                  currentModel={message.model}
                  onRegenerateFromModel={onRegenerate}
                />
              )}
              {!isArenaMessage && (
                <MessageFeedback
                  messageId={message.id}
                  thumbsUp={message.thumbsUp}
                  sessionId={sessionId}
                  provider={{
                    model: message.model,
                    provider: message.provider
                  }}
                  onFeedbackUpdate={onFeedbackUpdate}
                />
              )}

              {isArenaMessage && !needsPreferenceSelection && !isPreferred && (
                <MessagePreference
                  messageId={message.id}
                  onChangePreference={handlePreference}
                />
              )}
            </div>
          )}
        </div>

        {(!isGenerating || !isLast) &&
          (!isArenaMessage ||
            (isArenaMessage && turnHasPreferenceSelection)) && (
            <>
              <hr className="my-1" />
              <MessageStats
                modelId={message.model}
                latency={message.latency}
                cost={message.cost}
              />
            </>
          )}
      </div>
    </div>
  )
}
