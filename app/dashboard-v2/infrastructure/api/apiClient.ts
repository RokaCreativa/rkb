import { Category, Section, Product } from '../../core/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message);
  }
  return response.json();
}

export const apiClient = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse<Category[]>(response);
  },

  async createCategory(category: Omit<Category, 'category_id'>): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    return handleResponse<Category>(response);
  },

  async updateCategory(category: Category): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${category.category_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    return handleResponse<Category>(response);
  },

  async deleteCategory(categoryId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // Sections
  async getSections(categoryId: number): Promise<Section[]> {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/sections`);
    return handleResponse<Section[]>(response);
  },

  async createSection(section: Omit<Section, 'section_id'>): Promise<Section> {
    const response = await fetch(`${API_BASE_URL}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(section),
    });
    return handleResponse<Section>(response);
  },

  async updateSection(section: Section): Promise<Section> {
    const response = await fetch(`${API_BASE_URL}/sections/${section.section_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(section),
    });
    return handleResponse<Section>(response);
  },

  async deleteSection(sectionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // Products
  async getProducts(sectionId: number): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/products`);
    return handleResponse<Product[]>(response);
  },

  async createProduct(product: Omit<Product, 'product_id'>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return handleResponse<Product>(response);
  },

  async updateProduct(product: Product): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${product.product_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return handleResponse<Product>(response);
  },

  async deleteProduct(productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
}; 