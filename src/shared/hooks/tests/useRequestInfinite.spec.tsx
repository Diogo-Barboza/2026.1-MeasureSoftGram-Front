import { renderHook, waitFor, act } from '@testing-library/react';
import { useRequestInfinite } from '../useRequestInfinite'; 
import api from '@services/api';

// Forçamos o Jest a tratar o api como uma função que podemos manipular
jest.mock('@services/api', () => jest.fn());

describe('useRequestInfinite Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Previne o erro "Cannot read properties of undefined" no map()
    (api as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('deve inicializar com o estado correto', async () => {
    const { result } = renderHook(() => useRequestInfinite(() => ({ url: '/test' })));
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
    
    expect(typeof result.current.fetchMore).toBe('function');
  });

  it('deve buscar dados quando solicitado', async () => {
    const mockPage = { data: Array(10).fill('item') };
    (api as jest.Mock).mockResolvedValue(mockPage);

    // A MÁGICA ESTÁ AQUI: Adicionamos "params: { page: index }"
    // Assim, a página 0 e a página 1 terão chaves de cache diferentes!
    const { result } = renderHook(() => 
      useRequestInfinite((index) => ({ url: '/test', params: { page: index } }))
    );

    // 1. Esperamos o SWR carregar a primeira página com sucesso
    await waitFor(() => {
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    // 2. Limpamos o registro de chamadas da API
    (api as jest.Mock).mockClear();

    // 3. Executamos o fetchMore
    act(() => {
      result.current.fetchMore();
    });

    // 4. Como a chave mudou (page: 1), o SWR é forçado a bater na API de novo!
    await waitFor(() => {
      expect(api).toHaveBeenCalled();
    });
  });
});