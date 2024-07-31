"use client"

import { SelectChat } from "@/db/schema/chats"
import { SelectProfile } from "@/db/schema/profiles"
import { AppContext } from "@/lib/context/app-context"
import { cn } from "@/lib/utils"
import { HTMLAttributes, useContext, useEffect, useState } from "react"
import { ArenaModeIndicator } from "./arena-mode-indicator"
import { ChatsBar } from "./chats-bar/chats-bar"
import { SettingsBar } from "./settings-bar/settings-bar"

interface DashboardProps extends HTMLAttributes<HTMLDivElement> {
  profile: SelectProfile
  chats: SelectChat[]
}

export const Dashboard = ({ profile, chats, ...props }: DashboardProps) => {
  const { setProfile } = useContext(AppContext)

  const [isChatsOpen, setIsChatsOpen] = useState(true)

  useEffect(() => {
    setProfile(profile)
  }, [profile])

  return (
    <div className="flex h-screen">
      <ChatsBar
        chats={chats}
        isOpen={isChatsOpen}
        onOpenChange={setIsChatsOpen}
      />

      <div className={cn(isChatsOpen ? "hidden sm:flex sm:flex-1" : "flex-1")}>
        {props.children}
      </div>

      <div
        className={cn(
          "absolute right-2 top-2 gap-2",
          isChatsOpen ? "hidden sm:flex" : "flex"
        )}
      >
        <ArenaModeIndicator />
        <SettingsBar />
      </div>
    </div>
  )
}
