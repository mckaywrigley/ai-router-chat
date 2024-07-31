import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { Check, Copy } from "lucide-react";
import { FC, HTMLAttributes, useState } from "react";
import { ACTION_ICON_SIZE, MessageActionButton } from "./message-action-button";

interface CopyMessageProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
}

export const CopyMessage: FC<CopyMessageProps> = ({ content, ...props }) => {
  const { copyToClipboard } = useCopyToClipboard({});
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MessageActionButton
      onClick={handleCopy}
      icon={copied ? <Check className={`size-${ACTION_ICON_SIZE}`} /> : <Copy className={`size-${ACTION_ICON_SIZE}`} />}
      className={props.className}
    />
  );
};
