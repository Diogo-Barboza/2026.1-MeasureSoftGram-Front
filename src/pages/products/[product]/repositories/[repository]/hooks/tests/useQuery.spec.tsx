import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { repository } from '@services/repository';
import { productQuery } from '@services/product';

import formatEntitiesFilter from '@utils/formatEntitiesFilter';
import formatEntitiesMetrics from '@utils/formatEntitiesMetrics';
import { getPathId } from '@utils/pathDestructer';

import { useQuery } from '../useQuery'; // Ajuste o caminho conforme necessário

// 1. Mocks do Next e Contexto
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: jest.fn()
}));

// 2. Mocks dos Serviços
jest.mock('@services/repository', () => ({
  repository: {
    getHistorical: jest.fn(),
    getLatest: jest.fn(),
    getTsqmiBadgeUrl: jest.fn(),
    getRepository: jest.fn()
  }
}));

jest.mock('@services/product', () => ({
  productQuery: {
    getPreConfigEntitiesRelationship: jest.fn(),
    getMetricsLatestValues: jest.fn(),
    getCharacteristicsLatestValues: jest.fn(),
    getCompareGoalAccomplished: jest.fn()
  }
}));

// 3. Mocks dos Utilitários
jest.mock('@utils/formatEntitiesFilter', () => jest.fn());
jest.mock('@utils/formatEntitiesMetrics', () => jest.fn());
jest.mock('@utils/pathDestructer', () => ({
  getPathId: jest.fn()
}));

describe('useQuery Hook', () => {
  const mockSetters = {
    setCurrentRepository: jest.fn(),
    setCharacteristics: jest.fn(),
    setSubCharacteristics: jest.fn(),
    setMeasures: jest.fn(),
    setMetrics: jest.fn(),
    setHistoricalTSQMI: jest.fn(),
    setLatestTSQMI: jest.fn(),
    setLatestTSQMIBadgeUrl: jest.fn()
  };

  beforeAll(() => {
    // Mock do window.crypto utilizado no loadHistoricalTsqmi e loadLatestTsqmi
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: jest.fn((arr) => {
          arr[0] = 12345; // Simula o retorno de um valor randômico
          return arr;
        })
      }
    });

    // Mockamos os logs para o console ficar limpo durante os testes do "Caminho Triste"
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRepositoryContext as jest.Mock).mockReturnValue(mockSetters);
  });

  it('não deve acionar as requisições se não houver um repositório na query', () => {
    (useRouter as jest.Mock).mockReturnValue({ query: {} });

    renderHook(() => useQuery());

    // Como query.repository não existe, getRepository não pode ser chamado
    expect(repository.getRepository).not.toHaveBeenCalled();
  });

  it('deve buscar e formatar todos os dados com sucesso quando houver repositório na query', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { product: 'org-1-prod-2', repository: 'repo-3' }
    });

    (getPathId as jest.Mock).mockImplementation((str) => str.split('-'));
    (formatEntitiesFilter as jest.Mock).mockReturnValue([['char1'], ['sub1'], ['meas1']]);
    (formatEntitiesMetrics as jest.Mock).mockReturnValue([['met1']]);

    // Resoluções de Sucesso das Promessas
    (productQuery.getPreConfigEntitiesRelationship as jest.Mock).mockResolvedValue({ data: 'rel' });
    (productQuery.getMetricsLatestValues as jest.Mock).mockResolvedValue({ data: 'metrics' });
    (productQuery.getCharacteristicsLatestValues as jest.Mock).mockResolvedValue({ data: ['charData'] });
    (productQuery.getCompareGoalAccomplished as jest.Mock).mockResolvedValue({ data: ['goalAccomplished'] });

    (repository.getHistorical as jest.Mock).mockResolvedValue({ data: { results: ['historicalData'] } });
    (repository.getLatest as jest.Mock).mockResolvedValue({ data: 'latestTsqmi' });
    (repository.getTsqmiBadgeUrl as jest.Mock).mockReturnValue('http://badge.url');
    (repository.getRepository as jest.Mock).mockResolvedValue({ data: 'repositoryData' });

    const { result } = renderHook(() => useQuery());

    await waitFor(() => {
      // Verifica se todas as funções do contexto foram alimentadas
      expect(mockSetters.setCurrentRepository).toHaveBeenCalledWith('repositoryData');
      expect(mockSetters.setCharacteristics).toHaveBeenCalledWith(['char1']);
      expect(mockSetters.setSubCharacteristics).toHaveBeenCalledWith(['sub1']);
      expect(mockSetters.setMeasures).toHaveBeenCalledWith(['meas1']);
      expect(mockSetters.setMetrics).toHaveBeenCalledWith(['met1']);
      expect(mockSetters.setLatestTSQMI).toHaveBeenCalledWith('latestTsqmi');
      expect(mockSetters.setLatestTSQMIBadgeUrl).toHaveBeenCalledWith('http://badge.url');
      expect(mockSetters.setHistoricalTSQMI).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TSQMI', key: 'TSQMI', history: ['historicalData'] })
      );

      // Verifica os retornos internos do próprio hook (states)
      expect(result.current.repositoryHistoricalCharacteristics).toEqual(['historicalData']);
      expect(result.current.latestValueCharacteristics).toEqual(['charData']);
      expect(result.current.comparedGoalAccomplished).toEqual(['goalAccomplished']);
      
      // Verifica o formatCheckedOptions (se todas as keys viraram true)
      expect(result.current.checkedOptionsFormat).toEqual({
        char1: true,
        sub1: true,
        meas1: true,
        met1: true
      });
    });
  });

  it('deve lidar corretamente com erros nas requisições sem quebrar a aplicação (blocos catch)', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { product: 'org-1-prod-2', repository: 'repo-3' }
    });
    (getPathId as jest.Mock).mockImplementation((str) => str.split('-'));

    // Rejeições forçadas (Simulação de erro na API/Rede)
    const error = new Error('Network Error');
    (productQuery.getPreConfigEntitiesRelationship as jest.Mock).mockRejectedValue(error);
    (productQuery.getCharacteristicsLatestValues as jest.Mock).mockRejectedValue(error);
    (productQuery.getCompareGoalAccomplished as jest.Mock).mockRejectedValue(error);
    
    (repository.getHistorical as jest.Mock).mockRejectedValue(error);
    (repository.getLatest as jest.Mock).mockRejectedValue(error);
    (repository.getRepository as jest.Mock).mockRejectedValue(error);

    renderHook(() => useQuery());

    await waitFor(() => {
      // O catch do loadLatestTsqmi chama console.log
      expect(console.log).toHaveBeenCalledWith(error);
      
      // O catch do loadCompareGoalAccomplished chama console.error
      expect(console.error).toHaveBeenCalledWith(error);

      // Apesar dos erros, o código não quebra e as funções de contexto (exceto as mockadas acima) não explodem
      expect(mockSetters.setCurrentRepository).not.toHaveBeenCalled();
    });
  });
});