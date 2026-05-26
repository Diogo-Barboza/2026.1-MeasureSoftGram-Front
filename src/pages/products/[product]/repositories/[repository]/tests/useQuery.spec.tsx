import { renderHook, act, waitFor } from '@testing-library/react';
import { productQuery } from '@services/product';
import { useQuery } from '../hooks/useQuery';

// ---- Mocks ----
const mockSetCurrentRepository = jest.fn();
const mockSetCharacteristics = jest.fn();
const mockSetSubCharacteristics = jest.fn();
const mockSetMeasures = jest.fn();
const mockSetMetrics = jest.fn();
const mockSetHistoricalTSQMI = jest.fn();
const mockSetLatestTSQMI = jest.fn();
const mockSetLatestTSQMIBadgeUrl = jest.fn();
const mockSetCurrentProduct = jest.fn();
const mockSetCurrentOrganizations = jest.fn();

let mockQuery: Record<string, string | undefined> = {};
let mockCurrentProduct: any = null;
let mockCurrentOrganization: any = null;
let mockOrganizationList: any[] = [];

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: mockQuery,
    push: jest.fn(),
  }),
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    setCurrentRepository: mockSetCurrentRepository,
    setCharacteristics: mockSetCharacteristics,
    setSubCharacteristics: mockSetSubCharacteristics,
    setMeasures: mockSetMeasures,
    setMetrics: mockSetMetrics,
    setHistoricalTSQMI: mockSetHistoricalTSQMI,
    setLatestTSQMI: mockSetLatestTSQMI,
    setLatestTSQMIBadgeUrl: mockSetLatestTSQMIBadgeUrl,
  }),
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    setCurrentProduct: mockSetCurrentProduct,
    currentProduct: mockCurrentProduct,
  }),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: mockCurrentOrganization,
    organizationList: mockOrganizationList,
    setCurrentOrganizations: mockSetCurrentOrganizations,
  }),
}));

jest.mock('@services/repository', () => ({
  repository: {
    getHistorical: jest.fn().mockResolvedValue({ data: { results: [] } }),
    getLatest: jest.fn().mockResolvedValue({ data: {} }),
    getRepository: jest.fn().mockResolvedValue({ data: { id: '1', name: 'test-repo' } }),
    getTsqmiBadgeUrl: jest.fn().mockReturnValue('http://badge.url'),
  },
}));

jest.mock('@services/product', () => ({
  productQuery: {
    getPreConfigEntitiesRelationship: jest.fn().mockResolvedValue({ data: { data: [] } }),
    getMetricsLatestValues: jest.fn().mockResolvedValue({ data: {} }),
    getCharacteristicsLatestValues: jest.fn().mockResolvedValue({ data: [] }),
    getCompareGoalAccomplished: jest.fn().mockResolvedValue({ data: [] }),
    getProductById: jest.fn().mockResolvedValue({ type: 'success', value: { id: '2', name: 'TestProduct' } }),
  },
}));

jest.mock('@utils/formatEntitiesFilter', () => jest.fn().mockReturnValue([[], [], []]));
jest.mock('@utils/formatEntitiesMetrics', () => jest.fn().mockReturnValue([[]]));

describe('useQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {};
    mockCurrentProduct = null;
    mockCurrentOrganization = null;
    mockOrganizationList = [];
  });

  it('should return initial state when no query params', () => {
    const { result } = renderHook(() => useQuery());

    expect(result.current.repositoryHistoricalCharacteristics).toEqual([]);
    expect(result.current.latestValueCharacteristics).toEqual([]);
    expect(result.current.comparedGoalAccomplished).toEqual([]);
  });

  it('should load repository data when query.repository is present', async () => {
    mockQuery = {
      product: '1-2',
      repository: '3-test',
    };

    const { result } = renderHook(() => useQuery());

    await waitFor(() => {
      expect(mockSetCurrentProduct).toHaveBeenCalled();
    });
  });

  it('should synchronize organization when query.product is present and org list is loaded', async () => {
    mockOrganizationList = [
      { id: '1', name: 'Org 1' },
      { id: '5', name: 'Org 5' },
    ];
    mockCurrentOrganization = null;
    mockQuery = { product: '5-2' };

    renderHook(() => useQuery());

    await waitFor(() => {
      expect(mockSetCurrentOrganizations).toHaveBeenCalledWith([{ id: '5', name: 'Org 5' }]);
    });
  });

  it('should not set organization when current org already matches', async () => {
    mockOrganizationList = [{ id: '1', name: 'Org 1' }];
    mockCurrentOrganization = { id: '1', name: 'Org 1' };
    mockQuery = { product: '1-2' };

    renderHook(() => useQuery());

    await waitFor(() => {
      expect(mockSetCurrentOrganizations).not.toHaveBeenCalled();
    });
  });

  it('should reload product when currentProduct becomes null after org change', async () => {
    mockCurrentOrganization = { id: '1', name: 'Org 1' };
    mockCurrentProduct = null;
    mockQuery = { product: '1-2' };

    renderHook(() => useQuery());

    await waitFor(() => {
      expect(productQuery.getProductById).toHaveBeenCalledWith('1', '2');
    });
  });

  it('should call loadProduct when repository query changes', async () => {
    mockQuery = {
      product: '10-20',
      repository: '30-test',
    };

    renderHook(() => useQuery());

    await waitFor(() => {
      expect(productQuery.getProductById).toHaveBeenCalledWith('10', '20');
    });
  });

  it('should handle loadProduct error gracefully', async () => {
    productQuery.getProductById.mockRejectedValueOnce(new Error('Network error'));

    mockQuery = {
      product: '1-2',
      repository: '3-test',
    };

    // Should not throw
    const { result } = renderHook(() => useQuery());

    await waitFor(() => {
      expect(result.current.repositoryHistoricalCharacteristics).toEqual([]);
    });
  });
});
