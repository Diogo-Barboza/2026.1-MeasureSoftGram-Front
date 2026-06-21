import { repository } from '../repository';
import api from '../api';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock do Auth para que getAuthHeaders resolva sem chamar a rede real.
jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn().mockResolvedValue({ type: 'success', value: { key: 'mock-token' } })
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRepository', () => {
    it('should handle an error when creating a repository', async () => {
      // Simule uma falha na API
      (mockedApi.post as jest.Mock).mockRejectedValue(new Error('Failed to create repository'));

      // Execute o método
      const result = await repository.createRepository('org1', 'prod1', { name: 'Test Repo', platform: 'GitHub' });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('updateRepository', () => {
    it('should handle an error when updating a repository', async () => {
      // Simule uma falha na API
      (mockedApi.put as jest.Mock).mockRejectedValue(new Error('Failed to update repository'));

      // Execute o método
      const result = await repository.updateRepository('org1', 'prod1', 'repo1', {
        name: 'Updated Repo',
        platform: 'GitLab'
      });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('deleteRepository', () => {
    it('should handle an error when deleting a repository', async () => {
      // Simule uma falha na API
      (mockedApi.delete as jest.Mock).mockRejectedValue(new Error('Failed to delete repository'));

      // Execute o método
      const result = await repository.deleteRepository('org1', 'prod1', 'repo1');

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('getHistoricalData', () => {
    it('should handle an error when fetching historical data', async () => {
      // Simule uma falha na API
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch historical data'));

      // Execute o método
      const result = await repository.getHistoricalData({
        organizationId: 'org1',
        productId: 'prod1',
        repositoryId: 'repo1',
        entity: 'commits'
      });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('versiona rotas com /v1', () => {
    it('getRepository should call api.get with the /v1 prefixed URL', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { id: 'repo1' } });

      await repository.getRepository('org1', 'prod1', 'repo1');

      expect(mockedApi.get).toHaveBeenCalledWith('/v1/organizations/org1/products/prod1/repositories/repo1/');
    });

    it('createRepository should call api.post with the /v1 prefixed URL', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: {} });

      await repository.createRepository('org1', 'prod1', { name: 'Test Repo', platform: 'GitHub' });

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/v1/organizations/org1/products/prod1/repositories/',
        { name: 'Test Repo', platform: 'GitHub', imported: false },
        expect.any(Object)
      );
    });
  });
});
