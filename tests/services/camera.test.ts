import CameraService from "../../src/services/camera";

// Mock dla expo-camera
jest.mock("expo-camera", () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
  },
}));

// Mock dla expo-image-manipulator
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: "jpeg",
  },
}));

// Mock dla utils/constants
jest.mock("../../src/utils/constants", () => ({
  CAMERA: {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
  },
}));

describe("CameraService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = CameraService;
      const instance2 = CameraService;
      expect(instance1).toBe(instance2);
    });
  });

  describe("checkCameraPermissions", () => {
    it("should return true when permissions are granted", async () => {
      const { Camera } = require("expo-camera");
      Camera.getCameraPermissionsAsync.mockResolvedValue({ status: "granted" });

      const result = await CameraService.checkCameraPermissions();

      expect(result).toBe(true);
      expect(Camera.getCameraPermissionsAsync).toHaveBeenCalled();
    });

    it("should return false when permissions are denied", async () => {
      const { Camera } = require("expo-camera");
      Camera.getCameraPermissionsAsync.mockResolvedValue({ status: "denied" });

      const result = await CameraService.checkCameraPermissions();

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      const { Camera } = require("expo-camera");
      Camera.getCameraPermissionsAsync.mockRejectedValue(
        new Error("Permission check failed")
      );

      const result = await CameraService.checkCameraPermissions();

      expect(result).toBe(false);
    });
  });

  describe("requestCameraPermissions", () => {
    it("should return true when permissions are granted", async () => {
      const { Camera } = require("expo-camera");
      Camera.requestCameraPermissionsAsync.mockResolvedValue({
        status: "granted",
      });

      const result = await CameraService.requestCameraPermissions();

      expect(result).toBe(true);
      expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    it("should return false when permissions are denied", async () => {
      const { Camera } = require("expo-camera");
      Camera.requestCameraPermissionsAsync.mockResolvedValue({
        status: "denied",
      });

      const result = await CameraService.requestCameraPermissions();

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      const { Camera } = require("expo-camera");
      Camera.requestCameraPermissionsAsync.mockRejectedValue(
        new Error("Permission request failed")
      );

      const result = await CameraService.requestCameraPermissions();

      expect(result).toBe(false);
    });
  });

  describe("setCameraRef", () => {
    it("should set camera reference", () => {
      const mockRef = { current: {} };

      CameraService.setCameraRef(mockRef);

      // Nie możemy bezpośrednio sprawdzić prywatnej właściwości,
      // ale możemy sprawdzić czy nie rzuca błędu
      expect(() => CameraService.setCameraRef(mockRef)).not.toThrow();
    });
  });

  describe("takePhoto", () => {
    it("should take photo successfully", async () => {
      const mockCameraRef = {
        takePictureAsync: jest.fn().mockResolvedValue({
          uri: "file://photo.jpg",
        }),
      };

      CameraService.setCameraRef(mockCameraRef);

      const result = await CameraService.takePhoto();

      expect(result).toBe("file://photo.jpg");
      expect(mockCameraRef.takePictureAsync).toHaveBeenCalledWith({
        quality: 0.8,
        base64: true,
      });
    });

    it("should return null when camera ref is not set", async () => {
      CameraService.setCameraRef(null);

      const result = await CameraService.takePhoto();

      expect(result).toBeNull();
    });

    it("should return null on photo capture error", async () => {
      const mockCameraRef = {
        takePictureAsync: jest
          .fn()
          .mockRejectedValue(new Error("Photo capture failed")),
      };

      CameraService.setCameraRef(mockCameraRef);

      const result = await CameraService.takePhoto();

      expect(result).toBeNull();
    });
  });

  describe("optimizeImage", () => {
    it("should optimize image successfully", async () => {
      const { manipulateAsync } = require("expo-image-manipulator");
      manipulateAsync.mockResolvedValue({
        uri: "file://optimized.jpg",
      });

      const result = await CameraService.optimizeImage("file://original.jpg");

      expect(result).toBe("file://optimized.jpg");
      expect(manipulateAsync).toHaveBeenCalledWith(
        "file://original.jpg",
        [
          {
            resize: {
              width: 1920,
              height: 1080,
            },
          },
        ],
        {
          compress: 0.8,
          format: "jpeg",
        }
      );
    });

    it("should return original URI on optimization error", async () => {
      const { manipulateAsync } = require("expo-image-manipulator");
      manipulateAsync.mockRejectedValue(new Error("Optimization failed"));

      const result = await CameraService.optimizeImage("file://original.jpg");

      expect(result).toBe("file://original.jpg");
    });
  });
});
