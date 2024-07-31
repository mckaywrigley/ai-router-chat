import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI, openai } from "@ai-sdk/openai"
import { ndLLMProviders } from "./not-diamond-config"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GROQ_API_KEY
})

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY
})

const perplexity = createOpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY ?? "",
  baseURL: "https://api.perplexity.ai/"
})

export const providers = {
  openai,
  anthropic,
  google,
  groq,
  perplexity
}

export interface NDLLMProvider {
  provider: string
  model: string
}

export function selectRandomModel(
  excludeModels: string[],
  activeModels: NDLLMProvider[]
) {
  const availableModels = ndLLMProviders.filter(
    provider =>
      !excludeModels.includes(provider.providerModelId) &&
      activeModels.some(item => item.model === provider.providerModelId)
  )

  const randomIndex = Math.floor(Math.random() * availableModels.length)
  const randomSelection = availableModels[randomIndex]

  return randomSelection.providerModelId
}
