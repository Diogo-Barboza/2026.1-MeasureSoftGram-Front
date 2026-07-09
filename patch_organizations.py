with open('src/pages/organizations/tests/Organizations.spec.tsx', 'r') as f:
    content = f.read()

content = content.replace("mockReturnValue({ query: { edit: 'org-123' } });", "mockReturnValue({ query: { edit: 'org-123' }, push: mockPush });")
content = content.replace("mockReturnValue({", "mockReturnValue({ push: mockPush, ")

with open('src/pages/organizations/tests/Organizations.spec.tsx', 'w') as f:
    f.write(content)
