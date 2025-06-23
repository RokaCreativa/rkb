/**
 * @fileoverview Página de Inicio de Sesión - MODO PRUEBAS
 * @description Solo pide email, sin contraseña. CERO SEGURIDAD.
 */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard-v2";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Por favor ingresa tu email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password: "dummy", // Campo dummy requerido por NextAuth
        redirect: false,
      });

      if (result?.error) {
        setError("Usuario no encontrado en la base de datos");
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">RokaMenu</CardTitle>
          <CardDescription>
            🧪 MODO PRUEBAS - Solo necesitas tu email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Entrar (Solo Email)"}
            </Button>

            <div className="text-xs text-gray-500 text-center mt-4">
              ⚠️ Configuración de pruebas: Sin contraseña requerida
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
