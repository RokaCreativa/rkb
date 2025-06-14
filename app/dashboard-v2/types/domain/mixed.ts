/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Tipos para Lista Mixta T31 (FASE 1.2)
 * PORQUÉ NECESARIO: Jerarquía híbrida requiere mostrar secciones y productos directos juntos
 * PROBLEMA RESUELTO: Sin estos tipos, no podemos renderizar contenido mixto en una sola lista
 * CONEXIÓN: selectMixedContentForCategory → MixedContentView → estos tipos
 * ARQUITECTURA: Implementa el patrón de discriminated unions para type safety
 */

import { Section } from './section';
import { Product } from './product';

// 🧭 MIGA DE PAN: Discriminated Union para contenido mixto
// PORQUÉ: Permite type safety al renderizar diferentes tipos de items
// PATRÓN v0.dev: itemType como discriminator para switch statements seguros
export type MixedListItem = 
  | (Section & { itemType: 'section' })
  | (Product & { itemType: 'product' });

// 🧭 MIGA DE PAN: Tipo para props del componente MixedContentView
// CONEXIÓN: DashboardViewWrapper → MixedContentView → estas props
export interface MixedContentViewProps {
  items: MixedListItem[];
  onSectionSelect: (section: Section) => void;
  onProductEdit: (product: Product) => void;
  onProductDelete: (product: Product) => void;
  onProductToggleVisibility: (product: Product) => void;
  onSectionEdit: (section: Section) => void;
  onSectionDelete: (section: Section) => void;
  onSectionToggleVisibility: (section: Section) => void;
  onAddSection: () => void;
  onAddProductDirect: () => void;
}

// 🧭 MIGA DE PAN: Helpers para type guards
// PORQUÉ: Facilita el trabajo con discriminated unions en componentes
export const isSectionItem = (item: MixedListItem): item is Section & { itemType: 'section' } => {
  return item.itemType === 'section';
};

export const isProductItem = (item: MixedListItem): item is Product & { itemType: 'product' } => {
  return item.itemType === 'product';
}; 