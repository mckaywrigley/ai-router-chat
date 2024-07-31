"use client";

import { SelectChat } from "@/db/schema/chats";
import { cn } from "@/lib/utils";
import { SidebarClose, SidebarOpen } from "lucide-react";
import { HTMLAttributes } from "react";
import { ChatsList } from "../chats/chats-list";
import { CreateChatButton } from "../chats/create-chat-button";
import { Button } from "../ui/button";

interface ChatsBarProps extends HTMLAttributes<HTMLDivElement> {
  chats: SelectChat[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ChatsBar = ({ chats, isOpen, onOpenChange, ...props }: ChatsBarProps) => {
  return (
    <>
      <div className={cn(`flex h-full flex-col gap-2 overflow-auto bg-gray-50 p-2 transition-transform duration-300 sm:w-auto sm:min-w-[260px] sm:max-w-[260px]`, isOpen ? "w-screen translate-x-0" : "hidden -translate-x-full", props.className)}>
        <div className="flex gap-2">
          <CreateChatButton className="h-8 w-full" />
          <Button
            className="size-8 p-2"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <SidebarClose />
          </Button>
        </div>

        <ChatsList
          className="flex-1 grow overflow-auto pb-10"
          chats={chats}
        />
      </div>

      {!isOpen && (
        <Button
          className="absolute left-2 top-2 size-8 p-2"
          size="icon"
          onClick={() => onOpenChange(true)}
        >
          <SidebarOpen />
        </Button>
      )}
    </>
  );
};
