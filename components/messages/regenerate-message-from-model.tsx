"use client"

import { AppContext } from "@/lib/context/app-context"
import { ndLLMProviders } from "@/lib/not-diamond/not-diamond-config"
import { Check, ChevronDown, Repeat, Sparkles } from "lucide-react"
import { FC, HTMLAttributes, useContext, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { ACTION_ICON_SIZE, MessageActionButton } from "./message-action-button"

interface RegenerateMessageFromModelProps
  extends HTMLAttributes<HTMLDivElement> {
  currentModel: string
  onRegenerateFromModel: (modelId: string) => void
}

export const RegenerateMessageFromModel: FC<
  RegenerateMessageFromModelProps
> = ({ currentModel, onRegenerateFromModel, ...props }) => {
  const { profile } = useContext(AppContext)

  const [hoveredModel, setHoveredModel] = useState<string | null>(null)

  if (!profile) return null

  // Sort models by provider and then by model
  const sortedModels = profile.activeModels
    .map(modelId => ndLLMProviders.find(m => m.providerModelId === modelId))
    .filter(model => model !== undefined)
    .sort((a, b) => {
      if (!a || !b) return 0

      if (a.cloudProvider < b.cloudProvider) return -1
      if (a.cloudProvider > b.cloudProvider) return 1
      if (a.providerModelId < b.providerModelId) return -1
      if (a.providerModelId > b.providerModelId) return 1
      return 0
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MessageActionButton
          onClick={() => {}}
          icon={
            <div className="flex items-center gap-0.5">
              <Sparkles className={`size-${ACTION_ICON_SIZE}`} />
              <ChevronDown className="size-3" />
            </div>
          }
          className={props.className}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[200px]">
        <div className="flex flex-col">
          {sortedModels.map(
            item =>
              item && (
                <DropdownMenuItem
                  key={item.providerModelId}
                  className="flex cursor-pointer justify-between"
                  onClick={() => onRegenerateFromModel(item.providerModelId)}
                  onMouseEnter={() => setHoveredModel(item.providerModelId)}
                  onMouseLeave={() => setHoveredModel(null)}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-gray-500">
                      {item.cloudProvider}
                    </div>
                  </div>

                  {hoveredModel === item.providerModelId && (
                    <Repeat className="size-4 text-gray-500" />
                  )}
                  {currentModel === item.providerModelId &&
                    hoveredModel !== item.providerModelId && (
                      <Check className="size-4" />
                    )}
                </DropdownMenuItem>
              )
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
