import re

with open('src/shared/contexts/ProductProvider/tests/ProductProvider.spec.tsx', 'r') as f:
    content = f.read()

# Revert the console.log from ProductProvider.tsx
with open('src/shared/contexts/ProductProvider/ProductProvider.tsx', 'r') as f:
    prov = f.read()
prov = prov.replace("console.log('storedProductId is', storedProductId);\n        if (storedProductId) {", "if (storedProductId) {")
with open('src/shared/contexts/ProductProvider/ProductProvider.tsx', 'w') as f:
    f.write(prov)

# Fix the test
new_test = """
  it('loads from local storage', async () => {
    localStorage.setItem('selectedProductId', '"prod-2"');
    jest.spyOn(OrgContext, 'useOrganizationContext').mockReturnValue({
      currentOrganization: { id: 'org-1' }
    } as any);

    (productQuery.getAllProducts as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
      data: {
        results: [{ id: 'prod-1', name: 'Prod 1' }, { id: 'prod-2', name: 'Prod 2' }]
      }
    }), 100)));

    const Child = () => {
      const { currentProduct } = useProductContext();
      return (
        <div>
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
      expect(screen.getByTestId('curr-prod').textContent).toBe('Prod 2');
    });
  });
"""

content = re.sub(r"it\('loads from local storage', async \(\) => \{.*?\n  \}\);\n", new_test.strip() + "\n", content, flags=re.DOTALL)

with open('src/shared/contexts/ProductProvider/tests/ProductProvider.spec.tsx', 'w') as f:
    f.write(content)
