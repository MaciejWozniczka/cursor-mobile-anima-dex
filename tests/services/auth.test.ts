import AuthService from '../../src/services/auth';
import StorageService from '../../src/services/storage';

// Mock dla StorageService
jest.mock('../../src/services/storage', () => ({
  getAuthToken: jest.fn(),
  getUser: jest.fn(),
  saveAuthToken: jest.fn(),
  saveUser: jest.fn(),
  clearAuthToken: jest.fn(),
  clearUser: jest.fn(),
}));

// Mock dla utils/helpers
jest.mock('../../src/utils/helpers', () => ({
  retry: jest.fn((fn) => fn()),
  createError: jest.fn((code, message) => new Error(message)),
  createTimeoutSignal: jest.fn(() => ({ aborted: false })),
}));

// Mock dla utils/constants
jest.mock('../../src/utils/constants', () => ({
  API_ENDPOINTS: {
    AUTH_LOGIN: 'https://test.com/login',
    AUTH_REGISTER: 'https://test.com/register',
  },
  API_TIMEOUTS: {
    request: 30000,
  },
}));

// Mock dla fetch
global.fetch = jest.fn();

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AuthService;
      const instance2 = AuthService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize with valid token and user', async () => {
      const mockToken = 'valid-token';
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01',
      };

      (StorageService.getAuthToken as jest.Mock).mockResolvedValue(mockToken);
      (StorageService.getUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.initialize();

      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should initialize without token and user', async () => {
      (StorageService.getAuthToken as jest.Mock).mockResolvedValue(null);
      (StorageService.getUser as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.initialize();

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle initialization errors', async () => {
      (StorageService.getAuthToken as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await AuthService.initialize();

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Błąd inicjalizacji autoryzacji');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          token: 'new-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: '2024-01-01',
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      (StorageService.saveAuthToken as jest.Mock).mockResolvedValue(undefined);
      (StorageService.saveUser as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.login('test@example.com', 'password');

      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toBeTruthy();
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.login('test@example.com', 'wrong-password')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.login('test@example.com', 'password')).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          token: 'new-token',
          user: {
            id: '1',
            email: 'new@example.com',
            name: 'New User',
            createdAt: '2024-01-01',
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      (StorageService.saveAuthToken as jest.Mock).mockResolvedValue(undefined);
      (StorageService.saveUser as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.register('new@example.com', 'password');

      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toBeTruthy();
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle email already exists', async () => {
      const mockResponse = {
        ok: false,
        status: 409,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.register('existing@example.com', 'password')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.register('new@example.com', 'password')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (StorageService.clearAuthToken as jest.Mock).mockResolvedValue(undefined);
      (StorageService.clearUser as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.logout();

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle logout errors', async () => {
      (StorageService.clearAuthToken as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await AuthService.logout();

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Błąd wylogowania');
    });
  });

  describe('getAuthState', () => {
    it('should return current auth state', () => {
      const state = AuthService.getAuthState();
      expect(state).toBeDefined();
      expect(typeof state.isAuthenticated).toBe('boolean');
      expect(typeof state.isLoading).toBe('boolean');
    });
  });
});
