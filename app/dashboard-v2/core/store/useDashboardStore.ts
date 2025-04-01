import { create } from 'zustand';
import { DashboardState, DashboardActions, Category, Section, Product } from '../types';

const initialState: DashboardState = {
  categories: [],
  sections: [],
  products: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
  expandedCategories: [],
};

export const useDashboardStore = create<DashboardState & DashboardActions>((set: any) => ({
  ...initialState,

  setCategories: (categories: Category[]) => set({ categories }),
  setSections: (sections: Section[]) => set({ sections }),
  setProducts: (products: Product[]) => set({ products }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setSelectedCategory: (category: Category | null) => set({ selectedCategory: category }),

  toggleCategoryExpansion: (categoryId: number) =>
    set((state: DashboardState) => ({
      expandedCategories: state.expandedCategories.includes(categoryId)
        ? state.expandedCategories.filter((id: number) => id !== categoryId)
        : [...state.expandedCategories, categoryId],
    })),

  addCategory: (category: Category) =>
    set((state: DashboardState) => ({
      categories: [...state.categories, category],
    })),

  updateCategory: (category: Category) =>
    set((state: DashboardState) => ({
      categories: state.categories.map((c: Category) =>
        c.category_id === category.category_id ? category : c
      ),
    })),

  deleteCategory: (categoryId: number) =>
    set((state: DashboardState) => ({
      categories: state.categories.filter((c: Category) => c.category_id !== categoryId),
      sections: state.sections.filter((s: Section) => s.category_id !== categoryId),
    })),

  addSection: (section: Section) =>
    set((state: DashboardState) => ({
      sections: [...state.sections, section],
    })),

  updateSection: (section: Section) =>
    set((state: DashboardState) => ({
      sections: state.sections.map((s: Section) =>
        s.section_id === section.section_id ? section : s
      ),
    })),

  deleteSection: (sectionId: number) =>
    set((state: DashboardState) => ({
      sections: state.sections.filter((s: Section) => s.section_id !== sectionId),
      products: state.products.filter((p: Product) => p.section_id !== sectionId),
    })),

  addProduct: (product: Product) =>
    set((state: DashboardState) => ({
      products: [...state.products, product],
    })),

  updateProduct: (product: Product) =>
    set((state: DashboardState) => ({
      products: state.products.map((p: Product) =>
        p.product_id === product.product_id ? product : p
      ),
    })),

  deleteProduct: (productId: number) =>
    set((state: DashboardState) => ({
      products: state.products.filter((p: Product) => p.product_id !== productId),
    })),
})); 