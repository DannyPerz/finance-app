import { icons, type LucideIcon } from "lucide-react";

interface Props {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 18 }: Props) {
  const LucideComponent = icons[name as keyof typeof icons] as
    | LucideIcon
    | undefined;

  if (!LucideComponent) {
    const Fallback = icons["Circle"];
    return <Fallback className={className} size={size} />;
  }

  return <LucideComponent className={className} size={size} />;
}

// Default icon mappings for categories
export const CATEGORY_ICONS: Record<string, string> = {
  // Income
  Salario: "Briefcase",
  Freelance: "Laptop",
  Inversiones: "TrendingUp",
  "Otros Ingresos": "Coins",
  // Expense
  Arriendo: "House",
  Alimentación: "ShoppingCart",
  Transporte: "Car",
  Entretenimiento: "Film",
  Servicios: "Lightbulb",
  Suscripciones: "Smartphone",
  Salud: "Heart",
  Educación: "BookOpen",
  Ropa: "Shirt",
  "Otros Gastos": "Package",
};

// Icons available in the category picker
export const ICON_OPTIONS = [
  "Briefcase",
  "Laptop",
  "TrendingUp",
  "Coins",
  "DollarSign",
  "House",
  "ShoppingCart",
  "Car",
  "Bus",
  "Film",
  "Lightbulb",
  "Smartphone",
  "Heart",
  "BookOpen",
  "Shirt",
  "Package",
  "Music",
  "Plane",
  "Utensils",
  "Coffee",
  "Gamepad2",
  "Dumbbell",
  "Dog",
  "Gift",
  "CreditCard",
  "Wrench",
  "Wifi",
  "Baby",
  "Pill",
  "GraduationCap",
];
