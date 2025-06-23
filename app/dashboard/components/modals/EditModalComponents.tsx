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
import { BaseModal } from "@/app/dashboard/components/ui/Modal/BaseModal"
import { Button } from "@/app/dashboard/components/ui/Button/Button"
import type { Category, Section, Product } from "@/app/dashboard/types"

import { CategoryForm, type CategoryFormRef } from "../domain/categories/CategoryEditModalForm"
import { SectionForm, type SectionFormRef } from "../domain/sections/SectionEditModalForm"
import { ProductForm, type ProductFormRef } from "../domain/products/ProductEditModalForm"

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
 * 🧭 MIGA DE PAN CONTEXTUAL: Modales de Edición Unificados (T36 Completado)
 *
 * 📍 UBICACIÓN: components/modals/EditModalComponents.tsx → Sistema Modales Centralizado
 *
 * 🎯 PORQUÉ EXISTE:
 * Implementa el sistema de modales unificado (T36) proporcionando un modal genérico
 * reutilizable para todas las entidades (Categorías, Secciones, Productos). Elimina
 * duplicación de código y garantiza consistencia visual y comportamental. Cumple
 * Mandamiento #7 (Separación) siendo componentes "tontos" que delegan lógica.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. useModalState hook → openModal() → isOpen: true
 * 2. EditModal genérico → renderForm() según itemType
 * 3. FormRef → getFormData() → {data, imageFile}
 * 4. onSave callback → dashboardStore action
 * 5. Success/Error → closeModal() automático | toast feedback
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: useModalState.tsx → modalState + callbacks
 * - ENTRADA: DesktopMasterDetailView + MobileDrillDownView → openModal calls
 * - SALIDA: CategoryForm, SectionForm, ProductForm → formularios específicos
 * - SALIDA: BaseModal → wrapper UI consistente
 * - STORE: dashboardStore → actions CRUD via onSave callback
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #36):
 * - Antes: Cada entidad tenía su propio modal con lógica duplicada
 * - Error: Inconsistencias UX, estado de loading disperso, código repetitivo
 * - Solución: Modal genérico + FormRef pattern + estado centralizado
 * - Beneficio: DRY, consistencia UX, mantenimiento simplificado
 * - Fecha: 2025-01-10 - Sistema modales unificado completado
 *
 * 🎯 CASOS DE USO REALES:
 * - Crear categoría → EditCategoryModal → CategoryForm → dashboardStore.createCategory
 * - Editar producto → EditProductModal → ProductForm → dashboardStore.updateProduct
 * - Loading state → isSubmitting: true → botón "Guardando..." disabled
 * - Error handling → toast automático + modal permanece abierto
 * - Success → closeModal() automático + UI actualizada
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - Componentes "tontos": SOLO renderizado, NO lógica de negocio
 * - FormRef pattern: acceso imperativo a datos de formulario
 * - isSubmitting: controla estado loading durante operaciones async
 * - onSave callback: SIEMPRE debe manejar errores con try/catch
 * - itemType: determina qué formulario específico renderizar
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: BaseModal component para wrapper UI
 * - REQUIERE: CategoryForm, SectionForm, ProductForm components
 * - REQUIERE: useModalState hook como orquestador
 * - REQUIERE: dashboardStore actions funcionales
 * - ROMPE SI: FormRef.getFormData() no implementado
 * - ROMPE SI: onSave callback no maneja errores
 *
 * 📊 PERFORMANCE:
 * - Conditional rendering → solo renderiza modal cuando isOpen
 * - FormRef → acceso directo sin re-renders de estado
 * - Loading state → UX feedback sin bloquear interfaz
 * - Error boundaries → errores no crashean aplicación
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): UI "tonta", lógica en hooks/store
 * - Mandamiento #3 (DRY): Un modal genérico para todas las entidades
 * - Mandamiento #6 (Consistencia): UX uniforme en todos los modales
 * - Mandamiento #8 (Calidad): Error handling robusto y predecible
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
