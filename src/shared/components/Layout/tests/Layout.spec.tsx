import React from 'react';
import { render } from '@testing-library/react';

import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import Layout from '../Layout';

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  OrganizationProvider: ({ children }: any) => children,
  useOrganizationContext: jest.fn(),
}));

describe('<Layout />', () => {
  const mockUseProductContext = useProductContext as jest.Mock;
  const mockUseOrganizationContext = useOrganizationContext as jest.Mock;

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot sem produtos (sidebar oculta)', () => {
      mockUseProductContext.mockReturnValue({
        productsList: [],
        currentProduct: null,
        setCurrentProduct: jest.fn(),
        updateProductList: jest.fn(),
      });

      mockUseOrganizationContext.mockReturnValue({
        organizationList: [],
        currentOrganization: null,
        setCurrentOrganizations: jest.fn(),
        fetchOrganizations: jest.fn(),
      });

      const tree = render(
        <RepositoryProvider>
          <Layout />
        </RepositoryProvider>
      );
      expect(tree).toMatchSnapshot();
    });

    it('Deve corresponder ao Snapshot com produtos (sidebar visível)', () => {
      mockUseProductContext.mockReturnValue({
        productsList: [{ id: '1', name: 'Product 1' }],
        currentProduct: { id: '1', name: 'Product 1' },
        setCurrentProduct: jest.fn(),
        updateProductList: jest.fn(),
      });

      mockUseOrganizationContext.mockReturnValue({
        organizationList: [{ id: '1', name: 'Org 1', products: ['1'] }],
        currentOrganization: { id: '1', name: 'Org 1', products: ['1'] },
        setCurrentOrganizations: jest.fn(),
        fetchOrganizations: jest.fn(),
      });

      const tree = render(
        <RepositoryProvider>
          <Layout />
        </RepositoryProvider>
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
