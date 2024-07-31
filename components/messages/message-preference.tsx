"use client";

import { Star } from "lucide-react";
import { FC, HTMLAttributes } from "react";
import { ACTION_ICON_SIZE, MessageActionButton } from "./message-action-button";

interface MessagePreferenceProps extends HTMLAttributes<HTMLDivElement> {
  messageId: string;
  onChangePreference: () => void;
}

export const MessagePreference: FC<MessagePreferenceProps> = ({ messageId, onChangePreference, ...props }) => {
  return (
    <MessageActionButton
      onClick={onChangePreference}
      icon={<Star className={`size-${ACTION_ICON_SIZE}`} />}
      className={props.className}
    />
  );
};
