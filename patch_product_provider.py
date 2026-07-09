content = """import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ProductProvider, useProductContext } from '../ProductProvider';
import { productQuery } from '@services/product';

jest.mock('@services/product');
jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: { id: 'org-1' }
  })
}));

describe('ProductProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders correctly and loads data', async () => {
    (productQuery.getAllProducts as jest.Mock).mockResolvedValueOnce({
      data: {
        results: [{ id: 'prod-1', name: 'Prod 1' }]
      }
    });

    const Child = () => {
      const { productList, currentProduct } = useProductContext();
      return (
        <div>
          <span data-testid="prod-len">{productList?.length || 0}</span>
          <span data-testid="curr-prod">{currentProduct?.name || 'none'}</span>
        </div>
      );
    };

    render(
      <ProductProvider>
        <Child />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('curr-prod').textContent).toBe('Prod 1');
    });
  });

  it('updates state via setters', async () => {
    const Child = () => {
      const { setCurrentProduct, updateProductList, currentProduct } = useProductContext();
      return (
        <div>
          <span data-testid="curr-prod">{currentProduct?.name || 'none'}</span>
          <button onClick={() => updateProductList([{ id: 'prod-2', name: 'Prod 2', description: '', github_id: 1 }])}>Update List</button>
          <button onClick={() => setCurrentProduct({ id: 'prod-3', name: 'Prod 3', description: '', github_id: 2 })}>Set Curr</button>
        </div>
      );
    };

    render(
      <ProductProvider>
        <Child />
      </ProductProvider>
    );

    act(() => {
      screen.getByText('Update List').click();
    });

    expect(screen.getByTestId('curr-prod').textContent).toBe('Prod 2');

    act(() => {
      screen.getByText('Set Curr').click();
    });

    expect(screen.getByTestId('curr-prod').textContent).toBe('Prod 3');
  });

  it('throws error if used outside provider', () => {
    const Child = () => {
      useProductContext();
      return <div />;
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Child />)).toThrow('useProductContext must be used within a ProductProvider');
    consoleSpy.mockRestore();
  });
});
"""

with open('src/shared/contexts/ProductProvider/tests/ProductProvider.spec.tsx', 'w') as f:
    f.write(content)
