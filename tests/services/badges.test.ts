import BadgeService from "../../src/services/badges";
import AnimalAPI from "../../src/services/api";
import StorageService from "../../src/services/storage";
import { StoredBadge } from "../../src/types";

// Mock dla AnimalAPI
jest.mock("../../src/services/api", () => ({
  identifyAnimal: jest.fn(),
  generateBadge: jest.fn(),
}));

// Mock dla StorageService
jest.mock("../../src/services/storage", () => ({
  checkIfAnimalExists: jest.fn(),
  getBadgeByAnimalName: jest.fn(),
  saveBadge: jest.fn(),
  getBadges: jest.fn(),
  getBadgeById: jest.fn(),
  deleteBadge: jest.fn(),
  clearAllBadges: jest.fn(),
}));

const mockBadge: StoredBadge = {
  id: "1",
  animalName: "Lew",
  description: "Król dżungli",
  imageBlob: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  discoveredAt: "2024-01-01",
};

describe("BadgeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = BadgeService;
      const instance2 = BadgeService;
      expect(instance1).toBe(instance2);
    });
  });

  describe("discoverAnimal", () => {
    it("should discover new animal successfully", async () => {
      const mockIdentification = {
        name: "Lew",
        description: "Król dżungli",
      };

      const mockBadgeResponse = {
        imageData: new ArrayBuffer(100),
        additionalData: { test: "data" },
      };

      (AnimalAPI.identifyAnimal as jest.Mock).mockResolvedValue(
        mockIdentification
      );
      (StorageService.checkIfAnimalExists as jest.Mock).mockResolvedValue(
        false
      );
      (AnimalAPI.generateBadge as jest.Mock).mockResolvedValue(
        mockBadgeResponse
      );
      (StorageService.saveBadge as jest.Mock).mockResolvedValue(mockBadge);

      const result = await BadgeService.discoverAnimal("file://test.jpg");

      expect(result).toEqual({
        success: true,
        badge: mockBadge,
      });
      expect(AnimalAPI.identifyAnimal).toHaveBeenCalledWith("file://test.jpg");
      expect(StorageService.checkIfAnimalExists).toHaveBeenCalledWith("Lew");
      expect(AnimalAPI.generateBadge).toHaveBeenCalledWith("Lew");
      expect(StorageService.saveBadge).toHaveBeenCalledWith(
        "Lew",
        "Król dżungli",
        mockBadgeResponse.imageData,
        "file://test.jpg",
        mockBadgeResponse.additionalData
      );
    });

    it("should return already exists result when animal already exists", async () => {
      const mockIdentification = {
        name: "Tygrys",
        description: "Największy kot świata",
      };

      const existingBadge: StoredBadge = {
        id: "2",
        animalName: "Tygrys",
        description: "Największy kot świata",
        imageBlob: "data:image/jpeg;base64,existing...",
        discoveredAt: "2024-01-01",
      };

      (AnimalAPI.identifyAnimal as jest.Mock).mockResolvedValue(
        mockIdentification
      );
      (StorageService.checkIfAnimalExists as jest.Mock).mockResolvedValue(true);
      (StorageService.getBadgeByAnimalName as jest.Mock).mockResolvedValue(
        existingBadge
      );

      const result = await BadgeService.discoverAnimal("file://test.jpg");

      expect(result).toEqual({
        success: false,
        alreadyExists: true,
        animalName: "Tygrys",
        existingBadge: existingBadge,
      });
    });

    it("should handle identification errors", async () => {
      (AnimalAPI.identifyAnimal as jest.Mock).mockRejectedValue(
        new Error("Identification failed")
      );

      const result = await BadgeService.discoverAnimal("file://test.jpg");

      expect(result).toEqual({
        success: false,
        alreadyExists: false,
        error: "Identification failed",
      });
    });

    it("should handle badge generation errors", async () => {
      const mockIdentification = {
        name: "Niedźwiedź",
        description: "Silny drapieżnik",
      };

      (AnimalAPI.identifyAnimal as jest.Mock).mockResolvedValue(
        mockIdentification
      );
      (StorageService.checkIfAnimalExists as jest.Mock).mockResolvedValue(
        false
      );
      (AnimalAPI.generateBadge as jest.Mock).mockRejectedValue(
        new Error("Badge generation failed")
      );

      const result = await BadgeService.discoverAnimal("file://test.jpg");

      expect(result).toEqual({
        success: false,
        alreadyExists: false,
        error: "Badge generation failed",
      });
    });

    it("should handle storage errors", async () => {
      const mockIdentification = {
        name: "Słoń",
        description: "Największy ssak lądowy",
      };

      const mockBadgeResponse = {
        imageData: new ArrayBuffer(100),
      };

      (AnimalAPI.identifyAnimal as jest.Mock).mockResolvedValue(
        mockIdentification
      );
      (StorageService.checkIfAnimalExists as jest.Mock).mockResolvedValue(
        false
      );
      (AnimalAPI.generateBadge as jest.Mock).mockResolvedValue(
        mockBadgeResponse
      );
      (StorageService.saveBadge as jest.Mock).mockRejectedValue(
        new Error("Storage failed")
      );

      const result = await BadgeService.discoverAnimal("file://test.jpg");

      expect(result).toEqual({
        success: false,
        alreadyExists: false,
        error: "Storage failed",
      });
    });
  });

  describe("getAllBadges", () => {
    it("should return all badges successfully", async () => {
      const mockBadges = [mockBadge];

      (StorageService.getBadges as jest.Mock).mockResolvedValue(mockBadges);

      const result = await BadgeService.getAllBadges();

      expect(result).toEqual(mockBadges);
      expect(StorageService.getBadges).toHaveBeenCalled();
    });

    it("should return empty array on error", async () => {
      (StorageService.getBadges as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      const result = await BadgeService.getAllBadges();

      expect(result).toEqual([]);
    });
  });

  describe("getBadgeById", () => {
    it("should return badge by ID successfully", async () => {
      (StorageService.getBadgeById as jest.Mock).mockResolvedValue(mockBadge);

      const result = await BadgeService.getBadgeById("1");

      expect(result).toEqual(mockBadge);
      expect(StorageService.getBadgeById).toHaveBeenCalledWith("1");
    });

    it("should return null when badge not found", async () => {
      (StorageService.getBadgeById as jest.Mock).mockResolvedValue(null);

      const result = await BadgeService.getBadgeById("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      (StorageService.getBadgeById as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      const result = await BadgeService.getBadgeById("1");

      expect(result).toBeNull();
    });
  });

  describe("deleteBadge", () => {
    it("should delete badge successfully", async () => {
      (StorageService.deleteBadge as jest.Mock).mockResolvedValue(true);

      const result = await BadgeService.deleteBadge("1");

      expect(result).toBe(true);
      expect(StorageService.deleteBadge).toHaveBeenCalledWith("1");
    });

    it("should handle deletion errors", async () => {
      (StorageService.deleteBadge as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      const result = await BadgeService.deleteBadge("1");

      expect(result).toBe(false);
    });
  });

  describe("getFilteredBadges", () => {
    it("should get filtered badges successfully", async () => {
      const mockBadges = [mockBadge];
      const filterOptions = {
        search: "Lew",
        sortBy: "name" as const,
        sortOrder: "asc" as const,
      };

      (StorageService.getBadges as jest.Mock).mockResolvedValue(mockBadges);

      const result = await BadgeService.getFilteredBadges(filterOptions);

      expect(result).toEqual(mockBadges);
    });

    it("should handle filter errors", async () => {
      const filterOptions = {
        search: "test",
        sortBy: "name" as const,
        sortOrder: "asc" as const,
      };

      (StorageService.getBadges as jest.Mock).mockRejectedValue(
        new Error("Filter failed")
      );

      const result = await BadgeService.getFilteredBadges(filterOptions);

      expect(result).toEqual([]);
    });
  });

  describe("clearAllBadges", () => {
    it("should clear all badges successfully", async () => {
      (StorageService.clearAllBadges as jest.Mock).mockResolvedValue(true);

      const result = await BadgeService.clearAllBadges();

      expect(result).toBe(true);
    });

    it("should handle clear errors", async () => {
      (StorageService.clearAllBadges as jest.Mock).mockRejectedValue(
        new Error("Clear failed")
      );

      const result = await BadgeService.clearAllBadges();

      expect(result).toBe(false);
    });
  });
});
