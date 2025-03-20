// Tipos base
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  active?: boolean;
}

// Usuarios y Autenticación
export interface User extends BaseModel {
  email: string;
  name?: string;
  roleId: string;
  role: Role;
  notifications: Notification[];
}

export interface Role extends BaseModel {
  name: string;
  description?: string;
  users: User[];
}

// Menú y Productos
export interface Menu {
  id: number;
  name: string;
  description?: string;
  userId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: number;
  name: string;
  description?: string;
  menuId: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sectionId: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category extends BaseModel {
  name: string;
  description?: string;
  products: Product[];
}

export interface Allergen extends BaseModel {
  name: string;
  icon?: string;
  products: Product[];
}

// Notificaciones
export interface Notification extends BaseModel {
  type: string;
  message: string;
  read: boolean;
  userId: string;
  user: User;
  data?: any;
}

// Reservas
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Booking extends BaseModel {
  userId: string;
  date: Date;
  time: string;
  guests: number;
  status: BookingStatus;
  notes?: string;
}

// Configuración
export type SettingType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

export interface Setting extends BaseModel {
  key: string;
  value: string;
  type: SettingType;
} 