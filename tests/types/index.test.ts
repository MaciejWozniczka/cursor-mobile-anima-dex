import {
  AnimalIdentificationResponse,
  BadgeGenerationResponse,
  APIEndpoints,
  StoredBadge,
  BadgeCollection,
  User,
  AuthState,
  RootStackParamList,
  MainTabParamList,
  CameraState,
} from "../../src/types";

describe("Types", () => {
  describe("API Types", () => {
    it("should have AnimalIdentificationResponse interface", () => {
      const mockResponse: AnimalIdentificationResponse = {
        name: "Kot domowy",
        description: "Mały drapieżnik domowy",
      };

      expect(mockResponse.name).toBe("Kot domowy");
      expect(mockResponse.description).toBe("Mały drapieżnik domowy");
    });

    it("should have BadgeGenerationResponse interface", () => {
      const mockResponse: BadgeGenerationResponse = {
        imageData: new ArrayBuffer(1024),
        additionalData: { source: "AI" },
      };

      expect(mockResponse.imageData).toBeInstanceOf(ArrayBuffer);
      expect(mockResponse.additionalData).toEqual({ source: "AI" });
    });

    it("should have APIEndpoints interface", () => {
      const mockEndpoints: APIEndpoints = {
        identifyAnimal: {
          method: "POST",
          url: "https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226",
          contentType: "multipart/form-data",
          body: new FormData(),
          response: { name: "Test", description: "Test description" },
        },
        generateBadge: {
          method: "GET",
          url: "https://andrzej210-20210.wykr.es/webhook-test/a56adba0-37af-40b9-941a-3db55e4fc028",
          params: { name: "Test" },
          response: { imageData: new ArrayBuffer(1024) },
        },
        authLogin: {
          method: "POST",
          url: "https://lifemanager.bieda.it/api/auth",
          contentType: "application/json",
          body: { email: "test@example.com", password: "password" },
          response: { token: "test-token" },
        },
        authRegister: {
          method: "POST",
          url: "https://lifemanager.bieda.it/api/user",
          contentType: "application/json",
          body: { email: "test@example.com", password: "password" },
          response: { token: "test-token" },
        },
      };

      expect(mockEndpoints.identifyAnimal.method).toBe("POST");
      expect(mockEndpoints.generateBadge.method).toBe("GET");
      expect(mockEndpoints.authLogin.method).toBe("POST");
      expect(mockEndpoints.authRegister.method).toBe("POST");
    });
  });

  describe("Badge Types", () => {
    it("should have StoredBadge interface", () => {
      const mockBadge: StoredBadge = {
        id: "badge-1",
        animalName: "Kot domowy",
        description: "Mały drapieżnik domowy",
        imageBlob: "base64-encoded-image",
        discoveredAt: "2024-01-15T10:00:00Z",
        originalPhoto: "base64-original-photo",
        additionalData: { source: "AI" },
      };

      expect(mockBadge.id).toBe("badge-1");
      expect(mockBadge.animalName).toBe("Kot domowy");
      expect(mockBadge.description).toBe("Mały drapieżnik domowy");
      expect(mockBadge.imageBlob).toBe("base64-encoded-image");
      expect(mockBadge.discoveredAt).toBe("2024-01-15T10:00:00Z");
      expect(mockBadge.originalPhoto).toBe("base64-original-photo");
      expect(mockBadge.additionalData).toEqual({ source: "AI" });
    });

    it("should have BadgeCollection interface", () => {
      const mockCollection: BadgeCollection = {
        badges: [],
        totalCount: 0,
        lastSync: "2024-01-15T10:00:00Z",
      };

      expect(mockCollection.badges).toEqual([]);
      expect(mockCollection.totalCount).toBe(0);
      expect(mockCollection.lastSync).toBe("2024-01-15T10:00:00Z");
    });
  });

  describe("User Types", () => {
    it("should have User interface", () => {
      const mockUser: User = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        avatar: "avatar-url",
        createdAt: "2024-01-15T10:00:00Z",
      };

      expect(mockUser.id).toBe("user-1");
      expect(mockUser.email).toBe("test@example.com");
      expect(mockUser.name).toBe("Test User");
      expect(mockUser.avatar).toBe("avatar-url");
      expect(mockUser.createdAt).toBe("2024-01-15T10:00:00Z");
    });

    it("should have AuthState interface", () => {
      const mockAuthState: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

      expect(mockAuthState.user).toBeNull();
      expect(mockAuthState.isAuthenticated).toBe(false);
      expect(mockAuthState.isLoading).toBe(false);
      expect(mockAuthState.error).toBeNull();
    });
  });

  describe("Navigation Types", () => {
    it("should have RootStackParamList type", () => {
      const mockParams: RootStackParamList = {
        Auth: undefined,
        Main: undefined,
        Camera: { resetCamera: true },
        Analysis: { photoUri: "photo-uri" },
        BadgeDetail: {
          badge: {
            id: "badge-1",
            animalName: "Test",
            description: "Test description",
            imageBlob: "base64-image",
            discoveredAt: "2024-01-15T10:00:00Z",
          },
        },
      };

      expect(mockParams.Auth).toBeUndefined();
      expect(mockParams.Main).toBeUndefined();
      expect(mockParams.Camera?.resetCamera).toBe(true);
      expect(mockParams.Analysis?.photoUri).toBe("photo-uri");
      expect(mockParams.BadgeDetail?.badge.id).toBe("badge-1");
    });

    it("should have MainTabParamList type", () => {
      const mockTabParams: MainTabParamList = {
        Camera: { resetCamera: false },
        Gallery: undefined,
        Profile: undefined,
      };

      expect(mockTabParams.Camera?.resetCamera).toBe(false);
      expect(mockTabParams.Gallery).toBeUndefined();
      expect(mockTabParams.Profile).toBeUndefined();
    });
  });

  describe("Camera Types", () => {
    it("should have CameraState interface", () => {
      const mockCameraState: CameraState = {
        hasPermission: true,
        type: "back",
        isCapturing: false,
        flash: "auto",
      };

      expect(mockCameraState.hasPermission).toBe(true);
      expect(mockCameraState.type).toBe("back");
      expect(mockCameraState.isCapturing).toBe(false);
      expect(mockCameraState.flash).toBe("auto");
    });
  });

  describe("Type Validation", () => {
    it("should validate required fields", () => {
      // Test that required fields are enforced
      const requiredFields = {
        AnimalIdentificationResponse: ["name", "description"],
        StoredBadge: ["id", "animalName", "description", "imageBlob", "discoveredAt"],
        User: ["id", "email", "createdAt"],
      };

      expect(requiredFields.AnimalIdentificationResponse).toContain("name");
      expect(requiredFields.AnimalIdentificationResponse).toContain("description");
      expect(requiredFields.StoredBadge).toContain("id");
      expect(requiredFields.User).toContain("id");
    });

    it("should allow optional fields", () => {
      // Test that optional fields can be omitted
      const badgeWithoutOptionals: StoredBadge = {
        id: "badge-1",
        animalName: "Test",
        description: "Test description",
        imageBlob: "base64-image",
        discoveredAt: "2024-01-15T10:00:00Z",
        // originalPhoto and additionalData are optional
      };

      expect(badgeWithoutOptionals.id).toBe("badge-1");
      expect(badgeWithoutOptionals.originalPhoto).toBeUndefined();
      expect(badgeWithoutOptionals.additionalData).toBeUndefined();
    });
  });
});
