import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import Products from '../Products';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

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

jest.mock('@hooks/useRequireAuth', () => jest.fn());

describe('Products Component', () => {
  const mockProducts = [
    { id: 'prod1', name: 'Alpha', description: 'Desc 1' },
    { id: 'prod2', name: 'Beta', description: 'Desc 2' }
  ];

  const mockOrgs = [
    { id: 'org1', name: 'Org 1' },
    { id: 'org2', name: 'Org 2' }
  ];

  beforeEach(() => {
    (useOrganizationContext as jest.Mock).mockReturnValue({
      organizationList: mockOrgs,
      currentOrganization: mockOrgs[0],
      setCurrentOrganizations: jest.fn(),
      isLoading: false
    });
    (useProductContext as jest.Mock).mockReturnValue({
      productsList: mockProducts,
      currentProduct: mockProducts[0],
      setCurrentProduct: jest.fn()
    });
    (useRepositoryContext as jest.Mock).mockReturnValue({
      repositoriesLatestTsqmi: []
    });
  });

  it('deve renderizar a tela de importação de repositórios com campos corretos', () => {
    render(<Products />);
    
    expect(screen.getByText('Importar Repositórios do GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Organizações do GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Produtos')).toBeInTheDocument();
  });
});
