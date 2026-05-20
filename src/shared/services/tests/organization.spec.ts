import api from '../api';
import { organizationQuery } from '../organization'; // Ajuste o caminho se necessário
import { getAccessToken } from '@services/Auth';

jest.mock('../api');

// Precisamos mockar o Auth dessa forma para conseguir alterar 
// o retorno dele nos testes de erro.
jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn(),
}));

describe('Organization Service', () => {
  const mockPayload = { name: 'Nova Org', key: 'NOVA' };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuração padrão de sucesso para o token na maioria dos testes
    (getAccessToken as jest.Mock).mockResolvedValue({
      type: 'success',
      value: { key: 'mock-token' }
    });
  });

  // ==========================================
  // CAMINHOS DE SUCESSO
  // ==========================================

  it('deve listar as organizações (GET)', async () => {
    const mockOrgs = { results: [{ id: '1', name: 'Org 1' }] };
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrgs });

    const result = await organizationQuery.getAllOrganization();
    
    expect(api.get).toHaveBeenCalled();
    expect(result.type).toEqual('success');
    if (result.type === 'success') {
      expect(result.value).toEqual(mockOrgs.results);
    }
  });

  it('deve buscar uma organização por ID (GET)', async () => {
    const mockOrg = { id: '1', name: 'Org 1' };
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrg });

    const result = await organizationQuery.getOrganizationById('1');
    
    expect(api.get).toHaveBeenCalledWith('/organizations/1/', expect.any(Object));
    expect(result.type).toEqual('success');
  });

  it('deve criar uma nova organização (POST)', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { id: '2', ...mockPayload } });

    const result = await organizationQuery.createOrganization(mockPayload);
    expect(api.post).toHaveBeenCalled();
    expect(result.type).toEqual('success');
  });

  it('deve atualizar uma organização existente (PUT)', async () => {
    (api.put as jest.Mock).mockResolvedValue({ data: mockPayload });

    const result = await organizationQuery.updateOrganization('1', mockPayload);
    expect(api.put).toHaveBeenCalled();
    expect(result.type).toEqual('success');
  });

  it('deve deletar uma organização (DELETE)', async () => {
    (api.delete as jest.Mock).mockResolvedValue({ status: 204 });

    const result = await organizationQuery.deleteOrganization('1');
    expect(api.delete).toHaveBeenCalled();
    expect(result.type).toEqual('success');
  });

  // ==========================================
  // CAMINHOS DE ERRO E EXCEÇÃO (Aumentam a cobertura)
  // ==========================================

  it('deve retornar erro se o token de acesso não for encontrado', async () => {
    // Força o getAccessToken a retornar um erro
    (getAccessToken as jest.Mock).mockResolvedValue({ type: 'error' });

    const result = await organizationQuery.getAllOrganization();
    
    expect(result.type).toEqual('error');
    if (result.type === 'error') {
      expect(result.error.message).toBe('Token de acesso não encontrado.');
    }
  });

  it('deve lidar com falha genérica no getAllOrganization', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await organizationQuery.getAllOrganization();
    expect(result.type).toEqual('error');
  });

  it('deve lidar com falha genérica no getOrganizationById', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await organizationQuery.getOrganizationById('1');
    expect(result.type).toEqual('error');
  });

  it('deve lidar com falha genérica no deleteOrganization', async () => {
    (api.delete as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await organizationQuery.deleteOrganization('1');
    expect(result.type).toEqual('error');
  });

  // Testes de Status 400 (Tratamento de Bad Request da API)
  
  it('deve retornar erro de nome duplicado ao criar organização', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { name: ["Organization with this name already exists."] }
      }
    };
    (api.post as jest.Mock).mockRejectedValue(errorResponse);

    const result = await organizationQuery.createOrganization(mockPayload);
    
    expect(result.type).toEqual('error');
    if (result.type === 'error') {
      expect(result.error.message).toBe('Já existe uma organização com este nome.');
    }
  });

  it('deve retornar erro de chave duplicada ao criar organização', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { key: ["Organization with this key already exists."] }
      }
    };
    (api.post as jest.Mock).mockRejectedValue(errorResponse);

    const result = await organizationQuery.createOrganization(mockPayload);
    
    expect(result.type).toEqual('error');
    if (result.type === 'error') {
      expect(result.error.message).toBe('Já existe uma organização com esta chave.');
    }
  });

  it('deve retornar erro genérico ao falhar na criação', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('Erro interno'));

    const result = await organizationQuery.createOrganization(mockPayload);
    
    expect(result.type).toEqual('error');
    if (result.type === 'error') {
      expect(result.error.message).toBe('Ocorreu um erro ao criar organização.');
    }
  });

  it('deve retornar erro de nome duplicado ao atualizar organização', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { name: ["Organization with this name already exists."] }
      }
    };
    (api.put as jest.Mock).mockRejectedValue(errorResponse);

    const result = await organizationQuery.updateOrganization('1', mockPayload);
    
    expect(result.type).toEqual('error');
    if (result.type === 'error') {
      expect(result.error.message).toBe('Já existe uma organização com este nome.');
    }
  });

  it('deve retornar erro de chave duplicada ao atualizar organização', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { key: ["Organization with this key already exists."] }
      }
    };
    (api.put as jest.Mock).mockRejectedValue(errorResponse);

    const result = await organizationQuery.updateOrganization('1', mockPayload);
    
    expect(result.type).toEqual('error');
    if (result.type === 'error') {
      expect(result.error.message).toBe('Já existe uma organização com esta chave.');
    }
  });

  it('deve retornar erro genérico ao falhar na atualização', async () => {
    (api.put as jest.Mock).mockRejectedValue(new Error('Erro interno'));

    const result = await organizationQuery.updateOrganization('1', mockPayload);
    
    expect(result.type).toEqual('error');
    if (result.type === 'error') {
      expect(result.error.message).toBe('Ocorreu um erro ao atualizar organização.');
    }
  });
});