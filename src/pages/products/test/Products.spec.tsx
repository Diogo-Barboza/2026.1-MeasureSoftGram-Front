import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProductProvider } from '@contexts/ProductProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Products from '../Products';
import '@testing-library/jest-dom';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(),
  OrganizationProvider: ({ children }: any) => <>{children}</>
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(),
  ProductProvider: ({ children }: any) => <>{children}</>
}));

jest.mock('@hooks/useRequireAuth', () => jest.fn());

import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';

describe('Products Component', () => {
  const mockProducts = [
    { id: '1', name: 'Alpha', description: 'Desc 1' },
    { id: '2', name: 'Beta', description: 'Desc 2' }
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
      productsList: mockProducts
    });
  });

  it('deve filtrar produtos ao digitar no input de busca', () => {
    render(<Products />);
    
    const searchInput = screen.getByTestId('search-input').querySelector('input')!;
    
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('deve exibir mensagem de "não encontrado" quando o filtro não retorna resultados', () => {
    render(<Products />);
    
    const searchInput = screen.getByTestId('search-input').querySelector('input')!;
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } });
    
    expect(screen.getByText(/not-found/i)).toBeInTheDocument();
  });

  it('deve exibir o Skeleton enquanto produtos não são carregados', () => {
    (useProductContext as jest.Mock).mockReturnValue({ productsList: undefined });
    render(<Products />);
    
    expect(screen.getByTestId('skeleton-container')).toBeInTheDocument(); 
  });
});
