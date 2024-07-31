"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppContextProvider } from "@/lib/context/app-context"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"
import { FC } from "react"
import { WaitForHydration } from "./wait-for-hydration"

export const Providers: FC<ThemeProviderProps> = ({ children, ...props }) => {
  return (
    <NextThemesProvider {...props}>
      <AppContextProvider>
        <WaitForHydration>
          <TooltipProvider>{children}</TooltipProvider>
        </WaitForHydration>
      </AppContextProvider>
    </NextThemesProvider>
  )
}
