import { renderHook, act, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { organizationQuery } from '@services/organization';
import { useOrganizationQuery } from '../useOrganizationQuery';

let mockCurrentOrganizations: any[] | undefined;
const mockSetCurrentOrganizations = jest.fn();

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganizations: mockCurrentOrganizations,
    setCurrentOrganizations: mockSetCurrentOrganizations,
  }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@services/organization', () => ({
  organizationQuery: {
    getAllOrganization: jest.fn(),
    createOrganization: jest.fn(),
    getOrganizationById: jest.fn(),
    updateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
  },
}));

describe('useOrganizationQuery Hook', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentOrganizations = undefined; 
  });

  it('deve carregar organizações no mount e aplicar "fake-id" se necessário', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1' }, { name: 'Org 2 Sem ID' }],
    });

    renderHook(() => useOrganizationQuery());

    await waitFor(() => {
      expect(mockSetCurrentOrganizations).toHaveBeenCalledWith([
        { id: 'org-1', name: 'Org 1' },
        { id: 'fake-id', name: 'Org 2 Sem ID' },
      ]);
    });
  });

  it('deve exibir toast de erro se getAllOrganization falhar com mensagem', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'error',
      error: { message: 'Erro no servidor' },
    });

    renderHook(() => useOrganizationQuery());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações: Erro no servidor');
    });
  });

  it('deve exibir toast com "Erro desconhecido" se getAllOrganization falhar sem mensagem', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'error',
      error: {}, 
    });

    renderHook(() => useOrganizationQuery());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações: Erro desconhecido');
    });
  });

  it('deve exibir toast de erro se getAllOrganization cair no bloco catch', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockRejectedValue(new Error('Network Error'));

    renderHook(() => useOrganizationQuery());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações: Network Error');
    });
  });

  it('deve exibir "Erro desconhecido" no bloco catch se a exceção não tiver mensagem', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockRejectedValue({});

    renderHook(() => useOrganizationQuery());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações: Erro desconhecido');
    });
  });

  it('deve criar uma organização com sucesso e disparar atualização', async () => {
    mockCurrentOrganizations = [{ id: '1', name: 'Existente' }];
    
    (organizationQuery.createOrganization as jest.Mock).mockResolvedValue({ type: 'success' });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({ type: 'success', value: [] });

    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.createOrganization({ name: 'Nova Org' } as any);
    });

    await waitFor(() => {
      expect(organizationQuery.getAllOrganization).toHaveBeenCalled();
    });
  });

  it('NÃO deve disparar atualização se a criação falhar', async () => {
    mockCurrentOrganizations = [{ id: '1', name: 'Existente' }];
    (organizationQuery.createOrganization as jest.Mock).mockResolvedValue({ type: 'error' });
    
    const { result } = renderHook(() => useOrganizationQuery());
    
    (organizationQuery.getAllOrganization as jest.Mock).mockClear();

    await act(async () => {
      await result.current.createOrganization({ name: 'Nova Org' } as any);
    });

    expect(organizationQuery.getAllOrganization).not.toHaveBeenCalled();
  });

  it('deve deletar uma organização com sucesso e disparar atualização', async () => {
    mockCurrentOrganizations = [{ id: '1', name: 'Existente' }];
    (organizationQuery.deleteOrganization as jest.Mock).mockResolvedValue({ type: 'success' });

    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.deleteOrganization('1');
    });

    await waitFor(() => {
      expect(organizationQuery.getAllOrganization).toHaveBeenCalled();
    });
  });

  it('NÃO deve disparar atualização se a deleção falhar', async () => {
    mockCurrentOrganizations = [{ id: '1', name: 'Existente' }];
    (organizationQuery.deleteOrganization as jest.Mock).mockResolvedValue({ type: 'error' });
    
    const { result } = renderHook(() => useOrganizationQuery());
    (organizationQuery.getAllOrganization as jest.Mock).mockClear();

    await act(async () => {
      await result.current.deleteOrganization('1');
    });

    expect(organizationQuery.getAllOrganization).not.toHaveBeenCalled();
  });

  it('deve repassar as chamadas de getOrganizationById e updateOrganization corretamente', async () => {
    mockCurrentOrganizations = [{ id: '1', name: 'Existente' }];
    
    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.getOrganizationById('org-123');
      await result.current.updateOrganization('org-123', { name: 'Editada' } as any);
    });

    expect(organizationQuery.getOrganizationById).toHaveBeenCalledWith('org-123');
    expect(organizationQuery.updateOrganization).toHaveBeenCalledWith('org-123', { name: 'Editada' });
  });
});