# Dashboard v2 - RokaMenu

## Estructura del Proyecto

La estructura de este proyecto sigue un diseño orientado a dominio (Domain-Driven Design), organizando el código por áreas funcionales en lugar de por tipos de archivos:

```
dashboard-v2/
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
│   │   ├── category.ts     # Tipos para categorías
│   │   ├── section.ts      # Tipos para secciones
│   │   └── product.ts      # Tipos para productos
│   ├── ui/                 # Tipos para componentes de UI
│   │   ├── common.ts       # Tipos compartidos de UI
│   │   └── modals.ts       # Tipos para modales
│   ├── type-adapters.ts    # Adaptadores para conversión de tipos
│   └── index.ts            # Exportaciones centralizadas
└── utils/                  # Utilidades y helpers
```

## Principios de Arquitectura

Este proyecto sigue varios principios clave:

1. **Separación de Dominios**: El código está organizado por dominios funcionales (categorías, secciones, productos) en lugar de por tipos de archivos.

2. **Patrón Fachada**: Usamos hooks de fachada (como `useDashboardState`) para coordinar la comunicación entre dominios.

3. **Cohesión Funcional**: Cada carpeta mantiene alta cohesión, conteniendo todo lo relacionado con una funcionalidad específica.

4. **Separación de Responsabilidades**: Distinguimos entre:

   - Lógica de dominio (hooks/domain/\*)
   - Lógica de presentación (components/\*)
   - Lógica de UI (hooks/ui/\*)

5. **Manejo de Estado Descentralizado**: Cada dominio maneja su propio estado, que luego es coordinado por fachadas.

## Guía para Contribuyentes

Al contribuir a este proyecto, por favor sigue estas directrices:

1. **Ubica el código en el lugar correcto**: Antes de crear un nuevo archivo, identifica a qué dominio pertenece y colócalo en la carpeta correspondiente.

2. **Respeta los límites de dominio**: Evita importar directamente entre dominios; utiliza las fachadas o hooks de coordinación.

3. **Mantén la cohesión**: Cada módulo debe tener un propósito claro y enfocarse en una responsabilidad específica.

4. **Documentación**: Añade comentarios JSDoc a tus funciones y componentes, especialmente para explicar el propósito y los parámetros.

5. **Nomenclatura consistente**: Sigue las convenciones de nomenclatura existentes para mantener coherencia.

## Mandamientos de Código

1. **Separar lo funcional de lo estético**: La lógica de negocio no debe mezclarse con la presentación visual.

2. **No repetir código**: Usa abstracciones y componentes reutilizables.

3. **Todo código debe ser descubrible**: La estructura del proyecto debe hacer que sea fácil encontrar lo que buscas.

4. **Los tipos refuerzan el contrato**: Usa tipos TypeScript para clarificar los contratos entre componentes.

5. **El estado debe ser predecible**: Gestiona el estado de forma transparente y predecible.

6. **Optimizar para mantenimiento, no para velocidad inicial**: Prioriza código claro y mantenible sobre desarrollo rápido.

## Convenciones

- Los nombres de archivos utilizan PascalCase para componentes y camelCase para hooks y utilidades.
- Las interfaces de tipos utilizan PascalCase.
- Los hooks de dominio siguen el patrón `use{Entidad}Management.ts`.
- Las exportaciones por defecto se utilizan para componentes y hooks principales.
- Añade tests para lógica crítica, especialmente en los hooks de dominio.
