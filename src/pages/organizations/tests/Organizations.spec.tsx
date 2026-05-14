import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Organizations from '../Organizations';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { getAllUsers } from '@services/user';
import { useOrganizationQuery } from '../hooks/useOrganizationQuery';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@services/user', () => ({
  getAllUsers: jest.fn(),
}));

jest.mock('../hooks/useOrganizationQuery', () => ({
  useOrganizationQuery: jest.fn(),
}));

describe('Organizations Component', () => {
  const mockCreateOrganization = jest.fn();
  const mockGetOrganizationById = jest.fn();
  const mockUpdateOrganization = jest.fn();

  const originalLocation = window.location;

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: jest.fn(), href: '' },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    (useRouter as jest.Mock).mockReturnValue({
      query: {},
    });

    (useOrganizationQuery as jest.Mock).mockReturnValue({
      createOrganization: mockCreateOrganization,
      getOrganizationById: mockGetOrganizationById,
      updateOrganization: mockUpdateOrganization,
    });

    (getAllUsers as jest.Mock).mockResolvedValue({
      type: 'success',
      value: {
        results: [
          { id: 1, username: 'dev_ninja', first_name: 'Dev', last_name: 'Ninja' }
        ],
      },
    });
  });

  it('deve carregar usuários e exibir erro se a chamada falhar', async () => {
    (getAllUsers as jest.Mock).mockResolvedValue({ type: 'error' });
    render(<Organizations />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('toast.load-users');
    });
  });

  it('deve carregar os dados da organização caso esteja no modo de edição', async () => {
    (useRouter as jest.Mock).mockReturnValue({ query: { edit: 'org-123' } });
    
    mockGetOrganizationById.mockResolvedValue({
      type: 'success',
      value: { name: 'Org Editada', key: 'ORG', description: 'Desc', members: ['dev_ninja'] },
    });

    render(<Organizations />);

    await waitFor(() => {
      const nomeInput = screen.getByTestId('input-nome').querySelector('input');
      expect(nomeInput?.value).toBe('Org Editada');
    });

    expect(screen.getByText('title-edit')).toBeInTheDocument();
  });

  it('deve abrir o modal, adicionar/remover um usuário e fechar o modal', async () => {
    render(<Organizations />);

    await waitFor(() => {
      expect(getAllUsers).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('add-members'));

    const userItem = await screen.findByText('Dev Ninja (dev_ninja)');
    expect(userItem).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: 'Adicionar' });
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Adicionado');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Adicionar');

    fireEvent.click(screen.getByText('close'));
  });

  it('deve submeter o formulário de CRIAÇÃO com sucesso', async () => {
    jest.useFakeTimers();
    mockCreateOrganization.mockResolvedValue({ type: 'success' });
    render(<Organizations />);

    fireEvent.change(screen.getByTestId('input-nome').querySelector('input')!, { target: { value: 'Nova Org' } });
    fireEvent.change(screen.getByTestId('input-descricao').querySelector('textarea')!, { target: { value: 'Descrição teste' } });

    fireEvent.click(screen.getByText('create'));

    await waitFor(() => {
      expect(mockCreateOrganization).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Nova Org', description: 'Descrição teste', members: [] })
      );
      expect(toast.success).toHaveBeenCalledWith('toast.sucess');
    });

    act(() => { jest.runAllTimers(); });
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('deve exibir erros corretos ao falhar a CRIAÇÃO', async () => {
    render(<Organizations />);

    const nomeInput = screen.getByTestId('input-nome').querySelector('input')!;
    fireEvent.change(nomeInput, { target: { value: 'Org Falha' } });

    mockCreateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: 'toast.name-exists' } });
    fireEvent.click(screen.getByText('create'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('toast.name-exists'));

    mockCreateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: 'toast.key-exists' } });
    fireEvent.click(screen.getByText('create'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('toast.key-exists'));

    mockCreateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: 'server_down' } });
    fireEvent.click(screen.getByText('create'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('toast.error'));
  });

  it('deve submeter o formulário de EDIÇÃO com sucesso', async () => {
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ query: { edit: 'org-123' } });
    
    mockGetOrganizationById.mockResolvedValue({ type: 'success', value: { name: 'Org Existente' } });
    mockUpdateOrganization.mockResolvedValue({ type: 'success' });

    render(<Organizations />);

    await waitFor(() => {
      expect(screen.getByTestId('input-nome').querySelector('input')?.value).toBe('Org Existente');
    });

    fireEvent.click(screen.getByText('save'));

    await waitFor(() => {
      expect(mockUpdateOrganization).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('toast.sucess-edit');
    });

    act(() => { jest.runAllTimers(); });
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('deve exibir erros corretos ao falhar a EDIÇÃO', async () => {
    (useRouter as jest.Mock).mockReturnValue({ query: { edit: 'org-123' } });
    
    mockGetOrganizationById.mockResolvedValue({ type: 'success', value: { name: 'Org Existente' } });

    render(<Organizations />);

    await waitFor(() => {
      expect(screen.getByTestId('input-nome').querySelector('input')?.value).toBe('Org Existente');
    });

    mockUpdateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: 'toast.name-exists' } });
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('toast.name-exists'));

    mockUpdateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: 'toast.key-exists' } });
    fireEvent.click(screen.getByText('save'));
    
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('toast.key-exists'));

    mockUpdateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: 'server_down' } });
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('toast.error-edit'));
  });
});