import { Camera } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { CAMERA } from "@/utils/constants";

class CameraService {
  private static instance: CameraService;
  private cameraRef: any = null;

  private constructor() {}

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Sprawdzenie uprawnień do aparatu
   */
  async checkCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error checking camera permissions:", error);
      return false;
    }
  }

  /**
   * Żądanie uprawnień do aparatu
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting camera permissions:", error);
      return false;
    }
  }

  /**
   * Ustawienie referencji do aparatu
   */
  setCameraRef(ref: any): void {
    this.cameraRef = ref;
  }

  /**
   * Robienie zdjęcia
   */
  async takePhoto(): Promise<string | null> {
    if (!this.cameraRef) {
      console.error("Camera reference not set");
      return null;
    }

    try {
      const photo = await this.cameraRef.takePictureAsync({
        quality: CAMERA.quality,
        base64: true,
      });

      return photo.uri;
    } catch (error) {
      console.error("Error taking photo:", error);
      return null;
    }
  }

  /**
   * Optymalizacja obrazu
   */
  async optimizeImage(imageUri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: CAMERA.maxWidth,
              height: CAMERA.maxHeight,
            },
          },
        ],
        {
          compress: CAMERA.quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error("Error optimizing image:", error);
      return imageUri; // Zwróć oryginalny URI jeśli optymalizacja się nie powiedzie
    }
  }

  /**
   * Konwersja obrazu na base64
   */
  async imageToBase64(imageUri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(imageUri, [], {
        base64: true,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return result.base64 || "";
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return "";
    }
  }

  /**
   * Pobranie rozmiaru obrazu
   */
  async getImageSize(
    imageUri: string
  ): Promise<{ width: number; height: number }> {
    try {
      const result = await ImageManipulator.manipulateAsync(imageUri, [], {
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return {
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error("Error getting image size:", error);
      return { width: 0, height: 0 };
    }
  }

  /**
   * Walidacja jakości obrazu
   */
  async validateImageQuality(imageUri: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const size = await this.getImageSize(imageUri);

      if (size.width < 100 || size.height < 100) {
        return {
          isValid: false,
          error:
            "Zdjęcie jest zbyt małe. Minimalny rozmiar to 100x100 pikseli.",
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error("Error validating image quality:", error);
      return {
        isValid: false,
        error: "Nie udało się zwalidować jakości zdjęcia",
      };
    }
  }

  /**
   * Pobranie dostępnych typów aparatów
   */
  async getAvailableCameraTypes(): Promise<string[]> {
    try {
      // W expo-camera 16.x nie ma getAvailableCameraTypesAsync
      // Domyślnie zwracamy dostępne typy
      return ["back", "front"];
    } catch (error) {
      console.error("Error getting available camera types:", error);
      return ["back"]; // Domyślnie aparat tylny
    }
  }

  /**
   * Pobranie dostępnych trybów błysku
   */
  getAvailableFlashModes(): string[] {
    return ["off", "on", "auto"];
  }

  /**
   * Sprawdzenie czy aparat jest gotowy
   */
  isCameraReady(): boolean {
    return this.cameraRef !== null;
  }

  /**
   * Czyszczenie zasobów aparatu
   */
  cleanup(): void {
    this.cameraRef = null;
  }
}

export default CameraService.getInstance();
