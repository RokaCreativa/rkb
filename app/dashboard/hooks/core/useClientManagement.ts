import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useCustomizationStore } from '../ui/state/useCustomizationStore';
import { Category } from '@/app/dashboard/types';

// Usamos Client interface del dominio centralizado
interface Client {
  id: string;
  name: string;
  logo?: string;
  customization?: string | null;
  // Otros campos del cliente
}

/**
 * Hook para gestionar los datos del cliente
 * Incluye la carga y actualización de la personalización
 */
export const useClientManagement = () => {
  const params = useParams();
  const clientId = params?.clientId as string || 'default';
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { initializeFromClient } = useCustomizationStore();

  // Cargar datos del cliente
  useEffect(() => {
    const loadClient = async () => {
      setLoading(true);
      setError(null);

      try {
        // En una implementación real, esto sería una llamada a la API
        // Por ahora, simulamos la carga para propósitos de demostración

        // Intentar cargar la personalización guardada para este cliente
        const savedCustomization = localStorage.getItem(`client-${clientId}-customization`);

        // Simulación de datos de API
        const mockClient: Client = {
          id: clientId,
          name: 'Cliente Demo',
          customization: savedCustomization
        };

        setClient(mockClient);

        // Aseguramos que se inicialice la customizationStore
        // incluso si no hay datos de personalización guardados
        initializeFromClient(mockClient.customization || null);

        console.log('Client loaded successfully:', mockClient.name);
      } catch (err) {
        console.error('Error loading client:', err);
        setError('Error al cargar los datos del cliente');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId, initializeFromClient]);

  // Actualizar datos del cliente
  const updateClient = useCallback(async (updatedClient: Client) => {
    try {
      // En una implementación real, sería una llamada a la API
      // Ejemplo: await fetch(`/api/clients/${clientId}`, { method: 'PUT', body: JSON.stringify(updatedClient) });

      // Guardar la personalización en localStorage como simulación
      if (updatedClient.customization) {
        localStorage.setItem(`client-${clientId}-customization`, updatedClient.customization);
        console.log('Client customization saved successfully');
      }

      setClient(updatedClient);
      return updatedClient;
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Error al actualizar los datos del cliente');
      throw err;
    }
  }, [clientId]);

  return {
    client,
    loading,
    error,
    updateClient
  };
};

export default useClientManagement; 