# Testy AnimalDex

## Struktura testów

```
tests/
├── utils/                   # Testy funkcji pomocniczych
│   ├── helpers.test.ts      # Testy helpers (kompleksowe)
│   └── constants.test.ts    # Testy stałych aplikacji
├── types/                   # Testy typów TypeScript
│   └── index.test.ts        # Testy interfejsów i typów
├── components/              # Testy komponentów React
│   ├── LoadingScreen.test.tsx # Testy LoadingScreen
│   ├── BadgeCard.test.tsx     # Testy BadgeCard
│   └── AuthForm.test.tsx      # Testy AuthForm
└── README.md                # Ten plik
```

## Uruchamianie testów

### Wszystkie testy

```bash
npm test
```

### Testy w trybie watch

```bash
npm run test:watch
```

### Testy z pokryciem kodu

```bash
npm run test:coverage
```

### Pojedynczy plik testowy

```bash
npm test -- tests/utils/helpers.test.ts
```

## Konfiguracja

### Jest

- Używa `ts-jest` jako preset
- Konfiguracja w `jest.config.js`
- Testy uruchamiane w środowisku Node.js

### TypeScript

- Wsparcie dla TypeScript przez `ts-jest`
- Konfiguracja w `tsconfig.json`

## Aktualny stan

Testy są w fazie aktywnego rozwoju i pokrywają większość głównych funkcjonalności aplikacji.

### Działające testy

- ✅ **Funkcje pomocnicze** (helpers) - 25+ testów
- ✅ **Stałe aplikacji** (constants) - 15+ testów
- ✅ **Typy TypeScript** (types) - 20+ testów
- ✅ **Komponenty React** (components) - 15+ testów
- ✅ **Konfiguracja TypeScript**
- ✅ **Mocki dla React Native i Expo**

### Pokrycie kodu

- **Utils**: ~80% (funkcje pomocnicze)
- **Types**: ~90% (interfejsy i typy)
- **Components**: ~60% (komponenty React)
- **Services**: ~20% (serwisy - w trakcie rozwoju)

## Szczegóły testów

### Utils/Helpers

- Formatowanie dat i czasu
- Operacje na stringach i tablicach
- Konwersja obrazów (ArrayBuffer ↔ base64)
- Walidacja (email, hasło, base64)
- Funkcje pomocnicze (debounce, throttle, retry)
- Generowanie ID i obsługa błędów

### Types

- Interfejsy API (AnimalIdentificationResponse, BadgeGenerationResponse)
- Typy odznak (StoredBadge, BadgeCollection)
- Typy użytkownika (User, AuthState)
- Typy nawigacji (RootStackParamList, MainTabParamList)
- Typy kamery (CameraState)

### Components

- **LoadingScreen**: renderowanie, wiadomości, struktura
- **BadgeCard**: różne rozmiary, interakcje, wyświetlanie danych
- **AuthForm**: logowanie/rejestracja, walidacja, stany ładowania

## Mocki

### React Native

- `View`, `Text`, `TouchableOpacity`, `TextInput`
- `ActivityIndicator`, `StyleSheet`
- `Platform.OS` (iOS/Android)

### Expo

- `@expo/vector-icons` (Ionicons)

### Constants

- Kolory, typografia, spacing, cienie
- Klucze storage, endpointy API
- Ustawienia kamery, typy odznak

## Dodawanie nowych testów

1. **Utwórz plik `.test.ts` lub `.test.tsx`** w odpowiednim katalogu
2. **Dodaj mocki** dla zależności zewnętrznych
3. **Użyj `describe`, `it`, `expect`** z Jest
4. **Dodaj `testID`** do komponentów React dla łatwiejszego testowania
5. **Uruchom testy**: `npm test`

## Przykłady testów

### Test funkcji pomocniczej

```typescript
describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = new Date("2024-01-15");
    const result = formatDate(date);
    expect(result).toContain("15");
    expect(result).toContain("styczeń");
  });
});
```

### Test komponentu

```typescript
describe('LoadingScreen', () => {
  it('should render with default message', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText('Ładowanie...')).toBeTruthy();
  });
});
```

## Uwagi

- Testy są uruchamiane w środowisku Node.js, nie w React Native
- Moduły React Native i Expo są mockowane
- Dla pełnego testowania aplikacji zalecane jest użycie `jest-expo` lub podobnych narzędzi
- Testy pokrywają logikę biznesową, walidację i renderowanie komponentów
