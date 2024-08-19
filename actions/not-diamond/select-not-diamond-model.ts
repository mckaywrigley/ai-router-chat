"use server"

import console from "console"
import {
  fallbackModels,
  ndBaseUrl,
  ndHeaders,
  ndLLMProviders
} from "../../lib/not-diamond/not-diamond-config"
import { NDLLMProvider } from "../../lib/not-diamond/select-random-model"
import { handleFetch } from "../../lib/utils/handle-fetch"

export async function selectNdModel(
  preferenceId: string,
  messages: { role: string; content: string }[],
  activeModels: NDLLMProvider[],
  previousSession: string | null
) {
  try {
    const response = await handleFetch(`${ndBaseUrl}/v2/chat/modelSelect`, {
      method: "POST",
      headers: ndHeaders,
      body: JSON.stringify({
        messages,
        llm_providers: activeModels.filter(model => model.provider !== ""),
        preference_id: preferenceId,
        previous_session: previousSession
      })
    })

    const {
      session_id,
      provider: { model }
    } = response

    const selectedModel = ndLLMProviders.find(
      item => item.ndModelId === model
    )?.providerModelId
    if (!selectedModel) {
      throw new Error("No model selected")
    }

    return { session_id, model: selectedModel }
  } catch (error: any) {
    console.error(`Error selecting model: ${error.message}`)

    // Fallback mechanism
    for (const fallbackModel of fallbackModels) {
      const fallbackProvider = ndLLMProviders.find(
        provider => provider.providerModelId === fallbackModel
      )
      if (
        fallbackProvider &&
        activeModels.some(item => item.model === fallbackModel)
      ) {
        return { session_id: null, model: fallbackModel }
      }
    }

    return { session_id: null, model: null }
  }
}

export async function selectNdArenaModels(
  preferenceId: string,
  messages: { role: string; content: string }[],
  activeModels: NDLLMProvider[]
) {
  try {
    const response = await handleFetch(
      `${ndBaseUrl}/v2/chat/arena/arenaModels`,
      {
        method: "POST",
        headers: ndHeaders,
        body: JSON.stringify({
          messages,
          llm_providers: activeModels.filter(model => model.provider !== ""),
          preference_id: preferenceId
        })
      }
    )

    const { session_id, model_1, model_2 } = response

    return {
      session_id,
      model1: model_1.model,
      model2: model_2.model
    }
  } catch (error: any) {
    console.error(`Error selecting arena models: ${error.message}`)

    // Fallback mechanism
    let fallbackModel1: string | null = null
    let fallbackModel2: string | null = null

    for (const fallbackModel of fallbackModels) {
      const fallbackProvider = ndLLMProviders.find(
        provider => provider.providerModelId === fallbackModel
      )
      if (
        fallbackProvider &&
        activeModels.some(item => item.model === fallbackModel)
      ) {
        if (!fallbackModel1) {
          fallbackModel1 = fallbackModel
        } else if (!fallbackModel2) {
          fallbackModel2 = fallbackModel
          break
        }
      }
    }

    return {
      session_id: null,
      model_1: fallbackModel1,
      model_2: fallbackModel2
    }
  }
}
