"use server"

import {
  ndBaseUrl,
  ndHeaders,
  ndLLMProviders
} from "../../lib/not-diamond/not-diamond-config"
import { NDLLMProvider } from "../../lib/not-diamond/select-random-model"
import { handleFetch } from "../../lib/utils/handle-fetch"

export const submitFeedback = async (
  session_id: string,
  thumbs: number,
  provider: NDLLMProvider
) => {
  const providerData = ndLLMProviders.find(
    currentProvider => currentProvider.providerModelId === provider?.model
  )

  await handleFetch(`${ndBaseUrl}/v2/chat/report/thumbsUpDown`, {
    method: "POST",
    headers: ndHeaders,
    body: JSON.stringify({
      session_id,
      thumbs,
      provider: {
        model: providerData?.ndModelId,
        provider: providerData?.ndProvider
      }
    })
  })
}
