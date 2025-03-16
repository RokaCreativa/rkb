import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Eye, EyeOff, GripVertical, Plus, Settings, Trash, X, Image as ImageIcon } from 'lucide-react';
import { Categoria, Producto } from '@/app/types/menu';

interface MenuCategoriasProps {
  categorias: Categoria[];
  onUpdateCategorias: (categorias: Categoria[]) => void;
  tipoNegocioId: number;
}

const MenuCategorias: React.FC<MenuCategoriasProps> = ({
  categorias,
  onUpdateCategorias,
  tipoNegocioId
}) => {
  const [categoriasState, setCategoriasState] = useState<Categoria[]>(categorias);
  const [categoriaEditando, setCategoriaEditando] = useState<number | null>(null);
  const [productoEditando, setProductoEditando] = useState<{
    categoriaId: number;
    producto: Producto | null;
  } | null>(null);
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '' });
  const [nuevoProducto, setNuevoProducto] = useState<Partial<Producto>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    visible: true
  });

  // Actualizar vista previa cuando cambian las categorías
  useEffect(() => {
    onUpdateCategorias(categoriasState);
  }, [categoriasState, onUpdateCategorias]);

  // Determinar si mostrar campos de restaurante basado en el tipo de negocio
  const mostrarCamposRestaurante = [1, 2, 3].includes(tipoNegocioId); // IDs para restaurantes, cafeterías, etc.

  const agregarCategoria = () => {
    if (!nuevaCategoria.nombre.trim()) return;

    const newId = Math.max(0, ...categoriasState.map(c => c.id)) + 1;
    const nuevaCat: Categoria = {
      id: newId,
      nombre: nuevaCategoria.nombre,
      visible: true,
      productos: []
    };

    const nuevasCategorias = [...categoriasState, nuevaCat];
    setCategoriasState(nuevasCategorias);
    onUpdateCategorias(nuevasCategorias);
    setNuevaCategoria({ nombre: '' });
    setMostrarFormCategoria(false);
  };

  const agregarProducto = (categoriaId: number) => {
    setProductoEditando({
      categoriaId,
      producto: null
    });
    setNuevoProducto({
      nombre: '',
      descripcion: '',
      precio: 0,
      visible: true,
      etiquetas: [],
      alergenos: []
    });
  };

  const guardarProducto = () => {
    if (!productoEditando || !nuevoProducto.nombre) return;

    const nuevasCategorias = categoriasState.map(cat => {
      if (cat.id === productoEditando.categoriaId) {
        if (productoEditando.producto) {
          // Editando producto existente
          return {
            ...cat,
            productos: cat.productos.map(prod => 
              prod.id === productoEditando.producto?.id 
                ? { ...prod, ...nuevoProducto }
                : prod
            )
          };
        } else {
          // Agregando nuevo producto
          const newId = Math.max(0, ...cat.productos.map(p => p.id)) + 1;
          return {
            ...cat,
            productos: [...cat.productos, { 
              id: newId,
              ...nuevoProducto as Producto
            }]
          };
        }
      }
      return cat;
    });

    setCategoriasState(nuevasCategorias);
    onUpdateCategorias(nuevasCategorias);
    setProductoEditando(null);
  };

  const editarProducto = (categoriaId: number, producto: Producto) => {
    setProductoEditando({
      categoriaId,
      producto
    });
    setNuevoProducto({
      ...producto
    });
  };

  const toggleCategoriaVisibilidad = (categoriaId: number) => {
    const nuevasCategorias = categoriasState.map(cat => {
      if (cat.id === categoriaId) {
        return { ...cat, visible: !cat.visible };
      }
      return cat;
    });
    setCategoriasState(nuevasCategorias);
    onUpdateCategorias(nuevasCategorias);
  };

  const toggleProductoVisibilidad = (categoriaId: number, productoId: number) => {
    const nuevasCategorias = categoriasState.map(cat => {
      if (cat.id === categoriaId) {
        return {
          ...cat,
          productos: cat.productos.map(prod => {
            if (prod.id === productoId) {
              return { ...prod, visible: !prod.visible };
            }
            return prod;
          }),
        };
      }
      return cat;
    });
    setCategoriasState(nuevasCategorias);
    onUpdateCategorias(nuevasCategorias);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categoriasState);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCategoriasState(items);
    onUpdateCategorias(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categorías y Productos</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setMostrarFormCategoria(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {mostrarFormCategoria && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Nueva Categoría</h3>
            <button
              onClick={() => setMostrarFormCategoria(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la categoría
              </label>
              <input
                type="text"
                value={nuevaCategoria.nombre}
                onChange={(e) => setNuevaCategoria({ nombre: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Ej: Entrantes, Postres, etc."
              />
            </div>
            <button
              onClick={agregarCategoria}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              Crear Categoría
            </button>
          </div>
        </div>
      )}

      {/* Modal para editar/crear producto */}
      {productoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">
                {productoEditando.producto ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setProductoEditando(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    placeholder="Ej: Pizza Margherita"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={nuevoProducto.descripcion}
                    onChange={(e) => setNuevoProducto(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full p-2 border rounded-md h-24"
                    placeholder="Describe el producto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    value={nuevoProducto.precio}
                    onChange={(e) => setNuevoProducto(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-2 border rounded-md"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Arrastra una imagen aquí o
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      selecciona un archivo
                    </button>
                  </div>
                </div>

                {mostrarCamposRestaurante && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Etiquetas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Picante', 'Sin gluten', 'Sin lácteos', 'Vegano', 'Vegetariano'].map((etiqueta) => (
                          <button
                            key={etiqueta}
                            onClick={() => {
                              const etiquetas = nuevoProducto.etiquetas || [];
                              setNuevoProducto(prev => ({
                                ...prev,
                                etiquetas: etiquetas.includes(etiqueta)
                                  ? etiquetas.filter(e => e !== etiqueta)
                                  : [...etiquetas, etiqueta]
                              }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm ${
                              (nuevoProducto.etiquetas || []).includes(etiqueta)
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {etiqueta}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alérgenos
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {/* Aquí irían los alérgenos */}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setProductoEditando(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={guardarProducto}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categorias">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {categoriasState.map((categoria, index) => (
                <Draggable
                  key={categoria.id}
                  draggableId={categoria.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border rounded-lg bg-white overflow-hidden"
                    >
                      {/* Cabecera de categoría */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <h3 className="font-medium">{categoria.nombre}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCategoriaVisibilidad(categoria.id)}
                            className={`p-1 rounded-lg hover:bg-gray-100 ${
                              categoria.visible ? 'text-green-600' : 'text-gray-400'
                            }`}
                          >
                            {categoria.visible ? (
                              <Eye className="w-5 h-5" />
                            ) : (
                              <EyeOff className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => setCategoriaEditando(categoria.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          <button className="p-1 rounded-lg hover:bg-gray-100 text-red-400">
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Lista de productos */}
                      <div className="p-4">
                        <div className="space-y-2">
                          {categoria.productos.map((producto) => (
                            <div
                              key={producto.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-gray-300" />
                                <div>
                                  <p className="font-medium">{producto.nombre}</p>
                                  {producto.descripcion && (
                                    <p className="text-sm text-gray-500">
                                      {producto.descripcion}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {producto.precio.toFixed(2)}€
                                </span>
                                <button
                                  onClick={() =>
                                    toggleProductoVisibilidad(
                                      categoria.id,
                                      producto.id
                                    )
                                  }
                                  className={`p-1 rounded-lg hover:bg-gray-100 ${
                                    producto.visible
                                      ? 'text-green-600'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {producto.visible ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    editarProducto(categoria.id, producto)
                                  }
                                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          onClick={() => agregarProducto(categoria.id)}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Agregar Producto</span>
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default MenuCategorias; 