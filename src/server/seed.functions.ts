import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  users,
  categories,
  accounts,
  transactions,
  budgets,
  debts,
  goals,
  recurringTransactions,
} from "@/db/schema";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const resetAndSeed = createServerFn({ method: "POST" }).handler(
  async () => {
    // Delete in FK-safe order (children first)
    await db.delete(recurringTransactions);
    await db.delete(transactions);
    await db.delete(budgets);
    await db.delete(debts);
    await db.delete(goals);
    await db.delete(categories);
    await db.delete(accounts);
    await db.delete(users);

    // Now seed fresh
    return seedFresh();
  },
);

export const seedDatabase = createServerFn({ method: "POST" }).handler(
  async () => {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, TEMP_USER_ID));

    if (existingUser.length > 0) {
      return { message: "Ya existe data, no se hizo seed" };
    }

    return seedFresh();
  },
);

async function seedFresh() {
  // 1. Create temp user
  await db.insert(users).values({
    id: TEMP_USER_ID,
    email: "usuario@finova.app",
    name: "Usuario Demo",
    baseCurrency: "COP",
  });

  // 2. Create default categories
  const defaultCategories = [
    { name: "Alimentación", icon: "utensils", type: "expense" as const },
    { name: "Transporte", icon: "car", type: "expense" as const },
    { name: "Entretenimiento", icon: "gamepad-2", type: "expense" as const },
    { name: "Salud", icon: "heart-pulse", type: "expense" as const },
    { name: "Educación", icon: "book-open", type: "expense" as const },
    { name: "Vivienda", icon: "house", type: "expense" as const },
    {
      name: "Servicios Públicos",
      icon: "lightbulb",
      type: "expense" as const,
    },
    { name: "Suscripciones", icon: "smartphone", type: "expense" as const },
    { name: "Ropa", icon: "shirt", type: "expense" as const },
    { name: "Otros Gastos", icon: "circle", type: "expense" as const },
    { name: "Salario", icon: "briefcase", type: "income" as const },
    { name: "Freelance", icon: "laptop", type: "income" as const },
    { name: "Inversiones", icon: "trending-up", type: "income" as const },
    { name: "Otros Ingresos", icon: "circle", type: "income" as const },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(
      defaultCategories.map((c) => ({
        userId: TEMP_USER_ID,
        name: c.name,
        icon: c.icon,
        type: c.type,
        isDefault: true,
      })),
    )
    .returning();

  const catMap = Object.fromEntries(
    insertedCategories.map((c) => [c.name, c.id]),
  );

  // 3. Create sample accounts
  const insertedAccounts = await db
    .insert(accounts)
    .values([
      {
        userId: TEMP_USER_ID,
        name: "Bancolombia Ahorros",
        type: "bank",
        currency: "COP",
        balance: "8250000",
      },
      {
        userId: TEMP_USER_ID,
        name: "Nequi",
        type: "wallet",
        currency: "COP",
        balance: "1450000",
      },
      {
        userId: TEMP_USER_ID,
        name: "Nu Colombia",
        type: "wallet",
        currency: "COP",
        balance: "2750000",
      },
    ])
    .returning();

  const accMap = Object.fromEntries(
    insertedAccounts.map((a) => [a.name, a.id]),
  );

  // 4. Create sample transactions
  await db.insert(transactions).values([
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Bancolombia Ahorros"],
      categoryId: catMap["Alimentación"],
      type: "expense",
      amount: "185000",
      description: "Supermercado Éxito",
      date: "2026-02-27",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Bancolombia Ahorros"],
      categoryId: catMap["Salario"],
      type: "income",
      amount: "5200000",
      description: "Salario Mensual",
      date: "2026-02-25",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Nequi"],
      categoryId: catMap["Suscripciones"],
      type: "expense",
      amount: "33900",
      description: "Netflix",
      date: "2026-02-24",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Nequi"],
      categoryId: catMap["Transporte"],
      type: "expense",
      amount: "24500",
      description: "Uber",
      date: "2026-02-23",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Nu Colombia"],
      categoryId: catMap["Freelance"],
      type: "income",
      amount: "800000",
      description: "Freelance - Diseño Web",
      date: "2026-02-22",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Nequi"],
      categoryId: catMap["Suscripciones"],
      type: "expense",
      amount: "16900",
      description: "Spotify",
      date: "2026-02-20",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Bancolombia Ahorros"],
      categoryId: catMap["Alimentación"],
      type: "expense",
      amount: "75000",
      description: "Restaurante",
      date: "2026-02-19",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Nu Colombia"],
      categoryId: catMap["Entretenimiento"],
      type: "expense",
      amount: "45000",
      description: "Cine",
      date: "2026-02-18",
    },
  ]);

  // 5. Create sample budgets (Feb 2026)
  await db.insert(budgets).values([
    {
      userId: TEMP_USER_ID,
      categoryId: catMap["Alimentación"],
      amount: "500000",
      month: 2,
      year: 2026,
    },
    {
      userId: TEMP_USER_ID,
      categoryId: catMap["Transporte"],
      amount: "300000",
      month: 2,
      year: 2026,
    },
    {
      userId: TEMP_USER_ID,
      categoryId: catMap["Entretenimiento"],
      amount: "200000",
      month: 2,
      year: 2026,
    },
    {
      userId: TEMP_USER_ID,
      categoryId: catMap["Salud"],
      amount: "150000",
      month: 2,
      year: 2026,
    },
    {
      userId: TEMP_USER_ID,
      categoryId: catMap["Suscripciones"],
      amount: "100000",
      month: 2,
      year: 2026,
    },
    {
      userId: TEMP_USER_ID,
      categoryId: catMap["Servicios Públicos"],
      amount: "400000",
      month: 2,
      year: 2026,
    },
  ]);

  // 6. Create sample debts
  await db.insert(debts).values([
    {
      userId: TEMP_USER_ID,
      name: "Crédito Bancolombia",
      principal: "15000000",
      interestRate: "1.2000",
      totalInstallments: 48,
      paidInstallments: 20,
      monthlyPayment: "420000",
      remainingBalance: "8500000",
    },
    {
      userId: TEMP_USER_ID,
      name: "Tarjeta Nu",
      principal: "3000000",
      interestRate: "2.1000",
      totalInstallments: 24,
      paidInstallments: 16,
      monthlyPayment: "165000",
      remainingBalance: "1200000",
    },
  ]);

  // 7. Create sample goals
  await db.insert(goals).values([
    {
      userId: TEMP_USER_ID,
      name: "Moto nueva",
      targetAmount: "8000000",
      currentAmount: "2100000",
      deadline: "2026-12-01",
    },
    {
      userId: TEMP_USER_ID,
      name: "Fondo de emergencia",
      targetAmount: "10000000",
      currentAmount: "4500000",
      deadline: "2027-06-01",
    },
    {
      userId: TEMP_USER_ID,
      name: "Vacaciones",
      targetAmount: "3500000",
      currentAmount: "800000",
      deadline: "2026-07-15",
    },
  ]);

  // 8. Create sample recurring transactions
  await db.insert(recurringTransactions).values([
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Nequi"],
      categoryId: catMap["Suscripciones"],
      type: "expense",
      amount: "33900",
      description: "Netflix",
      frequency: "monthly",
      nextDate: "2026-03-15",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Nequi"],
      categoryId: catMap["Suscripciones"],
      type: "expense",
      amount: "16900",
      description: "Spotify",
      frequency: "monthly",
      nextDate: "2026-03-20",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Bancolombia Ahorros"],
      categoryId: catMap["Salud"],
      type: "expense",
      amount: "95000",
      description: "Gimnasio",
      frequency: "monthly",
      nextDate: "2026-03-01",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Bancolombia Ahorros"],
      categoryId: catMap["Servicios Públicos"],
      type: "expense",
      amount: "89000",
      description: "Internet Claro",
      frequency: "monthly",
      nextDate: "2026-03-05",
    },
    {
      userId: TEMP_USER_ID,
      accountId: accMap["Bancolombia Ahorros"],
      categoryId: catMap["Salario"],
      type: "income",
      amount: "5200000",
      description: "Salario",
      frequency: "monthly",
      nextDate: "2026-03-30",
    },
  ]);

  return { message: "Seed completado exitosamente ✅" };
}
