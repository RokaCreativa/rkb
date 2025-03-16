import { Categoria } from '@/app/types/menu';

interface VistaPreviaProps {
  categorias: Categoria[];
  nombreRestaurante: string;
  tipoNegocio: string;
}

const VistaPrevia: React.FC<VistaPreviaProps> = ({
  categorias,
  nombreRestaurante,
  tipoNegocio
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-bold">{nombreRestaurante}</h2>
        <p className="text-gray-300">{tipoNegocio}</p>
      </div>

      <div className="divide-y">
        {categorias.filter(cat => cat.visible).map((categoria) => (
          <div key={categoria.id} className="p-6">
            <h3 className="text-xl font-semibold mb-4">{categoria.nombre}</h3>
            <div className="space-y-4">
              {categoria.productos.filter(prod => prod.visible).map((producto) => (
                <div key={producto.id} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{producto.nombre}</h4>
                    {producto.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">
                        {producto.descripcion}
                      </p>
                    )}
                    {producto.etiquetas && producto.etiquetas.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {producto.etiquetas.map((etiqueta) => (
                          <span
                            key={etiqueta}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {etiqueta}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-semibold">
                    {producto.precio.toFixed(2)}€
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaPrevia; 