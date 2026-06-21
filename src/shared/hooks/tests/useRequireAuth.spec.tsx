import { useAuth } from '@contexts/Auth';
import { toast } from 'react-toastify';
import useRequireAuth from '@hooks/useRequireAuth';
import { useRouter } from 'next/router';
import { renderHook } from '@testing-library/react';

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@contexts/Auth', () => ({
  useAuth: jest.fn(),
}));

describe('useRequireAuth', () => {
  let mockUseAuth: any;
  let mockUseRouter: any;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockUseAuth = useAuth;
    mockUseRouter = useRouter;
    mockConsoleError = jest.spyOn(console, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is authorized', () => {
    const mockSession = {
      user: {
        id: 1,
        name: 'Fake name',
        email: 'fake@test.com',
      },
    };

    const setupAuthorizedTest = ({ pathname, loading }: any) => {
      mockUseAuth.mockReturnValueOnce({
        session: mockSession,
        loading,
      });
      mockUseRouter.mockReturnValueOnce({
        push: (path: string) => mockPush(path),
        pathname,
      });

      return renderHook(() => useRequireAuth());
    };

    it('should not redirect or display toast for authorized user on /products when loaded', () => {
      const { result } = setupAuthorizedTest({ pathname: '/products', loading: 'loaded' });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(0);
      expect(mockPush).toHaveBeenCalledTimes(0);
    });

    it('should not redirect or display toast for authorized user on /products when loading', () => {
      const { result } = setupAuthorizedTest({ pathname: '/products', loading: 'loading' });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(0);
      expect(mockPush).toHaveBeenCalledTimes(0);
    });

    it('should not redirect or display toast for authorized user on / when loaded', () => {
      const { result } = setupAuthorizedTest({ pathname: '/', loading: 'loaded' });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(0);
      expect(mockPush).toHaveBeenCalledTimes(0);
    });

    it('should not redirect or display toast for authorized user on / when loading', () => {
      const { result } = setupAuthorizedTest({ pathname: '/', loading: 'loading' });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(0);
      expect(mockPush).toHaveBeenCalledTimes(0);
    });
  });

  describe('when user is not authorized', () => {
    const mockSession: any = null;

    const setupUnauthorizedTest = ({ pathname, loading, redirectError }: any) => {
      mockUseAuth.mockReturnValueOnce({
        session: mockSession,
        loading,
      });
      mockUseRouter.mockReturnValueOnce({
        push: (path: string) => {
          if (redirectError) {
            throw new Error('Redirect error');
          }
          mockPush(path);
        },
        pathname,
      });

      return renderHook(() => useRequireAuth());
    };

    it('should redirect and display toast for unauthorized user on /products when loaded', () => {
      const { result } = setupUnauthorizedTest({ pathname: '/products', loading: 'loaded' });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledTimes(0);
    });

    it('should not redirect or display toast for unauthorized user on /products when loading', () => {
      const { result } = setupUnauthorizedTest({ pathname: '/products', loading: 'loading' });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(0);
      expect(mockPush).toHaveBeenCalledTimes(0);
      expect(mockConsoleError).toHaveBeenCalledTimes(0);
    });

    it('should not redirect or display toast for unauthorized user on / when loaded', () => {
      const { result } = setupUnauthorizedTest({ pathname: '/', loading: 'loaded' });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(0);
      expect(mockPush).toHaveBeenCalledTimes(0);
      expect(mockConsoleError).toHaveBeenCalledTimes(0);
    });

    it('should not redirect or display toast for unauthorized user on / when loading', () => {
      const { result } = setupUnauthorizedTest({ pathname: '/', loading: 'loading' });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(0);
      expect(mockPush).toHaveBeenCalledTimes(0);
      expect(mockConsoleError).toHaveBeenCalledTimes(0);
    });

    it('should display toast and log redirect error on /productstest when loaded', () => {
      const { result } = setupUnauthorizedTest({ pathname: '/productstest', loading: 'loaded', redirectError: true });
      expect(result.current).toBeDefined();
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledTimes(0);
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });
});
