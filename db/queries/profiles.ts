"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { db } from "../db"
import { InsertProfile, SelectProfile, profiles } from "../schema/profiles"

export const getProfile = async (): Promise<SelectProfile> => {
  const _cookies = cookies() // hack for cache issue

  try {
    const result = await db.select().from(profiles)
    return result[0]
  } catch (error) {
    console.error(`Error fetching profile:`, error)
    throw error
  }
}

export const createProfile = async (
  profile: InsertProfile
): Promise<SelectProfile> => {
  try {
    const result = await db.insert(profiles).values(profile).returning()
    revalidatePath("/")
    return result[0]
  } catch (error) {
    console.error(`Error creating profile:`, error)
    throw error
  }
}

export const updateProfile = async (
  id: string,
  profile: Partial<InsertProfile>
): Promise<SelectProfile> => {
  try {
    const result = await db
      .update(profiles)
      .set(profile)
      .where(eq(profiles.id, id))
      .returning()
    revalidatePath("/")
    return result[0]
  } catch (error) {
    console.error(`Error updating profile:`, error)
    throw error
  }
}
