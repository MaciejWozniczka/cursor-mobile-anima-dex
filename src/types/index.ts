// API Types
export interface AnimalIdentificationResponse {
  name: string;
  description: string;
}

export interface BadgeGenerationResponse {
  imageData: ArrayBuffer;
  additionalData?: any;
}

export interface APIEndpoints {
  identifyAnimal: {
    method: "POST";
    url: "https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226";
    contentType: "multipart/form-data";
    body: FormData;
    response: AnimalIdentificationResponse;
  };
  generateBadge: {
    method: "GET";
    url: "https://andrzej210-20210.wykr.es/webhook-test/a56adba0-37af-40b9-941a-3db55e4fc028";
    params: { name: string };
    response: BadgeGenerationResponse;
  };
  authLogin: {
    method: "POST";
    url: "https://lifemanager.bieda.it/api/auth";
    contentType: "application/json";
    body: { email: string; password: string };
    response: { token: string; user?: any };
  };
  authRegister: {
    method: "POST";
    url: "https://lifemanager.bieda.it/api/user";
    contentType: "application/json";
    body: { email: string; password: string };
    response: { token: string; user?: any };
  };
}

// Badge Types
export interface StoredBadge {
  id: string;
  animalName: string;
  description: string;
  imageBlob: string; // base64 encoded image data
  discoveredAt: string; // ISO timestamp
  originalPhoto?: string; // base64 zdjęcia użytkownika (opcjonalnie)
  additionalData?: any; // dodatkowe dane z API generowania odznaki
  
  // Nowe pola dla stylizacji odznak
  badgeType?: 'standard' | 'odyssey' | 'journey' | 'challenge' | 'scoop' | 'festival';
  badgeTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  category?: string; // np. "Podróż", "Wyzwanie", "Festiwal"
  overlayText?: string; // tekst na banerze (np. "Big Ben", "Chichen Itza")
  specialIcon?: string; // specjalna ikona (np. "50", "diamond")
}

export interface BadgeCollection {
  badges: StoredBadge[];
  totalCount: number;
  lastSync: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Camera: { resetCamera?: boolean } | undefined;
  Analysis: {
    photoUri: string;
  };
  BadgeDetail: {
    badge: StoredBadge;
  };
};

export type MainTabParamList = {
  Camera: { resetCamera?: boolean } | undefined;
  Gallery: undefined;
  Profile: undefined;
};

// Camera Types
export interface CameraState {
  hasPermission: boolean | null;
  type: "front" | "back";
  isCapturing: boolean;
  flash: "off" | "on" | "auto";
}

// Analysis Types
export interface AnalysisState {
  isAnalyzing: boolean;
  result: AnimalIdentificationResponse | null;
  error: string | null;
  photoUri: string | null;
}

// Gallery Types
export interface GalleryFilters {
  search: string;
  sortBy: "date" | "name";
  sortOrder: "asc" | "desc";
}

// Analytics Types
export interface AnalyticsEvents {
  photo_captured: { species?: string; confidence?: number };
  badge_unlocked: { species: string; rarity: string };
  collection_viewed: { badge_count: number };
  species_identified: { species: string; success: boolean };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Constants
export const STORAGE_KEYS = {
  BADGES: "animal_badges",
  USER: "user_data",
  AUTH_TOKEN: "auth_token",
  SETTINGS: "app_settings",
} as const;

export const API_ENDPOINTS = {
  IDENTIFY_ANIMAL:
    "https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226",
  GENERATE_BADGE:
    "https://andrzej210-20210.wykr.es/webhook-test/a56adba0-37af-40b9-941a-3db55e4fc028",
} as const;

export const API_TIMEOUTS = {
  request: 30000, // 30 seconds
  upload: 60000, // 60 seconds for image uploads
} as const;
