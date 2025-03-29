# 🌟 Guía Unificada del Proyecto RokaMenu

## 📝 Resumen del Proyecto

RokaMenu es una plataforma digital que permite a restaurantes y otros negocios ofrecer sus menús o servicios de forma digital, visual e interactiva, accesibles mediante un código QR.

### 🧠 Funcionalidades principales

- **Menús digitales por QR**: Cada negocio tiene un menú accesible desde un código QR personalizado
- **Gestión avanzada de menús**:
  - Crear, editar, eliminar menús
  - Agrupar por categorías y secciones
  - Soporte multilingüe con traducción automática
- **Configuración del cliente**:
  - Tipo de menú (Digital o PDF/Imagen)
  - Personalización de apariencia (colores, logos)
  - Idiomas configurables por cliente
  - Perfil del negocio (dirección, redes sociales, contacto)
  - Estadísticas de visualización del menú
  - QR personalizado y botón de WhatsApp directo
- **Gestión de productos**:
  - Activar/desactivar platos en tiempo real
  - Reordenar platos con drag & drop
  - Precios variables (por tamaño o porciones)
  - Alérgenos y etiquetas (vegano, sin gluten, etc.)
- **Soporte para múltiples tipos de negocio**: restaurantes, inmobiliarias, excursiones, peluquerías, etc.
- **Vista previa móvil en tiempo real**: Simulación de teléfono móvil en el dashboard

## 🏗️ Arquitectura del Proyecto

La aplicación está construida con:
- **Frontend**: Next.js con TypeScript
- **Backend**: API Routes de Next.js
- **Base de datos**: MySQL, gestionada con Prisma ORM
- **Autenticación**: NextAuth.js

### Estructura de carpetas principal

```
/app
  /dashboard           # Página principal del dashboard
  /api                 # Endpoints de API
  /components          # Componentes reutilizables
  /hooks               # Hooks específicos de la aplicación
/lib
  /services            # Servicios de comunicación con API
  /hooks               # Hooks genéricos reutilizables
  /adapters            # Adaptadores de tipos y funciones
  /handlers            # Manejadores de eventos
  /types               # Definiciones de tipos
/prisma                # Configuración de Prisma y esquema de BD
```

## 🚀 Estado Actual del Proyecto (Abril 2024)

### Principales Desafíos Resueltos

1. **Optimización de carga inicial**:
   - Se ha reducido el tiempo de carga de 20+ segundos a menos de 2 segundos
   - Implementada carga bajo demanda para secciones y productos

2. **Extracción de lógica de eventos**:
   - Creados manejadores específicos para categorías, secciones y productos
   - Mejor organización y reutilización de código

3. **Corrección de tipos**:
   - Estandarizado el manejo de campos booleanos vs. numéricos
   - Creados adaptadores para conversión de tipos

### En Progreso

1. **Refactorización del Dashboard**:
   - El archivo principal sigue siendo demasiado grande (~1800 líneas)
   - Se está implementando una estructura más modular

2. **Integración de hooks centralizados**:
   - Hooks existentes (useCategories, useSections, useProducts) en proceso de integración
   - Creación de adaptadores para asegurar compatibilidad

## 🧩 Componentes Principales

### Dashboard Page

El archivo `app/dashboard/page.tsx` es el componente principal que:
- Gestiona la navegación entre vistas (categorías, secciones, productos)
- Coordina llamadas a API y manejo de datos
- Implementa la interfaz de usuario principal

### Sistema de Modales

Hay dos conjuntos principales de modales:
1. **Modales legacy**: Implementados directamente en el dashboard
2. **Nuevo sistema modular**: En desarrollo, con jerarquía:
   - `BaseModal`: Componente base
   - `FormModal`: Para modales con formularios
   - `ConfirmationModal`: Para confirmaciones

### Sistema de Hooks

Existen varios tipos de hooks:
1. **Hooks específicos** (`app/hooks/`): Implementan lógica específica del negocio
2. **Hooks genéricos** (`lib/hooks/`): Funcionalidad reutilizable

### Adaptadores

Ubicados en `lib/adapters/`:
- Resuelven diferencias de tipos entre componentes
- Adaptan funciones para compatibilidad
- Facilitan la integración de sistemas legacy y nuevos

## 🛣️ Plan de Refactorización

### Fase 1: Extracción de controladores de eventos ✅

- Creados manejadores específicos en `lib/handlers/`
- Extraída la lógica de eventos del dashboard principal

### Fase 2: Optimización de carga de datos ✅

- Implementada carga bajo demanda
- Eliminada precarga agresiva 

### Fase 3-7: Mejoras Pendientes

1. **Separación de componentes de vistas**
2. **Implementación de enrutamiento interno**
3. **Extracción de lógica de datos**
4. **Implementación de gestión de estado global**
5. **Implementación de estrategia de caché**

## 🧰 Buenas Prácticas a Seguir

1. **Priorizar mantenibilidad**: Código fácil de entender y modificar
2. **Seguir el principio DRY**: No repetir código
3. **Separar responsabilidades**: Cada componente/hook con propósito único
4. **Mantener consistencia**: Mismos patrones en todo el proyecto
5. **Documentar cambios significativos**: Actualizar documentación

### Al desarrollar nuevas funcionalidades:

1. **Analizar primero**: Entender completamente los requisitos
2. **Buscar código existente**: No crear algo nuevo si existe algo similar
3. **Planificar los cambios**: Decidir qué componentes/hooks crear/modificar
4. **Implementar por fases**: Comenzar con lo básico
5. **Probar exhaustivamente**: Verificar funcionalidad completa

## 🐛 Errores comunes a evitar

- **NO crear nuevas carpetas** sin necesidad absoluta
- **NO duplicar componentes o hooks** existentes
- **NO mezclar lógica de negocio** con presentación
- **NO implementar la misma funcionalidad** de múltiples maneras
- **NO crear archivos demasiado grandes** (>300 líneas)

## 📚 Recursos Adicionales

Consulta los siguientes documentos para información más detallada:

- Plan detallado: [`MasterPlan/plan-implementacion.md`](MasterPlan/plan-implementacion.md)
- Estructura completa: [`MasterPlan/PROJECT_STRUCTURE2.md`](MasterPlan/PROJECT_STRUCTURE2.md)
- Estándares de tipos: [`estandares-tipos.md`](estandares-tipos.md)
- Errores y soluciones: [`MasterPlan/errores-soluciones.md`](MasterPlan/errores-soluciones.md) 