import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { STORAGE_KEYS, StoredBadge, BadgeCollection, User } from "@/types";
import {
  generateId,
  arrayBufferToBase64,
  isValidBase64,
} from "@/utils/helpers";

class StorageService {
  private static instance: StorageService;
  private badgesDir: string;
  private metadataFile: string;

  private constructor() {
    this.badgesDir = `${FileSystem.documentDirectory}badges/`;
    this.metadataFile = `${this.badgesDir}metadata.json`;
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Inicjalizacja systemu plików
  private async initializeFileSystem(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.badgesDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.badgesDir, {
          intermediates: true,
        });
        console.log("✅ Utworzono katalog badges");
      }
    } catch (error) {
      console.error("❌ Error initializing file system:", error);
      throw new Error("Nie udało się zainicjalizować systemu plików");
    }
  }

  // Badge Management - FileSystem Storage
  async saveBadge(
    animalName: string,
    description: string,
    imageBuffer: ArrayBuffer,
    originalPhoto?: string,
    additionalData?: any
  ): Promise<StoredBadge> {
    try {
      console.log("💾 Rozpoczynam zapisywanie odznaki dla:", animalName);

      // Inicjalizuj system plików
      await this.initializeFileSystem();

      // Generuj unikalny ID dla odznaki
      const badgeId = generateId();

      // Zapisz obraz jako plik
      console.log("🔄 Zapisuję obraz jako plik...");
      const imageFileName = `badge_${badgeId}.png`;
      const imageUri = `${this.badgesDir}${imageFileName}`;

      // Konwertuj ArrayBuffer na base64 i zapisz jako plik
      console.log("🔄 Konwertuję ArrayBuffer na base64...");
      const base64Image = arrayBufferToBase64(imageBuffer);
      console.log("✅ Base64 wygenerowany, długość:", base64Image.length);

      // Sprawdź czy base64 jest poprawny
      if (!base64Image || base64Image.length === 0) {
        throw new Error("Nieprawidłowy base64 string");
      }

      // Waliduj format base64
      if (!isValidBase64(base64Image)) {
        throw new Error("Nieprawidłowy format base64");
      }

      // Zapisz jako plik binarny
      try {
        await FileSystem.writeAsStringAsync(imageUri, base64Image, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (writeError) {
        console.error("❌ Błąd zapisywania pliku:", writeError);

        // Fallback: spróbuj zapisać jako zwykły tekst
        try {
          await FileSystem.writeAsStringAsync(imageUri, base64Image);
          console.log("✅ Plik zapisany jako tekst (fallback)");
        } catch (fallbackError) {
          console.error("❌ Błąd fallback zapisywania:", fallbackError);
          throw new Error("Nie udało się zapisać pliku obrazu");
        }
      }

      console.log("✅ Obraz zapisany jako plik:", imageUri);

      // Zapisz oryginalne zdjęcie (jeśli dostępne)
      let originalPhotoUri: string | undefined;
      if (originalPhoto) {
        try {
          const originalFileName = `original_${badgeId}.jpg`;
          originalPhotoUri = `${this.badgesDir}${originalFileName}`;

          // Sprawdź czy originalPhoto to już base64 czy URI
          if (
            originalPhoto.startsWith("data:") ||
            originalPhoto.startsWith("file:")
          ) {
            // To jest URI, skopiuj plik
            await FileSystem.copyAsync({
              from: originalPhoto,
              to: originalPhotoUri,
            });
          } else {
            // To jest base64, zapisz jako plik
            try {
              await FileSystem.writeAsStringAsync(
                originalPhotoUri,
                originalPhoto,
                {
                  encoding: FileSystem.EncodingType.Base64,
                }
              );
            } catch (writeError) {
              console.warn(
                "⚠️ Błąd zapisywania oryginalnego zdjęcia jako base64:",
                writeError
              );
              // Spróbuj zapisać jako zwykły tekst
              await FileSystem.writeAsStringAsync(
                originalPhotoUri,
                originalPhoto
              );
            }
          }
          console.log("✅ Oryginalne zdjęcie zapisane:", originalPhotoUri);
        } catch (photoError) {
          console.warn(
            "⚠️ Nie udało się zapisać oryginalnego zdjęcia:",
            photoError
          );
          // Kontynuuj bez oryginalnego zdjęcia
        }
      }

      // Utwórz obiekt odznaki
      const badge: StoredBadge = {
        id: badgeId,
        animalName,
        description,
        imageBlob: imageUri, // Ścieżka do pliku obrazu
        discoveredAt: new Date().toISOString(),
        originalPhoto: originalPhotoUri,
        additionalData,
      };

      // Zapisz metadane do pliku JSON
      await this.saveMetadata(badge);
      console.log("✅ Odznaka zapisana pomyślnie!");

      return badge;
    } catch (error) {
      console.error("❌ Error saving badge:", error);

      // Szczegółowe logowanie błędu
      if (error instanceof Error) {
        console.error("❌ Szczegóły błędu:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }

      // Sprawdź czy to błąd base64
      if (error instanceof Error && error.message.includes("bad base-64")) {
        throw new Error("Błąd kodowania obrazu - nieprawidłowy format base64");
      }

      throw new Error("Nie udało się zapisać odznaki");
    }
  }

  // Zapisz metadane do pliku JSON
  private async saveMetadata(newBadge: StoredBadge): Promise<void> {
    try {
      const existingBadges = await this.getBadges();
      const updatedBadges = [...existingBadges, newBadge];

      const metadataJson = JSON.stringify(updatedBadges, null, 2);

      await FileSystem.writeAsStringAsync(this.metadataFile, metadataJson);
      console.log("✅ Metadane zapisane do pliku JSON");
    } catch (error) {
      console.error("❌ Error saving metadata:", error);

      // Fallback: spróbuj zapisać tylko nową odznakę
      try {
        const fallbackJson = JSON.stringify([newBadge], null, 2);
        await FileSystem.writeAsStringAsync(this.metadataFile, fallbackJson);
        console.log("✅ Metadane zapisane (fallback - tylko nowa odznaka)");
      } catch (fallbackError) {
        console.error("❌ Error saving metadata fallback:", fallbackError);
        throw new Error("Nie udało się zapisać metadanych");
      }
    }
  }

  // Pobierz wszystkie odznaki z pliku JSON
  async getBadges(): Promise<StoredBadge[]> {
    try {
      await this.initializeFileSystem();

      const fileInfo = await FileSystem.getInfoAsync(this.metadataFile);
      if (!fileInfo.exists) {
        console.log("📁 Plik metadanych nie istnieje, zwracam pustą tablicę");
        return [];
      }

      const data = await FileSystem.readAsStringAsync(this.metadataFile);
      const badges = JSON.parse(data);

      if (!Array.isArray(badges)) {
        console.warn("⚠️ Plik metadanych ma nieprawidłowy format");
        return [];
      }

      console.log("✅ Załadowano odznaki z pliku:", badges.length);
      return badges;
    } catch (error) {
      console.error("❌ Error getting badges:", error);
      return [];
    }
  }

  // Pobierz odznakę po ID
  async getBadgeById(id: string): Promise<StoredBadge | null> {
    try {
      const badges = await this.getBadges();
      return badges.find((badge) => badge.id === id) || null;
    } catch (error) {
      console.error("❌ Error getting badge by ID:", error);
      return null;
    }
  }

  // Usuń odznakę
  async deleteBadge(id: string): Promise<boolean> {
    try {
      const badges = await this.getBadges();
      const badgeToDelete = badges.find((badge) => badge.id === id);

      if (badgeToDelete) {
        // Usuń plik obrazu
        try {
          await FileSystem.deleteAsync(badgeToDelete.imageBlob);
          console.log("✅ Usunięto plik obrazu:", badgeToDelete.imageBlob);
        } catch (fileError) {
          console.warn("⚠️ Nie udało się usunąć pliku obrazu:", fileError);
        }

        // Usuń oryginalne zdjęcie (jeśli istnieje)
        if (badgeToDelete.originalPhoto) {
          try {
            await FileSystem.deleteAsync(badgeToDelete.originalPhoto);
            console.log(
              "✅ Usunięto oryginalne zdjęcie:",
              badgeToDelete.originalPhoto
            );
          } catch (fileError) {
            console.warn(
              "⚠️ Nie udało się usunąć oryginalnego zdjęcia:",
              fileError
            );
          }
        }
      }

      const updatedBadges = badges.filter((badge) => badge.id !== id);

      // Zapisz zaktualizowane metadane
      try {
        await FileSystem.writeAsStringAsync(
          this.metadataFile,
          JSON.stringify(updatedBadges, null, 2)
        );
      } catch (writeError) {
        console.error(
          "❌ Błąd zapisywania metadanych po usunięciu:",
          writeError
        );
        throw new Error("Nie udało się zaktualizować metadanych");
      }

      console.log("✅ Odznaka usunięta pomyślnie");
      return true;
    } catch (error) {
      console.error("❌ Error deleting badge:", error);
      return false;
    }
  }

  // Sprawdź czy zwierzę już zostało odkryte
  async checkIfAnimalExists(animalName: string): Promise<boolean> {
    try {
      const badges = await this.getBadges();
      return badges.some(
        (badge) => badge.animalName.toLowerCase() === animalName.toLowerCase()
      );
    } catch (error) {
      console.error("❌ Error checking if animal exists:", error);
      return false;
    }
  }

  // Pobierz kolekcję odznak
  async getBadgeCollection(): Promise<BadgeCollection> {
    try {
      const badges = await this.getBadges();
      return {
        badges,
        totalCount: badges.length,
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error getting badge collection:", error);
      return {
        badges: [],
        totalCount: 0,
        lastSync: new Date().toISOString(),
      };
    }
  }

  // Wyczyść wszystkie odznaki
  async clearAllBadges(): Promise<boolean> {
    try {
      await this.initializeFileSystem();

      // Usuń wszystkie pliki w katalogu badges
      const files = await FileSystem.readDirectoryAsync(this.badgesDir);
      for (const file of files) {
        try {
          await FileSystem.deleteAsync(`${this.badgesDir}${file}`);
        } catch (fileError) {
          console.warn("⚠️ Nie udało się usunąć pliku:", file, fileError);
        }
      }

      console.log("✅ Wszystkie odznaki zostały usunięte");
      return true;
    } catch (error) {
      console.error("❌ Error clearing badges:", error);
      return false;
    }
  }

  // Pobierz URI obrazu odznaki
  async getBadgeImageUri(badge: StoredBadge): Promise<string> {
    try {
      // Sprawdź czy plik istnieje
      const fileInfo = await FileSystem.getInfoAsync(badge.imageBlob);
      if (!fileInfo.exists) {
        console.warn("⚠️ Plik obrazu nie istnieje:", badge.imageBlob);
        return "";
      }

      // Zwróć ścieżkę do pliku
      return badge.imageBlob;
    } catch (error) {
      console.error("❌ Error getting badge image URI:", error);
      return "";
    }
  }

  // Pobierz statystyki przechowywania
  async getStorageStats(): Promise<{
    totalBadges: number;
    totalSize: number;
    lastSync: string;
  }> {
    try {
      const badges = await this.getBadges();
      let totalSize = 0;

      // Oblicz rozmiar plików obrazów
      for (const badge of badges) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(badge.imageBlob);
          if (fileInfo.exists) {
            totalSize += fileInfo.size || 0;
          }

          // Dodaj rozmiar oryginalnego zdjęcia
          if (badge.originalPhoto) {
            const originalFileInfo = await FileSystem.getInfoAsync(
              badge.originalPhoto
            );
            if (originalFileInfo.exists) {
              totalSize += originalFileInfo.size || 0;
            }
          }
        } catch (error) {
          console.warn("⚠️ Nie udało się pobrać rozmiaru pliku:", error);
        }
      }

      return {
        totalBadges: badges.length,
        totalSize,
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error getting storage stats:", error);
      return {
        totalBadges: 0,
        totalSize: 0,
        lastSync: new Date().toISOString(),
      };
    }
  }

  // Test systemu plików
  async testFileSystem(): Promise<boolean> {
    try {
      await this.initializeFileSystem();

      const testFile = `${this.badgesDir}test.txt`;
      const testData = "test_data";

      await FileSystem.writeAsStringAsync(testFile, testData);
      const retrievedData = await FileSystem.readAsStringAsync(testFile);
      await FileSystem.deleteAsync(testFile);

      return retrievedData === testData;
    } catch (error) {
      console.error("❌ FileSystem test failed:", error);
      return false;
    }
  }

  // Napraw system plików
  async repairFileSystem(): Promise<{ repaired: boolean; message: string }> {
    try {
      await this.initializeFileSystem();

      const fileInfo = await FileSystem.getInfoAsync(this.metadataFile);
      if (!fileInfo.exists) {
        return { repaired: false, message: "Brak danych do naprawy" };
      }

      console.log("📊 Rozmiar pliku metadanych:", fileInfo.size, "bajtów");

      try {
        const data = await FileSystem.readAsStringAsync(this.metadataFile);
        const badges = JSON.parse(data);

        if (!Array.isArray(badges)) {
          console.warn("⚠️ Plik metadanych ma nieprawidłowy format, usuwam");
          await FileSystem.deleteAsync(this.metadataFile);
          return {
            repaired: true,
            message: "Usunięto nieprawidłowy plik metadanych",
          };
        }

        // Sprawdź czy wszystkie pliki obrazów istnieją
        const validBadges = [];
        for (const badge of badges) {
          try {
            const imageInfo = await FileSystem.getInfoAsync(badge.imageBlob);
            if (imageInfo.exists) {
              validBadges.push(badge);
            } else {
              console.warn("⚠️ Plik obrazu nie istnieje:", badge.imageBlob);
            }
          } catch (error) {
            console.warn("⚠️ Błąd sprawdzania pliku:", badge.imageBlob, error);
          }
        }

        if (validBadges.length !== badges.length) {
          console.warn(
            "⚠️ Niektóre pliki obrazów są uszkodzone, naprawiam metadane"
          );
          try {
            await FileSystem.writeAsStringAsync(
              this.metadataFile,
              JSON.stringify(validBadges, null, 2)
            );
          } catch (writeError) {
            console.error(
              "❌ Błąd zapisywania naprawionych metadanych:",
              writeError
            );
            throw new Error("Nie udało się zapisać naprawionych metadanych");
          }
          return {
            repaired: true,
            message: `Naprawiono metadane: ${badges.length - validBadges.length} uszkodzonych odznak zostało usuniętych`,
          };
        }

        return { repaired: false, message: "System plików jest poprawny" };
      } catch (parseError) {
        console.warn("⚠️ Błąd parsowania JSON, usuwam plik metadanych");
        await FileSystem.deleteAsync(this.metadataFile);
        return {
          repaired: true,
          message: "Usunięto uszkodzony plik metadanych",
        };
      }
    } catch (error) {
      console.error("❌ Error repairing file system:", error);
      return {
        repaired: false,
        message: "Błąd podczas naprawy systemu plików",
      };
    }
  }

  // User Management (pozostaje AsyncStorage)
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("❌ Error saving user:", error);
      throw new Error("Nie udało się zapisać danych użytkownika");
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("❌ Error getting user:", error);
      return null;
    }
  }

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error("❌ Error clearing user:", error);
    }
  }

  // Auth Token Management (pozostaje AsyncStorage)
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error("❌ Error saving auth token:", error);
      throw new Error("Nie udało się zapisać tokenu autoryzacji");
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("❌ Error getting auth token:", error);
      return null;
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("❌ Error clearing auth token:", error);
    }
  }

  // Settings Management (pozostaje AsyncStorage)
  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      throw new Error("Nie udało się zapisać ustawień");
    }
  }

  async getSettings(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("❌ Error getting settings:", error);
      return {};
    }
  }

  // Wyczyść wszystkie dane (dla wylogowania)
  async clearAllData(): Promise<void> {
    try {
      // Wyczyść AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.SETTINGS,
      ]);

      // Wyczyść system plików
      await this.clearAllBadges();
    } catch (error) {
      console.error("❌ Error clearing all data:", error);
      throw new Error("Nie udało się wyczyścić wszystkich danych");
    }
  }
}

export default StorageService.getInstance();
