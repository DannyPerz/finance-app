import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setLoading(true);

    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (result.error) {
        setError(
          result.error.message ||
            "No se pudo crear la cuenta. Intenta de nuevo.",
        );
      } else {
        router.navigate({ to: "/" });
      }
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md animate-in-up">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30">
            <div className="h-4 w-4 rounded-full bg-primary shadow-[0_0_14px_var(--color-primary)] animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Regístrate para empezar a controlar tus finanzas
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <Icon name="AlertCircle" size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="register-name"
                className="text-sm font-medium text-foreground"
              >
                Nombre
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Tu nombre"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
                {...register("name", {
                  required: "El nombre es requerido",
                })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="register-email"
                className="text-sm font-medium text-foreground"
              >
                Correo electrónico
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
                {...register("email", {
                  required: "El correo es requerido",
                  pattern: {
                    value: /^\S+@\S+$/,
                    message: "Ingresa un correo válido",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="register-password"
                className="text-sm font-medium text-foreground"
              >
                Contraseña
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
                {...register("password", {
                  required: "La contraseña es requerida",
                  minLength: {
                    value: 8,
                    message: "La contraseña debe tener al menos 8 caracteres",
                  },
                })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="register-confirm-password"
                className="text-sm font-medium text-foreground"
              >
                Confirmar contraseña
              </label>
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
                {...register("confirmPassword", {
                  required: "Confirma tu contraseña",
                  validate: (val) =>
                    val === watch("password") || "Las contraseñas no coinciden",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Icon
                    name="Loader2"
                    size={16}
                    className="animate-spin"
                  />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
