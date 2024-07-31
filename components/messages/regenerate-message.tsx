import { Repeat } from "lucide-react";
import { FC, HTMLAttributes } from "react";
import { ACTION_ICON_SIZE, MessageActionButton } from "./message-action-button";

interface RegenerateMessageProps extends HTMLAttributes<HTMLDivElement> {
  onRegenerate: () => void;
}

export const RegenerateMessage: FC<RegenerateMessageProps> = ({ onRegenerate, ...props }) => {
  return (
    <MessageActionButton
      onClick={onRegenerate}
      icon={<Repeat className={`size-${ACTION_ICON_SIZE}`} />}
      className={props.className}
    />
  );
};
