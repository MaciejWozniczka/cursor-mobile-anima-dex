import { Platform } from "react-native";
import { v4 as uuidv4 } from "uuid";

// Polyfill dla atob i btoa w React Native
if (typeof global.atob === "undefined") {
  global.atob = (str: string): string => {
    return Buffer.from(str, "base64").toString("binary");
  };
}

if (typeof global.btoa === "undefined") {
  global.btoa = (str: string): string => {
    return Buffer.from(str, "binary").toString("base64");
  };
}

// Date formatting
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth();
  
  // Skróty miesięcy po polsku
  const monthNames = [
    'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
    'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'
  ];
  
  return `${day} ${monthNames[month]}`;
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// String utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Array utilities
export const sortByDate = <T extends { discoveredAt: string }>(
  items: T[],
  order: "asc" | "desc" = "desc"
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.discoveredAt).getTime();
    const dateB = new Date(b.discoveredAt).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
};

export const sortByName = <T extends { animalName: string }>(
  items: T[],
  order: "asc" | "desc" = "asc"
): T[] => {
  return [...items].sort((a, b) => {
    const nameA = a.animalName.toLowerCase();
    const nameB = b.animalName.toLowerCase();
    return order === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });
};

export const filterBySearch = <
  T extends { animalName: string; description: string },
>(
  items: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.animalName.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
  );
};

// Image utilities
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  try {
    const uint8Array = new Uint8Array(buffer);
    
    // Sprawdź czy buffer jest poprawny
    if (!buffer || buffer.byteLength === 0) {
      throw new Error("Pusty ArrayBuffer");
    }

    // Metoda 1: Użyj Buffer (najbardziej niezawodna w React Native)
    try {
      const base64 = Buffer.from(uint8Array).toString('base64');
      if (base64 && base64.length > 0) {
        return base64;
      }
    } catch (bufferError) {
      console.warn("⚠️ Buffer konwersja nie powiodła się, próbuję alternatywnej metody");
    }

    // Metoda 2: Ręczna konwersja przez binary string
    let binary = "";
    const chunkSize = 8192; // 8KB chunks
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      const chunkArray = Array.from(chunk);
      binary += String.fromCharCode.apply(null, chunkArray);
    }

    // Sprawdź czy binary string jest poprawny
    if (!binary || binary.length === 0) {
      throw new Error("Pusty binary string");
    }

    const base64 = btoa(binary);
    
    // Sprawdź czy base64 jest poprawny
    if (!base64 || base64.length === 0) {
      throw new Error("Pusty base64 string");
    }

    return base64;
  } catch (error) {
    console.error("❌ Błąd konwersji ArrayBuffer do base64:", error);
    throw new Error("Nie udało się przekonwertować obrazu do base64");
  }
};

export const base64ToDataURL = (
  base64: string,
  mimeType: string = "image/png"
): string => {
  return `data:${mimeType};base64,${base64}`;
};

// Walidacja base64 string
export const isValidBase64 = (str: string): boolean => {
  try {
    // Sprawdź czy string nie jest pusty
    if (!str || str.length === 0) {
      return false;
    }
    
    // Sprawdź czy zawiera tylko dozwolone znaki base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(str)) {
      return false;
    }
    
    // Sprawdź czy długość jest poprawna (musi być podzielna przez 4)
    if (str.length % 4 !== 0) {
      return false;
    }
    
    // Spróbuj zdekodować
    atob(str);
    return true;
  } catch (error) {
    return false;
  }
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Platform utilities
export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

// ID generation - React Native compatible
export const generateId = (): string => {
  try {
    // Próbuj użyć uuid jeśli crypto.getRandomValues jest dostępne
    return uuidv4();
  } catch (error) {
    // Fallback dla React Native gdy crypto.getRandomValues() nie jest dostępne
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);

    return `${timestamp}-${randomPart}-${randomPart2}`;
  }
};

// Error handling
export const createError = (code: string, message: string, details?: any) => ({
  code,
  message,
  details,
});

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Storage utilities
export const getStorageKey = (key: string): string => {
  return `animal_dex_${key}`;
};

// Animation utilities
export const interpolateValue = (
  value: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number => {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;

  const inputRangeSize = inputMax - inputMin;
  const outputRangeSize = outputMax - outputMin;

  const normalizedValue = (value - inputMin) / inputRangeSize;
  return outputMin + normalizedValue * outputRangeSize;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Retry utility
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Timeout utility for fetch requests
export const createTimeoutSignal = (timeoutMs: number): AbortSignal => {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return controller.signal;
};
