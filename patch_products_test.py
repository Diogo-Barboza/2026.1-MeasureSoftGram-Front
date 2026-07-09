import re
with open('src/pages/products/test/Products.spec.tsx', 'r') as f:
    content = f.read()

content = content.replace('render(<Products />);', 'await act(async () => { render(<Products />); });')

with open('src/pages/products/test/Products.spec.tsx', 'w') as f:
    f.write(content)
