// Importamos las dependencias necesarias
import React from "react";

// Importamos los componentes locales correctamente
import Header from "./components/Header"; // Encabezado de la aplicación
import Sidebar from "./components/Sidebar"; // Barra lateral de navegación

/**
 * Componente de diseño principal del dashboard
 *
 * - Estructura el layout del panel de administración.
 * - Contiene el Sidebar, el Header y el contenido principal.
 * - Recibe `children` como prop para renderizar contenido dinámico.
 */

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar - Barra Lateral de Navegación */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1">
        {/* Header - Encabezado */}
        <Header />

        {/* Contenido principal */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

// Exportamos el componente para su uso en otras partes de la app
export default Layout;
