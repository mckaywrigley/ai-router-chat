"use client";

import { SelectMessage } from "@/db/schema/messages";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { Button } from "../ui/button";
import { MessageMarkdown } from "./message-markdown";

interface UserMessageProps extends HTMLAttributes<HTMLDivElement> {
  message: SelectMessage;
  onSubmitEdit: (editedMessage: SelectMessage) => void;
}

export const UserMessage: FC<UserMessageProps> = ({ message, onSubmitEdit, ...props }) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(message.content);

  const handleSubmitEdit = () => {
    onSubmitEdit({ ...message, content: inputValue });
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      onSubmitEdit({ ...message, content: inputValue });
    } else if (event.key === "Escape") {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isEditing]);

  return (
    <div
      className={cn("relative flex w-full justify-end", props.className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && !isEditing && (
        <Pencil
          className="mr-2 mt-2 size-6 cursor-pointer p-1 opacity-50 hover:opacity-100"
          onClick={() => {
            setInputValue(message.content);
            setIsEditing(true);
          }}
        />
      )}

      {isEditing ? (
        <div className="w-full">
          <ReactTextareaAutosize
            ref={inputRef}
            className="w-full resize-none rounded-md border border-gray-300 p-2"
            placeholder="Enter your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            minRows={3}
            onKeyDown={handleKeyDown}
          />

          <div className="mt-1 flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleSubmitEdit}
            >
              Send
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex w-fit flex-col gap-2 rounded-xl bg-gray-100 p-3">
          <MessageMarkdown content={message.content} />
        </div>
      )}
    </div>
  );
};
