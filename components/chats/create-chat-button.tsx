"use client";

import { AppContext } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, HTMLAttributes, useContext } from "react";
import { Button } from "../ui/button";

interface CreateChatButtonProps extends HTMLAttributes<HTMLDivElement> {}

export const CreateChatButton: FC<CreateChatButtonProps> = ({ ...props }) => {
  const { setSelectedChatId } = useContext(AppContext);

  const router = useRouter();
  const pathname = usePathname();

  return (
    <Button
      className={cn(props.className)}
      onClick={() => {
        if (pathname === "/") {
          // hack to reset messages
          setSelectedChatId(Math.random().toString());
        } else {
          router.push("/");
        }
      }}
    >
      <Plus className="mr-1.5 size-5" /> Chat
    </Button>
  );
};
