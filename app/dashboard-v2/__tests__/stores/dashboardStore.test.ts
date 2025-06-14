/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Tests integrales para dashboardStore - FASE 7
 * 
 * PORQUÉ CRÍTICO: Implementa testing strategy de v0.dev para store complejo
 * PROBLEMA RESUELTO: Store sin tests que maneja estado crítico de la aplicación
 * 
 * ESTRATEGIA DE TESTING:
 * 1. Unit tests para acciones individuales
 * 2. Integration tests para flujos completos
 * 3. Edge cases para eliminación en cascada
 * 4. Optimistic updates + rollback scenarios
 * 5. Mock de APIs para tests aislados
 * 
 * CONEXIONES CRÍTICAS:
 * - dashboardStore.ts: Store principal que se testea
 * - Todos los componentes que usan el store
 * - APIs que el store consume
 * 
 * PATRÓN v0.dev: Tests descriptivos + mocks realistas + edge cases críticos
 * ARQUITECTURA: Separación clara entre unit e integration tests
 */

import { renderHook, act } from '@testing-library/react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { toast } from 'react-hot-toast';

// --- MOCKS ---

// Mock de toast para evitar errores en tests
jest.mock('react-hot-toast', () => ({
    toast: {
        loading: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock de fetch para simular APIs
global.fetch = jest.fn();

// --- DATOS DE PRUEBA ---

const mockClient = {
    id: 1,
    name: 'Test Restaurant',
    email: 'test@restaurant.com'
};

const mockCategories = [
    {
        category_id: 1,
        name: 'Hamburguesas',
        status: 1,
        display_order: 1,
        client_id: 1,
        image: 'hamburguesas.jpg'
    },
    {
        category_id: 2,
        name: 'Bebidas',
        status: 1,
        display_order: 2,
        client_id: 1,
        image: 'bebidas.jpg'
    }
];

const mockSections = [
    {
        section_id: 1,
        name: 'Hamburguesas Clásicas',
        category_id: 1,
        status: 1,
        display_order: 1,
        products_count: 5,
        visible_products_count: 4
    },
    {
        section_id: 2,
        name: 'Hamburguesas Premium',
        category_id: 1,
        status: 1,
        display_order: 2,
        products_count: 3,
        visible_products_count: 3
    }
];

const mockProducts = [
    {
        product_id: 1,
        name: 'Big Mac',
        section_id: 1,
        category_id: null,
        status: 1,
        display_order: 1,
        price: '8.99',
        description: 'Hamburguesa clásica'
    },
    {
        product_id: 2,
        name: 'Coca Cola',
        section_id: null,
        category_id: 2, // Producto directo
        status: 1,
        display_order: 1,
        price: '2.50',
        description: 'Bebida refrescante'
    }
];

// --- HELPERS DE TESTING ---

const createMockResponse = (data: any, ok = true) => ({
    ok,
    json: async () => data,
});

const setupFetchMock = (responses: { [key: string]: any }) => {
    (fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
        const method = options?.method || 'GET';
        const key = `${method} ${url}`;
        
        if (responses[key]) {
            return Promise.resolve(createMockResponse(responses[key]));
        }
        
        // Default response
        return Promise.resolve(createMockResponse({ error: 'Not mocked' }, false));
    });
};

describe('DashboardStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useDashboardStore.setState({
            client: null,
            categories: [],
            sections: {},
            products: {},
            isLoading: false,
            isClientLoading: false,
            isUpdating: false,
            error: null,
            initialDataLoaded: false,
            activeView: 'categories',
            activeCategoryId: null,
            activeSectionId: null,
            history: [],
            selectedCategoryId: null,
            selectedSectionId: null,
        });
        
        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('🧭 UNIT TESTS - Acciones Individuales', () => {
        test('should fetch categories successfully', async () => {
            // 🧭 MIGA DE PAN: Test básico de fetchCategories con mock de API
            setupFetchMock({
                'GET /api/categories?client_id=1': mockCategories
            });

            const { result } = renderHook(() => useDashboardStore());

            await act(async () => {
                await result.current.fetchCategories(1);
            });

            expect(result.current.categories).toEqual(mockCategories);
            expect(result.current.isLoading).toBe(false);
            expect(fetch).toHaveBeenCalledWith('/api/categories?client_id=1');
        });

        test('should handle fetch categories error', async () => {
            // 🧭 MIGA DE PAN: Test de manejo de errores en fetchCategories
            setupFetchMock({
                'GET /api/categories?client_id=1': { error: 'Server error' }
            });
            (fetch as jest.Mock).mockResolvedValueOnce(createMockResponse({ error: 'Server error' }, false));

            const { result } = renderHook(() => useDashboardStore());

            await act(async () => {
                await result.current.fetchCategories(1);
            });

            expect(result.current.categories).toEqual([]);
            expect(result.current.error).toBe('Server error');
            expect(toast.error).toHaveBeenCalled();
        });

        test('should create product direct successfully', async () => {
            // 🧭 MIGA DE PAN: Test específico para T31 - createProductDirect
            setupFetchMock({
                'POST /api/products': { success: true, product: mockProducts[1] },
                'GET /api/categories/2/products': [mockProducts[1]]
            });

            const { result } = renderHook(() => useDashboardStore());

            await act(async () => {
                await result.current.createProductDirect(2, {
                    name: 'Coca Cola',
                    price: '2.50',
                    description: 'Bebida refrescante'
                });
            });

            expect(fetch).toHaveBeenCalledWith('/api/products', expect.objectContaining({
                method: 'POST'
            }));
            expect(toast.success).toHaveBeenCalledWith('Producto directo creado', expect.any(Object));
        });
    });

    describe('🧭 INTEGRATION TESTS - Flujos Completos', () => {
        test('should handle complete navigation flow', async () => {
            // 🧭 MIGA DE PAN: Test de flujo completo de navegación móvil
            setupFetchMock({
                'GET /api/sections?category_id=1': mockSections,
                'GET /api/products?section_id=1': [mockProducts[0]]
            });

            const { result } = renderHook(() => useDashboardStore());

            // Simular navegación: categories → sections → products
            await act(async () => {
                result.current.handleCategorySelect(1);
            });

            expect(result.current.activeView).toBe('sections');
            expect(result.current.activeCategoryId).toBe(1);

            await act(async () => {
                result.current.handleSectionSelect(1);
            });

            expect(result.current.activeView).toBe('products');
            expect(result.current.activeSectionId).toBe(1);

            // Test navegación hacia atrás
            act(() => {
                result.current.handleBack();
            });

            expect(result.current.activeView).toBe('sections');
            expect(result.current.activeSectionId).toBe(null);
        });

        test('should handle hybrid category flow (T31)', async () => {
            // 🧭 MIGA DE PAN: Test de flujo híbrido con productos directos
            setupFetchMock({
                'GET /api/categories/2/products': [mockProducts[1]], // Producto directo
                'GET /api/sections?category_id=2': [] // Sin secciones
            });

            const { result } = renderHook(() => useDashboardStore());

            await act(async () => {
                await result.current.fetchDataForCategory(2);
            });

            // Verificar que se cargaron productos directos
            expect(result.current.products['cat-2']).toEqual([mockProducts[1]]);
            expect(result.current.sections[2]).toEqual([]);
        });
    });

    describe('🧭 EDGE CASES - Eliminación en Cascada', () => {
        test('should handle category deletion with cascade cleanup', async () => {
            // 🧭 MIGA DE PAN: Test crítico de eliminación en cascada (FASE 4)
            setupFetchMock({
                'DELETE /api/categories/1': { success: true },
                'GET /api/categories?client_id=1': [mockCategories[1]] // Solo queda categoría 2
            });

            const { result } = renderHook(() => useDashboardStore());

            // Setup initial state
            act(() => {
                useDashboardStore.setState({
                    categories: mockCategories,
                    sections: { 1: mockSections },
                    products: { 1: [mockProducts[0]], 'cat-1': [] },
                    selectedCategoryId: 1,
                    selectedSectionId: 1
                });
            });

            await act(async () => {
                await result.current.deleteCategory(1);
            });

            // Verificar eliminación en cascada
            expect(result.current.categories).toHaveLength(1);
            expect(result.current.sections[1]).toBeUndefined();
            expect(result.current.products[1]).toBeUndefined();
            expect(result.current.products['cat-1']).toBeUndefined();
            
            // Verificar reseteo de selecciones
            expect(result.current.selectedCategoryId).toBe(null);
            expect(result.current.selectedSectionId).toBe(null);
        });

        test('should rollback on failed deletion', async () => {
            // 🧭 MIGA DE PAN: Test de rollback en caso de error (patrón v0.dev)
            setupFetchMock({});
            (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => useDashboardStore());

            // Setup initial state
            const initialState = {
                categories: mockCategories,
                sections: { 1: mockSections },
                selectedCategoryId: 1
            };

            act(() => {
                useDashboardStore.setState(initialState);
            });

            await act(async () => {
                try {
                    await result.current.deleteCategory(1);
                } catch (error) {
                    // Expected to fail
                }
            });

            // Verificar que el estado se restauró completamente
            expect(result.current.categories).toEqual(mockCategories);
            expect(result.current.sections[1]).toEqual(mockSections);
            expect(result.current.selectedCategoryId).toBe(1);
            expect(toast.error).toHaveBeenCalled();
        });

        test('should handle concurrent operations gracefully', async () => {
            // 🧭 MIGA DE PAN: Test de operaciones concurrentes
            setupFetchMock({
                'POST /api/categories': { success: true },
                'DELETE /api/categories/1': { success: true },
                'GET /api/categories?client_id=1': mockCategories
            });

            const { result } = renderHook(() => useDashboardStore());

            // Simular operaciones concurrentes
            const promises = [
                result.current.createCategory({ name: 'Nueva Categoría' }),
                result.current.deleteCategory(1),
                result.current.fetchCategories(1)
            ];

            await act(async () => {
                await Promise.allSettled(promises);
            });

            // Verificar que no hay estados inconsistentes
            expect(result.current.isUpdating).toBe(false);
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('🧭 OPTIMISTIC UPDATES', () => {
        test('should show optimistic update immediately', async () => {
            // 🧭 MIGA DE PAN: Test de optimistic updates para UX fluida
            let resolvePromise: (value: any) => void;
            const slowPromise = new Promise(resolve => {
                resolvePromise = resolve;
            });

            (fetch as jest.Mock).mockReturnValueOnce(slowPromise);

            const { result } = renderHook(() => useDashboardStore());

            // Setup initial state
            act(() => {
                useDashboardStore.setState({
                    categories: [mockCategories[0]],
                    selectedCategoryId: mockCategories[0].category_id
                });
            });

            // Iniciar eliminación (no await para verificar estado intermedio)
            act(() => {
                result.current.deleteCategory(mockCategories[0].category_id);
            });

            // Verificar que el optimistic update se aplicó inmediatamente
            expect(result.current.categories).toHaveLength(0);

            // Resolver la promesa
            act(() => {
                resolvePromise!(createMockResponse({ success: true }));
            });
        });
    });

    describe('🧭 PERFORMANCE TESTS', () => {
        test('should handle large datasets efficiently', async () => {
            // 🧭 MIGA DE PAN: Test de rendimiento con datasets grandes
            const largeCategories = Array.from({ length: 100 }, (_, i) => ({
                ...mockCategories[0],
                category_id: i + 1,
                name: `Category ${i + 1}`
            }));

            setupFetchMock({
                'GET /api/categories?client_id=1': largeCategories
            });

            const { result } = renderHook(() => useDashboardStore());

            const startTime = performance.now();

            await act(async () => {
                await result.current.fetchCategories(1);
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(result.current.categories).toHaveLength(100);
            expect(duration).toBeLessThan(100); // Menos de 100ms
        });
    });
}); 