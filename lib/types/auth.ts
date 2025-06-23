/**
 * @fileoverview Tipos de Autenticación Centralizados
 * @description Definiciones de tipos TypeScript para NextAuth y autenticación
 * @module lib/types/auth
 */

// 🎯 Tipos base para usuarios
export interface BaseUser {
    id: string;
    name: string;
    email: string;
    role: string;
    client_id?: number;
}

// 🎯 Extender tipos de NextAuth de forma centralizada
declare module "next-auth" {
    interface User extends BaseUser { }

    interface Session {
        user: User;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends BaseUser { }
}

// 🎯 Tipos para credenciales de login
export interface LoginCredentials {
    email: string;
    password?: string; // Opcional para modo pruebas
}

// 🎯 Tipos para respuestas de API auth
export interface AuthResponse {
    status: 'success' | 'error';
    message: string;
    authenticated: boolean;
    session?: {
        user: BaseUser;
        expires: string;
    };
    error?: string;
} 