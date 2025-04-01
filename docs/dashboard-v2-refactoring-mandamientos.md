# Los Mandamientos de la Refactorización 📜

> "No tocarás el código original, ni harás daño a la funcionalidad existente"

## 🎯 Objetivo Principal
- **NO TOCARÁS** el dashboard original
- Refactorizar = Reorganizar código existente
- Mantener EXACTAMENTE la misma funcionalidad
- Aplicar patrones modernos SIN sobre-ingenierizar
- Implementar arquitectura limpia
- **PROHIBIDO USAR COMPONENTES DEL DASHBOARD ORIGINAL**
  * Si necesitas un componente similar, cópialo y adáptalo en dashboard-v2
  * Mantén total separación entre las dos implementaciones
  * No mezclar importaciones entre dashboard y dashboard-v2

## 📚 Buenas Prácticas de Programación
- Implementar principios SOLID
- Separación clara de responsabilidades
- Sistema de manejo de estado eficiente
- Manejo de errores robusto
- Testing sistemático (unitario y de integración)

## 🛠️ Enfoque Técnico
- TypeScript implementado correctamente
- Componentes pequeños y focalizados
- Patrones de diseño adecuados
- Testing desde el inicio
- Manejo de estado predecible

## 📝 Documentación y Mantenimiento
- Documentar SOLO código probado y funcionando
- Archivos a mantener actualizados:
  * `dashboard-v2-refactoring-guide.md`
  * `dashboard-v2-refactoring-guide-part2.md`
  * `dashboard-v2-refactoring-guide-part3.md`
  * `dashboard-v2-refactoring-index.md`
- Comentarios claros "para dummies"
- Documentar decisiones de arquitectura

## ✅ Verificación Constante
- Tests para cada componente
- Comparar comportamiento con original
- Verificar rendimiento
- NO avanzar si algo no funciona igual

## 📖 MANDAMIENTO CRÍTICO: Estudio del Código Original
- **SIEMPRE CONSULTARÁS el código del dashboard original antes de implementar cualquier componente**
- Este mandamiento es PRIORITARIO y no puede ser ignorado bajo ninguna circunstancia
- Entender a fondo el código original ANTES de refactorizar cualquier parte
- Comparar visual y funcionalmente cada componente con su equivalente original
- Analizar meticulosamente los patrones de interacción y comportamientos específicos
- Revisar los estilos exactos (márgenes, espaciados, colores, tipografía) para asegurar fidelidad visual
- Documentar diferencias estructurales pero mantener la experiencia de usuario IDÉNTICA
- NUNCA asumir cómo funciona algo - verificar siempre en el código original
- En caso de duda, SIEMPRE consultar el código original como fuente de verdad absoluta

## 📱 MANDAMIENTO CRÍTICO: Flujo de Navegación y Comportamiento de Vistas
- **RESPETAR EXACTAMENTE el flujo de navegación del dashboard original**
- Estudiar meticulosamente cómo se manejan los cambios entre vistas en el dashboard original
- Mantener el mismo comportamiento cuando se hace clic en categorías, secciones y productos
- Preservar el estado de navegación (expandido/colapsado) según el diseño original
- Asegurar que las transiciones entre vistas sean idénticas al dashboard original
- Estudiar los métodos `navigateToCategory`, `navigateToSection` y similares en el código original
- NO implementar cambios en el flujo de navegación sin primero verificar el comportamiento original
- Respetar la jerarquía de navegación: Categorías -> Secciones -> Productos
- Mantener la coherencia entre el breadcrumb y la vista actual
- Garantizar que el comportamiento de "volver atrás" funcione exactamente igual que en el original
- **CRUCIAL**: Mostrar las secciones expandidas dentro de la vista de categorías, NO navegar a una vista separada
- Las secciones DEBEN aparecer como elementos expandidos bajo la categoría correspondiente, manteniendo la vista de categorías

## 🚀 Escalabilidad Real
- Arquitectura que permita crecimiento
- Código modular y reutilizable
- Patrones consistentes
- Fácil de extender sin modificar

## 📋 Plan de Acción Detallado

### Fase 1: Arquitectura Base 🏗️
1. **Implementar arquitectura limpia con:**
   - `features/` - Características principales
   - `shared/` - Componentes y utilidades compartidas
   - `core/` - Lógica de negocio central
   - `infrastructure/` - Servicios externos y APIs

2. **Migrar el estado global:**
   - Reemplazar `DashboardContext` con un sistema más robusto
   - Implementar un store centralizado con Zustand
   - Separar la lógica de negocio de los componentes

### Fase 2: Componentes Base 🧩
1. **Crear componentes base reutilizables:**
   - Tablas genéricas
   - Modales base
   - Formularios
   - Botones y controles

2. **Implementar sistema de diseño:**
   - Variables de tema
   - Componentes UI consistentes
   - Sistema de espaciado y tipografía

### Fase 3: Features Principales 🎯
1. **Migrar features una por una:**
   - Gestión de Categorías
   - Gestión de Secciones
   - Gestión de Productos
   - Vista previa del teléfono

2. **Cada feature incluirá:**
   - Componentes específicos
   - Hooks personalizados
   - Tests unitarios
   - Documentación

### Fase 4: Testing y Optimización 🚀
1. **Implementar tests:**
   - Unitarios para componentes
   - De integración para features
   - Tests de rendimiento

2. **Optimizaciones:**
   - Lazy loading de componentes
   - Memoización donde sea necesario
   - Optimización de re-renders

### Fase 5: Documentación y Validación 📝
1. **Documentar:**
   - Guías de uso
   - Decisiones de arquitectura
   - Patrones implementados

2. **Validar:**
   - Comparación con dashboard original
   - Tests de integración
   - Revisión de rendimiento

## 📚 Comprensión de RokaMenu

### 🎯 Propósito Principal
- Plataforma de menús digitales para restaurantes
- Acceso mediante códigos QR
- Gestión completa de menús (categorías, secciones, productos)

### 🏗️ Estructura de Datos
1. **Categorías** (ej: Entrantes, Platos Principales)
   - Atributos: ID, nombre, orden, estado
   - Contiene: Múltiples secciones
   
2. **Secciones** (ej: Pastas, Carnes)
   - Atributos: ID, nombre, imagen, orden, estado
   - Pertenece a: Una categoría
   - Contiene: Múltiples productos

3. **Productos** (ej: Spaghetti Carbonara)
   - Atributos: ID, nombre, descripción, precio, imagen
   - Pertenece a: Una sección
   - Estado: activo/inactivo

### 🔄 Flujos Principales
1. **Dashboard**
   - Gestión CRUD de categorías
   - Gestión CRUD de secciones por categoría
   - Gestión CRUD de productos por sección
   - Vista previa en tiempo real

2. **Vista Pública**
   - Acceso mediante QR
   - Navegación jerárquica
   - Visualización optimizada para móviles

### ⚠️ Puntos Críticos
1. **Rendimiento**
   - Carga inicial optimizada (<2s)
   - Carga progresiva de datos
   - Gestión eficiente del estado

2. **Consistencia de Datos**
   - Tipos booleanos vs numéricos
   - Estados de visibilidad
   - Orden de elementos

3. **UX/UI**
   - Feedback inmediato
   - Estados de carga claros
   - Prevención de errores

## 🔍 Recordatorios Importantes

1. **NO modificar el dashboard original**
   - Todo desarrollo nuevo en dashboard-v2
   - Mantener compatibilidad con datos existentes

2. **Priorizar rendimiento**
   - Implementar carga progresiva
   - Evitar carga innecesaria de datos
   - Optimizar re-renders

3. **Mantener consistencia**
   - Seguir patrones establecidos
   - Usar tipos definidos
   - Documentar cambios

4. **Testing y validación**
   - Probar cada cambio
   - Validar tipos
   - Verificar rendimiento

5. **Gestión de imágenes**
   - Usar sólo rutas estandarizadas:
     * Logo de Roka Menu: `/images/logo_rokamenu.png`
     * Categorías: `/images/categories/{nombre_archivo}`
     * Secciones: `/images/sections/{nombre_archivo}`
     * Productos: `/images/products/{nombre_archivo}`
     * Logo principal: `/images/main_logo/{nombre_archivo}`
     * Imagen de respaldo: `/images/no-image.png`
   - Utilizar siempre `getImagePath()` para resolver rutas
   - Implementar `handleImageError()` para manejo de errores
   - NO usar rutas antiguas como `/images/clientes/`

6. **Modelo de datos principal**
   - **clients**:
     * client_id: Int [@id]
     * name: String? [@db.VarChar(100)]
     * company_logo: String? [@db.VarChar(70)] Este de momento creo que no se usa
     * main_logo: String? [@db.VarChar(100)]
     * email: String [@db.VarChar(200)]
   - **categories**:
     * category_id: Int [@id @default(autoincrement())]
     * name: String? [@db.VarChar(50)]
     * image: String? [@db.VarChar(45)]
     * status: Boolean? [@default(true)]
     * display_order: Int?
     * client_id: Int?
   - **sections**:
     * section_id: Int [@id @default(autoincrement())]
     * name: String? [@db.VarChar(50)]
     * image: String? [@db.VarChar(100)]
     * status: Boolean? [@default(true)]
     * display_order: Int?
     * category_id: Int?
   - **products**:
     * product_id: Int [@id @default(autoincrement())]
     * name: String? [@db.VarChar(100)]
     * description: String? [@db.Text]
     * price: Decimal? [@db.Decimal(10, 2)]
     * image: String? [@db.VarChar(100)]
     * status: Boolean? [@default(true)]
     * display_order: Int?
   - **products_sections**:
     * product_id: Int [parte de clave primaria compuesta]
     * section_id: Int [parte de clave primaria compuesta]
   - **users** (auth):
     * user_id: String [@id @db.VarChar(30)]
     * email: String [@db.VarChar(255)] /* Principalmente usado para autenticación */
     * password: String? [@db.VarChar(30)] /* Principalmente usado para autenticación */
     * username: String? [@db.VarChar(200)] /* Usado para gestión de sesión */
     * profile: String? [@db.VarChar(2)] /* Usado para gestión de sesión */
     * client_id: Int? /* Usado para gestión de sesión */

## 🧠 MANDAMIENTO CRÍTICO: Gestión del Estado
- **IMPLEMENTARÁS un sistema de doble estado (local y global) para datos críticos**
- Usar estado local para respuesta inmediata en la interfaz de usuario
- Mantener estado global para coordinación entre componentes
- Implementar verificación de cache para evitar cargas redundantes
- Normalizar datos antes de almacenarlos en cualquier estado
- Priorizar el estado local sobre el global para renderizado cuando sea necesario
- Incluir indicadores visuales específicos durante estados de carga
- Implementar herramientas de depuración visibles en modo desarrollo
- Evitar efectos con dependencias innecesarias o mal configuradas
- Utilizar nombres descriptivos para los estados que indiquen su propósito específico

---

> 🎯 **Estado Actual**: Fase 3 - Features Principales (En Progreso)
> 
> 📅 **Última Actualización**: 15/05/2024 - 20:30 - v0.3.5
> 
> ✅ **Completado**:
> - Estructura de directorios creada
> - Tipos base definidos
> - Store con Zustand implementado
> - Cliente API base creado
> - Hook de categorías implementado
> - Hook de secciones implementado
> - Hook de productos implementado
> - Componentes base creados:
>   * Tabla genérica reutilizable
>   * Modal base reutilizable
>   * Campo de formulario reutilizable
>   * Botón reutilizable
> - Sistema de diseño implementado:
>   * Variables de tema (colores, espaciado, tipografía)
>   * Sistema de componentes CSS coherente
>   * Estructura de archivos modular para estilos
>   * Integración con el layout principal
> - Gestión de estado optimizada:
>   * Implementación de estado dual (local/global)
>   * Sistema de caché para datos frecuentemente usados
>   * Verificación preventiva antes de cargas
>   * Indicadores de carga específicos por contexto
> - Componentes críticos implementados:
>   * Vista de categorías con expansión in-situ
>   * Carga bajo demanda de secciones
>   * Manejo óptimo de autenticación
>   * Layout adaptativo para diferentes dispositivos
> 
> 🔄 **Siguiente Paso**: Completar la implementación de features principales
> - **Refactorizar funcionalidad de productos**:
>   * Implementar carga bajo demanda de productos
>   * Optimizar rendimiento de tablas de productos
>   * Mejorar UX para creación/edición de productos
>   * Implementar vista previa en tiempo real
> - **Optimizar vista previa de teléfono**:
>   * Mejorar rendimiento con lazy loading
>   * Sincronizar estado con la navegación principal
>   * Implementar transiciones fluidas
>
> ⚠️ **RECORDATORIO CRÍTICO**:
> - SIEMPRE consultar el código original del dashboard antes de modificar cualquier componente
> - Verificar cada detalle visual y funcional contra la implementación original
> - No avanzar en ninguna implementación sin entender completamente cómo funciona en el dashboard original
> - Implementar SIEMPRE sistema de doble estado para datos críticos
> - Priorizar renderizado inmediato con estado local para mejor UX
>
> 📋 **Progreso de Fase 3**: 65% completado
> 
> 📝 **Notas**:
> - La arquitectura ha demostrado ser robusta y eficiente
> - Se han resuelto problemas críticos de sincronización de estado
> - El renderizado de secciones ahora es inmediato gracias al estado local
> - Se ha optimizado la carga de datos con verificación de caché
> - El sistema de depuración en desarrollo facilita la identificación de problemas
> - Se mantiene plena compatibilidad con el dashboard original
> - Las herramientas de diagnóstico implementadas permiten identificar rápidamente problemas de autenticación y carga de datos

> 💡 **Nota**: Este documento debe ser consultado en cada paso de la refactorización para mantener el rumbo correcto.

> ⚠️ **Advertencia**: La violación de estos mandamientos puede resultar en caos y desorden en el código. 