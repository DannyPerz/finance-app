import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { users, categories, transactions } from "@/db/schema";
import { sql } from "drizzle-orm";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const resetAndSeed = createServerFn({ method: "POST" }).handler(
  async () => {
    // Drop and recreate tables
    await db.execute(sql`DROP TABLE IF EXISTS recurring_transactions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS budgets CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS debts CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS goals CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS exchange_rates CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS transactions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS accounts CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS categories CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

    // Drop old enums
    await db.execute(sql`DROP TYPE IF EXISTS currency CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS account_type CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS frequency CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS transaction_type CASCADE`);
    await db.execute(
      sql`CREATE TYPE transaction_type AS ENUM ('income', 'expense')`,
    );
    await db.execute(
      sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN CREATE TYPE category_type AS ENUM ('income', 'expense'); END IF; END $$`,
    );

    // Recreate tables
    await db.execute(sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'Circle',
        type category_type NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        type transaction_type NOT NULL,
        amount NUMERIC(18,2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Seed user
    await db.insert(users).values({
      id: TEMP_USER_ID,
      email: "demo@finova.app",
      name: "Danny",
    });

    // Seed categories — icons are Lucide component names
    const incomeCategories = [
      { name: "Salario", icon: "Briefcase" },
      { name: "Freelance", icon: "Laptop" },
      { name: "Inversiones", icon: "TrendingUp" },
      { name: "Otros Ingresos", icon: "Coins" },
    ];

    const expenseCategories = [
      { name: "Arriendo", icon: "House" },
      { name: "Alimentación", icon: "ShoppingCart" },
      { name: "Transporte", icon: "Car" },
      { name: "Entretenimiento", icon: "Film" },
      { name: "Servicios", icon: "Lightbulb" },
      { name: "Suscripciones", icon: "Smartphone" },
      { name: "Salud", icon: "Heart" },
      { name: "Educación", icon: "BookOpen" },
      { name: "Ropa", icon: "Shirt" },
      { name: "Otros Gastos", icon: "Package" },
    ];

    const allCats = [
      ...incomeCategories.map((c) => ({
        ...c,
        userId: TEMP_USER_ID,
        type: "income" as const,
        isDefault: true,
      })),
      ...expenseCategories.map((c) => ({
        ...c,
        userId: TEMP_USER_ID,
        type: "expense" as const,
        isDefault: true,
      })),
    ];

    const insertedCats = await db
      .insert(categories)
      .values(allCats)
      .returning();

    const catMap = Object.fromEntries(insertedCats.map((c) => [c.name, c.id]));

    // Seed transactions for current + past 2 months
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    const sampleTx = [
      {
        type: "income" as const,
        amount: "5200000",
        desc: "Salario Mensual",
        cat: "Salario",
        daysAgo: 2,
      },
      {
        type: "income" as const,
        amount: "800000",
        desc: "Freelance - Proyecto Web",
        cat: "Freelance",
        daysAgo: 10,
      },
      {
        type: "expense" as const,
        amount: "1500000",
        desc: "Arriendo Apartamento",
        cat: "Arriendo",
        daysAgo: 1,
      },
      {
        type: "expense" as const,
        amount: "180000",
        desc: "Mercado Semanal",
        cat: "Alimentación",
        daysAgo: 3,
      },
      {
        type: "expense" as const,
        amount: "95000",
        desc: "Restaurante con amigos",
        cat: "Entretenimiento",
        daysAgo: 4,
      },
      {
        type: "expense" as const,
        amount: "33900",
        desc: "Netflix + Spotify",
        cat: "Suscripciones",
        daysAgo: 5,
      },
      {
        type: "expense" as const,
        amount: "24500",
        desc: "Uber al trabajo",
        cat: "Transporte",
        daysAgo: 6,
      },
      {
        type: "expense" as const,
        amount: "65000",
        desc: "Servicios Públicos",
        cat: "Servicios",
        daysAgo: 7,
      },
      {
        type: "expense" as const,
        amount: "120000",
        desc: "Consulta Médica",
        cat: "Salud",
        daysAgo: 8,
      },
      {
        type: "expense" as const,
        amount: "45000",
        desc: "Curso Udemy",
        cat: "Educación",
        daysAgo: 12,
      },
      {
        type: "income" as const,
        amount: "5200000",
        desc: "Salario Mensual",
        cat: "Salario",
        monthOffset: -1,
        day: 28,
      },
      {
        type: "income" as const,
        amount: "450000",
        desc: "Freelance - Logo",
        cat: "Freelance",
        monthOffset: -1,
        day: 15,
      },
      {
        type: "expense" as const,
        amount: "1500000",
        desc: "Arriendo",
        cat: "Arriendo",
        monthOffset: -1,
        day: 1,
      },
      {
        type: "expense" as const,
        amount: "350000",
        desc: "Mercado del Mes",
        cat: "Alimentación",
        monthOffset: -1,
        day: 5,
      },
      {
        type: "expense" as const,
        amount: "75000",
        desc: "Cine + Comida",
        cat: "Entretenimiento",
        monthOffset: -1,
        day: 10,
      },
      {
        type: "expense" as const,
        amount: "33900",
        desc: "Suscripciones",
        cat: "Suscripciones",
        monthOffset: -1,
        day: 3,
      },
      {
        type: "expense" as const,
        amount: "55000",
        desc: "TransMilenio Mensual",
        cat: "Transporte",
        monthOffset: -1,
        day: 2,
      },
      {
        type: "income" as const,
        amount: "5200000",
        desc: "Salario Mensual",
        cat: "Salario",
        monthOffset: -2,
        day: 28,
      },
      {
        type: "expense" as const,
        amount: "1500000",
        desc: "Arriendo",
        cat: "Arriendo",
        monthOffset: -2,
        day: 1,
      },
      {
        type: "expense" as const,
        amount: "400000",
        desc: "Mercado + Varios",
        cat: "Alimentación",
        monthOffset: -2,
        day: 8,
      },
      {
        type: "expense" as const,
        amount: "200000",
        desc: "Ropa nueva",
        cat: "Ropa",
        monthOffset: -2,
        day: 14,
      },
      {
        type: "expense" as const,
        amount: "33900",
        desc: "Suscripciones",
        cat: "Suscripciones",
        monthOffset: -2,
        day: 3,
      },
    ];

    const txValues = sampleTx.map((tx) => {
      let txDate: string;
      if (tx.daysAgo !== undefined) {
        const d = new Date(now);
        d.setDate(d.getDate() - tx.daysAgo);
        txDate = d.toISOString().split("T")[0];
      } else {
        const mo = m + (tx.monthOffset ?? 0);
        const d = new Date(y, mo, tx.day ?? 1);
        txDate = d.toISOString().split("T")[0];
      }
      return {
        userId: TEMP_USER_ID,
        categoryId: catMap[tx.cat],
        type: tx.type,
        amount: tx.amount,
        description: tx.desc,
        date: txDate,
      };
    });

    await db.insert(transactions).values(txValues);

    return { message: "✅ Base de datos reinicializada con datos de ejemplo" };
  },
);
