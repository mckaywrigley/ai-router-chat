import { ndLLMProviders } from "../not-diamond/not-diamond-config"

export const getCost = (messages: string[], output: string, model: string) => {
  const inputLength = messages.reduce(
    (acc: number, curr: any) => acc + curr.length,
    0
  )
  const outputLength = output.length

  const provider = ndLLMProviders.find(item => item.providerModelId === model)
  if (!provider) throw new Error("Model not found")

  const inputTokens = inputLength * 1.33
  const outputTokens = outputLength * 1.33

  const inputCost = (inputTokens / 1_000_000) * provider.inputCost
  const outputCost = (outputTokens / 1_000_000) * provider.outputCost

  const totalCost = inputCost + outputCost
  const costInHundredthCents = Math.round(totalCost * 1000000) // Convert to 1/100 cents
  return costInHundredthCents
}
