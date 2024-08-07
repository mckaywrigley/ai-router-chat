export const ndBaseUrl = "https://not-diamond-server.onrender.com"

export const ndHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: `Bearer ${process.env.NOT_DIAMOND_API_KEY}`
}

export interface NdModel {
  ndProvider: string
  cloudProvider: string
  ndModelId: string
  providerModelId: string
  label: string
  inputCost: number
  outputCost: number
  maxTokens?: number
}

// cost is $ per 1M tokens
export const ndLLMProviders: NdModel[] = [
  // OpenAI -----------
  // GPT-4o Omni
  {
    ndProvider: "openai",
    cloudProvider: "openai",
    ndModelId: "gpt-4o-2024-05-13",
    providerModelId: "gpt-4o-2024-05-13",
    label: "GPT-4o",
    inputCost: 5,
    outputCost: 15,
    maxTokens: 128_000
  },
  // GPT-4 Turbo
  {
    ndProvider: "openai",
    cloudProvider: "openai",
    ndModelId: "gpt-4-turbo-2024-04-09",
    providerModelId: "gpt-4-turbo-2024-04-09",
    label: "GPT-4 Turbo",
    inputCost: 10,
    outputCost: 30,
    maxTokens: 128_000
  },
  // GPT-4o Mini
  {
    ndProvider: "openai",
    cloudProvider: "openai",
    ndModelId: "gpt-4o-mini",
    providerModelId: "gpt-4o-mini",
    label: "GPT-4o Mini",
    inputCost: 0.15,
    outputCost: 0.6,
    maxTokens: 128_000
  },

  // Anthropic -----------
  // Claude 3 Opus
  {
    ndProvider: "anthropic",
    cloudProvider: "anthropic",
    ndModelId: "claude-3-opus-20240229",
    providerModelId: "claude-3-opus-20240229",
    label: "Claude 3 Opus",
    inputCost: 15,
    outputCost: 75,
    maxTokens: 200_000
  },
  // Claude 3 Haiku
  {
    ndProvider: "anthropic",
    cloudProvider: "anthropic",
    ndModelId: "claude-3-haiku-20240307",
    providerModelId: "claude-3-haiku-20240307",
    label: "Claude 3 Haiku",
    inputCost: 0.25,
    outputCost: 1.25,
    maxTokens: 50_000
  },
  {
    ndProvider: "anthropic",
    cloudProvider: "anthropic",
    ndModelId: "claude-3-5-sonnet-20240620",
    providerModelId: "claude-3-5-sonnet-20240620",
    label: "Claude 3.5 Sonnet",
    inputCost: 3,
    outputCost: 1.25
  },
  // Google -----------
  // Gemini 1.5 Pro
  {
    ndProvider: "google",
    cloudProvider: "google",
    ndModelId: "gemini-1.5-pro-latest",
    providerModelId: "models/gemini-1.5-pro-latest",
    label: "Gemini 1.5 Pro",
    inputCost: 3.5,
    outputCost: 7,
    maxTokens: 128_000
  },

  // Llama (via Groq) -----------
  // Llama3 70b
  {
    ndProvider: "togetherai",
    cloudProvider: "groq",
    ndModelId: "Llama-3-70b-chat-hf",
    providerModelId: "llama3-70b-8192",
    label: "Llama3 70b",
    inputCost: 0.59,
    outputCost: 0.79,
    maxTokens: 100_000
  },

  // Perplexity -----------
  // Sonar Large 32k Online
  {
    ndProvider: "perplexity",
    cloudProvider: "perplexity",
    ndModelId: "llama-3.1-sonar-large-128k-online",
    providerModelId: "llama-3.1-sonar-large-128k-online",
    label: "Perplexity",
    inputCost: 1.0,
    outputCost: 1.0,
    maxTokens: 100_000
  }
]

export const fallbackModels = [
  "gpt-4-turbo-2024-04-09",
  "claude-3-opus-20240229",
  "gpt-4-1106-preview",
  "gemini-1.5-pro",
  "llama-3-70b-chat-hf",
  "claude-3-haiku-20240307",
  "gpt-4o-mini",
  "llama-3.1-sonar-large-128k-online"
]
