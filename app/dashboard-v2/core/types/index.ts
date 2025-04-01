export interface Category {
  category_id: number;
  name: string;
  order: number;
  is_expanded: boolean;
  sections_count: number;
}

export interface Section {
  section_id: number;
  category_id: number;
  name: string;
  order: number;
  image_url: string;
  status: 'active' | 'inactive';
}

export interface Product {
  product_id: number;
  section_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  status: 'active' | 'inactive';
}

export interface DashboardState {
  categories: Category[];
  sections: Section[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: Category | null;
  expandedCategories: number[];
}

export interface DashboardActions {
  setCategories: (categories: Category[]) => void;
  setSections: (sections: Section[]) => void;
  setProducts: (products: Product[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedCategory: (category: Category | null) => void;
  toggleCategoryExpansion: (categoryId: number) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: number) => void;
  addSection: (section: Section) => void;
  updateSection: (section: Section) => void;
  deleteSection: (sectionId: number) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
} 