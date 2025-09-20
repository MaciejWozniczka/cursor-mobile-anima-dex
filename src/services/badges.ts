/* eslint-disable class-methods-use-this */
import { StoredBadge } from "@/types";
import AnimalAPI from "./api";
import StorageService from "./storage";

class BadgeService {
  private static instance: BadgeService;

  private constructor() {}

  public static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  /**
   * Główny proces odkrywania zwierzęcia i generowania odznaki
   */
  // eslint-disable-next-line class-methods-use-this
  async discoverAnimal(photoUri: string): Promise<StoredBadge> {
    try {
      // Krok 1: Identyfikacja zwierzęcia
      console.log("🔍 Krok 1: Identyfikacja zwierzęcia...");
      const identification = await AnimalAPI.identifyAnimal(photoUri);
      console.log("✅ Zidentyfikowano zwierzę:", {
        name: identification.name,
        description: identification.description,
      });

      // Krok 2: Sprawdzenie czy zwierzę już zostało odkryte
      console.log("🔍 Krok 2: Sprawdzanie czy zwierzę już istnieje...");
      const alreadyExists = await StorageService.checkIfAnimalExists(
        identification.name
      );

      if (alreadyExists) {
        throw new Error(
          `Zwierzę "${identification.name}" zostało już odkryte!`
        );
      }
      console.log("✅ Zwierzę nie zostało jeszcze odkryte");

      // Krok 3: Generowanie odznaki z przekazaniem name
      console.log("🎨 Krok 3: Generowanie odznaki dla:", identification.name);
      const badgeResponse = await AnimalAPI.generateBadge(identification.name);
      console.log("✅ Odznaka wygenerowana pomyślnie");

      // Krok 4: Zapisywanie odznaki w FileSystem
      console.log("💾 Krok 4: Zapisywanie odznaki w FileSystem...");
      const badge = await StorageService.saveBadge(
        identification.name,
        identification.description,
        badgeResponse.imageData,
        photoUri,
        badgeResponse.additionalData
      );
      console.log("✅ Odznaka zapisana w FileSystem:", badge.id);

      return badge;
    } catch (error) {
      console.error("❌ Error in discoverAnimal:", error);
      throw error;
    }
  }

  /**
   * Pobiera wszystkie odznaki z FileSystem
   */
  async getAllBadges(): Promise<StoredBadge[]> {
    try {
      const badges = await StorageService.getBadges();
      console.log("📊 Pobrano odznaki z FileSystem:", badges.length);
      return badges;
    } catch (error) {
      console.error("❌ Error getting all badges:", error);
      return [];
    }
  }

  /**
   * Pobiera odznakę po ID
   */
  async getBadgeById(id: string): Promise<StoredBadge | null> {
    try {
      const badge = await StorageService.getBadgeById(id);
      if (badge) {
        console.log("✅ Pobrano odznakę:", badge.animalName);
      }
      return badge;
    } catch (error) {
      console.error("❌ Error getting badge by ID:", error);
      return null;
    }
  }

  /**
   * Sprawdza czy zwierzę już zostało odkryte
   */
  async checkIfAnimalExists(animalName: string): Promise<boolean> {
    try {
      const exists = await StorageService.checkIfAnimalExists(animalName);
      if (exists) {
        console.log("⚠️ Zwierzę już istnieje:", animalName);
      }
      return exists;
    } catch (error) {
      console.error("❌ Error checking if animal exists:", error);
      return false;
    }
  }

  /**
   * Usuwa odznakę
   */
  async deleteBadge(id: string): Promise<boolean> {
    try {
      const success = await StorageService.deleteBadge(id);
      if (success) {
        console.log("✅ Odznaka usunięta:", id);
      } else {
        console.warn("⚠️ Nie udało się usunąć odznaki:", id);
      }
      return success;
    } catch (error) {
      console.error("❌ Error deleting badge:", error);
      return false;
    }
  }

  /**
   * Pobiera statystyki kolekcji
   */
  async getCollectionStats(): Promise<{
    totalBadges: number;
    uniqueSpecies: number;
    lastDiscovery: string | null;
    averageDiscoveriesPerDay: number;
  }> {
    try {
      const badges = await this.getAllBadges();

      if (badges.length === 0) {
        return {
          totalBadges: 0,
          uniqueSpecies: 0,
          lastDiscovery: null,
          averageDiscoveriesPerDay: 0,
        };
      }

      // Liczba unikalnych gatunków
      const uniqueSpecies = new Set(
        badges.map((badge) => badge.animalName.toLowerCase())
      ).size;

      // Ostatnie odkrycie
      const sortedBadges = badges.sort(
        (a, b) =>
          new Date(b.discoveredAt).getTime() -
          new Date(a.discoveredAt).getTime()
      );
      const lastDiscovery = sortedBadges[0]?.discoveredAt || null;

      // Średnia odkryć dziennie (ostatnie 30 dni)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentBadges = badges.filter(
        (badge) => new Date(badge.discoveredAt) > thirtyDaysAgo
      );

      const averageDiscoveriesPerDay = recentBadges.length / 30;

      console.log("📊 Statystyki kolekcji:", {
        totalBadges: badges.length,
        uniqueSpecies,
        lastDiscovery,
        averageDiscoveriesPerDay:
          Math.round(averageDiscoveriesPerDay * 100) / 100,
      });

      return {
        totalBadges: badges.length,
        uniqueSpecies,
        lastDiscovery,
        averageDiscoveriesPerDay:
          Math.round(averageDiscoveriesPerDay * 100) / 100,
      };
    } catch (error) {
      console.error("❌ Error getting collection stats:", error);
      return {
        totalBadges: 0,
        uniqueSpecies: 0,
        lastDiscovery: null,
        averageDiscoveriesPerDay: 0,
      };
    }
  }

  /**
   * Filtruje i sortuje odznaki
   */
  async getFilteredBadges(options: {
    search?: string;
    sortBy?: "date" | "name";
    sortOrder?: "asc" | "desc";
    limit?: number;
  }): Promise<StoredBadge[]> {
    try {
      let badges = await this.getAllBadges();

      // Filtrowanie
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        badges = badges.filter(
          (badge) =>
            badge.animalName.toLowerCase().includes(searchTerm) ||
            badge.description.toLowerCase().includes(searchTerm)
        );
      }

      // Sortowanie
      if (options.sortBy === "name") {
        badges.sort((a, b) => {
          const nameA = a.animalName.toLowerCase();
          const nameB = b.animalName.toLowerCase();
          const comparison = nameA.localeCompare(nameB);
          return options.sortOrder === "desc" ? -comparison : comparison;
        });
      } else {
        // Domyślnie sortowanie po dacie
        badges.sort((a, b) => {
          const dateA = new Date(a.discoveredAt).getTime();
          const dateB = new Date(b.discoveredAt).getTime();
          return options.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
      }

      // Limit
      if (options.limit) {
        badges = badges.slice(0, options.limit);
      }

      console.log("🔍 Filtrowane odznaki:", badges.length);
      return badges;
    } catch (error) {
      console.error("❌ Error getting filtered badges:", error);
      return [];
    }
  }

  /**
   * Eksportuje kolekcję (przygotowanie do przyszłych funkcji)
   */
  async exportCollection(): Promise<{
    badges: StoredBadge[];
    stats: any;
    exportDate: string;
  }> {
    try {
      const badges = await this.getAllBadges();
      const stats = await this.getCollectionStats();

      console.log("📤 Eksport kolekcji:", badges.length, "odznak");

      return {
        badges,
        stats,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error exporting collection:", error);
      throw new Error("Nie udało się wyeksportować kolekcji");
    }
  }

  /**
   * Czyści wszystkie odznaki (funkcja debug/development)
   */
  async clearAllBadges(): Promise<boolean> {
    try {
      const success = await StorageService.clearAllBadges();
      if (success) {
        console.log("🗑️ Wszystkie odznaki zostały usunięte");
      }
      return success;
    } catch (error) {
      console.error("❌ Error clearing all badges:", error);
      return false;
    }
  }

  /**
   * Sprawdza połączenie z API
   */
  async checkAPIConnection(): Promise<boolean> {
    try {
      const isConnected = await AnimalAPI.checkConnection();
      console.log("🌐 Połączenie z API:", isConnected ? "OK" : "Błąd");
      return isConnected;
    } catch (error) {
      console.error("❌ Error checking API connection:", error);
      return false;
    }
  }

  /**
   * Sprawdza stan FileSystem
   */
  async checkFileSystemHealth(): Promise<{
    isHealthy: boolean;
    message: string;
    stats?: any;
  }> {
    try {
      const fileSystemWorks = await StorageService.testFileSystem();
      if (!fileSystemWorks) {
        return {
          isHealthy: false,
          message: "FileSystem nie działa poprawnie",
        };
      }

      const repairResult = await StorageService.repairFileSystem();
      if (repairResult.repaired) {
        return {
          isHealthy: false,
          message: repairResult.message,
        };
      }

      const stats = await StorageService.getStorageStats();
      return {
        isHealthy: true,
        message: "FileSystem działa poprawnie",
        stats,
      };
    } catch (error) {
      console.error("❌ Error checking FileSystem health:", error);
      return {
        isHealthy: false,
        message: "Błąd podczas sprawdzania FileSystem",
      };
    }
  }

  /**
   * Symuluje proces odkrywania (dla testów)
   */
  async simulateDiscovery(
    animalName: string,
    description: string
  ): Promise<StoredBadge> {
    try {
      // Symulacja generowania odznaki
      const mockImageBuffer = new ArrayBuffer(1024); // Mock data

      const badge = await StorageService.saveBadge(
        animalName,
        description,
        mockImageBuffer
      );

      console.log("🎭 Symulowane odkrycie:", animalName);
      return badge;
    } catch (error) {
      console.error("❌ Error in simulateDiscovery:", error);
      throw error;
    }
  }

  /**
   * Generuje przykładowe odznaki z różnymi stylami (dla demonstracji)
   */
  async generateSampleBadges(): Promise<StoredBadge[]> {
    try {
      const sampleBadges = [
        {
          animalName: "Sad Święt...",
          description: "Tradycyjny sad z owocami",
          badgeType: "standard" as const,
          category: "Sad Święt...",
          discoveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dzień temu
        },
        {
          animalName: "Senny Mi...",
          description: "Senne popołudnie",
          badgeType: "standard" as const,
          category: "Senny Mi...",
          discoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dni temu
        },
        {
          animalName: "Piwnica a...",
          description: "Winiarnia i piwnica",
          badgeType: "standard" as const,
          category: "Piwnica a...",
          discoveredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 dni temu
        },
        {
          animalName: "Odysseja ...",
          description: "Podróż przez Azję",
          badgeType: "odyssey" as const,
          category: "Odysseja ...",
          discoveredAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 dni temu
        },
        {
          animalName: "Odysseja ...",
          description: "Świątynia Nieba",
          badgeType: "odyssey" as const,
          category: "Odysseja ...",
          discoveredAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(), // 17 dni temu
        },
        {
          animalName: "Odysseja ...",
          description: "Pagoda w mieście",
          badgeType: "odyssey" as const,
          category: "Odysseja ...",
          discoveredAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(), // 17 dni temu
        },
        {
          animalName: "Podróż p...",
          description: "Big Ben w Londynie",
          badgeType: "journey" as const,
          category: "Podróż p...",
          overlayText: "Big Ben",
          specialIcon: "50",
          discoveredAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(), // 24 dni temu
        },
        {
          animalName: "Podróż p...",
          description: "Chichen Itza",
          badgeType: "journey" as const,
          category: "Podróż p...",
          overlayText: "Chichen Itza",
          specialIcon: "50",
          discoveredAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(), // 26 dni temu
        },
        {
          animalName: "Podróż p...",
          description: "Wieża Eiffla",
          badgeType: "journey" as const,
          category: "Podróż p...",
          overlayText: "Eiffel Tower",
          specialIcon: "50",
          discoveredAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(), // 26 dni temu
        },
        {
          animalName: "Wyzwani...",
          description: "Wyzwanie z psem",
          badgeType: "challenge" as const,
          category: "Wyzwani...",
          discoveredAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(), // 33 dni temu
        },
        {
          animalName: "Wyzwani...",
          description: "Lody z dziećmi",
          badgeType: "challenge" as const,
          category: "Wyzwani...",
          discoveredAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString(), // 34 dni temu
        },
        {
          animalName: "Gałka rad...",
          description: "Lody z dodatkami",
          badgeType: "scoop" as const,
          category: "Gałka rad...",
          discoveredAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(), // 37 dni temu
        },
        {
          animalName: "Gałka rad...",
          description: "Lody na ulicy",
          badgeType: "scoop" as const,
          category: "Gałka rad...",
          discoveredAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString(), // 43 dni temu
        },
        {
          animalName: "Festiwal ...",
          description: "Fajerwerki nad wodą",
          badgeType: "festival" as const,
          category: "Festiwal ...",
          discoveredAt: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString(), // 46 dni temu
        },
        {
          animalName: "Festiwal ...",
          description: "Fajerwerki nad Fuji",
          badgeType: "festival" as const,
          category: "Festiwal ...",
          discoveredAt: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString(), // 52 dni temu
        },
      ];

      const createdBadges: StoredBadge[] = [];
      
      for (const sampleBadge of sampleBadges) {
        try {
          const mockImageBuffer = new ArrayBuffer(1024); // Mock data
          const badge = await StorageService.saveBadge(
            sampleBadge.animalName,
            sampleBadge.description,
            mockImageBuffer,
            undefined,
            {
              badgeType: sampleBadge.badgeType,
              category: sampleBadge.category,
              overlayText: sampleBadge.overlayText,
              specialIcon: sampleBadge.specialIcon,
            }
          );
          
          // Aktualizuj badge o dodatkowe pola
          const updatedBadge = {
            ...badge,
            badgeType: sampleBadge.badgeType,
            category: sampleBadge.category,
            overlayText: sampleBadge.overlayText,
            specialIcon: sampleBadge.specialIcon,
          };
          
          createdBadges.push(updatedBadge);
        } catch (error) {
          console.error(`❌ Error creating sample badge ${sampleBadge.animalName}:`, error);
        }
      }

      console.log("🎭 Wygenerowano przykładowe odznaki:", createdBadges.length);
      return createdBadges;
    } catch (error) {
      console.error("❌ Error generating sample badges:", error);
      return [];
    }
  }
}

export default BadgeService.getInstance();
