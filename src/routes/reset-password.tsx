import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { resetPassword } from "@/lib/auth-client";
import { Icon } from "@/components/Icon";
import { z } from "zod";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async (data: { password: string; confirm: string }) => {
    setError(null);
    setLoading(true);

    try {
      // Better auth implicitly extracts token from URL (?token=...) 
      // when `resetPassword` is called in browser. 
      // But we can also pass it in fetchOptions if needed.
      const result = await resetPassword({
        newPassword: data.password,
        token: search.token!,
      });

      if (result.error) {
        setError(result.error.message || "El enlace inválido o expirado. Solicita uno nuevo.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.navigate({ to: "/login" });
        }, 3000);
      }
    } catch {
      setError("Error interno. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const currentPassword = watch("password");

  if (!search.token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="glass max-w-sm rounded-2xl p-8 text-center animate-in-up">
          <Icon name="AlertTriangle" size={48} className="mx-auto mb-4 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Enlace inválido</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Falta el token de seguridad en la URL o el enlace está mal formado.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md animate-in-up">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30">
            <Icon name="LockKeyhole" className="text-primary shadow-[0_0_14px_var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Crea una nueva contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa tu nueva contraseña para acceder a tu cuenta
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          {success ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                <Icon name="CheckCircle2" size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">¡Contraseña actualizada!</h3>
                <p className="text-sm text-muted-foreground">
                  Tu contraseña fue restablecida con éxito. Redirigiendo al inicio de sesión...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <Icon name="AlertCircle" size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Contraseña */}
              <div className="space-y-2">
                <label
                  htmlFor="reset-password"
                  className="text-sm font-medium text-foreground"
                >
                  Nueva contraseña
                </label>
                <input
                  id="reset-password"
                  type="password"
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 8,
                      message: "Debe tener al menos 8 caracteres",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message as string}</p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <label
                  htmlFor="reset-confirm"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="reset-confirm"
                  type="password"
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
                  {...register("confirm", {
                    required: "Confirma tu contraseña",
                    validate: (val) =>
                      val === currentPassword || "Las contraseñas no coinciden",
                  })}
                />
                {errors.confirm && (
                  <p className="text-xs text-destructive">{errors.confirm.message as string}</p>
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
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Guardar nueva contraseña"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
