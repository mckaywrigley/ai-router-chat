"use client"

import { PropsWithChildren, useEffect, useState } from "react"

export function WaitForHydration({ children }: PropsWithChildren) {
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return <>{isHydrated ? <>{children}</> : null}</>
}
