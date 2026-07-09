with open('src/pages/organizations/tests/Organizations.spec.tsx', 'r') as f:
    content = f.read()

content = content.replace("expect(window.location.reload).toHaveBeenCalled();", "expect(mockPush).toHaveBeenCalledWith('/home');")

with open('src/pages/organizations/tests/Organizations.spec.tsx', 'w') as f:
    f.write(content)
