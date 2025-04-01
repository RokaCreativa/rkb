# Guía de Refactorización del Dashboard v2 - Parte 3: Patrones de Migración y Roadmap

## Patrones de Migración del Dashboard v1 al v2

### Filosofía de la Migración

La migración del Dashboard v1 al v2 sigue estos principios fundamentales:

1. **Mantener la funcionalidad existente**: El Dashboard v2 debe ofrecer todas las características del v1.
2. **Mejorar la experiencia del usuario**: Optimizar los flujos de trabajo y la interfaz.
3. **Refactorizar el código**: Mejorar calidad, mantenibilidad y legibilidad.
4. **Adoptar mejores prácticas modernas**: Incorporar patrones actuales de React y TypeScript.

### Patrones Comunes de Migración

#### 1. De Componentes de Clase a Componentes Funcionales

**Dashboard v1 (Clase):**
```tsx
// Componente de clase antiguo
class CategoryManager extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      categories: [],
      isLoading: true,
      error: null
    };
  }
  
  componentDidMount() {
    this.fetchCategories();
  }
  
  fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      this.setState({ categories: data, isLoading: false });
    } catch (error) {
      this.setState({ error: 'Error al cargar categorías', isLoading: false });
    }
  }
  
  handleDeleteCategory = (id: number) => {
    // Implementación...
  }
  
  render() {
    const { categories, isLoading, error } = this.state;
    
    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    
    return (
      <div>
        {categories.map(category => (
          <CategoryItem 
            key={category.id} 
            category={category} 
            onDelete={this.handleDeleteCategory} 
          />
        ))}
      </div>
    );
  }
}
```

**Dashboard v2 (Funcional):**
```tsx
// Componente funcional con hooks
function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError('Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const handleDeleteCategory = useCallback(async (id: number) => {
    // Implementación...
  }, []);
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {categories.map(category => (
        <CategoryItem 
          key={category.id} 
          category={category} 
          onDelete={handleDeleteCategory} 
        />
      ))}
    </div>
  );
}
```

#### 2. De Gestión de Estado con setState a Hooks

**Dashboard v1 (setState):**
```tsx
class SectionEditor extends React.Component {
  state = {
    name: this.props.initialName || '',
    image: null,
    isSubmitting: false
  };
  
  handleNameChange = (e) => {
    this.setState({ name: e.target.value });
  };
  
  handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ image: e.target.files[0] });
    }
  };
  
  handleSubmit = async () => {
    this.setState({ isSubmitting: true });
    // Lógica de envío...
    this.setState({ isSubmitting: false });
  };
  
  // Resto del componente...
}
```

**Dashboard v2 (useState):**
```tsx
function SectionEditor({ initialName, onSubmit }) {
  const [name, setName] = useState(initialName || '');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Lógica de envío...
      onSubmit({ name, image });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Resto del componente...
}
```

#### 3. De Manejo de Efectos Secundarios a useEffect

**Dashboard v1:**
```tsx
class ProductList extends React.Component {
  componentDidMount() {
    this.loadProducts();
    
    // Suscribirse a eventos
    window.addEventListener('resize', this.handleResize);
    eventBus.on('product-created', this.handleProductCreated);
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.sectionId !== this.props.sectionId) {
      this.loadProducts();
    }
  }
  
  componentWillUnmount() {
    // Limpiar
    window.removeEventListener('resize', this.handleResize);
    eventBus.off('product-created', this.handleProductCreated);
  }
  
  // Métodos de manejo...
}
```

**Dashboard v2:**
```tsx
function ProductList({ sectionId }) {
  const [products, setProducts] = useState([]);
  
  // Efecto para cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      // Implementación...
    };
    
    loadProducts();
  }, [sectionId]); // Se ejecuta cuando cambia sectionId
  
  // Efecto para eventos
  useEffect(() => {
    const handleResize = () => {
      // Implementación...
    };
    
    const handleProductCreated = (data) => {
      // Implementación...
    };
    
    // Suscribirse a eventos
    window.addEventListener('resize', handleResize);
    eventBus.on('product-created', handleProductCreated);
    
    // Función de limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      eventBus.off('product-created', handleProductCreated);
    };
  }, []); // Solo se ejecuta al montar/desmontar
  
  // Resto del componente...
}
```

#### 4. De Manejo de API Directo a Hooks Personalizados

**Dashboard v1:**
```tsx
class CategoryManager extends React.Component {
  fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      this.setState({ categories: data });
    } catch (error) {
      this.setState({ error: 'Error al cargar categorías' });
    }
  };
  
  createCategory = async (categoryData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const newCategory = await response.json();
      this.setState(prevState => ({
        categories: [...prevState.categories, newCategory]
      }));
    } catch (error) {
      this.setState({ error: 'Error al crear categoría' });
    }
  };
  
  // Más métodos de API...
}
```

**Dashboard v2:**
```tsx
// Hook personalizado para API de categorías
function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError('Error al cargar categorías');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const createCategory = useCallback(async (categoryData: Partial<Category>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al crear categoría');
      
      const newCategory = await response.json();
      setCategories(prev => [...prev, newCategory]);
      
      return newCategory;
    } catch (error) {
      setError('Error al crear categoría');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Más métodos de API...
  
  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    // Más métodos...
  };
}

// Componente que usa el hook
function CategoryManager() {
  const { 
    categories, 
    isLoading, 
    error, 
    fetchCategories, 
    createCategory 
  } = useCategories();
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Resto del componente...
}
```

## Errores Comunes y Cómo Evitarlos

### 1. Problemas de Dependencias en useEffect

**Error:**
```tsx
function SectionList({ categoryId }) {
  const [sections, setSections] = useState([]);
  
  // 🚫 Bad: Missing dependency
  useEffect(() => {
    fetchSectionsByCategory(categoryId);
  }, []); // Missing categoryId in dependencies
}
```

**Solución:**
```tsx
function SectionList({ categoryId }) {
  const [sections, setSections] = useState([]);
  
  // ✅ Good: Proper dependencies
  useEffect(() => {
    fetchSectionsByCategory(categoryId);
  }, [categoryId]); // Will run when categoryId changes
}
```

### 2. Estado Derivado Innecesario

**Error:**
```tsx
function ProductList({ products }) {
  // 🚫 Bad: Redundant state that duplicates props
  const [productList, setProductList] = useState(products);
  
  // This creates bugs because productList won't update when products prop changes
  useEffect(() => {
    setProductList(products);
  }, [products]);
  
  return (
    <div>
      {productList.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Solución:**
```tsx
function ProductList({ products }) {
  // ✅ Good: Use props directly or derive values with useMemo if needed
  
  // If filtering/transforming is needed, use useMemo:
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);
  
  return (
    <div>
      {sortedProducts.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 3. Race Conditions en Carga de Datos

**Error:**
```tsx
function SectionDetails({ sectionId }) {
  const [sectionData, setSectionData] = useState(null);
  
  // 🚫 Bad: Susceptible to race conditions
  useEffect(() => {
    let isActive = true;
    
    const fetchData = async () => {
      const data = await fetchSectionById(sectionId);
      setSectionData(data); // May set data for the wrong sectionId
    };
    
    fetchData();
    
    return () => {
      isActive = false; // This doesn't actually cancel the setState
    };
  }, [sectionId]);
}
```

**Solución:**
```tsx
function SectionDetails({ sectionId }) {
  const [sectionData, setSectionData] = useState(null);
  
  // ✅ Good: Handles race conditions properly
  useEffect(() => {
    let isActive = true;
    
    const fetchData = async () => {
      // Reset data when sectionId changes
      setSectionData(null);
      
      const data = await fetchSectionById(sectionId);
      
      // Only update state if component is still mounted and sectionId hasn't changed
      if (isActive) {
        setSectionData(data);
      }
    };
    
    fetchData();
    
    return () => {
      isActive = false;
    };
  }, [sectionId]);
}
```

### 4. Abusar del Tipo `any`

**Error:**
```tsx
// 🚫 Bad: Overusing 'any' loses TypeScript benefits
function EditProductForm({ product }: { product: any }) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  // This is error-prone - what if product.price is undefined?
}
```

**Solución:**
```tsx
// ✅ Good: Proper typing
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

function EditProductForm({ product }: { product: Product }) {
  // TypeScript validates that product has required properties
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [description, setDescription] = useState(product.description || '');
}
```

### 5. Efectos Secundarios en Renderizado

**Error:**
```tsx
function CategorySelector({ onCategoryChange }) {
  // 🚫 Bad: Side effect during render
  if (localStorage.getItem('selectedCategory')) {
    const categoryId = JSON.parse(localStorage.getItem('selectedCategory'));
    onCategoryChange(categoryId); // Side effect in render!
  }
}
```

**Solución:**
```tsx
function CategorySelector({ onCategoryChange }) {
  // ✅ Good: Effects belong in useEffect
  useEffect(() => {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      const categoryId = JSON.parse(savedCategory);
      onCategoryChange(categoryId);
    }
  }, [onCategoryChange]);
}
```

## Roadmap para Completar la Refactorización

A continuación, se presenta un plan detallado para completar la refactorización del Dashboard v2, dividido en fases concretas con tareas específicas.

### Fase 1: Completar Estructura Base y Componentes Fundamentales

1. **Definir tipos e interfaces**
   - [ ] Revisar y unificar interfaces de tipos en `/app/types/menu.ts`
   - [ ] Crear tipos específicos para el dashboard v2 en `/app/dashboard-v2/types`

2. **Finalizar hooks personalizados básicos**
   - [ ] Completar `useDataState.tsx` con todas las operaciones necesarias
   - [ ] Implementar o mejorar `useSections.tsx` para operaciones CRUD completas
   - [ ] Implementar o mejorar `useProducts.tsx` para operaciones CRUD completas

3. **Estructurar componentes base**
   - [ ] Completar `SectionTable.tsx` con todas las funcionalidades
   - [ ] Completar `ProductTable.tsx` con todas las funcionalidades
   - [ ] Implementar componentes de filtrado y búsqueda

**Tiempo estimado: 2-3 días**

### Fase 2: Implementar Flujos de Trabajo Principales

1. **Flujo de categorías**
   - [ ] Implementar creación de categorías
   - [ ] Implementar edición de categorías
   - [ ] Implementar eliminación de categorías con confirmación
   - [ ] Implementar reordenamiento de categorías con drag-and-drop

2. **Flujo de secciones**
   - [ ] Implementar creación de secciones
   - [ ] Implementar edición de secciones
   - [ ] Implementar eliminación de secciones con confirmación
   - [ ] Implementar reordenamiento de secciones dentro de categorías

3. **Flujo de productos**
   - [ ] Implementar creación de productos
   - [ ] Implementar edición de productos
   - [ ] Implementar eliminación de productos con confirmación
   - [ ] Implementar reordenamiento de productos dentro de secciones

**Tiempo estimado: 3-4 días**

### Fase 3: Mejorar la Experiencia de Usuario

1. **Navegación y persistencia de estado**
   - [ ] Implementar navegación con rutas para categorías/secciones/productos
   - [ ] Persistir estado de navegación (expansión, selección) en localStorage
   - [ ] Implementar historial de navegación y breadcrumbs

2. **Mejoras visuales y feedback**
   - [ ] Implementar animaciones de transición entre vistas
   - [ ] Mejorar sistema de notificaciones (toast, alerts)
   - [ ] Implementar estados vacíos con mensajes informativos

3. **Accesibilidad y responsividad**
   - [ ] Implementar navegación por teclado
   - [ ] Asegurar contraste adecuado para todos los elementos
   - [ ] Adaptar diseño para dispositivos móviles y tablets

**Tiempo estimado: 2-3 días**

### Fase 4: Optimización de Rendimiento

1. **Optimización de estado y renders**
   - [ ] Aplicar memoización (useMemo, useCallback, React.memo) donde sea necesario
   - [ ] Implementar virtualización para listas largas
   - [ ] Auditar y reducir renders innecesarios

2. **Optimización de carga de datos**
   - [ ] Implementar carga bajo demanda (lazy loading) para secciones/productos
   - [ ] Implementar caching de datos con tiempo de vida
   - [ ] Optimizar estrategias de refetch y revalidación

3. **Análisis y métricas**
   - [ ] Implementar logging para operaciones críticas
   - [ ] Medir tiempos de carga y respuesta
   - [ ] Optimizar puntos críticos identificados

**Tiempo estimado: 2-3 días**

### Fase 5: Pruebas y Despliegue

1. **Pruebas unitarias**
   - [ ] Crear pruebas para hooks personalizados
   - [ ] Crear pruebas para componentes clave
   - [ ] Verificar manejo de errores y casos límite

2. **Pruebas de integración**
   - [ ] Verificar flujos completos de trabajo
   - [ ] Probar interacciones entre componentes
   - [ ] Validar operaciones CRUD end-to-end

3. **Despliegue y monitoreo**
   - [ ] Crear build de producción y verificar
   - [ ] Implementar estrategia de monitoreo de errores
   - [ ] Recopilar feedback de usuarios y planificar mejoras

**Tiempo estimado: 2-3 días**

## Tiempo Total Estimado: 11-16 días laborables

## Consejos Finales para el Éxito

1. **Seguir un enfoque incremental**: Refactorizar y verificar pequeñas partes en lugar de grandes cambios.

2. **Mantener la compatibilidad**: Asegurar que los componentes refactorizados funcionen con la API existente.

3. **Documentar decisiones**: Mantener un registro de las decisiones de diseño y los problemas resueltos.

4. **Comunicar cambios**: Mantener informados a los stakeholders sobre el progreso y los cambios.

5. **Medir el impacto**: Evaluar los beneficios de la refactorización en términos de rendimiento, mantenibilidad y experiencia de usuario.

---

Con esta guía detallada, deberías tener una hoja de ruta clara para completar la refactorización del Dashboard v2 con éxito, evitando errores comunes y siguiendo las mejores prácticas establecidas. 