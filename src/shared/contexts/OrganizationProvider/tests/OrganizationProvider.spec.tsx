import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { OrganizationProvider, useOrganizationContext } from '../OrganizationProvider';
import { organizationQuery } from '@services/organization';
import { useAuth } from '@contexts/Auth';
import { toast } from 'react-toastify';

jest.mock('@services/organization');
jest.mock('@contexts/Auth');
jest.mock('react-toastify', () => ({
  toast: { error: jest.fn() }
}));

const mockSession = { user: { email: 'test@test.com' } };

describe('OrganizationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render children and initialize correctly', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({ type: 'success', value: [] });
    
    const Child = () => {
      const { currentOrganization, organizationList, isLoading } = useOrganizationContext();
      return (
        <div>
          <span data-testid="org-len">{organizationList.length}</span>
          <span data-testid="curr-org">{currentOrganization?.name || 'none'}</span>
          <span data-testid="is-loading">{isLoading ? 'yes' : 'no'}</span>
        </div>
      );
    };

    render(
      <OrganizationProvider>
        <Child />
      </OrganizationProvider>
    );

    expect(screen.getByTestId('org-len').textContent).toBe('0');
  });

  it('should load organizations if session exists', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1', description: '', url: '', products: [], key: 'org1' }]
    });
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: []
    });

    const Child = () => {
      const { currentOrganization, organizationList } = useOrganizationContext();
      return (
        <div>
          <span data-testid="org-len">{organizationList.length}</span>
          <span data-testid="curr-org">{currentOrganization?.name || 'none'}</span>
        </div>
      );
    };

    render(
      <OrganizationProvider>
        <Child />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('curr-org').textContent).toBe('Org 1');
    });
  });

  it('should handle api error', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (organizationQuery.getAllOrganization as jest.Mock).mockRejectedValue(new Error('api error'));

    render(
      <OrganizationProvider>
        <div />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar organizações. Por favor, tente novamente.");
    });
  });

  it('should throw error when used outside provider', () => {
    const Child = () => {
      useOrganizationContext();
      return <div />;
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Child />)).toThrow('OrganizationContext must be used within a OrganizationProvider');
    consoleSpy.mockRestore();
  });
});
