import api from '../api';
import { organizationQuery } from '../organization'; // Ajuste o nome da importação se necessário

jest.mock('../api');
jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn(() => 'mock-token'),
}));

describe('Organization Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar as organizações (GET)', async () => {
    const mockOrgs = [{ id: '1', name: 'Org 1' }];
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrgs });

    const result = await organizationQuery.getAllOrganizations();
    expect(api.get).toHaveBeenCalled();
    expect(result.data).toEqual(mockOrgs);
  });

  it('deve criar uma nova organização (POST)', async () => {
    const mockPayload = { name: 'Nova Org' };
    (api.post as jest.Mock).mockResolvedValue({ data: { id: '2', ...mockPayload } });

    const result = await organizationQuery.createOrganization(mockPayload);
    expect(api.post).toHaveBeenCalledWith('/organizations/', mockPayload, expect.any(Object));
    expect(result.data.name).toEqual('Nova Org');
  });

  it('deve atualizar uma organização existente (PUT/PATCH)', async () => {
    const mockPayload = { name: 'Org Atualizada' };
    (api.put as jest.Mock).mockResolvedValue({ data: mockPayload });

    const result = await organizationQuery.updateOrganization('1', mockPayload);
    expect(api.put).toHaveBeenCalledWith('/organizations/1/', mockPayload, expect.any(Object));
    expect(result.data.name).toEqual('Org Atualizada');
  });

  it('deve deletar uma organização (DELETE)', async () => {
    (api.delete as jest.Mock).mockResolvedValue({ status: 204 });

    const result = await organizationQuery.deleteOrganization('1');
    expect(api.delete).toHaveBeenCalledWith('/organizations/1/', expect.any(Object));
    expect(result.status).toEqual(204);
  });
});
