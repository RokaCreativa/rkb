import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { categorias, productos, alergenos_producto, alergenos } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Menú - RokaMenu',
  description: 'Gestión de menús y productos',
};

type ProductWithAllergens = productos & {
  alergenos: (alergenos_producto & {
    alergeno: alergenos;
  })[];
};

type CategoriaWithProducts = categorias & {
  productos: ProductWithAllergens[];
};

async function getCategories(): Promise<CategoriaWithProducts[]> {
  const categories = await prisma.categorias.findMany({
    where: {
      estatus: 'A',
      eliminado: 'N'
    },
    orderBy: {
      orden: 'asc'
    },
    include: {
      productos: {
        where: {
          estatus: 'A',
          eliminado: 'N'
        },
        orderBy: {
          orden: 'asc'
        },
        include: {
          alergenos: {
            include: {
              alergeno: true
            }
          }
        }
      }
    }
  });

  return categories as CategoriaWithProducts[];
}

export default async function MenuPage() {
  const categories = await getCategories();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Menú</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{category.nombre}</h2>
              <span className="text-sm text-gray-500">
                {category.productos.length} productos
              </span>
            </div>

            {category.foto && (
              <img
                src={`/images/categories/${category.foto}`}
                alt={category.nombre}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}

            <div className="space-y-2">
              {category.productos.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <h3 className="font-medium">{product.nombre}</h3>
                    {product.descripcion && (
                      <p className="text-sm text-gray-500">{product.descripcion}</p>
                    )}
                    {product.alergenos.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {product.alergenos.map((pa) => (
                          <img
                            key={pa.alergeno.id}
                            src={`/images/allergens/${pa.alergeno.icono}`}
                            alt={pa.alergeno.nombre}
                            title={pa.alergeno.nombre}
                            className="w-4 h-4"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold">
                    {(product.precio || 0).toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 