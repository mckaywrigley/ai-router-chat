"use client";

import { AppContext } from "@/lib/context/app-context";
import { Swords } from "lucide-react";
import { FC, useContext } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ArenaModeIndicatorProps {}

export const ArenaModeIndicator: FC<ArenaModeIndicatorProps> = ({}) => {
  const { isArenaModeActive } = useContext(AppContext);

  if (isArenaModeActive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <Swords />
          </TooltipTrigger>

          <TooltipContent>Arena Mode Active</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-not-allowed">
            <Swords className="opacity-15" />
          </TooltipTrigger>

          <TooltipContent>Arena Mode Inactive</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
};
