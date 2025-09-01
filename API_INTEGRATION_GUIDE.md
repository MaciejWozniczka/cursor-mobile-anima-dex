# Przewodnik Integracji API - AnimaDex

## Przegląd

AnimaDex integruje się z dwoma głównymi endpointami n8n do identyfikacji zwierząt i generowania odznak. Ten dokument opisuje szczegóły integracji, formaty danych i obsługę błędów.

## Endpointy API

### 1. Identyfikacja Zwierząt

**Endpoint:** `POST https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226`

**Metoda:** `POST`

**Content-Type:** `multipart/form-data`

**Parametry:**
- `image`: Plik obrazu (zdjęcie zwierzęcia)

**Odpowiedź:**
```json
{
  "name": "Kaczka",
  "description": "Ptak wodny z rodziny kaczkowatych"
}
```

**Obsługa w kodzie:**
```typescript
// src/services/api.ts
async identifyAnimal(photoUri: string): Promise<AnimalIdentificationResponse> {
  // Implementacja wysyłania zdjęcia i otrzymywania odpowiedzi
}
```

### 2. Generowanie Odznak

**Endpoint:** `GET https://andrzej210-20210.wykr.es/webhook-test/a56adba0-37af-40b9-941a-3db55e4fc028`

**Metoda:** `GET`

**Parametry:**
- `name`: Nazwa zwierzęcia (URL encoded)

**Przykład:** `?name=kaczka`

**Odpowiedź (Nowy Format):**
```json
{
  "data": "iVBORw0KGgoAAAANSUhEUgAA...", // base64 encoded image
  "additionalInfo": "Dodatkowe informacje o odznace",
  "rarity": "common",
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

**Obsługa w kodzie:**
```typescript
// src/services/api.ts
async generateBadge(animalName: string): Promise<BadgeGenerationResponse> {
  // Implementacja z obsługą nowego formatu JSON
}
```

## Nowy Format Odpowiedzi - Szczegóły

### Zmiana Formatu

**Poprzedni format:** Bezpośredni `ArrayBuffer` z obrazem
**Nowy format:** JSON z polem `data` zawierającym base64 obrazka

### Implementacja

```typescript
// Sprawdzenie typu odpowiedzi
const contentType = response.headers.get('content-type');
if (contentType && contentType.includes('application/json')) {
  // Nowy format JSON
  const jsonResponse = await response.json();
  
  if (jsonResponse.data) {
    // Konwersja base64 na ArrayBuffer
    const base64Data = jsonResponse.data;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return {
      imageData: bytes.buffer,
      additionalData: jsonResponse
    };
  }
} else {
  // Fallback dla starego formatu ArrayBuffer
  const arrayBuffer = await response.arrayBuffer();
  return { imageData: arrayBuffer };
}
```

### Polyfill dla React Native

React Native nie ma wbudowanej funkcji `atob` i `btoa`. Dodano polyfill:

```typescript
// src/utils/helpers.ts
if (typeof global.atob === 'undefined') {
  global.atob = (str: string): string => {
    return Buffer.from(str, 'base64').toString('binary');
  };
}

if (typeof global.btoa === 'undefined') {
  global.btoa = (str: string): string => {
    return Buffer.from(str, 'binary').toString('base64');
  };
}
```

## Struktura Danych

### Typy TypeScript

```typescript
// src/types/index.ts
export interface AnimalIdentificationResponse {
  name: string;
  description: string;
}

export interface BadgeGenerationResponse {
  imageData: ArrayBuffer;
  additionalData?: any;
}

export interface StoredBadge {
  id: string;
  animalName: string;
  description: string;
  imageBlob: string; // base64 encoded image data
  discoveredAt: string; // ISO timestamp
  originalPhoto?: string; // base64 zdjęcia użytkownika (opcjonalnie)
  additionalData?: any; // dodatkowe dane z API generowania odznaki
}
```

### Przechowywanie Danych

```typescript
// src/services/storage.ts
async saveBadge(
  animalName: string,
  description: string,
  imageBuffer: ArrayBuffer,
  originalPhoto?: string,
  additionalData?: any // Nowy parametr
): Promise<StoredBadge> {
  // Implementacja zapisywania z dodatkowymi danymi
}
```

## Wyświetlanie Danych

### AnalysisScreen

Dodatkowe dane z API są wyświetlane użytkownikowi po zdobyciu odznaki:

```typescript
// src/screens/AnalysisScreen.tsx
{result.additionalData && (
  <View style={styles.additionalDataContainer}>
    <Text style={styles.additionalDataTitle}>Dodatkowe informacje:</Text>
    <Text style={styles.additionalDataText}>
      {JSON.stringify(result.additionalData, null, 2)}
    </Text>
  </View>
)}
```

### Styling

```typescript
additionalDataContainer: {
  marginTop: SPACING.md,
  paddingTop: SPACING.md,
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
},
additionalDataTitle: {
  fontSize: FONTS.sizes.md,
  fontWeight: FONTS.weights.semibold,
  color: COLORS.textPrimary,
  marginBottom: SPACING.sm,
},
additionalDataText: {
  fontSize: FONTS.sizes.sm,
  color: COLORS.textSecondary,
  lineHeight: 20,
  fontFamily: 'monospace',
  backgroundColor: COLORS.grayLight,
  padding: SPACING.sm,
  borderRadius: BORDER_RADIUS.sm,
},
```

## Obsługa Błędów

### Typy Błędów

```typescript
// src/utils/helpers.ts
export const createError = (code: string, message: string, details?: any) => ({
  code,
  message,
  details,
});
```

### Obsługa w API

```typescript
// Przykłady błędów
if (!jsonResponse.data) {
  throw createError(
    "INVALID_RESPONSE",
    "Nieprawidłowa odpowiedź z serwera - brak pola 'data'"
  );
}

if (arrayBuffer.byteLength === 0) {
  throw createError(
    "EMPTY_RESPONSE",
    "Otrzymano pustą odpowiedź z serwera generowania odznaki"
  );
}
```

## Retry Logic

### Implementacja

```typescript
// src/utils/helpers.ts
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
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};
```

### Użycie

```typescript
const response = await retry(
  async () => {
    const result = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(API_TIMEOUTS.request),
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    return result;
  },
  3, // maxAttempts
  1000 // delay
);
```

## Timeout Configuration

```typescript
// src/utils/constants.ts
export const API_TIMEOUTS = {
  request: 30000, // 30 seconds
  upload: 60000, // 60 seconds for image uploads
} as const;
```

## Testowanie

### Przykład cURL

```bash
# Test identyfikacji zwierząt
curl -X POST \
  -F "image=@photo.jpg" \
  https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226

# Test generowania odznaki
curl --location 'https://andrzej210-20210.wykr.es/webhook-test/a56adba0-37af-40b9-941a-3db55e4fc028?name=kaczka'
```

### Debugowanie

```typescript
// Włączanie logów debugowania
console.log('API Response:', jsonResponse);
console.log('Content-Type:', contentType);
console.log('Base64 length:', base64Data.length);
```

## Backward Compatibility

Aplikacja obsługuje zarówno nowy format JSON jak i stary format ArrayBuffer:

1. **Sprawdza Content-Type** odpowiedzi
2. **Parsuje JSON** jeśli to application/json
3. **Fallback na ArrayBuffer** dla innych typów
4. **Zachowuje dodatkowe dane** jeśli są dostępne

## Podsumowanie

Integracja API została zaktualizowana, aby obsługiwać nowy format odpowiedzi z polem `data` zawierającym base64 obrazka. Aplikacja zachowuje backward compatibility i wyświetla dodatkowe dane użytkownikowi po zdobyciu odznaki.

**Kluczowe zmiany:**
- ✅ Obsługa JSON response z polem `data`
- ✅ Polyfill dla atob/btoa w React Native
- ✅ Wyświetlanie dodatkowych danych użytkownikowi
- ✅ Backward compatibility z poprzednim formatem
- ✅ Ulepszona obsługa błędów i retry logic
