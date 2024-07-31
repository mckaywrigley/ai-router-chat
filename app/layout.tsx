import { createPreferenceId } from "@/actions/not-diamond/create-preference-id"
import { Dashboard } from "@/components/dashboard"
import { OnboardingMessage } from "@/components/onboarding-message"
import { Providers } from "@/components/utility/providers"
import { getAllChatsByProfileId } from "@/db/queries/chats"
import { createProfile, getProfile } from "@/db/queries/profiles"
import { ndLLMProviders } from "@/lib/not-diamond/not-diamond-config"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Router Chat",
  description:
    "A template for building an AI chat app that utilizes advanced LLM model routing powered by Not Diamond."
}

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  let profile = await getProfile()

  if (!profile) {
    const preferenceId = await createPreferenceId("not-diamond-template")
    profile = await createProfile({
      preferenceId,
      activeModels: [...ndLLMProviders.map(model => model.providerModelId)]
    })
  }

  const chats = await getAllChatsByProfileId(profile.id)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers attribute="class" defaultTheme="light">
          <Dashboard profile={profile} chats={chats}>
            {children}
          </Dashboard>
          <OnboardingMessage />
        </Providers>
      </body>
    </html>
  )
}
