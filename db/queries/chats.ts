"use server"

import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { InsertChat, SelectChat, chats } from "../schema/chats"

export const getChatById = async (id: string): Promise<SelectChat> => {
  try {
    const result = await db.select().from(chats).where(eq(chats.id, id))
    return result[0]
  } catch (error) {
    console.error(`Error fetching chat with id ${id}:`, error)
    throw error
  }
}

export const getAllChatsByProfileId = async (
  profileId: string
): Promise<SelectChat[]> => {
  try {
    return await db
      .select()
      .from(chats)
      .where(eq(chats.profileId, profileId))
      .orderBy(desc(chats.createdAt))
  } catch (error) {
    console.error("Error fetching all chats:", error)
    throw error
  }
}

export const createChat = async (chatData: InsertChat): Promise<SelectChat> => {
  try {
    const result = await db.insert(chats).values(chatData).returning()
    revalidatePath("/")
    return result[0]
  } catch (error) {
    console.error("Error creating chat:", error)
    throw error
  }
}

export const updateChat = async (
  id: string,
  updateData: Partial<InsertChat>
): Promise<SelectChat[]> => {
  try {
    const result = await db
      .update(chats)
      .set(updateData)
      .where(eq(chats.id, id))
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error(`Error updating chat with id ${id}:`, error)
    throw error
  }
}

export const deleteChat = async (id: string): Promise<SelectChat[]> => {
  try {
    const result = await db.delete(chats).where(eq(chats.id, id)).returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error(`Error deleting chat with id ${id}:`, error)
    throw error
  }
}
