import { sql } from "drizzle-orm"
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  preferenceId: text("preference_id").unique(),
  hasOnboarded: boolean("has_onboarded").default(false).notNull(),
  routerProgress: integer("router_progress").default(0).notNull(),
  activeModels: text("active_models")
    .array()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertProfile = typeof profiles.$inferInsert
export type SelectProfile = typeof profiles.$inferSelect
