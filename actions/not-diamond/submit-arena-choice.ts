"use server"

import { ndBaseUrl, ndHeaders } from "../../lib/not-diamond/not-diamond-config"
import { handleFetch } from "../../lib/utils/handle-fetch"

export const submitArenaChoice = async (
  session_id: string,
  preferred: { provider: string; model: string },
  rejected: { provider: string; model: string }
) => {
  const payload = {
    session_id,
    preferred_provider: preferred,
    rejected_provider: rejected
  }

  await handleFetch(`${ndBaseUrl}/v2/chat/arena/arenaChoice`, {
    method: "POST",
    headers: ndHeaders,
    body: JSON.stringify(payload)
  })
}
