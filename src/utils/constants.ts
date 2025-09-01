import { Dimensions } from "react-native";

// Screen Dimensions - funkcja aby uniknąć problemów w testach
export const getScreenDimensions = () => {
  try {
    return Dimensions.get("window");
  } catch {
    // Fallback dla środowiska testowego
    return { width: 400, height: 800 };
  }
};

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getScreenDimensions();

// Colors - Clean Modern palette
export const COLORS = {
  // Primary Colors - Modern Blue
  primary: "#3B82F6", // Modern blue
  primaryDark: "#1D4ED8",
  primaryLight: "#60A5FA",

  // Secondary Colors - Soft Blue
  secondary: "#6366F1", // Indigo
  secondaryDark: "#4338CA",
  secondaryLight: "#818CF8",

  // Accent Colors - Vibrant Blue
  accent: "#06B6D4", // Cyan
  accentDark: "#0891B2",
  accentLight: "#22D3EE",

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",
  gray: "#6B7280",
  grayLight: "#F3F4F6",
  grayDark: "#374151",

  // Status Colors
  success: "#10B981", // Emerald
  warning: "#F59E0B", // Amber
  error: "#EF4444", // Red
  info: "#3B82F6", // Blue

  // Background Colors - Clean
  background: "#F8FAFC", // Very light blue-gray
  surface: "#FFFFFF", // Pure white
  card: "#FFFFFF", // Pure white

  // Clean design colors
  glass: "#F8FAFC", // Light background
  glassDark: "#E5E7EB", // Light gray
  glassPrimary: "#EBF4FF", // Very light blue
  glassSecondary: "#EEF2FF", // Very light indigo

  // Text Colors
  textPrimary: "#1F2937", // Dark gray
  textSecondary: "#6B7280", // Medium gray
  textDisabled: "#D1D5DB", // Light gray

  // Border Colors
  border: "#E5E7EB", // Light gray
  borderLight: "#F3F4F6", // Very light gray
} as const;

// Typography
export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

// Spacing - 8px base unit system
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
} as const;

// Shadows - Clean Modern
export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  glass: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

// Camera Settings
export const CAMERA = {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  aspectRatio: 16 / 9,
} as const;

// API Timeouts
export const API_TIMEOUTS = {
  request: 30000, // 30 seconds
  upload: 60000, // 60 seconds for image uploads
} as const;

// Storage Limits
export const STORAGE_LIMITS = {
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxBadges: 1000, // Maximum number of stored badges
} as const;

// App Configuration
export const APP_CONFIG = {
  name: "Animal Dex",
  version: "1.0.0",
  buildNumber: "1",
  supportEmail: "support@animadex.app",
} as const;

// Feature Flags
export const FEATURES = {
  enableAnalytics: true,
  enableOfflineMode: true,
  enableSocialSharing: false, // Phase 2
  enableAR: false, // Phase 2
} as const;

export const API_ENDPOINTS = {
  IDENTIFY_ANIMAL:
    "https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226",
  GENERATE_BADGE:
    "https://andrzej210-20210.wykr.es/webhook/a56adba0-37af-40b9-941a-3db55e4fc028",
  AUTH_LOGIN: "https://lifemanager.bieda.it/api/auth",
  AUTH_REGISTER: "https://lifemanager.bieda.it/api/user",
} as const;
