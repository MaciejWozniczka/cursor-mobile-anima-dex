# Testy AnimalDex

## Struktura testów

```
tests/
├── setup.ts                 # Konfiguracja globalna testów
├── services/                # Testy serwisów
│   ├── auth.test.ts        # Testy AuthService
│   ├── api.test.ts         # Testy AnimalAPI
│   └── badges.test.ts      # Testy BadgeService
├── components/              # Testy komponentów
│   └── AuthScreen.test.tsx # Testy AuthScreen
└── utils/                   # Testy funkcji pomocniczych
    └── helpers.test.ts      # Testy helpers
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
npm test -- tests/services/auth.test.ts
```

## Konfiguracja

### Jest
- Używa `jest-expo` jako preset
- Konfiguracja w `jest.config.js`
- Setup w `jest.setup.js` i `tests/setup.ts`

### Babel
- Konfiguracja w `babel.config.js`
- Wsparcie dla aliasów ścieżek (`@/`)

### TypeScript
- Konfiguracja testowa w `tsconfig.test.json`
- Rozszerza główny `tsconfig.json`

## Mocki

### Expo moduły
- `expo-camera`
- `expo-image-manipulator`
- `expo-file-system`

### React Navigation
- `useNavigation`
- `useRoute`
- `useFocusEffect`

### AsyncStorage
- Używa `@react-native-async-storage/async-storage/jest/async-storage-mock`

## Przykłady testów

### Test serwisu
```typescript
describe('AuthService', () => {
  it('should login successfully', async () => {
    // Arrange
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    // Act
    const result = await AuthService.login('test@example.com', 'password');
    
    // Assert
    expect(result.isAuthenticated).toBe(true);
  });
});
```

### Test komponentu
```typescript
describe('AuthScreen', () => {
  it('renders login form', () => {
    const { getByText } = render(<AuthScreen />);
    expect(getByText('Zaloguj się')).toBeTruthy();
  });
});
```

## Pokrycie kodu

Testy pokrywają:
- ✅ Serwisy (AuthService, AnimalAPI, BadgeService)
- ✅ Komponenty (AuthScreen)
- ✅ Funkcje pomocnicze (helpers)
- ✅ Logikę biznesową
- ✅ Obsługę błędów
- ✅ Scenariusze edge case

## Dodawanie nowych testów

1. Utwórz plik `.test.ts` lub `.test.tsx`
2. Dodaj odpowiednie mocki w `tests/setup.ts`
3. Użyj `describe`, `it`, `expect` z Jest
4. Uruchom testy: `npm test`
