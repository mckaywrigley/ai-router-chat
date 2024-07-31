"use server"

import { createChat, deleteChat } from "@/db/queries/chats"
import { InsertChat } from "@/db/schema/chats"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export const createChatAction = async (chatData: InsertChat) => {
  const chat = await createChat(chatData)
  revalidatePath("/")
  return chat
}

export const deleteChatAction = async (
  chatId: string,
  deletingCurrent: boolean
) => {
  await deleteChat(chatId)
  revalidatePath("/")
  if (deletingCurrent) {
    return redirect("/")
  }
}
