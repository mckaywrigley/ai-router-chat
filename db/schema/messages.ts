import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core"
import { chats } from "./chats"
import { profiles } from "./profiles"

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  role: varchar("role", {
    length: 256,
    enum: ["user", "assistant", "system"]
  }).notNull(),
  provider: varchar("provider", {
    length: 256,
    enum: ["openai", "anthropic", "google", "groq", "perplexity"]
  }).notNull(),
  model: varchar("model", { length: 256 }).notNull(),
  turn: integer("turn").notNull(),
  thumbsUp: boolean("thumbs_up"),
  arenaMessage: boolean("arena_message").default(false).notNull(),
  isPreferred: boolean("is_preferred"),
  latency: integer("latency"), // in milliseconds
  cost: integer("cost"), // in 1/100 of a cent (Ex: 100 is $0.01, 10000 is $1.00)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertMessage = typeof messages.$inferInsert
export type SelectMessage = typeof messages.$inferSelect
