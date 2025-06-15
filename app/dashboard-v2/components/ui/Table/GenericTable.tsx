import React from 'react';

/**
 * @file GenericTable.tsx
 * @description Componente de tabla reutilizable y genérico para mostrar listas de datos.
 * @architecture
 * Este es un componente de UI "puro" y "tonto". No tiene lógica de negocio ni estado propio.
 * Su diseño genérico <T> le permite renderizar cualquier tipo de datos (categorías, secciones, productos)
 * siempre que los datos y las columnas se ajusten a las interfaces definidas.
 *
 * @dependencies
 * - `Column<T>`: Define la estructura de cada columna.
 * - `GenericTableProps<T>`: Define los props que el componente espera.
 *
 * @reasoning
 * Se utiliza una función genérica (`<T extends { [key: string]: any }>`) en lugar de `React.FC`
 * para mejorar la inferencia de tipos de TypeScript. Esto permite que el componente que lo usa
 * (como `CategoryGridView`) pase tipos específicos (`Product`, `Section`) y TypeScript los entienda
 * sin los errores de asignación que ocurrían previamente.
 */

// --- INTERFACES ---

export interface Column<T> {
  key: keyof T | 'actions' | 'content' | 'products' | 'price'; // Añadido 'price' para flexibilidad
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

// --- COMPONENTE ---

export const GenericTable = <T extends { [key: string]: any }>({
  data,
  columns,
  onRowClick,
  emptyMessage = "No hay datos para mostrar.",
}: GenericTableProps<T>): React.ReactElement | null => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">{emptyMessage}</p>;
  }

  // Fallback para key si no hay un id único
  const getRowKey = (item: T, index: number): React.Key => {
    return item.id ?? item.product_id ?? item.section_id ?? item.category_id ?? index;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm">
                  {col.render
                    ? col.render(item)
                    // @ts-ignore - Esta comprobación es segura, pero TS se queja por la naturaleza genérica de T
                    : item[col.key] !== null && typeof item[col.key] !== 'undefined'
                      // @ts-ignore - Igual que arriba, la conversión a string es un fallback seguro.
                      ? String(item[col.key])
                      : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Se asigna el displayName de esta manera para evitar conflictos con la sintaxis de genéricos
(GenericTable as React.FC<any>).displayName = 'GenericTable'; 