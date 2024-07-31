import { Chat } from "@/components/chats/chat"
import { getChatById } from "@/db/queries/chats"
import { getMessagesByChatId } from "@/db/queries/messages"

export const dynamic = "force-dynamic"

export default async function ChatIdPage({
  params
}: {
  params: { chatid: string }
}) {
  const chat = await getChatById(params.chatid)
  const messages = await getMessagesByChatId(params.chatid)

  return <Chat chat={chat} initialMessages={messages} />
}
