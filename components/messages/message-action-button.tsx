import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FC, HTMLAttributes, ReactNode } from "react";
import { Button } from "../ui/button";

export const ACTION_ICON_SIZE = 4;

interface MessageActionButtonProps extends HTMLAttributes<HTMLDivElement> {
  onClick: () => void;
  icon: ReactNode;
  isActive?: boolean;
}

export const MessageActionButton: FC<MessageActionButtonProps> = ({ onClick, icon, isActive, ...props }) => {
  return (
    <motion.div
      className="h-7 min-w-7"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    >
      <Button
        className={cn("h-7 min-w-7 p-1.5", isActive && "bg-neutral-300", props.className)}
        variant="ghost"
        onClick={onClick}
      >
        {icon}
      </Button>
    </motion.div>
  );
};
