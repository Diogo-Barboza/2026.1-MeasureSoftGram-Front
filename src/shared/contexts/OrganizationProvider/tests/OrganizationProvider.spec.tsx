import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { toast } from 'react-toastify';
import { OrganizationProvider, useOrganizationContext } from '../OrganizationProvider';
import { organizationQuery } from '@services/organization';
import { useAuth } from '@contexts/Auth';

jest.mock('@contexts/Auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@services/organization', () => ({
  organizationQuery: {
    getAllOrganization: jest.fn(),
    getGithubOrganizations: jest.fn(),
    importOrganization: jest.fn(),
  },
}));

describe('OrganizationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar valores padrão quando não houver sessão', () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null });

    const { result } = renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    expect(result.current.currentOrganization).toBeNull();
    expect(result.current.organizationList).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('deve carregar organizações no mount se houver sessão', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: { username: 'danilo' } });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ id: '1', name: 'Org 1' }],
    });
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [],
    });

    const { result } = renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    await waitFor(() => {
      expect(result.current.organizationList).toEqual([
        {
          id: '1',
          name: 'Org 1',
          description: '',
          url: '',
          products: [],
          key: '',
        },
      ]);
      expect(result.current.currentOrganization).toEqual({
        id: '1',
        name: 'Org 1',
        description: '',
        url: '',
        products: [],
        key: '',
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('deve importar organizações do GitHub que não estão registradas no MeasureSoftGram', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: { username: 'danilo' } });
    
    // Primeira chamada retorna lista vazia
    (organizationQuery.getAllOrganization as jest.Mock)
      .mockResolvedValueOnce({
        type: 'success',
        value: [],
      })
      // Segunda chamada (reload) retorna a lista com a nova org
      .mockResolvedValueOnce({
        type: 'success',
        value: [{ id: '2', name: 'GitHubOrg', key: 'GitHubOrg' }],
      });

    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ github_org_name: 'GitHubOrg' }],
    });

    (organizationQuery.importOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
    });

    renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    await waitFor(() => {
      expect(organizationQuery.importOrganization).toHaveBeenCalledWith('GitHubOrg');
    });
  });

  it('não deve importar organizações do GitHub se elas já existirem por nome ou por key', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: { username: 'danilo' } });
    
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [
        { id: '1', name: 'MatchingName', key: 'key1' },
        { id: '2', name: 'name2', key: 'matchingkey' },
      ],
    });

    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [
        { github_org_name: 'matchingname' },
        { github_org_name: 'matchingkey' },
      ],
    });

    renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    await waitFor(() => {
      expect(organizationQuery.importOrganization).not.toHaveBeenCalled();
    });
  });

  it('deve exibir toast.error se getAllOrganization falhar', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: { username: 'danilo' } });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'error',
    });

    renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações.');
    });
  });

  it('deve exibir toast.error e capturar erro no catch se getAllOrganization lançar exceção', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: { username: 'danilo' } });
    (organizationQuery.getAllOrganization as jest.Mock).mockRejectedValue(new Error('Network Error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações. Por favor, tente novamente.');
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('deve permitir chamar fetchOrganizations com forceFetch', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ id: '1', name: 'Org 1' }],
    });
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [],
    });

    const { result } = renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    await act(async () => {
      await result.current.fetchOrganizations(true);
    });

    expect(organizationQuery.getAllOrganization).toHaveBeenCalled();
  });

  it('deve retornar sem fazer nada em fetchOrganizations se não houver session e forceFetch for falso', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    const { result } = renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    await act(async () => {
      await result.current.fetchOrganizations(false);
    });

    expect(organizationQuery.getAllOrganization).not.toHaveBeenCalled();
  });

  it('deve usar os valores padrão de fallback ao mapear organizações', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: { username: 'danilo' } });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [
        {
          name: 'Org Fallbacks',
          // Todos os outros campos ausentes para forçar o fallback ?? '' ou ?? []
        },
      ],
    });
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [],
    });

    const { result } = renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider,
    });

    await waitFor(() => {
      expect(result.current.organizationList).toEqual([
        {
          id: '',
          name: 'Org Fallbacks',
          description: '',
          url: '',
          products: [],
          key: '',
        },
      ]);
    });
  });

  it('throws error when useOrganizationContext is used outside OrganizationProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useOrganizationContext())).toThrow('OrganizationContext must be used within a OrganizationProvider');
    consoleSpy.mockRestore();
  });
});
