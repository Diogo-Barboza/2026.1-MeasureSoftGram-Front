import api from '../api';
import { userQuery } from '../user'; // Verifique se a importação corresponde ao nome exportado no seu arquivo user.ts
import { getAccessToken } from '@services/Auth';

jest.mock('../api');
jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn(() => 'mock-token'),
}));

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar os detalhes do usuário com sucesso (GET)', async () => {
    const mockData = { id: '1', name: 'Zafiro' };
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await userQuery.getUser('1');

    expect(api.get).toHaveBeenCalledWith('/users/1/', expect.any(Object));
    expect(result.data).toEqual(mockData);
  });

  it('deve retornar erro ao falhar na busca (GET)', async () => {
    const mockError = new Error('Network Error');
    (api.get as jest.Mock).mockRejectedValue(mockError);

    await expect(userQuery.getUser('1')).rejects.toThrow('Network Error');
  });

  it('deve criar um usuário com sucesso (POST)', async () => {
    const mockPayload = { name: 'Novo Usuário', email: 'test@test.com' };
    (api.post as jest.Mock).mockResolvedValue({ data: mockPayload });

    const result = await userQuery.createUser(mockPayload);
    expect(api.post).toHaveBeenCalledWith('/users/', mockPayload);
    expect(result.data).toEqual(mockPayload);
  });
});
