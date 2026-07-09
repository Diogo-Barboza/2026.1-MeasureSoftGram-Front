import re

with open('src/shared/contexts/ProductProvider/tests/ProductProvider.spec.tsx', 'r') as f:
    content = f.read()

# For it('atualiza o estado currentProduct corretamente', () => {
content = content.replace("it('atualiza o estado currentProduct corretamente', () => {", "it('atualiza o estado currentProduct corretamente', async () => {")
content = content.replace("expect(getByTestId('currentProduct').textContent).toBe(mockProduct.name);", "await waitFor(() => expect(getByTestId('currentProduct').textContent).toBe(mockProduct.name));")

# For updateProductList
content = content.replace("it('updates the productsList correctly when updateProductList is called', () => {", "it('updates the productsList correctly when updateProductList is called', async () => {")
content = content.replace("expect(getByTestId('product-0').textContent).toBe(mockProduct.name);", "await waitFor(() => expect(getByTestId('product-0').textContent).toBe(mockProduct.name));")

with open('src/shared/contexts/ProductProvider/tests/ProductProvider.spec.tsx', 'w') as f:
    f.write(content)
