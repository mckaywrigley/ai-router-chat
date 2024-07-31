"use server"

import { ndBaseUrl, ndHeaders } from "../../lib/not-diamond/not-diamond-config"
import { handleFetch } from "../../lib/utils/handle-fetch"

export const createPreferenceId = async (name: string) => {
  const json = await handleFetch(
    `${ndBaseUrl}/v2/chat/preferences/preferenceCreate`,
    {
      method: "POST",
      headers: ndHeaders,
      body: JSON.stringify({
        name
      })
    }
  )

  return json.preference_id
}
