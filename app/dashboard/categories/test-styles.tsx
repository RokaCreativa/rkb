"use client";

/**
 * Componente de prueba para verificar estilos
 */
export default function TestStyles() {
  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Prueba de Estilos</h1>
      
      <table className="min-w-full">
        <thead>
          <tr className="bg-indigo-50">
            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wider">Encabezado 1</th>
            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wider">Encabezado 2</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-indigo-50 transition-colors">
            <td className="px-4 py-2 text-black font-bold">Este texto debe ser negro y bold</td>
            <td className="px-4 py-2 text-black font-medium">Este también debe ser negro</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 