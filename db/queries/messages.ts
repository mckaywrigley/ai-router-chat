"use server"

import { and, eq, gte, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { InsertMessage, SelectMessage, messages } from "../schema/messages"

export const getMessagesByChatId = async (
  chatId: string
): Promise<SelectMessage[]> => {
  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.turn)
  } catch (error) {
    console.error(`Error fetching messages for chatId ${chatId}:`, error)
    throw error
  }
}

export const createMessage = async (
  messageData: InsertMessage
): Promise<SelectMessage> => {
  try {
    const result = await db.insert(messages).values(messageData).returning()
    revalidatePath("/")
    return result[0]
  } catch (error) {
    console.error("Error creating message:", error)
    throw error
  }
}

export const updateMessage = async (
  id: string,
  updateData: Partial<InsertMessage>
): Promise<SelectMessage[]> => {
  try {
    const result = await db
      .update(messages)
      .set(updateData)
      .where(eq(messages.id, id))
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error(`Error updating message with id ${id}:`, error)
    throw error
  }
}

export const deleteMessage = async (id: string) => {
  try {
    await db.delete(messages).where(eq(messages.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting message with id ${id}:`, error)
    throw error
  }
}

export const deleteMessagesIncludingAndAfterTurn = async (
  chatId: string,
  turn: number
) => {
  try {
    await db
      .delete(messages)
      .where(and(eq(messages.chatId, chatId), gte(messages.turn, turn)))
      .returning()
    revalidatePath("/")
  } catch (error) {
    console.error(
      `Error deleting messages for chatId ${chatId} starting from turn ${turn}:`,
      error
    )
    throw error
  }
}

export const deleteRegeneratedMessages = async (
  chatId: string,
  turn: number
) => {
  try {
    await db
      .delete(messages)
      .where(and(eq(messages.chatId, chatId), inArray(messages.turn, [turn])))
      .returning()
    revalidatePath("/")
  } catch (error) {
    console.error(
      `Error deleting messages for chatId ${chatId} with turn ${turn} or ${turn - 1}:`,
      error
    )
    throw error
  }
}

export const getMessagesByChatIdAndTurn = async (
  chatId: string,
  turn: number
): Promise<SelectMessage[]> => {
  try {
    return await db
      .select()
      .from(messages)
      .where(and(eq(messages.chatId, chatId), eq(messages.turn, turn)))
  } catch (error) {
    console.error(
      `Error fetching messages for chatId ${chatId} with turn ${turn}:`,
      error
    )
    throw error
  }
}

export const updateTurnPreferences = async (
  chatId: string,
  turn: number,
  changes: { id: string; isPreferred: boolean }[]
) => {
  try {
    const updatePromises = changes.map(({ id, isPreferred }) =>
      db
        .update(messages)
        .set({ isPreferred })
        .where(
          and(
            eq(messages.chatId, chatId),
            eq(messages.turn, turn),
            eq(messages.id, id)
          )
        )
        .returning()
    )
    const results = await Promise.all(updatePromises)
    revalidatePath("/")
    return results.flat()
  } catch (error) {
    console.error(
      `Error updating turn preferences for chatId ${chatId} with turn ${turn}:`,
      error
    )
    throw error
  }
}
