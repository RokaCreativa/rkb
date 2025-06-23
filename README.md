# 🍽️ RokaMenu - Sistema de Gestión de Menús Digitales

![Next.js](https://img.shields.io/badge/Next.js-15.2.1-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748)
![Zustand](https://img.shields.io/badge/Zustand-State%20Management-orange)

Sistema completo de gestión de menús digitales para restaurantes, desarrollado con las últimas tecnologías web. Arquitectura moderna, escalable y mantenible siguiendo principios de Domain-Driven Design.

## 🚀 Tecnologías Principales

- **Frontend:** Next.js 15.2.1 + React 19 + TypeScript
- **Styling:** TailwindCSS + Shadcn/ui
- **Estado Global:** Zustand (patrón atómico + useMemo)
- **Base de Datos:** MySQL + Prisma ORM
- **Autenticación:** NextAuth.js
- **Arquitectura:** DDD + Separación de Responsabilidades

## 📁 Estructura del Proyecto

```
rokamenu-next/
├── app/
│   ├── api/                    # API Routes (Next.js App Router)
│   ├── dashboard-v2/           # Dashboard Principal
│   │   ├── components/         # Componentes UI
│   │   │   ├── core/          # Componentes maestros
│   │   │   ├── domain/        # Componentes de dominio
│   │   │   ├── modals/        # Sistema de modales
│   │   │   └── ui/            # Componentes reutilizables
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── stores/            # Estado global (Zustand)
│   │   ├── types/             # Definiciones de tipos
│   │   ├── utils/             # Utilidades
│   │   └── views/             # Vistas principales
│   └── auth/                  # Autenticación
├── docs/                      # Documentación técnica
│   └── sistema/               # Bitácora y mandamientos
├── prisma/                    # Schema y migraciones
└── public/                    # Assets estáticos
```

## 🏗️ Arquitectura del Dashboard

### **Vista de Escritorio (DashboardView.tsx)**

- **Patrón:** Master-Detail de 3 columnas
- **Grid 1:** Categorías + Productos Globales
- **Grid 2:** Secciones + Productos Locales
- **Grid 3:** Productos de Sección

### **Vista Móvil (MobileView.tsx)**

- **Patrón:** Drill-Down jerárquico
- **Navegación:** Categorías → Secciones → Productos
- **FAB:** Botón flotante contextual

## 🎯 Principios de Desarrollo

### **Mandamiento #7: Separación Absoluta**

- **Componentes UI:** "Tontos", solo renderizado y eventos
- **Lógica de Negocio:** Hooks personalizados y stores
- **Transformaciones:** useMemo para derivación de datos

### **Patrón React 19 + Zustand**

- **Selectores atómicos:** Evitar bucles infinitos
- **useMemo local:** Cálculos derivados en componentes
- **Hooks directos:** No usar getState() en componentes

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- MySQL 8.0+
- npm/yarn/pnpm

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/RokaCreativa/rokamenu.git
cd rokamenu

# Instalar dependencias
npm install

# Configurar base de datos
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📚 Documentación Técnica

- **📓 Bitácora:** `docs/sistema/Bitacora.md` - Historial de desarrollo
- **📜 Mandamientos:** `docs/sistema/Mandamientos.md` - Principios técnicos
- **🧠 Arquitectura:** `docs/sistema/EstructuraRokaMenu.md` - Diseño del sistema

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
npm run type-check   # Verificación de tipos
```

## 🎨 Sistema de Diseño

- **Framework:** TailwindCSS
- **Componentes:** Shadcn/ui + Radix UI
- **Iconos:** Heroicons
- **Tipografía:** Geist (optimizada por Vercel)
- **Responsive:** Mobile-First

## 🔐 Autenticación

- **Provider:** NextAuth.js
- **Estrategia:** Credenciales + JWT
- **Middleware:** Protección de rutas automática
- **Roles:** Sistema de permisos por cliente

## 📊 Estado del Proyecto

### ✅ **Completado**

- Sistema CRUD completo (Categorías, Secciones, Productos)
- Dashboard responsivo (Desktop + Mobile)
- Sistema de modales unificado
- Gestión de imágenes robusto
- Arquitectura híbrida (productos directos)
- Sistema de visibilidad/toggle

### 🚧 **En Desarrollo**

- Sistema de reordenamiento con flechitas
- Gestión de alérgenos
- Precios múltiples
- Exportación de menús

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es propiedad de **RokaCreativa** - Todos los derechos reservados.

## 🏢 Sobre RokaCreativa

Especialistas en soluciones digitales para el sector gastronómico.
Desarrollamos tecnología que transforma la experiencia culinaria.

---

**Desarrollado con ❤️ por el equipo de RokaCreativa**
