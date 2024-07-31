import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { profiles } from "./profiles"

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertChat = typeof chats.$inferInsert
export type SelectChat = typeof chats.$inferSelect
