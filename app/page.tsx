import { Chat } from "@/components/chats/chat"

export const dynamic = "force-dynamic"

export default async function Home() {
  return <Chat chat={null} initialMessages={[]} />
}
