"use client"

import { updateProfile } from "@/db/queries/profiles"
import { AppContext } from "@/lib/context/app-context"
import { FC, useContext } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./ui/dialog"

interface OnboardingMessageProps {}

export const OnboardingMessage: FC<OnboardingMessageProps> = () => {
  const { profile, setProfile } = useContext(AppContext)

  const handleOnboarding = async () => {
    if (!profile) return
    setProfile({ ...profile, hasOnboarded: true })
    await updateProfile(profile.id, { hasOnboarded: true })
  }

  if (!profile) return null

  return (
    <Dialog open={!profile.hasOnboarded} onOpenChange={handleOnboarding}>
      <DialogContent className="w-1/2 p-10">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            To start, you will select 10 arena messages to adapt your router to
            your preferences.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
