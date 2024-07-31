"use client"

import { deleteChatAction } from "@/actions/chats"
import { SelectChat } from "@/db/schema/chats"
import { cn } from "@/lib/utils"
import { Ellipsis, Trash } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FC, HTMLAttributes, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"

interface ChatListItemProps extends HTMLAttributes<HTMLDivElement> {
  chat: SelectChat
}
export const ChatListItem: FC<ChatListItemProps> = ({ chat, ...props }) => {
  const pathname = usePathname()

  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(false)

  const handleDeleteChat = async () => {
    await deleteChatAction(chat.id, pathname === `/${chat.id}`)
  }

  const isCurrentPath = pathname === `/${chat.id}`

  return (
    <Link
      className={cn(
        "flex justify-between rounded p-2 hover:bg-gray-100",
        isCurrentPath ? "bg-gray-100" : "",
        props.className
      )}
      href={`/${chat.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isSelected && setIsHovered(false)}
    >
      <div className="truncate text-sm">{chat.name}</div>

      <DropdownMenu onOpenChange={open => setIsSelected(open)}>
        <DropdownMenuTrigger
          className={cn(
            "text-gray-500",
            isHovered || isSelected || isCurrentPath
              ? "opacity-100 hover:text-black"
              : "opacity-0"
          )}
        >
          <Ellipsis />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="flex justify-center"
          onClick={e => {
            e.stopPropagation()
          }}
        >
          <Button
            className="flex gap-2 text-red-500"
            variant="ghost"
            onClick={handleDeleteChat}
          >
            <Trash className="size-4" />
            Delete
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
  )
}
