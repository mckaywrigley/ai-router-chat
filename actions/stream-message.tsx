"use server"

import { StreamMessagePayload } from "@/types/chat-data"
import { CoreMessage, streamText } from "ai"
import { createStreamableValue } from "ai/rsc"
import { ndLLMProviders } from "../lib/not-diamond/not-diamond-config"
import { providers } from "../lib/not-diamond/select-random-model"

const MAX_RETRIES = ndLLMProviders.length

export const streamMessage = async (payload: StreamMessagePayload) => {
  const stream = createStreamableValue("")

  const handleStreamText = async ({
    messages,
    temperature,
    model,
    retryCount = 0
  }: StreamMessagePayload & { retryCount?: number }) => {
    if (retryCount >= MAX_RETRIES) {
      stream.update("\n\nMax retries reached. Unable to complete the request.")
      stream.done()
      return
    }

    const regenerationProvider = ndLLMProviders.find(
      item => item.providerModelId === model
    )?.cloudProvider
    const modelWithProvider =
      providers[regenerationProvider as keyof typeof providers](model)

    try {
      const result = await streamText({
        model: modelWithProvider,
        messages: messages as CoreMessage[],
        temperature
      })

      const { textStream } = result

      for await (const chunk of textStream) {
        stream.update(chunk)
      }

      stream.done()
    } catch (e) {
      const models = ndLLMProviders.filter(
        item => item.providerModelId !== model
      )
      const randomModel =
        models[Math.floor(Math.random() * models.length)].providerModelId
      console.info(
        `\n\nEncountered an error. Retrying with a different model (${randomModel})...\n\n`
      )

      await handleStreamText({
        model: randomModel,
        temperature,
        messages,
        retryCount: retryCount + 1
      })
    }
  }

  handleStreamText(payload)

  return { output: stream.value }
}
