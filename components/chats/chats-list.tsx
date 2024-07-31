import { SelectChat } from "@/db/schema/chats";
import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";
import { ChatListItem } from "./chat-list-item";

interface ChatsListProps extends HTMLAttributes<HTMLDivElement> {
  chats: SelectChat[];
}

export const ChatsList: FC<ChatsListProps> = ({ chats, ...props }) => {
  return (
    <>
      {chats.length > 0 ? (
        <div className={cn(props.className, "flex flex-col")}>
          {chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
            />
          ))}
        </div>
      ) : (
        <div className={cn(props.className, "flex h-full items-center justify-center")}>
          <div className="text-gray-500">No chats found</div>
        </div>
      )}
    </>
  );
};
