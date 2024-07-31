"use client"

import { MAX_ROUTER_PROGRESS } from "@/components/router-progress-bar"
import { SelectProfile } from "@/db/schema/profiles"
import { ReactNode, createContext, useEffect, useState } from "react"
import {
  getLocalStorageItem,
  setLocalStorageItem
} from "../utils/local-storage"

interface AppContextType {
  selectedChatId: string | null
  setSelectedChatId: (selectedChatId: string | null) => void
  isArenaModeActive: boolean
  setIsArenaModeActive: (isArenaModeActive: boolean) => void
  profile: SelectProfile | null
  setProfile: (profile: SelectProfile | null) => void
}

export const AppContext = createContext<AppContextType>({
  selectedChatId: null,
  setSelectedChatId: () => {},
  isArenaModeActive: true,
  setIsArenaModeActive: () => {},
  profile: null,
  setProfile: () => {}
})

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [isArenaModeActive, setIsArenaModeActive] = useState(true)
  const [profile, setProfile] = useState<SelectProfile | null>(null)

  useEffect(() => {
    const savedArenaMode = getLocalStorageItem("arenaMode")
    if (savedArenaMode !== null) {
      if (profile && profile.routerProgress < MAX_ROUTER_PROGRESS) {
        setIsArenaModeActive(true)
      } else {
        setIsArenaModeActive(savedArenaMode)
      }
    }
  }, [])

  const handleSetIsArenaModeActive = (isArenaModeActive: boolean) => {
    setIsArenaModeActive(isArenaModeActive)
    setLocalStorageItem("arenaMode", isArenaModeActive)
  }

  return (
    <AppContext.Provider
      value={{
        selectedChatId,
        setSelectedChatId,
        isArenaModeActive,
        setIsArenaModeActive: handleSetIsArenaModeActive,
        profile,
        setProfile
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
