export interface BaseEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  image?: string;
  order: number;
  categoryId: number;
  isActive: boolean;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  order: number;
  menuId: number;
  products: Product[];
  isActive: boolean;
}

export interface Menu extends BaseEntity {
  name: string;
  description?: string;
  userId: string;
  categories: Category[];
  isActive: boolean;
}
