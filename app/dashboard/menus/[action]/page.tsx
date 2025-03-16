"use client";

import { useState, useEffect } from "react";
import { Menu, Section } from "@/app/types/models";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Props {
  params: {
    action: string;
  };
}

export default function MenuForm({ params }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isNew = params.action === "nuevo";
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [menu, setMenu] = useState<Partial<Menu>>({
    name: "",
    description: "",
  });
  const [sections, setSections] = useState<Section[]>([]);
  const [newSection, setNewSection] = useState({ name: "", description: "" });
  const [isAddingSectionVisible, setIsAddingSectionVisible] = useState(false);

  useEffect(() => {
    if (!isNew && params.action) {
      fetchMenu();
      fetchSections();
    }
  }, [isNew, params.action]);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/menus/${params.action}`);
      if (!response.ok) throw new Error("Error al obtener menú");
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!params.action || params.action === "nuevo") return;
    try {
      const response = await fetch(`/api/sections?menuId=${params.action}`);
      if (!response.ok) throw new Error("Error al obtener secciones");
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setIsSaving(true);

    try {
      const response = await fetch("/api/menus", {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...menu,
          id: !isNew ? params.action : undefined,
        }),
      });

      if (!response.ok) throw new Error("Error al guardar menú");
      router.push("/dashboard/menus");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu.id) return;

    try {
      const response = await fetch("/api/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSection,
          menuId: menu.id,
        }),
      });

      if (!response.ok) throw new Error("Error al crear sección");
      const data = await response.json();
      setSections([...sections, data]);
      setNewSection({ name: "", description: "" });
      setIsAddingSectionVisible(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sección?")) return;

    try {
      const response = await fetch("/api/sections", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: sectionId }),
      });

      if (!response.ok) throw new Error("Error al eliminar sección");
      setSections(sections.filter((s) => s.id !== sectionId));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cargando...</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-32 w-full rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/menus"
            className="mb-2 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver a menús
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Nuevo Menú" : "Editar Menú"}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={menu.name}
              onChange={(e) => setMenu({ ...menu, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none sm:text-sm"
              placeholder="Nombre del menú"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>
            <textarea
              id="description"
              value={menu.description || ""}
              onChange={(e) => setMenu({ ...menu, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none sm:text-sm"
              placeholder="Descripción del menú (opcional)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/menus"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>

        {!isNew && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Secciones</h2>
              <button
                onClick={() => setIsAddingSectionVisible(true)}
                className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                Añadir Sección
              </button>
            </div>

            {isAddingSectionVisible && (
              <form onSubmit={handleAddSection} className="space-y-4 rounded-lg border bg-white p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Nombre de la sección"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={newSection.description}
                    onChange={(e) =>
                      setNewSection({ ...newSection, description: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Descripción (opcional)"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingSectionVisible(false)}
                    className="rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-4"
                >
                  <div className="flex items-center">
                    <button className="mr-2 cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <div>
                      <h3 className="font-medium text-gray-900">{section.name}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-500">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 