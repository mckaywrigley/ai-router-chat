"use client"

import { createChatAction } from "@/actions/chats"
import {
  createMessageAction,
  deleteMessagesIncludingAndAfterTurnAction,
  deleteRegeneratedMessagesAction
} from "@/actions/messages"
import { reportRegeneration } from "@/actions/not-diamond/report-regeneration"
import {
  selectNdArenaModels,
  selectNdModel
} from "@/actions/not-diamond/select-not-diamond-model"
import { submitArenaChoice } from "@/actions/not-diamond/submit-arena-choice"
import { streamMessage } from "@/actions/stream-message"
import { SelectChat } from "@/db/schema/chats"
import { SelectMessage } from "@/db/schema/messages"
import { AppContext } from "@/lib/context/app-context"
import { ndLLMProviders } from "@/lib/not-diamond/not-diamond-config"
import { cn } from "@/lib/utils"
import { getCost } from "@/lib/utils/get-cost"
import { StreamableValue, readStreamableValue } from "ai/rsc"
import { CircleStop, Send } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import {
  FC,
  HTMLAttributes,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import TextareaAutosize from "react-textarea-autosize"
import { AssistantMessage } from "../messages/assistant-message"
import { UserMessage } from "../messages/user-message"
import { RouterProgressBar } from "../router-progress-bar"
import { Button } from "../ui/button"

interface ChatProps extends HTMLAttributes<HTMLDivElement> {
  chat: SelectChat | null
  initialMessages: SelectMessage[]
}

export const Chat: FC<ChatProps> = ({ chat, initialMessages, ...props }) => {
  const { profile, selectedChatId, isArenaModeActive } = useContext(AppContext)

  const router = useRouter()
  const pathname = usePathname()

  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const [messages, setMessages] = useState(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [waitingForGeneration, setWaitingForGeneration] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingStopped, setStreamingStopped] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false)

  // Hack to clear messages
  useEffect(() => {
    if (pathname === "/") {
      setSessionId(null)
      setMessages([])
      setIsGenerating(false)
      setWaitingForGeneration(false)
      abortControllerRef.current?.abort()
      inputRef.current?.focus()
    }
  }, [selectedChatId])

  // Focus on the input when the initial messages change
  useEffect(() => {
    inputRef.current?.focus()
  }, [initialMessages])

  // Scroll to the bottom of the chat when the messages change
  useEffect(() => {
    if (messagesEndRef?.current && !isScrolledUp) {
      messagesEndRef.current.scrollTop = messagesEndRef.current?.scrollHeight
    }
  }, [messages])

  const handleScroll = () => {
    if (messagesEndRef?.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current
      if (scrollTop + clientHeight < scrollHeight) {
        setIsScrolledUp(true)
      } else {
        setIsScrolledUp(false)
      }
    }
  }

  // Group the messages by turn, helps with rendering the correct turn UI
  const groupedByTurn = useMemo(() => {
    return messages.reduce(
      (acc: Record<number, SelectMessage[]>, message: SelectMessage) => {
        if (!acc[message.turn]) {
          acc[message.turn] = []
        }
        acc[message.turn].push(message)
        return acc
      },
      {}
    )
  }, [messages])

  const hasArenaMessages = messages.some(msg => msg.arenaMessage)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFeedbackUpdate = (messageId: string, thumbsUp: boolean) => {
    setMessages(
      messages.map(msg => (msg.id === messageId ? { ...msg, thumbsUp } : msg))
    )
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setStreamingStopped(true)
      inputRef.current?.focus()
      setIsGenerating(false)
      setWaitingForGeneration(false)
    }
  }

  const handleSubmit = async (
    regenerationModel: string | null = null,
    editedMessage: SelectMessage | null = null
  ) => {
    setIsScrolledUp(false)

    if (!profile) {
      alert("No profile detected")
      return
    }

    if (!profile.preferenceId) {
      alert("Please create a preference ID first.")
      return
    }

    if (profile.activeModels.length === 0) {
      alert("Please select at least one model.")
      return
    }

    // Update the messages based on the chat type
    let messagesCopy = [...messages]

    const isRegeneration = regenerationModel !== null
    const isEdit = editedMessage !== null

    if (
      isGenerating ||
      (inputValue.trim().length === 0 && !isRegeneration && !isEdit)
    ) {
      return
    }

    abortControllerRef.current = new AbortController()

    let chatIdToUse =
      pathname !== "/"
        ? pathname.split("/").pop()
        : chat?.id || messages.find(msg => msg.chatId)?.chatId

    let model1 = regenerationModel
    let provider1 = ndLLMProviders.find(item => item.providerModelId === model1)
      ?.cloudProvider as SelectMessage["provider"]

    let model2: string | null = null
    let provider2: SelectMessage["provider"] | null = null

    let activeSessionId: string | null = sessionId

    // the turn of the last assistant message(s)
    const lastTurn = isEdit
      ? editedMessage.turn - 1
      : Math.max(...messagesCopy.map(msg => msg.turn), 0)

    const latestTurnMessages = messagesCopy.filter(
      msg => msg.turn === lastTurn && msg.arenaMessage
    )
    const hasPreferredMessage =
      latestTurnMessages.every(msg => msg.isPreferred === false) ||
      latestTurnMessages.some(msg => msg.isPreferred)

    const modelsToUse = profile.activeModels.map((modelId: string) => {
      const foundProvider = ndLLMProviders.find(
        item => item.providerModelId === modelId
      )
      return {
        provider: foundProvider?.ndProvider || "",
        model: foundProvider?.ndModelId || ""
      }
    })

    // Checks if user has selected a preferred response for the latest turn
    if (
      isArenaModeActive &&
      messagesCopy.length > 0 &&
      latestTurnMessages.length > 0 &&
      !hasPreferredMessage
    ) {
      alert(
        "Please select a preferred response for the latest turn before proceeding."
      )
      return
    }

    // Begin chat generation ui
    inputRef.current?.focus()
    setIsGenerating(true)
    setWaitingForGeneration(true)
    setInputValue("")

    if (isEdit) {
      messagesCopy = messagesCopy.filter(msg => msg.turn < editedMessage.turn)
      setMessages(messagesCopy)
      await deleteMessagesIncludingAndAfterTurnAction(
        editedMessage.chatId,
        editedMessage.turn
      )
    }

    // Create a new user message
    const newUserMessage: SelectMessage = {
      id: `temp-user`,
      profileId: profile.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      chatId: chatIdToUse || "",
      content: isEdit ? editedMessage.content : inputValue,
      role: "user",
      provider: "openai",
      model: "",
      turn: lastTurn + 1,
      arenaMessage: false,
      isPreferred: null,
      thumbsUp: null,
      latency: null,
      cost: null
    }

    if (isRegeneration) {
      messagesCopy = messagesCopy.filter(msg => msg.turn <= lastTurn - 1)
    } else {
      if (messagesCopy[messagesCopy.length - 1]?.role === newUserMessage.role) {
        if (
          messagesCopy.length === 1 &&
          messagesCopy[0]?.role === newUserMessage.role
        ) {
          messagesCopy = [newUserMessage]
        } else {
          messagesCopy.pop()
          messagesCopy = [...messagesCopy, newUserMessage]
        }
      } else {
        messagesCopy = [...messagesCopy, newUserMessage]
      }
    }
    setMessages(messagesCopy)

    // Filter messages by turn
    const filteredMessages = messagesCopy.reduce(
      (acc: Record<number, any[]>, message: any) => {
        if (!acc[message.turn]) {
          acc[message.turn] = []
        }
        acc[message.turn].push(message)
        return acc
      },
      {}
    )

    // Get the preferred message for each turn
    const messagesToUse = Object.values(
      filteredMessages as Record<number, any[]>
    ).map((turnMessages: any[]) => {
      const preferredMessage = turnMessages.find(msg => msg.isPreferred)
      if (preferredMessage) {
        return {
          role: preferredMessage.role,
          content: preferredMessage.content
        }
      }
      const earliestMessage = turnMessages.reduce((earliest, current) => {
        return new Date(current.createdAt) < new Date(earliest.createdAt)
          ? current
          : earliest
      })
      return { role: earliestMessage.role, content: earliestMessage.content }
    })

    // Format the messages to be used in the chat
    const formattedMessages = messagesToUse.map(message => ({
      role: message.role,
      content: message.content
    }))

    // Create chat if needed
    if (!chatIdToUse && !isRegeneration) {
      const newChat = await createChatAction({
        name: inputValue.slice(0, 50),
        profileId: profile.id
      })
      chatIdToUse = newChat.id
    }

    // if regeneration, delete previous assistant message
    if (isRegeneration && chatIdToUse) {
      await deleteRegeneratedMessagesAction(chatIdToUse, lastTurn)
    }

    if (!isRegeneration && !isArenaModeActive) {
      const { session_id, model } = await selectNdModel(
        profile.preferenceId,
        formattedMessages,
        modelsToUse,
        activeSessionId
      )

      model1 =
        ndLLMProviders.find(item => item.ndModelId === model)
          ?.providerModelId ?? null
      provider1 = ndLLMProviders.find(item => item.ndModelId === model)
        ?.cloudProvider as SelectMessage["provider"]
      activeSessionId = session_id
      setSessionId(session_id)

      if (!model1) {
        alert("No model selected")
        return
      }
    }

    let latency1Start = 0
    let latency1End = 0
    let latency2Start = 0
    let latency2End = 0

    let textContent1 = ""
    let textContent2 = ""

    // Handle the chat based on the chat type
    if (isArenaModeActive) {
      const {
        session_id,
        model1: arenaModel1,
        model2: arenaModel2
      } = await selectNdArenaModels(
        profile.preferenceId,
        formattedMessages,
        modelsToUse
      )

      model1 =
        ndLLMProviders.find(item => item.ndModelId === arenaModel1)
          ?.providerModelId ?? null // convert nd model to clodu model
      model2 =
        ndLLMProviders.find(item => item.ndModelId === arenaModel2)
          ?.providerModelId ?? null // convert nd model to clodu model
      activeSessionId = session_id ?? null
      setSessionId(session_id)

      if (!model1 || !model2) {
        throw new Error("No suitable models found for arena mode.")
      }

      provider1 = ndLLMProviders.find(item => item.providerModelId === model1)
        ?.cloudProvider as SelectMessage["provider"]
      provider2 = ndLLMProviders.find(item => item.providerModelId === model2)
        ?.cloudProvider as SelectMessage["provider"]

      if (!provider1 || !provider2) {
        throw new Error("No suitable providers found for arena mode.")
      }

      latency1Start = Date.now()
      latency2Start = Date.now()

      const { output: output1 } = await streamMessage({
        messages: formattedMessages,
        model: model1,
        temperature: 0.5
      })

      const { output: output2 } = await streamMessage({
        messages: formattedMessages,
        model: model2,
        temperature: 0.5
      })

      const streamOutput = async (
        output: StreamableValue<string, any>,
        tempId: number
      ) => {
        let firstChunkReceived = false
        let firstChunkReceived2 = false
        for await (const chunk of readStreamableValue(output)) {
          if (abortControllerRef.current?.signal.aborted || streamingStopped) {
            latency1End = Date.now()
            latency2End = Date.now()
            break
          }

          if (!firstChunkReceived && chunk && tempId === 1) {
            latency1End = Date.now()
            firstChunkReceived = true
          }

          if (!firstChunkReceived2 && chunk && tempId === 2) {
            latency2End = Date.now()
            firstChunkReceived2 = true
          }

          setWaitingForGeneration(false)

          if (tempId === 1) {
            textContent1 += chunk
          } else if (tempId === 2) {
            textContent2 += chunk
          }

          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages]
            const assistantMessageIndex = updatedMessages.findIndex(
              msg => msg.id === `temp-assistant-${tempId}`
            )

            if (assistantMessageIndex !== -1) {
              updatedMessages[assistantMessageIndex] = {
                ...updatedMessages[assistantMessageIndex],
                content: tempId === 1 ? textContent1 : textContent2,
                updatedAt: new Date()
              }
            } else {
              const newAssistantMessage: SelectMessage = {
                id: `temp-assistant-${tempId}`,
                profileId: profile.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                chatId: chatIdToUse || "temp-chatid",
                content: tempId === 1 ? textContent1 : textContent2,
                role: "assistant",
                provider:
                  tempId === 1
                    ? (provider1 as SelectMessage["provider"])
                    : (provider2 as SelectMessage["provider"]),
                model: tempId === 1 ? (model1 as string) : (model2 as string),
                turn: lastTurn + 2,
                arenaMessage: true,
                isPreferred: null,
                thumbsUp: null,
                latency: null,
                cost: null
              }
              updatedMessages.push(newAssistantMessage)
            }

            return updatedMessages
          })
        }
      }

      const outputs = [
        { output: output1, tempId: 1 },
        { output: output2, tempId: 2 }
      ]
      outputs.sort(() => Math.random() - 0.5)
      await Promise.all(
        outputs.map(({ output, tempId }) => streamOutput(output, tempId))
      )

      // Handle standard chat mode
    } else {
      if (!model1) {
        throw new Error("No suitable model found.")
      }

      if (!provider1) {
        throw new Error("No suitable provider found.")
      }

      latency1Start = Date.now()

      const { output } = await streamMessage({
        messages: formattedMessages,
        model: model1,
        temperature: isRegeneration ? 1 : 0.5
      })

      let firstChunkReceived = false
      for await (const chunk of readStreamableValue(output)) {
        if (abortControllerRef.current.signal.aborted || streamingStopped) {
          latency1End = Date.now()
          break
        }

        setWaitingForGeneration(false)

        textContent1 += chunk

        if (!firstChunkReceived && chunk) {
          latency1End = Date.now()
          firstChunkReceived = true
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages]
          const assistantMessageIndex = updatedMessages.findIndex(
            msg => msg.id === `temp-assistant-1`
          )

          if (assistantMessageIndex !== -1) {
            updatedMessages[assistantMessageIndex].content = textContent1
            updatedMessages[assistantMessageIndex].updatedAt = new Date()
          } else {
            const newAssistantMessage: SelectMessage = {
              id: `temp-assistant-1`,
              profileId: profile.id,
              createdAt: new Date(),
              updatedAt: new Date(),
              chatId: chatIdToUse || "temp-chatid",
              content: textContent1,
              role: "assistant",
              provider: provider1,
              model: model1 as string,
              turn: lastTurn + 2,
              arenaMessage: false,
              isPreferred: null,
              thumbsUp: null,
              latency: null,
              cost: null
            }

            updatedMessages.push(newAssistantMessage)
          }

          return updatedMessages
        })
      }
    }

    if (chatIdToUse) {
      if (!isRegeneration && textContent1) {
        // create user message
        const userMessageResponse = await createMessageAction({
          chatId: chatIdToUse,
          profileId: profile.id,
          role: "user",
          content: isEdit ? editedMessage.content : inputValue,
          model: model1,
          provider: provider1,
          turn: lastTurn + 1
        })

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages]
          const userMessageIndex = updatedMessages.findIndex(
            msg => msg.id === "temp-user"
          )

          if (userMessageIndex !== -1) {
            updatedMessages[userMessageIndex] = userMessageResponse
          }

          return updatedMessages
        })
      }

      const assistantMessage1Cost = getCost(
        messages.map(m => m.content),
        textContent1,
        model1
      )

      if (textContent1) {
        const assistantMessage1Response = await createMessageAction({
          chatId: chatIdToUse,
          profileId: profile.id,
          role: "assistant",
          content: textContent1,
          model: model1,
          provider: provider1,
          turn: isRegeneration ? lastTurn : lastTurn + 2,
          latency: latency1End - latency1Start,
          cost: assistantMessage1Cost,
          arenaMessage: isArenaModeActive
        })

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages]
          const assistantMessageIndex = updatedMessages.findIndex(
            msg => msg.id === "temp-assistant-1"
          )

          if (assistantMessageIndex !== -1) {
            updatedMessages[assistantMessageIndex] = assistantMessage1Response
          }
          return updatedMessages
        })
      }

      // only create assistant message 2 if arena mode is active
      if (isArenaModeActive && textContent2) {
        const assistantMessage2Cost = getCost(
          messages.map(m => m.content),
          textContent2,
          model2 as string
        )

        const assistantMessage2Response = await createMessageAction({
          profileId: profile.id,
          chatId: chatIdToUse,
          role: "assistant",
          content: textContent2,
          model: model2 as string,
          provider: provider2 as SelectMessage["provider"],
          turn: lastTurn + 2,
          latency: latency2End - latency2Start,
          cost: assistantMessage2Cost,
          arenaMessage: isArenaModeActive
        })

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages]
          const assistantMessageIndex = updatedMessages.findIndex(
            msg => msg.id === "temp-assistant-2"
          )

          if (assistantMessageIndex !== -1) {
            updatedMessages[assistantMessageIndex] = assistantMessage2Response
          }
          return updatedMessages
        })
      }
    }

    setIsGenerating(false)
    setStreamingStopped(false)
    setWaitingForGeneration(false)
    router.refresh()

    if (isRegeneration && sessionId) {
      const ndProvider = ndLLMProviders.find(
        item => item.cloudProvider === provider1
      )
      const ndModel = ndLLMProviders.find(
        item => item.providerModelId === model1
      )

      if (!ndProvider || !ndModel) {
        throw new Error("No suitable providers or models found.")
      }

      await reportRegeneration(sessionId, {
        provider: ndProvider.ndProvider,
        model: ndModel.ndModelId
      })
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.shiftKey && event.key === "Enter") {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handlePreferenceUpdate = async (messageId: string) => {
    setMessages(
      messages.map(msg => {
        if (msg.turn === messages.find(m => m.id === messageId)?.turn) {
          return { ...msg, isPreferred: msg.id === messageId }
        }
        return msg
      })
    )

    const preferredMessage = messages.find(m => m.id === messageId)
    const rejectedMessage = messages.find(
      m => m.turn === preferredMessage?.turn && m.id !== messageId
    )

    if (!preferredMessage || !rejectedMessage) {
      throw new Error("No suitable messages found for arena mode.")
    }

    if (!sessionId) {
      throw new Error("No session id found.")
    }

    if (sessionId) {
      const preferredProvider = ndLLMProviders.find(
        item => item.cloudProvider === preferredMessage.provider
      )?.ndProvider
      const preferredModel = ndLLMProviders.find(
        item => item.providerModelId === preferredMessage.model
      )?.ndModelId
      const rejectedProvider = ndLLMProviders.find(
        item => item.cloudProvider === rejectedMessage.provider
      )?.ndProvider
      const rejectedModel = ndLLMProviders.find(
        item => item.providerModelId === rejectedMessage.model
      )?.ndModelId

      if (
        !preferredProvider ||
        !preferredModel ||
        !rejectedProvider ||
        !rejectedModel
      ) {
        throw new Error("No suitable providers or models found.")
      }

      await submitArenaChoice(
        sessionId,
        {
          provider: preferredProvider,
          model: preferredModel
        },
        {
          provider: rejectedProvider,
          model: rejectedModel
        }
      )
    }
  }

  return (
    <div
      className={cn(
        "mx-auto flex size-full flex-1 flex-col p-4 pt-12 sm:p-8 sm:pt-4",
        hasArenaMessages ? "max-w-[1200px]" : "max-w-[900px]",
        props.className
      )}
    >
      {profile && profile.routerProgress <= 10 && (
        <RouterProgressBar className="mb-4" />
      )}

      <div className="mx-auto max-w-full truncate text-xl font-semibold">
        {chat?.name || "New Chat"}
      </div>

      <hr className="my-4" />

      <div
        className="mt-2 flex flex-1 flex-col gap-6 overflow-auto"
        onScroll={handleScroll}
        ref={messagesEndRef}
      >
        {messages && messages.length > 0 ? (
          (Object.values(groupedByTurn) as SelectMessage[][]).map(
            (turn: SelectMessage[]) => {
              const userMessages = turn.filter(msg => msg.role === "user")
              const assistantMessages = turn.filter(
                msg => msg.role === "assistant"
              )
              const turnHasArenaMessages = turn.some(msg => msg.arenaMessage)
              const turnHasPreferenceSelection = turn.some(
                msg => msg.isPreferred
              )

              return (
                <div key={turn[0].turn} className="flex flex-col gap-4">
                  {userMessages.map((userMessage, index) => (
                    <UserMessage
                      key={index}
                      className="self-end px-4"
                      message={userMessage}
                      onSubmitEdit={editedMessage =>
                        handleSubmit(null, editedMessage)
                      }
                    />
                  ))}

                  {turnHasArenaMessages && !turnHasPreferenceSelection && (
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        Which response do you prefer?
                      </div>
                      <div className="mt-0.5 text-xs">
                        Your choice will improve your router.
                      </div>
                    </div>
                  )}

                  {assistantMessages.length > 0 && (
                    <div className="flex w-full gap-4">
                      {assistantMessages
                        .sort((a, b) => a.content.localeCompare(b.content))
                        .map((assistantMessage, index) => (
                          <AssistantMessage
                            key={index}
                            message={assistantMessage}
                            sessionId={sessionId}
                            isGenerating={isGenerating}
                            isLast={
                              assistantMessage.turn ===
                              Math.max(...messages.map(msg => msg.turn))
                            }
                            turnHasPreferenceSelection={
                              turnHasPreferenceSelection
                            }
                            onFeedbackUpdate={handleFeedbackUpdate}
                            onPreferenceUpdate={handlePreferenceUpdate}
                            onRegenerate={handleSubmit}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )
            }
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <div>Ask anything...</div>
          </div>
        )}

        {waitingForGeneration && (
          <div className="size-4 animate-pulse rounded-full bg-black" />
        )}
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[800px] items-center justify-center gap-2">
        <TextareaAutosize
          ref={inputRef}
          className="w-full resize-none rounded-md border border-gray-300 bg-gray-50 p-2"
          placeholder="Enter your message..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          maxRows={20}
          minRows={2}
          onKeyDown={handleKeyDown}
        />

        {isGenerating ? (
          <Button className="size-[66px] animate-pulse" onClick={handleStop}>
            <CircleStop />
          </Button>
        ) : (
          <Button
            className="size-[66px]"
            onClick={() => handleSubmit()}
            disabled={inputValue.length === 0 || isGenerating}
          >
            <Send />
          </Button>
        )}
      </div>
    </div>
  )
}
