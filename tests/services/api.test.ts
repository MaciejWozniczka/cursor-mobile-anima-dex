import AnimalAPI from '../../src/services/api';
import { createError } from '../../src/utils/helpers';

// Mock dla fetch
global.fetch = jest.fn();

// Mock dla utils/helpers
jest.mock('../../src/utils/helpers', () => ({
  retry: jest.fn(),
  createError: jest.fn(),
  createTimeoutSignal: jest.fn(() => ({ aborted: false })),
}));

// Mock dla utils/constants
jest.mock('../../src/utils/constants', () => ({
  API_ENDPOINTS: {
    IDENTIFY_ANIMAL: 'https://test.com/identify',
    GENERATE_BADGE: 'https://test.com/generate',
  },
  API_TIMEOUTS: {
    request: 30000,
    upload: 60000,
  },
}));

describe('AnimalAPI', () => {
  let api: typeof AnimalAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    api = AnimalAPI;
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AnimalAPI;
      const instance2 = AnimalAPI;
      expect(instance1).toBe(instance2);
    });
  });

  describe('identifyAnimal', () => {
    it('should identify animal successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            name: 'Lew',
            description: 'Król dżungli',
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.identifyAnimal('file://test.jpg');

      expect(result).toEqual({
        name: 'Lew',
        description: 'Król dżungli',
      });
    });

    it('should handle response without output field', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          name: 'Tygrys',
          description: 'Największy kot świata',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.identifyAnimal('file://test.jpg');

      expect(result).toEqual({
        name: 'Tygrys',
        description: 'Największy kot świata',
      });
    });

    it('should handle HTTP error response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(api.identifyAnimal('file://test.jpg')).rejects.toThrow();
    });

    it('should handle invalid response structure', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            name: 'Lew',
            // brak description
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(api.identifyAnimal('file://test.jpg')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.identifyAnimal('file://test.jpg')).rejects.toThrow();
    });
  });

  describe('generateBadge', () => {
    it('should generate badge successfully with base64 data', async () => {
      const mockBase64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({
          data: mockBase64Data,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.generateBadge('Lew');

      expect(result.imageData).toBeInstanceOf(ArrayBuffer);
      expect(result.imageData.byteLength).toBeGreaterThan(0);
    });

    it('should generate badge with Google Gemini API structure', async () => {
      const mockBase64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                inlineData: {
                  data: mockBase64Data,
                },
              }],
            },
          }],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.generateBadge('Tygrys');

      expect(result.imageData).toBeInstanceOf(ArrayBuffer);
      expect(result.imageData.byteLength).toBeGreaterThan(0);
    });

    it('should handle direct ArrayBuffer response', async () => {
      const mockArrayBuffer = new ArrayBuffer(100);
      
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/png'),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.generateBadge('Niedźwiedź');

      expect(result.imageData).toBe(mockArrayBuffer);
    });

    it('should handle HTTP error response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(api.generateBadge('Lew')).rejects.toThrow();
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/png'),
        },
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(api.generateBadge('Lew')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.generateBadge('Lew')).rejects.toThrow();
    });
  });

  describe('checkConnection', () => {
    it('should return true for successful connection', async () => {
      const mockResponse = {
        ok: true,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.checkConnection();

      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      const mockResponse = {
        ok: false,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.checkConnection();

      expect(result).toBe(false);
    });

    it('should return false for network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.checkConnection();

      expect(result).toBe(false);
    });
  });
});
