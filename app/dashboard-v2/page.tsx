import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardView from "./components/DashboardView";

/**
 * Configuración de metadatos para la página de dashboard
 */
export const metadata: Metadata = {
  title: "Dashboard de Menú | RokaMenu",
  description: "Panel de administración para gestionar tu menú digital",
};

/**
 * DashboardPage - Punto de entrada para el dashboard v2
 * 
 * Este archivo es un contenedor que gestiona:
 * 1. Validación básica de autenticación
 * 2. Redirección al login si no hay sesión
 * 3. Renderizado del componente principal DashboardView
 * 
 * Siguiendo principios de arquitectura limpia, este componente se mantiene
 * ligero y delega toda la lógica de negocio al componente DashboardView.
 */
export default async function DashboardPage() {
  // Validación de autenticación y roles del usuario
  const session = await getServerSession(authOptions);
  
  // Redireccionar al login si no hay sesión
  if (!session) {
    redirect("/login");
  }
  
  // COMENTADO TEMPORALMENTE PARA PRUEBAS DE VALIDACIÓN FUNCIONAL
  // Verificar rol de administrador (opcional, según requisitos)
  // if (session.user?.role !== "admin" && session.user?.role !== "superadmin") {
  //   redirect("/unauthorized");
  // }
  
  // Renderizar el dashboard solo si el usuario está autenticado
  return <DashboardView />;
}
