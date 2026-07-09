content = """import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import Products from '../Products';
import { organizationQuery } from '@services/organization';
import { productQuery } from '@services/product';
import { repository } from '@services/repository';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useAuth } from '@contexts/Auth';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

jest.mock('@services/organization');
jest.mock('@services/product');
jest.mock('@services/repository');
jest.mock('@contexts/OrganizationProvider');
jest.mock('@contexts/ProductProvider');
jest.mock('@contexts/Auth');
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));
jest.mock('react-toastify', () => ({
  toast: { error: jest.fn(), success: jest.fn() }
}));

const mockFetchOrgs = jest.fn();
const mockSetCurrentOrgs = jest.fn();
const mockUpdateProductList = jest.fn();
const mockSetCurrentProduct = jest.fn();
const mockSignInWithGithub = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

describe('Products Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ query: {}, push: mockPush, replace: mockReplace });
    (useAuth as jest.Mock).mockReturnValue({ signInWithGithub: mockSignInWithGithub });
    
    (useOrganizationContext as jest.Mock).mockReturnValue({
      organizationList: [{ id: 'org-1', name: 'Org 1' }],
      currentOrganization: { id: 'org-1', name: 'Org 1' },
      setCurrentOrganizations: mockSetCurrentOrgs,
      fetchOrganizations: mockFetchOrgs
    });
    
    (useProductContext as jest.Mock).mockReturnValue({
      currentProduct: { id: 'prod-1', name: 'Prod 1' },
      updateProductList: mockUpdateProductList,
      setCurrentProduct: mockSetCurrentProduct
    });

    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ github_org_id: 1, github_org_name: 'Org 1', description: 'Desc' }]
    });

    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1' }]
    });

    (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
      data: { results: [{ id: 'prod-1', name: 'Prod 1' }] }
    });

    (organizationQuery.getGithubRepos as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ github_repo_id: 1, name: 'Repo 1', url: 'http://repo1', description: '' }]
    });

    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: { results: [] }
    });
  });

  it('renders and loads initial data', async () => {
    render(<Products />);
    
    await waitFor(() => {
      expect(organizationQuery.getGithubOrganizations).toHaveBeenCalled();
    });
    
    expect(screen.getByText('Org 1')).toBeInTheDocument();
  });

  it('exchanges code if present in router query', async () => {
    (useRouter as jest.Mock).mockReturnValue({ query: { code: '123' }, replace: mockReplace });
    mockSignInWithGithub.mockResolvedValueOnce({ type: 'success' });
    
    render(<Products />);
    
    await waitFor(() => {
      expect(mockSignInWithGithub).toHaveBeenCalledWith('123');
      expect(toast.success).toHaveBeenCalledWith("Organizações do GitHub vinculadas com sucesso!");
    });
  });

  it('handles github org selection, imports and lists repos', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValueOnce({
      type: 'success',
      value: [] // Simulate not in backend
    }).mockResolvedValueOnce({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1' }] // After import
    });

    (organizationQuery.importOrganization as jest.Mock).mockResolvedValueOnce({
      type: 'success',
      value: { id: 'org-1' }
    });

    render(<Products />);

    await waitFor(() => {
      expect(organizationQuery.importOrganization).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });
  });

  it('handles importing a repo', async () => {
    (repository.createRepository as jest.Mock).mockResolvedValueOnce({ type: 'success' });
    
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });

    const importBtn = screen.getByText('Importar');
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(repository.createRepository).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Repositório Repo 1 importado com sucesso!');
    });
  });

  it('can change tabs and pagination', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });

    const importadosTab = screen.getByText('Importados');
    fireEvent.click(importadosTab);
    
    const todosTab = screen.getByText('Todos');
    fireEvent.click(todosTab);
    
    const aImportarTab = screen.getByText('A Importar');
    fireEvent.click(aImportarTab);
  });
});
"""

with open('src/pages/products/tests/Products.spec.tsx', 'w') as f:
    f.write(content)
