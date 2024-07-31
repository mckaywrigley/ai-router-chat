"use server"

import {
  createMessage,
  deleteMessagesIncludingAndAfterTurn,
  deleteRegeneratedMessages,
  getMessagesByChatIdAndTurn,
  updateMessage,
  updateTurnPreferences
} from "@/db/queries/messages"
import { InsertMessage, SelectMessage } from "@/db/schema/messages"
import { revalidatePath } from "next/cache"
import { submitFeedback } from "./not-diamond/submit-feedback"

export const createMessageAction = async (data: InsertMessage) => {
  const newMessage = await createMessage(data)
  revalidatePath("/")
  return newMessage
}

export const updateMessageAction = async (
  messageId: string,
  updateData: Partial<InsertMessage>
) => {
  const updatedMessage = await updateMessage(messageId, updateData)
  revalidatePath("/")
  return updatedMessage
}

export const updateTurnPreferenceAction = async (
  chatId: string,
  messageId: string,
  turn: number
) => {
  const messages = await getMessagesByChatIdAndTurn(chatId, turn)
  await updateTurnPreferences(
    chatId,
    turn,
    messages.map(msg => ({ id: msg.id, isPreferred: msg.id === messageId }))
  )
  revalidatePath("/")
}

export const deleteMessagesIncludingAndAfterTurnAction = async (
  chatId: string,
  turn: number
) => {
  await deleteMessagesIncludingAndAfterTurn(chatId, turn)
  revalidatePath("/")
}

export const deleteRegeneratedMessagesAction = async (
  chatId: string,
  turn: number
) => {
  await deleteRegeneratedMessages(chatId, turn)
  revalidatePath("/")
}

export const handleBothResponsesAreBad = async ({
  messages,
  sessionId
}: {
  messages: SelectMessage[]
  sessionId: string | null
}) => {
  const promises = messages.map(async message => {
    if (sessionId) {
      await submitFeedback(sessionId, -1, {
        provider: message.provider,
        model: message.model
      })
    }

    await updateMessageAction(message.id, {
      thumbsUp: false
    })

    await updateTurnPreferences(
      message.chatId,
      message.turn,
      messages.map(msg => ({ id: msg.id, isPreferred: false }))
    )
  })

  await Promise.all(promises)
}

export const handleBothResponsesAreGood = async ({
  messages
}: {
  messages: SelectMessage[]
}) => {
  const promises = messages.map(async message => {
    await updateMessageAction(message.id, {
      thumbsUp: false
    })

    await updateTurnPreferences(
      message.chatId,
      message.turn,
      messages.map(msg => ({ id: msg.id, isPreferred: true }))
    )
  })

  await Promise.all(promises)
}
