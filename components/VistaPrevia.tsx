import { Category } from '@/app/types/menu';

interface VistaPreviaProps {
  categories: Category[];
  restaurantName: string;
  businessType: string;
}

const VistaPrevia: React.FC<VistaPreviaProps> = ({
  categories,
  restaurantName,
  businessType
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-bold">{restaurantName}</h2>
        <p className="text-gray-300">{businessType}</p>
      </div>

      <div className="divide-y">
        {categories.filter(cat => cat.isVisible ?? true).map((category) => (
          <div key={category.id} className="p-6">
            <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
            <div className="space-y-4">
              {category.products.filter(prod => prod.isVisible ?? true).map((product) => (
                <div key={product.id} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {product.description}
                      </p>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {product.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-semibold">
                    {product.price?.toFixed(2) ?? '0.00'}€
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
