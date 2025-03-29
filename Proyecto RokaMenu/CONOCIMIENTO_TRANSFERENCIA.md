# TRANSFERENCIA DE CONOCIMIENTO - PROYECTO ROKAMENU

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Principales Funcionalidades](#principales-funcionalidades)
4. [Proceso de Desarrollo](#proceso-de-desarrollo)
5. [Estado Actual y Desafíos](#estado-actual-y-desafíos)
6. [Recursos y Documentación](#recursos-y-documentación)
7. [Contactos Clave](#contactos-clave)

## Introducción

Este documento tiene como objetivo facilitar la transferencia de conocimiento del proyecto RokaMenu a nuevos miembros del equipo, asegurando la continuidad y el mantenimiento efectivo del sistema. RokaMenu es una plataforma digital que permite a restaurantes ofrecer menús digitales a través de códigos QR, con capacidades avanzadas de gestión de productos, categorías y configuraciones personalizadas.

## Arquitectura del Proyecto

### Stack Tecnológico
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: API Routes de Next.js, Prisma ORM
- **Base de Datos**: MySQL
- **Despliegue**: Vercel (producción), GitHub Actions (CI/CD)
- **Herramientas de Desarrollo**: ESLint, Prettier, Jest

### Estructura del Proyecto
```
rokamenu-next/
├── app/                    # Aplicación Next.js
│   ├── api/                # Rutas de API
│   ├── dashboard/          # Interfaz de administración
│   ├── menu/               # Visualización de menús para clientes
│   └── [...]/              # Otras páginas y componentes
├── components/             # Componentes compartidos
├── context/                # Contextos de React
├── hooks/                  # Hooks personalizados
├── lib/                    # Utilidades, adaptadores y manejadores
│   ├── adapters/           # Adaptadores para conversión de tipos
│   ├── handlers/           # Manejadores de eventos
│   └── utils/              # Funciones de utilidad
├── prisma/                 # Configuración de Prisma y esquema
└── public/                 # Archivos estáticos
```

### Patrones de Diseño
- **Patrón Adaptador**: Utilizado para convertir tipos de datos entre la interfaz de usuario y la API.
- **Patrón Repositorio**: Implementado a través de hooks para abstraer la lógica de acceso a datos.
- **Context API**: Para gestión de estado global.
- **Custom Hooks**: Para encapsular lógica reutilizable.

## Principales Funcionalidades

### Dashboard de Administración
- **Gestión de Categorías**: Crear, editar, eliminar y ordenar categorías.
- **Gestión de Secciones**: Organizar productos en secciones dentro de categorías.
- **Gestión de Productos**: Administrar productos con detalles, precios, alérgenos y opciones.
- **Configuración de Cliente**: Personalizar colores, logos y ajustes específicos para cada restaurante.
- **Vista Previa de Menú**: Previsualizar el menú como lo verían los clientes finales.

### Visualización de Menú
- **Interfaz Responsiva**: Adaptable a cualquier dispositivo.
- **Filtrado de Productos**: Por categoría, sección y alérgenos.
- **Soporte Multilingüe**: Menús en múltiples idiomas.
- **Modo Oscuro/Claro**: Adaptable a las preferencias del usuario.

### Funcionalidades Técnicas
- **Carga Progresiva**: Optimizada para reducir tiempos de carga inicial.
- **Caché Local**: Para mejorar rendimiento y experiencia offline.
- **Optimistic Updates**: Para una experiencia de usuario más fluida.

## Proceso de Desarrollo

### Flujo de Trabajo
1. **Planificación**: Definición de requisitos y diseño en Figma.
2. **Desarrollo**: Implementación en ramas de feature.
3. **Pruebas**: Pruebas manuales y automatizadas.
4. **Revisión de Código**: Pull requests y code reviews.
5. **Despliegue**: CI/CD a través de GitHub Actions y Vercel.

### Convenciones de Código
- **Nomenclatura**: camelCase para variables/funciones, PascalCase para componentes/interfaces.
- **Tipos**: Uso estricto de TypeScript con interfaces definidas.
- **Componentes**: Preferencia por componentes funcionales con hooks.
- **Estado**: Minimizar estado local, preferir hooks centralizados.

### Procesos de Refactorización
Actualmente se está realizando una refactorización por fases:
1. **Fase 1** (Completada): Extracción de manejadores de eventos.
2. **Fase 2** (Completada): Optimización de carga de datos inicial.
3. **Fase 3-7** (En progreso): Separación de componentes de visualización, implementación de enrutamiento interno, extracción de lógica de datos, manejo de estado global y desarrollo de estrategia de caché.

## Estado Actual y Desafíos

### Estado del Proyecto (Mayo 2024)
- Implementación base completa y en producción.
- Refactorización en progreso para mejorar mantenibilidad.
- Planificación de nuevas funcionalidades de marketing y análisis.

### Desafíos Principales
- **Rendimiento del Dashboard**: Mejoras continuas para reducir tiempo de carga.
- **Consistencia de Tipos**: Entre frontend, API y base de datos.
- **Escalabilidad**: Preparación para mayor volumen de clientes y productos.
- **Experiencia Móvil**: Optimización para administración desde dispositivos móviles.

### Mejoras Planificadas
- **Sistema de Notificaciones**: Para administradores y clientes.
- **Analíticas Avanzadas**: Visualización de datos de uso.
- **Integración con Sistemas de Pago**: Para pedidos directos.
- **Gestión de Inventario**: Control de stock y alertas.

## Recursos y Documentación

### Documentación Interna
- Ver carpeta `/docs` para documentación completa, incluyendo:
  - Guía unificada del proyecto
  - Plan maestro de implementación
  - Estándares técnicos
  - Documentación de errores y soluciones
  - Estrategias de optimización

### Herramientas y Accesos
- **Repositorio**: GitHub - [URL del repositorio]
- **Gestión de Proyectos**: [Herramienta utilizada]
- **Entornos**: 
  - Desarrollo: [URL]
  - Staging: [URL]
  - Producción: [URL]

## Contactos Clave

- **Desarrollador Principal**: [Nombre] - [Email]
- **Diseñador UX/UI**: [Nombre] - [Email]
- **Product Owner**: [Nombre] - [Email]
- **Soporte Técnico**: [Email/Canal]

---

Documento actualizado: Mayo 2024. 