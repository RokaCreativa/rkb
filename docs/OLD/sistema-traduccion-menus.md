# Sistema de Traducción Multinivel para Menús de Clientes

## 📋 Resumen

Este documento detalla la implementación planificada de un sistema de traducción multinivel para los menús de los clientes en RokaMenu. Este sistema permitirá la traducción automática y manual de elementos de menú (categorías, secciones y productos) a diferentes idiomas, proporcionando una experiencia multilingüe completa tanto para los clientes (restaurantes) como para los usuarios finales.

> "Conocerás lo que existe antes de crear algo nuevo"
> "No duplicarás lo que ya está creado"
> "Separarás la función de la estética"
> "Garantizarás experiencia perfecta en múltiples dispositivos"

## 🔍 Contexto Actual

- Actualmente, el sistema i18n implementado (`app/dashboard-v2/i18n/`) traduce solo la interfaz de usuario del dashboard
- Existe una tabla `translations` en la base de datos que no está siendo utilizada
- Los menús de los clientes están disponibles solo en un idioma (idioma principal)
- No hay mecanismo para que los clientes ofrezcan sus menús en múltiples idiomas

## 🧩 Estructura de la Tabla `translations` Existente

```
Table: translations
Columns:
translation_id int AI PK
language_id varchar(2)
table_name varchar(50)
column_name varchar(50)
element_id int
text_value text
```

Esta tabla está diseñada para almacenar traducciones personalizadas para cualquier texto del sistema.

## 🎯 Visión del Sistema

El nuevo sistema de traducción de menús permitirá:

1. **Traducción automática**: Traducir automáticamente elementos del menú a múltiples idiomas usando servicios de traducción
2. **Traducciones personalizadas**: Permitir a los clientes (restaurantes) modificar manualmente las traducciones automáticas
3. **Activación/desactivación de idiomas**: Administrar qué idiomas están disponibles para cada menú
4. **Interfaz intuitiva**: Gestionar traducciones desde el dashboard de forma sencilla y visual

## 📁 Arquitectura Propuesta

### 1. Niveles de Traducción

El sistema utilizará un enfoque de tres niveles:

```
Nivel 1: Traducción Automática ─→ Nivel 2: Traducción Personalizada ─→ Nivel 3: Presentación
   (API externa)                 (Almacenada en BD)                  (Menú visible al usuario)
```

### 2. Componentes del Sistema

#### 2.1 Servicio de Traducción (`app/dashboard-v2/services/translationService.ts`)

```typescript
/**
 * @fileoverview Servicio para gestionar las traducciones de elementos de menú
 * @author RokaMenu Team
 * @version 1.0.0
 *
 * Este servicio proporciona funcionalidades para:
 * - Traducir elementos de menú con APIs externas
 * - Gestionar traducciones personalizadas
 * - Obtener traducciones para diferentes idiomas
 */
interface TranslationService {
  /**
   * Traduce automáticamente un texto a un idioma específico
   * @param text Texto original a traducir
   * @param targetLang Código de idioma destino (ej. "en", "fr")
   * @param sourceLang Código de idioma origen (opcional, autodetectar si no se especifica)
   * @returns Texto traducido
   */
  translateText(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<string>;

  /**
   * Traduce automáticamente un elemento completo (categoría, sección o producto)
   * @param entityType Tipo de entidad ("category", "section", "product")
   * @param entityId ID de la entidad
   * @param targetLang Código de idioma destino
   * @returns Resultado de la operación
   */
  translateEntity(
    entityType: "category" | "section" | "product",
    entityId: number,
    targetLang: string
  ): Promise<boolean>;

  /**
   * Guarda una traducción personalizada para un elemento
   * @param entityType Tipo de entidad ("category", "section", "product")
   * @param entityId ID de la entidad
   * @param fieldName Nombre del campo ("name", "description")
   * @param targetLang Código de idioma destino
   * @param customText Texto de traducción personalizado
   * @returns Resultado de la operación
   */
  saveCustomTranslation(
    entityType: "category" | "section" | "product",
    entityId: number,
    fieldName: string,
    targetLang: string,
    customText: string
  ): Promise<boolean>;

  /**
   * Obtiene la traducción para un elemento específico
   * @param entityType Tipo de entidad ("category", "section", "product")
   * @param entityId ID de la entidad
   * @param fieldName Nombre del campo ("name", "description")
   * @param targetLang Código de idioma destino
   * @returns Texto traducido (personalizado si existe, automático si no)
   */
  getTranslation(
    entityType: "category" | "section" | "product",
    entityId: number,
    fieldName: string,
    targetLang: string
  ): Promise<string>;

  /**
   * Activa o desactiva un idioma para el menú de un cliente
   * @param clientId ID del cliente
   * @param lang Código de idioma
   * @param active Estado de activación
   * @returns Resultado de la operación
   */
  setLanguageActive(
    clientId: number,
    lang: string,
    active: boolean
  ): Promise<boolean>;

  /**
   * Obtiene los idiomas activos para un cliente
   * @param clientId ID del cliente
   * @returns Lista de códigos de idioma activos
   */
  getActiveLanguages(clientId: number): Promise<string[]>;
}
```

#### 2.2 Hook de Gestión de Traducciones (`app/dashboard-v2/hooks/domain/translation/useMenuTranslation.ts`)

```typescript
/**
 * @fileoverview Hook para gestionar traducciones de menú
 * @author RokaMenu Team
 * @version 1.0.0
 *
 * Este hook proporciona una interfaz para gestionar las traducciones
 * de los elementos del menú, incluyendo traducciones automáticas y personalizadas.
 */
interface UseMenuTranslationReturn {
  /**
   * Estado de carga de traducciones
   */
  isLoading: boolean;

  /**
   * Error en operaciones de traducción
   */
  error: string | null;

  /**
   * Idiomas disponibles en el sistema
   */
  availableLanguages: Array<{ code: string; name: string; flag: string }>;

  /**
   * Idiomas activos para el cliente actual
   */
  activeLanguages: string[];

  /**
   * Traduce automáticamente un elemento del menú
   */
  translateEntity: (
    entityType: "category" | "section" | "product",
    entityId: number,
    targetLang: string
  ) => Promise<boolean>;

  /**
   * Guarda una traducción personalizada
   */
  saveCustomTranslation: (
    entityType: "category" | "section" | "product",
    entityId: number,
    fieldName: string,
    targetLang: string,
    text: string
  ) => Promise<boolean>;

  /**
   * Obtiene la traducción actual para un elemento
   */
  getTranslation: (
    entityType: "category" | "section" | "product",
    entityId: number,
    fieldName: string,
    targetLang: string
  ) => Promise<string>;

  /**
   * Activa/desactiva un idioma para el menú del cliente
   */
  toggleLanguage: (lang: string, active: boolean) => Promise<boolean>;

  /**
   * Traduce automáticamente todo el menú a un idioma
   */
  translateFullMenu: (targetLang: string) => Promise<boolean>;
}

function useMenuTranslation(clientId: number): UseMenuTranslationReturn {
  // Implementación del hook...
}
```

#### 2.3 Componentes de UI

##### 2.3.1 Componente de Selector de Idioma para Menú (`app/dashboard-v2/components/domain/translation/MenuLanguageSwitcher.tsx`)

```tsx
/**
 * @fileoverview Componente para seleccionar idiomas disponibles en el menú del cliente
 * @author RokaMenu Team
 * @version 1.0.0
 */
interface MenuLanguageSwitcherProps {
  /**
   * ID del cliente
   */
  clientId: number;

  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * Componente que permite activar/desactivar idiomas para el menú del cliente
 * y establecer el idioma principal.
 */
function MenuLanguageSwitcher({
  clientId,
  className,
}: MenuLanguageSwitcherProps) {
  const { activeLanguages, availableLanguages, toggleLanguage } =
    useMenuTranslation(clientId);

  // Implementación del componente...
}
```

##### 2.3.2 Editor de Traducciones (`app/dashboard-v2/components/domain/translation/TranslationEditor.tsx`)

```tsx
/**
 * @fileoverview Editor para modificar traducciones de elementos de menú
 * @author RokaMenu Team
 * @version 1.0.0
 */
interface TranslationEditorProps {
  /**
   * Tipo de entidad ("category", "section", "product")
   */
  entityType: "category" | "section" | "product";

  /**
   * ID de la entidad
   */
  entityId: number;

  /**
   * Nombre del campo ("name", "description")
   */
  fieldName: string;

  /**
   * Texto original
   */
  originalText: string;

  /**
   * Idiomas disponibles
   */
  languages: string[];

  /**
   * Función al guardar traducción
   */
  onSave?: (success: boolean) => void;
}

/**
 * Componente para editar traducciones de elementos de menú.
 * Permite ver la traducción automática y guardar traducciones personalizadas.
 */
function TranslationEditor({
  entityType,
  entityId,
  fieldName,
  originalText,
  languages,
  onSave,
}: TranslationEditorProps) {
  const { getTranslation, saveCustomTranslation } =
    useMenuTranslation(/* clientId obtenido de contexto */);

  // Implementación del componente...
}
```

##### 2.3.3 Vista de Gestión de Traducciones (`app/dashboard-v2/components/views/TranslationManagementView.tsx`)

```tsx
/**
 * @fileoverview Vista para gestionar las traducciones del menú
 * @author RokaMenu Team
 * @version 1.0.0
 */
interface TranslationManagementViewProps {
  /**
   * ID del cliente
   */
  clientId: number;
}

/**
 * Vista principal para gestionar las traducciones del menú.
 * Permite configurar idiomas disponibles y editar traducciones.
 */
function TranslationManagementView({
  clientId,
}: TranslationManagementViewProps) {
  // Implementación de la vista...
}
```

### 3. Integración con la API Existente

#### 3.1 Nuevos Endpoints

Se implementarán los siguientes endpoints:

```typescript
/**
 * @fileoverview Endpoints para gestión de traducciones
 */

// GET /api/client/{clientId}/languages
// Obtiene los idiomas activos para un cliente

// POST /api/client/{clientId}/languages
// Activa/desactiva un idioma para un cliente

// GET /api/translations/{entityType}/{entityId}/{fieldName}/{language}
// Obtiene la traducción para un elemento específico

// POST /api/translations/{entityType}/{entityId}/{fieldName}/{language}
// Guarda una traducción personalizada

// POST /api/translate/{entityType}/{entityId}/{language}
// Traduce automáticamente un elemento completo

// POST /api/translate/menu/{clientId}/{language}
// Traduce automáticamente todo el menú de un cliente
```

#### 3.2 Adaptación del Modelo de Datos

```typescript
/**
 * @fileoverview Extensión de tipos existentes para soporte de traducciones
 */

// Añadir a interfaces existentes
interface ClientSettings extends ClientSettingsBase {
  // Propiedades existentes...

  /**
   * Idiomas activos para el menú del cliente
   */
  active_languages: string[];

  /**
   * Idioma principal del menú
   */
  primary_language: string;
}
```

## 🛠️ Implementación

### Fase 1: Configuración Base

1. Crear servicio de traducción con integración a API externa (Google Cloud Translation, DeepL, etc.)
2. Implementar endpoints para CRUD de traducciones
3. Extender el modelo de datos para soportar idiomas activos por cliente

### Fase 2: Interfaz de Usuario

1. Desarrollar el editor de traducciones
2. Implementar el selector de idiomas para el menú
3. Crear la vista de gestión de traducciones en el dashboard

### Fase 3: Funcionalidades Avanzadas

1. Implementar cola de trabajo para traducciones masivas
2. Desarrollar sistema de caché para traducciones
3. Añadir estadísticas de cobertura de traducciones

## 🎨 Experiencia de Usuario

### 1. Flujo para Activar Nuevos Idiomas

1. El cliente va a "Configuración → Idiomas"
2. Selecciona los idiomas que desea activar (español, inglés, francés, etc.)
3. El sistema ofrece traducir automáticamente todo el menú
4. Si el cliente acepta, el sistema encola la traducción automática
5. Una vez completada, notifica al cliente que las traducciones están disponibles

### 2. Flujo para Editar Traducciones

1. El cliente navega a una categoría, sección o producto
2. Accede a la pestaña "Traducciones" en el panel de edición
3. Visualiza la traducción automática en cada idioma activo
4. Puede editar manualmente cualquier traducción
5. Guarda los cambios, que se almacenan como traducciones personalizadas

### 3. Visualización para el Usuario Final

1. El usuario final ve un selector de idiomas en el menú
2. Al cambiar el idioma, todos los textos del menú se actualizan instantáneamente
3. Se muestran las traducciones personalizadas si existen, o las automáticas en su defecto

## 📱 Consideraciones para Dispositivos Móviles

> "Garantizarás experiencia perfecta en múltiples dispositivos"

- El editor de traducciones será completamente responsive para tablets y móviles
- Se implementará una vista compacta para gestionar traducciones en dispositivos pequeños
- Las áreas táctiles para controles de edición tendrán al menos 44px×44px
- El selector de idiomas para usuarios finales será fácilmente accesible en cualquier tamaño de pantalla

## 🔍 Consideraciones Técnicas

### 1. Rendimiento

- Implementar un sistema de caché para traducciones frecuentes
- Cargar traducciones bajo demanda para evitar exceso de datos
- Utilizar lazy loading para editores de traducción

### 2. Almacenamiento

- Utilizar la tabla `translations` existente como base
- Para textos muy extensos, considerar optimizaciones como compresión o almacenamiento externo

### 3. Costos

- Monitorear el uso de APIs de traducción externas
- Implementar límites por cliente según su plan
- Considerar estrategias de reutilización de traducciones comunes

## 📊 Métricas de Éxito

- Tasa de adopción: % de clientes que activan múltiples idiomas
- Tasa de personalización: % de traducciones automáticas modificadas manualmente
- Rendimiento: Tiempo de carga de menús multilingües < 2 segundos
- Usabilidad: Facilidad para gestionar traducciones en el dashboard

## 📘 Integración con Sistema i18n Existente

> "No duplicarás lo que ya está creado"

El sistema reutilizará la infraestructura i18n ya implementada para la interfaz de usuario:

```typescript
/**
 * @fileoverview Integración con el sistema i18n existente
 */

// Extender el sistema actual para soportar traducciones de menú
import i18n from "../../i18n/i18n";
import { TranslationService } from "../../services/translationService";

// Hook que combina i18n de UI con traducciones de menú
export function useRokaMenuTranslation(clientId?: number) {
  // Usar el hook existente para UI
  const { t, changeLanguage, currentLanguage } = useI18n();

  // Añadir funcionalidades para traducciones de menú si hay clientId
  let menuTranslation = {};
  if (clientId) {
    const {
      getTranslation,
      saveCustomTranslation,
      // ...otros métodos
    } = useMenuTranslation(clientId);

    menuTranslation = {
      getMenuTranslation: getTranslation,
      saveMenuTranslation: saveCustomTranslation,
      // ...otros métodos
    };
  }

  return {
    // Funciones de traducción de UI
    t,
    changeLanguage,
    currentLanguage,

    // Funciones de traducción de menú
    ...menuTranslation,
  };
}
```

## 🧪 Plan de Pruebas

1. **Pruebas unitarias** para el servicio de traducción
2. **Pruebas de integración** para el flujo completo de traducción
3. **Pruebas de rendimiento** para cargas masivas de traducciones
4. **Pruebas de usabilidad** con clientes reales

## 🚀 Próximos Pasos

Dado que actualmente estamos enfocados en el plan de optimización móvil, este sistema de traducción se implementará después de completar las tareas prioritarias en `plan-optimizacion-movil.md`. Las próximas acciones serán:

1. Completar las tareas pendientes de optimización móvil
2. Finalizar la unificación de modales duplicados
3. Terminar la implementación básica de i18n para la interfaz
4. Comenzar con la fase 1 del sistema de traducción multinivel

## 📚 Referencias

- [Documentación de i18next](https://www.i18next.com/)
- [Google Cloud Translation API](https://cloud.google.com/translate)
- [DeepL API](https://www.deepl.com/pro-api)
- [Documentación de nextjs/Internationalization](https://nextjs.org/docs/advanced-features/i18n-routing)

---

Este plan deberá ser revisado y aprobado antes de comenzar su implementación, y se integrará con la estrategia general de internacionalización de RokaMenu.
