import re
with open('src/shared/contexts/ProductProvider/ProductProvider.tsx', 'r') as f:
    content = f.read()

content = content.replace("if (storedProductId) {", "console.log('storedProductId is', storedProductId);\n        if (storedProductId) {")

with open('src/shared/contexts/ProductProvider/ProductProvider.tsx', 'w') as f:
    f.write(content)
