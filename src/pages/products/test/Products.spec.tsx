import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as routerHooks from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { organizationQuery } from '@services/organization';
import { productQuery } from '@services/product';
import { repository } from '@services/repository';
import { toast } from 'react-toastify';
import Products from '../Products';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockQuery = {} as any;

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(),
  OrganizationProvider: ({ children }: any) => children
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(),
  ProductProvider: ({ children }: any) => children
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: jest.fn(),
  RepositoryProvider: ({ children }: any) => children
}));

const mockSignInWithGithub = jest.fn();
jest.mock('@contexts/Auth', () => ({
  useAuth: () => ({
    signInWithGithub: mockSignInWithGithub
  }),
  AuthProvider: ({ children }: any) => children
}));

jest.mock('@services/organization', () => ({
  organizationQuery: {
    getGithubOrganizations: jest.fn(),
    getAllOrganization: jest.fn(),
    importOrganization: jest.fn(),
    getGithubRepos: jest.fn(),
  }
}));

jest.mock('@services/product', () => ({
  productQuery: {
    getAllProducts: jest.fn(),
    getAllRepositories: jest.fn(),
  }
}));

jest.mock('@services/repository', () => ({
  repository: {
    createRepository: jest.fn(),
  }
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

describe('Products Component', () => {
  const SUCCESS = 'success';
  const MOCK_ORG_NAME = 'Org-GitHub-1';
  const MOCK_ORG_ID = 'backend-org-1';
  const PROD_1_ID = 'prod1';
  const REPO_ALPHA_URL = 'https://github.com/org/repo-alpha';
  const REPO_BETA_URL = 'https://github.com/org/repo-beta';

  const mockGitHubOrgs = [
    { github_org_id: 1, github_org_name: MOCK_ORG_NAME, description: 'Desc 1', avatar_url: '' },
    { github_org_id: 2, github_org_name: 'Org-GitHub-2', description: '', avatar_url: '' }
  ];

  const mockBackendOrgs = [
    { id: MOCK_ORG_ID, name: MOCK_ORG_NAME, key: MOCK_ORG_NAME }
  ];

  const mockProducts = [
    { id: PROD_1_ID, name: 'Alpha Product' },
    { id: 'prod2', name: 'Beta Product' }
  ];

  const mockGithubRepos = [
    { github_repo_id: 101, name: 'repo-alpha', github_full_name: `${MOCK_ORG_NAME}/repo-alpha`, url: REPO_ALPHA_URL, description: 'Alpha description' },
    { github_repo_id: 102, name: 'repo-beta', github_full_name: `${MOCK_ORG_NAME}/repo-beta`, url: REPO_BETA_URL, description: 'Beta description' }
  ];

  const mockImportedRepos = [
    { id: 'repo-db-1', name: 'repo-alpha', url: REPO_ALPHA_URL, description: 'Alpha description' }
  ];

  const mockSetCurrentOrganizations = jest.fn();
  const mockFetchOrganizations = jest.fn();
  const mockSetCurrentProduct = jest.fn();
  const mockUpdateProductList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {};

    jest.spyOn(routerHooks, 'useRouter').mockImplementation(() => ({
      push: mockPush,
      replace: mockReplace,
      query: mockQuery,
      pathname: '/products',
      asPath: '/products',
      prefetch: jest.fn().mockResolvedValue(undefined)
    } as any));
    
    (useOrganizationContext as jest.Mock).mockReturnValue({
      organizationList: mockBackendOrgs,
      currentOrganization: mockBackendOrgs[0],
      setCurrentOrganizations: mockSetCurrentOrganizations,
      fetchOrganizations: mockFetchOrganizations,
      isLoading: false
    });

    (useProductContext as jest.Mock).mockReturnValue({
      productsList: mockProducts,
      currentProduct: mockProducts[0],
      setCurrentProduct: mockSetCurrentProduct,
      updateProductList: mockUpdateProductList
    });

    // Default successful API resolves
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: SUCCESS,
      value: mockGitHubOrgs
    });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: SUCCESS,
      value: mockBackendOrgs
    });
    (organizationQuery.importOrganization as jest.Mock).mockResolvedValue({
      type: SUCCESS,
      value: { id: 'imported-org-id' }
    });
    (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
      data: { results: mockProducts }
    });
    (organizationQuery.getGithubRepos as jest.Mock).mockResolvedValue({
      type: SUCCESS,
      value: mockGithubRepos
    });
    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: { results: mockImportedRepos }
    });
    (repository.createRepository as jest.Mock).mockResolvedValue({
      type: SUCCESS
    });
    mockSignInWithGithub.mockResolvedValue({ type: SUCCESS });
  });

  it('deve renderizar a tela de importação de repositórios com campos corretos', async () => {
    render(<Products />);
    
    await waitFor(() => {
      expect(screen.getByText('Importação de Repositórios')).toBeInTheDocument();
      expect(screen.getAllByText('Organizações do GitHub')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Produtos do MeasureSoftGram')[0]).toBeInTheDocument();
    });
  });

  it('deve lidar com erro ao carregar organizações do GitHub no mount', async () => {
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'error'
    });
    render(<Products />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao buscar organizações do GitHub.');
    });
  });

  it('deve lidar com exceção ao carregar organizações do GitHub no mount', async () => {
    (organizationQuery.getGithubOrganizations as jest.Mock).mockRejectedValue(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<Products />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações.');
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('deve trocar de organização do GitHub e carregar dados associados se ela já existir no backend', async () => {
    render(<Products />);

    // Espera carregar a primeira por padrão
    await waitFor(() => {
      expect(organizationQuery.getAllOrganization).toHaveBeenCalled();
      expect(productQuery.getAllProducts).toHaveBeenCalledWith(MOCK_ORG_ID);
      expect(organizationQuery.getGithubRepos).toHaveBeenCalledWith(MOCK_ORG_ID);
    });
  });

  it('deve importar a organização do GitHub no MeasureSoftGram caso ela não exista no backend', async () => {
    // Retorna organização diferente
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: SUCCESS,
      value: []
    });

    render(<Products />);

    await waitFor(() => {
      expect(organizationQuery.importOrganization).toHaveBeenCalledWith(MOCK_ORG_NAME);
      expect(mockFetchOrganizations).toHaveBeenCalledWith(true);
    });
  });

  it('deve exibir erro se a importação da organização falhar', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: SUCCESS,
      value: []
    });
    (organizationQuery.importOrganization as jest.Mock).mockResolvedValue({
      type: 'error'
    });

    render(<Products />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao importar organização no MeasureSoftGram.');
    });
  });

  it('deve tratar exceção em handleSelectOrganization', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockRejectedValue(new Error('Failed connection'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Products />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro de comunicação com o servidor.');
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('deve importar um repositório com sucesso', async () => {
    render(<Products />);

    // Espera carregar repos importados
    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-alpha`)).toBeInTheDocument();
    });

    // Clique na tab "A Importar"
    const tabAImportar = screen.getByRole('tab', { name: /a importar/i });
    fireEvent.click(tabAImportar);

    // Agora repo-beta deve aparecer
    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-beta`)).toBeInTheDocument();
    });

    const importBtn = screen.getByRole('button', { name: /importar/i });
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(repository.createRepository).toHaveBeenCalledWith(
        MOCK_ORG_ID,
        PROD_1_ID,
        {
          name: 'repo-beta',
          url: REPO_BETA_URL,
          description: 'Beta description',
          platform: 'github',
          imported: true
        }
      );
      expect(toast.success).toHaveBeenCalledWith('Repositório repo-beta importado com sucesso!');
    });
  });

  it('deve exibir erro quando a importação de repositório falhar', async () => {
    (repository.createRepository as jest.Mock).mockResolvedValue({
      type: 'error',
      error: { message: 'Api Error' }
    });

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-alpha`)).toBeInTheDocument();
    });

    // Clique na tab "A Importar"
    const tabAImportar = screen.getByRole('tab', { name: /a importar/i });
    fireEvent.click(tabAImportar);

    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-beta`)).toBeInTheDocument();
    });

    const importBtn = screen.getByRole('button', { name: /importar/i });
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao importar repositório: Api Error');
    });
  });

  it('deve exibir erro genérico quando a importação de repositório lançar exceção', async () => {
    (repository.createRepository as jest.Mock).mockRejectedValue(new Error('Fatal'));

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-alpha`)).toBeInTheDocument();
    });

    // Clique na tab "A Importar"
    const tabAImportar = screen.getByRole('tab', { name: /a importar/i });
    fireEvent.click(tabAImportar);

    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-beta`)).toBeInTheDocument();
    });

    const importBtn = screen.getByRole('button', { name: /importar/i });
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao importar repositório: Fatal');
    });
  });

  it('deve realizar oauth com GitHub se o query param "code" estiver presente na URL', async () => {
    mockQuery = { code: 'github-oauth-code' };

    render(<Products />);

    await waitFor(() => {
      expect(mockSignInWithGithub).toHaveBeenCalledWith('github-oauth-code');
      expect(toast.success).toHaveBeenCalledWith('Organizações do GitHub vinculadas com sucesso!');
      expect(mockReplace).toHaveBeenCalled();
    });
  });

  it('deve exibir erro se o vinculo com GitHub via oauth falhar', async () => {
    mockQuery = { code: 'invalid-code' };
    mockSignInWithGithub.mockResolvedValue({ type: 'error' });

    render(<Products />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao vincular organizações do GitHub.');
    });
  });

  it('deve tratar exceção no oauth com GitHub', async () => {
    mockQuery = { code: 'error-code' };
    mockSignInWithGithub.mockRejectedValue(new Error('Fatal exchange'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Products />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ocorreu um erro ao vincular.');
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('deve redirecionar para a página de criação de produto ao clicar no botão Criar Produto', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /criar produto/i })).not.toBeDisabled();
    });

    const btn = screen.getByRole('button', { name: /criar produto/i });
    fireEvent.click(btn);

    expect(mockPush).toHaveBeenCalledWith(`/products/create?id_organization=${MOCK_ORG_ID}`);
  });

  it('deve filtrar repositórios pelo campo de busca', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-alpha`)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar repositórios do produto...');
    fireEvent.change(searchInput, { target: { value: 'alpha' } });

    expect(screen.getByText(`${MOCK_ORG_NAME}/repo-alpha`)).toBeInTheDocument();
  });

  it('deve filtrar repositórios pelas tabs de Importado / Todos / A Importar', async () => {
    render(<Products />);

    // Por padrão (tab 0: Importados), apenas repo-alpha (importado) é visível
    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-alpha`)).toBeInTheDocument();
    });
    expect(screen.queryByText(`${MOCK_ORG_NAME}/repo-beta`)).not.toBeInTheDocument();

    // Clique na tab "Todos" (Index 1)
    const tabTodos = screen.getByRole('tab', { name: /todos/i });
    fireEvent.click(tabTodos);

    await waitFor(() => {
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-alpha`)).toBeInTheDocument();
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-beta`)).toBeInTheDocument();
    });

    // Clique na tab "A Importar" (Index 2)
    const tabAImportar = screen.getByRole('tab', { name: /a importar/i });
    fireEvent.click(tabAImportar);

    await waitFor(() => {
      expect(screen.queryByText(`${MOCK_ORG_NAME}/repo-alpha`)).not.toBeInTheDocument();
      expect(screen.getByText(`${MOCK_ORG_NAME}/repo-beta`)).toBeInTheDocument();
    });
  });

  it('deve setar o produto atual na mudança de selectedProductId', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(mockSetCurrentProduct).toHaveBeenCalledWith(mockProducts[0]);
    });
  });

  it('deve tratar erro ao carregar repositórios importados', async () => {
    (productQuery.getAllRepositories as jest.Mock).mockRejectedValue(new Error('Fetch repos failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<Products />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Erro ao carregar repositórios importados:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it('deve trocar a organização selecionada ao disparar onChange do select', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /organizações do github/i })).toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox', { name: /organizações do github/i });
    fireEvent.mouseDown(combobox);

    const option = await screen.findByRole('option', { name: /org-github-2/i });
    fireEvent.click(option);

    await waitFor(() => {
      expect(organizationQuery.getGithubRepos).toHaveBeenCalled();
    });
  });

  it('deve trocar o produto selecionado ao disparar onChange do select', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Product')).toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox', { name: /produtos do measuresoftgram/i });
    fireEvent.mouseDown(combobox);

    const option = await screen.findByRole('option', { name: /beta product/i });
    fireEvent.click(option);

    await waitFor(() => {
      expect(mockSetCurrentProduct).toHaveBeenCalled();
    });
  });

  it('deve exibir botão de cadastrar primeiro produto se a organização não tiver produtos e redirecionar ao clicar', async () => {
    (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
      data: { results: [] }
    });
    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: { results: [] }
    });

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Esta organização ainda não possui nenhum produto cadastrado.')).toBeInTheDocument();
    });

    const registerBtn = screen.getByRole('button', { name: /cadastrar primeiro produto/i });
    fireEvent.click(registerBtn);

    expect(mockPush).toHaveBeenCalledWith(`/products/create?id_organization=${MOCK_ORG_ID}`);
  });
});
