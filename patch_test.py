import re

with open('src/pages/products/[product]/releases/create/tests/ReleaseCreation.spec.tsx', 'r') as f:
    content = f.read()

# Add mock for RepositorySelectionForm
mock = """
jest.mock('../components/RepositorySelectionForm/RepositorySelectionForm', () => {
  return function MockRepositorySelectionForm({ setValue }: any) {
    import('react').then(React => {
        React.useEffect(() => {
          setValue('repositories_ids', ['repo1']);
        }, [setValue]);
    })
    return <div data-testid="repo-selection-form"></div>;
  };
});
"""

# add mock at the top after jest.mock
content = content.replace("jest.mock('@services/balanceMatrix');", "jest.mock('@services/balanceMatrix');\n" + mock)

# Find all await act(async () => { render... })
# and add a click to the next button right after it.

pattern = re.compile(r'(await act\(async \(\) => {\s*render\(\s*<ReleaseCreation />\s*\);\s*}\);)')

replacement = r'\1\n    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /next/i })); });'

content = pattern.sub(replacement, content)

with open('src/pages/products/[product]/releases/create/tests/ReleaseCreation.spec.tsx', 'w') as f:
    f.write(content)
