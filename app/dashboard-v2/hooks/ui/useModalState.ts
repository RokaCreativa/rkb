/**
 * =================================================================================
 * 📖 MANDAMIENTO #7: SEPARACIÓN ABSOLUTA DE LÓGICA Y PRESENTACIÓN
 * ---------------------------------------------------------------------------------
 * "Separarás estrictamente la lógica de la presentación. Los componentes UI serán
 * tan simples (‘tontos’) como sea posible. La lógica de negocio, manejo de datos
 * y efectos secundarios vivirán solo en hooks personalizados y librerías auxiliares."
 *
 * Este hook es un ejemplo perfecto de este mandamiento, aislando la lógica de
 * estado de la UI de los componentes que la presentan.
 * =================================================================================
 */

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook para Estado de UI de Modales
 *
 * 📍 UBICACIÓN: app/dashboard-v2/hooks/ui/useModalState.ts
 *
 * 🎯 PORQUÉ EXISTE:
 * Para centralizar y aislar el estado *visual* de los modales (qué modal está abierto,
 * si está enviando datos) del estado de *datos* de la aplicación (que vive en `dashboardStore`).
 * Es la ÚNICA fuente de verdad para el estado de la UI de los modales.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Un componente UI (ej. `DashboardView`) llama a `openModal()`.
 * 2. El componente del modal (ej. `EditProductModal`) recibe `isSubmitting` y `setIsSubmitting` como props.
 * 3. Al hacer clic en "Guardar", el modal llama a `setIsSubmitting(true)`.
 * 4. El modal invoca la acción del `dashboardStore` (ej. `updateProduct`).
 * 5. En el bloque `finally` de la llamada, el modal invoca `setIsSubmitting(false)`.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - CONSUMIDO POR: Cualquier componente que necesite abrir un modal (ej. `DashboardView`, `MobileView`).
 * - CONTROLA A: `EditModals.tsx`, `DeleteConfirmationModal.tsx`.
 * - LLAMA A: Acciones del `useDashboardStore` para ejecutar lógica de negocio (ej. `deleteCategory`).
 *
 * 🚨 PROBLEMA RESUELTO:
 * - Eliminó el acoplamiento fuerte donde `dashboardStore` intentaba modificar el estado de la UI.
 * - Solucionó el error `TypeError: Cannot set properties of undefined (setting 'isSubmitting')`.
 * - Fecha de resolución: 2025-06-18.
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - Este hook NO conoce la lógica de negocio. Solo gestiona el estado de la UI.
 * - Delega todas las acciones de negocio al `dashboardStore`.
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - #6 (Separación de Responsabilidades): Es la encarnación de este mandamiento.
 * - #7 (Código Legible y Documentado): La existencia de este hook clarifica la arquitectura.
 */
"use client"

import { useState } from "react"
import { useDashboardStore } from "@/app/dashboard-v2/stores/dashboardStore"
import type { Category, Section, Product } from "@/app/dashboard-v2/types"

// --- TIPOS ---
export type ModalType = "editCategory" | "editSection" | "editProduct" | "deleteConfirmation" | null
export type ItemType = "category" | "section" | "product"
type ModalData = Category | Section | Product | null

export interface ModalOptions {
  item?: ModalData
  type?: ItemType
  isDirect?: boolean
  isGlobal?: boolean
  parentId?: number
}

interface FullModalState {
  type: ModalType
  options: ModalOptions
}

// --- HOOK ---
export const useModalState = () => {
  const [modalState, setModalState] = useState<FullModalState>({
    type: null,
    options: {},
  })

  const { deleteCategory, deleteSection, deleteProduct } = useDashboardStore()

  const openModal = (type: ModalType, options: ModalOptions = {}) => {
    setModalState({ type, options })
  }

  const closeModal = () => {
    setModalState({ type: null, options: {} })
  }

  const handleConfirmDelete = () => {
    const { item, type } = modalState.options
    if (!item || !type) return

    switch (type) {
      case "category":
        deleteCategory((item as Category).category_id)
        break
      case "section":
        deleteSection((item as Section).section_id)
        break
      case "product":
        deleteProduct((item as Product).product_id)
        break
      default:
        break
    }
    closeModal()
  }

  return {
    modalState,
    openModal,
    closeModal,
    handleConfirmDelete,
  }
}
