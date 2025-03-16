'use client';

import { Trash2 } from "lucide-react";

interface DeleteCategoryButtonProps {
  categoryId: number;
}

export function DeleteCategoryButton({ categoryId }: DeleteCategoryButtonProps) {
  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
} 