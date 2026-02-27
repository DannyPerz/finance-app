import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createCategorySchema } from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getCategories = createServerFn().handler(async () => {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, TEMP_USER_ID))
    .orderBy(categories.name);
  return result;
});

export const createCategory = createServerFn({ method: "POST" })
  .inputValidator(createCategorySchema)
  .handler(async ({ data }) => {
    const [newCat] = await db
      .insert(categories)
      .values({
        userId: TEMP_USER_ID,
        name: data.name,
        icon: data.icon,
        type: data.type,
      })
      .returning();
    return newCat;
  });
