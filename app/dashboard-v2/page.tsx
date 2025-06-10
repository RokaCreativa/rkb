/**
 * @file app/dashboard-v2/page.tsx
 * @description Página principal del dashboard.
 * @architecture
 * Este componente actúa como un simple punto de entrada.
 * Toda la lógica de sesión, renderizado condicional y carga de datos
 * se delega al componente `DashboardClient` para separar las
 * responsabilidades y manejar correctamente los hooks de cliente.
 */

import { Metadata } from "next";
import DashboardClient from "./components/core/DashboardClient";

/**
 * Configuración de metadatos para la página de dashboard
 */
export const metadata: Metadata = {
  title: "Dashboard - RokaMenu",
  description: "Panel de control para la gestión de menús digitales",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
