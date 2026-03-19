import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { forgetPassword } from "@/lib/auth-client";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setError(null);
    setLoading(true);

    try {
      const result = await forgetPassword({
        email: data.email,
        redirectTo: "/reset-password",
      });
      if (result.error) {
        setError(result.error.message || "No se pudo enviar el correo. Verifica que la dirección sea correcta.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Ocurrió un error inesperado al solicitar el restablecimiento.");
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
            <Icon name="Key" className="text-primary shadow-[0_0_14px_var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa tu correo para recibir un enlace de recuperación
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
                <h3 className="text-lg font-medium text-foreground">Revisa tu correo</h3>
                <p className="text-sm text-muted-foreground">
                  Te hemos enviado un enlace para restablecer tu contraseña. Puedes cerrar esta página.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-input bg-background/50 text-sm font-semibold hover:bg-muted transition-colors"
              >
                Volver al inicio de sesión
              </Link>
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

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="forgot-email"
                  className="text-sm font-medium text-foreground"
                >
                  Correo electrónico
                </label>
                <input
                  id="forgot-email"
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
                  <p className="text-xs text-destructive">{errors.email.message}</p>
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
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          {!success && (
            <>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">o</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline transition-colors"
                >
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
