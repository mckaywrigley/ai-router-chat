"use server"

import { ndBaseUrl, ndHeaders } from "../../lib/not-diamond/not-diamond-config"
import { NDLLMProvider } from "../../lib/not-diamond/select-random-model"
import { handleFetch } from "../../lib/utils/handle-fetch"

export const reportRegeneration = async (
  session_id: string,
  provider: NDLLMProvider
) => {
  await handleFetch(`${ndBaseUrl}/v2/chat/report/regenerated`, {
    method: "POST",
    headers: ndHeaders,
    body: JSON.stringify({
      session_id,
      provider,
      regenerated: true
    })
  })
}
