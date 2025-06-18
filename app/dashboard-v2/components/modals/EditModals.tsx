/**
 * =================================================================================
 * 📖 MANDAMIENTO #7: SEPARACIÓN ABSOLUTA DE LÓGICA Y PRESENTACIÓN
 * ---------------------------------------------------------------------------------
 * Estos componentes de modal son "tontos" en el buen sentido. Renderizan una UI
 * basada en props (`isOpen`, `item`, `isSubmitting`) y delegan toda la lógica
 * de negocio (`handleSave`) a los stores y hooks correspondientes.
 * =================================================================================
 */
"use client"

import type React from "react"
import { useRef, useState } from "react"
import { BaseModal } from "@/app/dashboard-v2/components/ui/Modal/BaseModal"
import { Button } from "@/app/dashboard-v2/components/ui/Button/Button"
import type { Category, Section, Product } from "@/app/dashboard-v2/types"

import { CategoryForm, type CategoryFormRef } from "../domain/categories/CategoryForm"
import { SectionForm, type SectionFormRef } from "../domain/sections/SectionForm"
import { ProductForm, type ProductFormRef } from "../domain/products/ProductForm"

type ItemWithId = Category | Section | Product
type FormDataWithImage = { data: Partial<ItemWithId>; imageFile: File | null | undefined }

interface EditModalProps<T extends ItemWithId> {
  isOpen: boolean
  onClose: () => void
  item: T | null
  itemType: "Categoría" | "Sección" | "Producto"
  onSave: (formData: FormDataWithImage) => Promise<void>
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente de Modal Genérico y Controlado
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/modals/EditModals.tsx → EditModal
 *
 * 🎯 PORQUÉ EXISTE:
 * Para proporcionar una UI de modal reutilizable (DRY) que actúa como un orquestador
 * entre la interacción del usuario, el estado de la UI y la lógica de datos. Es un
 * componente "controlado" para su estado de envío.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe `isSubmitting` y `setIsSubmitting` como props desde un hook padre (`useModalState`).
 * 2. El botón "Guardar" está deshabilitado si `isSubmitting` es `true`.
 * 3. `handleSave` usa `setIsSubmitting` para controlar la UI mientras llama a la acción
 *    del `dashboardStore` y espera su resolución.
 *
 * 🚨 PROBLEMA RESUELTO:
 * - Desacopla la lógica de renderizado del modal de la lógica de estado de envío,
 *   haciendo el componente más predecible, reutilizable y fácil de testear.
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - Este componente no contiene lógica de negocio. Delega todo al `dashboardStore`
 *   a través de las acciones correspondientes.
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - #3 (DRY - Don't Repeat Yourself): Un modal para gobernar a todos.
 * - #6 (Separación de Responsabilidades): Separa UI de lógica de negocio.
 * - #8 (Consistencia Visual): Asegura que todos los modales de edición se vean igual.
 */
const EditModal = <T extends ItemWithId>({
  isOpen,
  onClose,
  item,
  itemType,
  onSave,
}: EditModalProps<T>) => {
  const formRef = useRef<CategoryFormRef | SectionFormRef | ProductFormRef>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const title = item ? `Editar ${itemType}` : `Crear ${itemType}`

  const handleSave = async () => {
    if (!formRef.current) return
    setIsSubmitting(true)
    try {
      const formData = formRef.current.getFormData()
      await onSave(formData)
    } catch (error) {
      // El error ya se maneja (y se muestra en un toast) en la función onSave del padre.
      // Solo lo logueamos aquí para depuración si es necesario.
      console.error(`❌ Error capturado en el componente Modal:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button onClick={handleSave} disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </div>
  )

  const renderForm = () => {
    switch (itemType) {
      case "Categoría":
        return <CategoryForm ref={formRef as React.Ref<CategoryFormRef>} category={item as Category | null} />
      case "Sección":
        return <SectionForm ref={formRef as React.Ref<SectionFormRef>} section={item as Section | null} />
      case "Producto":
        return <ProductForm ref={formRef as React.Ref<ProductFormRef>} product={item as Product | null} />
      default:
        return null
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="xl">
      {renderForm()}
    </BaseModal>
  )
}

// --- EXPORTACIONES ESPECÍFICAS ---
interface ModalWrapperProps<T> {
  isOpen: boolean
  onClose: () => void
  item: T | null
  onSave: (formData: FormDataWithImage) => Promise<void>
}

export const EditCategoryModal: React.FC<ModalWrapperProps<Category>> = (props) => (
  <EditModal {...props} itemType="Categoría" />
)

export const EditSectionModal: React.FC<ModalWrapperProps<Section>> = (props) => (
  <EditModal {...props} itemType="Sección" />
)

export const EditProductModal: React.FC<ModalWrapperProps<Product>> = (props) => (
  <EditModal {...props} itemType="Producto" />
)
