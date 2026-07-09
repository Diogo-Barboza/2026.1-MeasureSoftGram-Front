import re
with open('src/shared/contexts/OrganizationProvider/tests/OrganizationProvider.spec.tsx', 'r') as f:
    content = f.read()

# Make sure all renders mock getAllOrganization
content = content.replace("render(", "(organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({ type: 'success', value: [] }); render(")

with open('src/shared/contexts/OrganizationProvider/tests/OrganizationProvider.spec.tsx', 'w') as f:
    f.write(content)
