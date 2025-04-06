# Los Mandamientos de la Refactorización 📜 (COMPLETADOS)

> "Conocerás lo que existe antes de crear algo nuevo"
> "Utilizarás componentes compartidos siempre que sea posible"
> "No duplicarás interfaces, tipos o componentes que ya existen"
> "Al cambiar funcionalidad, no tocarás la estética ni los estilos"

## 📢 IMPORTANTE: REFACTORIZACIÓN COMPLETADA

**La refactorización del dashboard ha sido completada exitosamente.** Se ha implementado una estructura orientada a dominios que mejora significativamente la organización y mantenibilidad del código. Para obtener la documentación más actualizada sobre la nueva estructura, consulta el archivo `app/dashboard-v2/README.md`.

## 🌟 Resumen del Proyecto RokaMenu

RokaMenu es una aplicación web para la gestión de menús digitales de restaurantes y otros negocios:

- Cada cliente (restaurante) tiene su propio menú digital accesible mediante un código QR personalizado
- Los clientes pueden gestionar completamente sus menús a través del dashboard (categorías, secciones, productos)
- Los usuarios finales pueden ver los menús en sus dispositivos móviles, tablets u ordenadores
- Soporte multilingüe que permitirá traducción automática de los menús (en desarrollo)
- Sistema de gestión completo con arrastrar y soltar para reorganizar elementos
- Personalización visual específica para cada tipo de elemento (categorías, secciones, productos)

## 🎯 Objetivo Principal (LOGRADO)

- ✅ Mantener EXACTAMENTE la misma funcionalidad
- ✅ Aplicar patrones modernos SIN sobre-ingenierizar
- ✅ Implementar arquitectura limpia
- ✅ Verificar la estructura existente antes de crear cualquier componente nuevo
- ✅ Mantener total separación de responsabilidades

## 🚫 MANDAMIENTO SUPREMO: RESPETARÁS LA REFACTORIZACIÓN REALIZADA

Los siguientes principios ya han sido implementados en la nueva estructura:

- ✅ No hay duplicados de componentes o hooks existentes
- ✅ Separación clara de responsabilidades
- ✅ No hay interfaces, tipos o componentes duplicados
- ✅ La estructura de carpetas establecida se mantiene:
  - Componentes principales en `dashboard-v2/components/core/`
  - Componentes de dominio en `dashboard-v2/components/domain/` (categorías, secciones, productos)
  - Modales en `dashboard-v2/components/modals/`
  - Componentes de vista en `dashboard-v2/components/views/`
  - Hooks principales en `dashboard-v2/hooks/core/`
  - Hooks de dominio en `dashboard-v2/hooks/domain/` (categoría, sección, producto)
  - Hooks de UI en `dashboard-v2/hooks/ui/`
  - Tipos en `dashboard-v2/types/` organizados por dominio, API y UI
  - Utilidades en `dashboard-v2/utils/`

## 🔍 MANDAMIENTO DE PUREZA FUNCIONAL: SEPARARÁS FUNCIONALIDAD DE ESTÉTICA

Este principio ha sido implementado completamente:

- ✅ La lógica de negocio está separada de los aspectos visuales
- ✅ Los estilos se mantienen consistentes y separados de la lógica
- ✅ Los cambios funcionales no afectan la apariencia visual
- ✅ Se utilizan componentes existentes con sus estilos actuales
- ✅ La lógica y la presentación están claramente separadas en cada componente

## 📋 MANDAMIENTO CRÍTICO: CONOCERÁS LA ESTRUCTURA ANTES DE CREAR

Para futuros desarrollos, recuerda estos principios fundamentales:

- **SIEMPRE VERIFICARÁS** lo que ya existe antes de crear cualquier nuevo componente o archivo
- **NUNCA crearás** un componente o hook si ya existe uno con la misma funcionalidad
- **Consultarás la documentación** regularmente para evitar duplicidades
- **Utilizarás herramientas de búsqueda** para explorar exhaustivamente antes de crear

La nueva estructura de archivos ya se encuentra implementada:

```
app/dashboard-v2/
├── components/             # Componentes de la UI
│   ├── core/               # Componentes principales y organizadores
│   ├── domain/             # Componentes específicos de dominio
│   │   ├── category/       # Componentes específicos para categorías
│   │   ├── section/        # Componentes específicos para secciones
│   │   └── product/        # Componentes específicos para productos
│   ├── modals/             # Modales (creación, edición, eliminación)
│   ├── ui/                 # Componentes de UI reutilizables
│   └── views/              # Vistas principales de la aplicación
├── hooks/                  # Hooks personalizados para la lógica
│   ├── core/               # Hooks principales (fachadas, coordinación)
│   ├── domain/             # Hooks específicos de dominio
│   │   ├── category/       # Hooks para gestión de categorías
│   │   ├── section/        # Hooks para gestión de secciones
│   │   └── product/        # Hooks para gestión de productos
│   └── ui/                 # Hooks relacionados con la UI
├── types/                  # Definiciones de tipos
│   ├── domain/             # Tipos específicos de dominio
│   ├── ui/                 # Tipos para componentes de UI
│   ├── index.ts            # Exportaciones centralizadas
│   └── type-adapters.ts    # Adaptadores para conversión de tipos
└── utils/                  # Utilidades y helpers
```

## 📋 MANDAMIENTO DE VERIFICACIÓN ESTRUCTURAL

Este principio debe seguirse para todas las futuras adiciones al dashboard:

- **SIEMPRE VERIFICARÁS** la estructura existente antes de crear algo nuevo
- Seguirás el procedimiento de verificación documentado:
  1. **Consultar documentación actualizada** para entender el contexto
  2. **Explorar directorios relevantes** usando herramientas apropiadas
  3. **Buscar elementos similares** antes de crear nuevos
  4. **Comprobar hooks y utilidades disponibles** antes de crear nuevos
  5. **Validar ubicación y nomenclatura** para mantener coherencia

## 🧩 MANDAMIENTO DE REUTILIZACIÓN: UTILIZARÁS EL SISTEMA DE COMPONENTES COMPARTIDOS

La nueva estructura implementa un sistema de componentes compartidos que:

- ✅ Centraliza la gestión de componentes reutilizables
- ✅ Proporciona una interfaz unificada para elementos comunes
- ✅ Mantiene la coherencia visual y de comportamiento en toda la aplicación
- ✅ Facilita la actualización y mantenimiento centralizados

### Sistema de Componentes Grid

Para los componentes de grid (tablas de categorías, secciones, productos) se ha implementado un sistema especializado:

- **GridIcon**: Componente centralizado para gestionar todos los íconos del sistema
- **useGridIcons**: Hook para acceder y gestionar los íconos de manera programática
- **Identidad Visual por Tipo**:
  - Categorías: Esquema de color indigo
  - Secciones: Esquema de color teal
  - Productos: Esquema de color yellow

Para cambiar un ícono en toda la aplicación, simplemente se modifica en el archivo `iconConfig.ts`.

## 📊 MANDAMIENTO DE ESTRUCTURA DE DATOS: RESPETARÁS EL MODELO DE DATOS

Se ha implementado un modelo de datos jerárquico claramente definido:

```
Cliente
  └── Categoría
       └── Sección
            └── Producto
```

Con tipos específicos para cada entidad y sus relaciones:

- **Cliente** (`Client`): Representa al restaurante o negocio

  ```typescript
  interface Client {
    id: number; // Identificador único del cliente
    name: string; // Nombre del negocio
    main_logo: string | null; // Logo principal del negocio
    // ... otras propiedades
  }
  ```

- **Categoría** (`Category`): Grupo principal de elementos del menú

  ```typescript
  interface Category {
    category_id: number; // Identificador único de la categoría
    name: string; // Nombre de la categoría
    image: string | null; // Imagen representativa (opcional)
    status: number; // Estado (1: visible, 0: oculta)
    display_order: number; // Orden de visualización
    client_id: number; // Cliente al que pertenece
    // ... otras propiedades
  }
  ```

- **Sección** (`Section`): Subdivisión de categoría

  ```typescript
  interface Section {
    section_id: number; // Identificador único de la sección
    name: string; // Nombre de la sección
    image: string | null; // Imagen representativa
    category_id: number; // Categoría a la que pertenece
    client_id: number; // Cliente al que pertenece
    display_order: number; // Orden de visualización
    status: number; // Estado (1: visible, 0: oculta)
    // ... otras propiedades
  }
  ```

- **Producto** (`Product`): Elemento individual del menú
  ```typescript
  interface Product {
    product_id: number; // Identificador único del producto
    name: string; // Nombre del producto
    image: string | null; // Imagen del producto
    status: number; // Estado (1: visible, 0: oculto)
    price: string; // Precio del producto
    section_id: number; // Sección a la que pertenece
    client_id: number; // Cliente al que pertenece
    display_order: number; // Orden de visualización
    // ... otras propiedades
  }
  ```

## 🎨 MANDAMIENTO DE ESTILOS Y COHERENCIA VISUAL

La refactorización ha mantenido la coherencia visual:

- ✅ Estilos consistentes por tipo de entidad
- ✅ Identidad de color específica para cada tipo (categorías, secciones, productos)
- ✅ Clases CSS organizadas y documentadas

## 🔄 MANDAMIENTO DE ACTUALIZACIÓN: ACTUALIZARÁS LOS MANDAMIENTOS CUANDO SEA NECESARIO

Cuando se realicen cambios importantes en la estructura, funcionalidad o patrones:

- ✅ Se actualizará este documento para reflejar los cambios
- ✅ Se asegurará que los nuevos cambios funcionen correctamente antes de actualizar los mandamientos
- ✅ Se documentará cualquier nuevo componente, hook o utilidad compartida
- ✅ Se mantendrá la lista de mandamientos actualizada y relevante

La última actualización de este documento es del **6 de abril de 2025**.

## 🚀 PRÓXIMOS PASOS

Con la refactorización completada, ahora es posible:

1. **Ampliar funcionalidades**: Añadir nuevas características manteniendo la nueva arquitectura
2. **Mejorar rendimiento**: Optimizar componentes y operaciones específicas
3. **Extender tipos**: Refinar el sistema de tipos para mayor seguridad y autocompletado
4. **Añadir tests**: Implementar pruebas unitarias y de integración
5. **Implementar multilenguaje**: Desarrollar el sistema de traducción automática para los menús

## 📚 RECURSOS Y REFERENCIAS

Para obtener información detallada sobre la nueva estructura:

- `app/dashboard-v2/README.md` - Documentación principal sobre la nueva estructura
- `docs/dashboard-v2-estructura-y-mandamientos.md` - Mandamientos actualizados
- `docs/archive/dashboard-v2-modelo-datos.md` - Detalles completos del modelo de datos
- `docs/archive/sistema-componentes-compartidos.md` - Documentación del sistema de componentes compartidos

> "Un proyecto ordenado es un proyecto mantenible"
> "Conocer la estructura es el primer paso para respetarla"
