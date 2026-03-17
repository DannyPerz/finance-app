import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from "./schemas";

import { getAuthUserId } from "./auth.utils";

export const getCategories = createServerFn().handler(async () => {
  const userId = await getAuthUserId();
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
  return allCategories;
});

export const createCategory = createServerFn({ method: "POST" })
  .inputValidator(createCategorySchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [newCat] = await db
      .insert(categories)
      .values({
        userId,
        name: data.name,
        icon: data.icon,
        type: data.type,
        budget: data.budget || null,
      })
      .returning();
    return newCat;
  });

export const updateCategory = createServerFn({ method: "POST" })
  .inputValidator(updateCategorySchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [updated] = await db
      .update(categories)
      .set({
        name: data.name,
        icon: data.icon,
        type: data.type,
        budget: data.budget || null,
      })
      .where(
        and(eq(categories.id, data.id), eq(categories.userId, userId)),
      )
      .returning();
    return updated;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator(deleteCategorySchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db
      .delete(categories)
      .where(
        and(eq(categories.id, data.id), eq(categories.userId, userId)),
      );
    return { success: true };
  });
