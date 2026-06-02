"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, clave }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error de autenticación");
        return;
      }
      const from = searchParams.get("from") || "/pagos";
      router.push(from);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#16181c] px-4">
      <Card className="w-full max-w-md border-white/10 shadow-xl">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Inversiones Express
          </p>
          <CardTitle className="text-2xl">Pagos de cuotas</CardTitle>
          <CardDescription>
            Demo — Pago multi-cuota con distribución automática
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clave">Contraseña</Label>
              <Input
                id="clave"
                type="password"
                autoComplete="current-password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-[#16181c] p-3 text-xs text-muted-foreground">
            <p className="font-medium text-gray-400">Credenciales demo:</p>
            <p>admin / admin123 (administrador)</p>
            <p>cobranza / cobranza123 (cobranza)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Cargando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
