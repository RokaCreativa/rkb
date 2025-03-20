"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { EyeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

// Definimos las interfaces para tipar correctamente
interface Categoria {
  id: number;
  name: string;
  image: string | null;
  display_order: number;
  status: number;
}

interface MenuCategoriasProps {
  categorias: Categoria[];
  setCategorias: (categorias: Categoria[]) => void;
}

export default function MenuCategorias({ categorias, setCategorias }: MenuCategoriasProps) {
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);

  // Función para manejar el drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = [...categorias];
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setCategorias(reorderedItems);
  };

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold mb-4">Categorías</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categorias">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2 bg-white p-4 shadow rounded-lg"
            >
              {categorias.map((categoria, index) => (
                <Draggable key={categoria.id} draggableId={String(categoria.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-4 flex items-center justify-between border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedCategory(categoria)}
                    >
                      <div className="flex items-center space-x-4">
                        <Image
                          src={categoria.image || "/images/placeholder.png"}
                          alt={categoria.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <span className="text-lg font-medium">{categoria.name}</span>
                      </div>
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Vista previa de la categoría seleccionada */}
      {selectedCategory && (
        <div className="w-full bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-center">{selectedCategory.name}</h3>
          {selectedCategory.image && (
            <Image
              src={selectedCategory.image}
              alt={selectedCategory.name}
              width={320}
              height={160}
              className="rounded mx-auto"
            />
          )}
        </div>
      )}
    </div>
  );
}
