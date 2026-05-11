import api from '../api';
import { organizationQuery } from '../organization'; 

jest.mock('../api');

jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn().mockResolvedValue({
    type: 'success',
    value: { key: 'mock-token' }
  }),
}));

describe('Organization Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar as organizações (GET)', async () => {
    const mockOrgs = { results: [{ id: '1', name: 'Org 1' }] };
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrgs });

    const result = await organizationQuery.getAllOrganization();
    
    expect(api.get).toHaveBeenCalled();
    expect(result.type).toEqual('success');
  });

  it('deve criar uma nova organização (POST)', async () => {
    const mockPayload = { name: 'Nova Org' };
    (api.post as jest.Mock).mockResolvedValue({ data: { id: '2', ...mockPayload } });

    const result = await organizationQuery.createOrganization(mockPayload);
    expect(api.post).toHaveBeenCalled();
    expect(result.type).toEqual('success');
  });

  it('deve atualizar uma organização existente (PUT/PATCH)', async () => {
    const mockPayload = { name: 'Org Atualizada' };
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
});