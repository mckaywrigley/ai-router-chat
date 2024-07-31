"use client"

import { AppContext } from "@/lib/context/app-context"
import { cn } from "@/lib/utils"
import { FC, HTMLAttributes, useContext } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./ui/dialog"
import { Progress } from "./ui/progress"

export const MAX_ROUTER_PROGRESS = 10

interface RouterProgressBarProps extends HTMLAttributes<HTMLDivElement> {}

export const RouterProgressBar: FC<RouterProgressBarProps> = ({ ...props }) => {
  const { profile, setProfile, setIsArenaModeActive } = useContext(AppContext)

  if (!profile) return null

  return (
    <>
      <div className={cn("mx-auto w-full max-w-[600px]", props.className)}>
        {profile.routerProgress < 10 && (
          <>
            <Progress
              value={
                profile.routerProgress > 0 ? profile.routerProgress * 10 : 1
              }
            />
            <div className="mt-1 text-center text-xs font-light">
              Remaining Arena Selections:{" "}
              {MAX_ROUTER_PROGRESS - profile.routerProgress}
            </div>
          </>
        )}
      </div>

      <Dialog
        open={profile.routerProgress === 10}
        onOpenChange={() => {
          setProfile({ ...profile, routerProgress: profile.routerProgress + 1 })
          setIsArenaModeActive(false)
        }}
      >
        <DialogContent className="w-1/2 p-10">
          <DialogHeader>
            <DialogTitle>Router Complete</DialogTitle>
            <DialogDescription>
              You have completed the router. You can now start chatting with
              your router.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
