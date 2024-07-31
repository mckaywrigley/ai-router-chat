import { ndLLMProviders } from "@/lib/not-diamond/not-diamond-config"
import { cn } from "@/lib/utils"
import { FC, HTMLAttributes } from "react"

interface MessageStatsProps extends HTMLAttributes<HTMLDivElement> {
  modelId: string
  latency: number | null
  cost: number | null
}

export const MessageStats: FC<MessageStatsProps> = ({
  modelId,
  latency,
  cost,
  ...props
}) => {
  const stats = [
    {
      label: "model",
      value:
        ndLLMProviders.find(item => item.providerModelId === modelId)?.label ||
        modelId
    },
    { label: "latency", value: latency ? `${latency}ms` : "N/A" },
    { label: "cost", value: cost ? `$${(cost / 1000000).toFixed(4)}` : "N/A" }
  ]

  return (
    <div className={cn("flex gap-8 text-[10px] sm:text-xs", props.className)}>
      {stats.map(({ label, value }) => (
        <div key={label}>
          <span className="font-light">{label}:</span>{" "}
          <span className="font-semibold">{value}</span>
        </div>
      ))}
    </div>
  )
}
