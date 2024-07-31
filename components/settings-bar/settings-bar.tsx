"use client"

import { updateProfile } from "@/db/queries/profiles"
import { AppContext } from "@/lib/context/app-context"
import { ndLLMProviders } from "@/lib/not-diamond/not-diamond-config"
import { cn } from "@/lib/utils"
import { Settings } from "lucide-react"
import { FC, HTMLAttributes, useContext } from "react"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { Switch } from "../ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../ui/tooltip"

interface SettingsBarProps extends HTMLAttributes<HTMLDivElement> {}

export const SettingsBar: FC<SettingsBarProps> = ({ ...props }) => {
  const { isArenaModeActive, setIsArenaModeActive, profile, setProfile } =
    useContext(AppContext)

  const handleArenaModeChange = () => {
    setIsArenaModeActive(!isArenaModeActive)
  }

  const handleModelChange = async (model: string) => {
    if (!profile) return

    const newModels = profile.activeModels.includes(model)
      ? profile.activeModels.filter(m => m !== model)
      : [...profile.activeModels, model]
    setProfile({ ...profile, activeModels: newModels })
    await updateProfile(profile.id, {
      ...profile,
      activeModels: newModels
    })
  }

  if (!profile) return

  return (
    <Sheet>
      <SheetTrigger className={cn(props.className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button className="size-8 p-2">
                <Settings />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open sidepanel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Customize your experience.</SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={isArenaModeActive}
              onCheckedChange={handleArenaModeChange}
            />
            <div>Arena Mode</div>
          </div>

          <div className="mt-4">
            <div className="font-bold">Active Models</div>

            {ndLLMProviders.map(item => (
              <div
                key={item.providerModelId}
                className="flex items-center gap-2"
              >
                <Checkbox
                  checked={profile.activeModels.includes(item.providerModelId)}
                  onCheckedChange={() =>
                    handleModelChange(item.providerModelId)
                  }
                />
                <div>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
