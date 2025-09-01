# Animal Dex 🐾

Mobilna aplikacja typu "Pokedex" dla realnych zwierząt, umożliwiająca użytkownikom odkrywanie i kolekcjonowanie zwierząt poprzez fotografowanie ich aparatem telefonu.

## 🚀 Funkcjonalności

### 🔐 System Autentykacji

- Logowanie i rejestracja użytkowników
- Bezpieczne przechowywanie sesji
- Profil użytkownika z podstawowymi informacjami

### 📸 Aparat i Fotografowanie

- Integracja z natywnym aparatem telefonu
- Robienie zdjęć zwierząt w wysokiej jakości
- Podgląd zdjęć przed wysłaniem
- Optymalizacja obrazów przed uploadem

### 🤖 Rozpoznawanie Zwierząt

- AI-powered identyfikacja gatunków zwierząt
- Integracja z endpointami n8n
- Automatyczne generowanie odznak
- Obsługa błędów i nieznanych gatunków

### 🏆 System Odznak

- Dynamiczne generowanie odznak przez AI
- Kolekcjonowanie unikalnych odznak
- Szczegółowe informacje o zwierzętach
- Efektowne animacje odkrycia

### 📚 Zarządzanie Kolekcją

- Galeria wszystkich zebranych odznak
- Wyszukiwanie i filtrowanie
- Sortowanie według daty i nazwy
- Szczegółowe widoki odznak

## 🛠️ Technologie

- **Frontend**: React Native + Expo
- **Nawigacja**: React Navigation
- **Stan**: React Query + useState/useContext
- **Autentykacja**: Expo Auth Session
- **Aparat**: Expo Camera
- **Przechowywanie**: AsyncStorage
- **Styling**: StyleSheet + Constants
- **Typy**: TypeScript (strict mode)

## 📱 Wymagania Systemowe

- Node.js 18+
- npm lub yarn
- Expo CLI
- iOS Simulator lub Android Emulator
- Fizyczne urządzenie (dla testowania aparatu)

## 🚀 Instalacja i Uruchomienie

### 1. Klonowanie Repozytorium

```bash
git clone <repository-url>
cd AnimaDex
```

### 2. Instalacja Zależności

```bash
npm install
```

### 3. Uruchomienie Aplikacji

```bash
# Uruchomienie serwera deweloperskiego
npm start

# Lub bezpośrednio na urządzeniu
npm run ios     # dla iOS
npm run android # dla Android
```

### 4. Testowanie

```bash
# Sprawdzenie typów TypeScript
npm run type-check

# Linting kodu
npm run lint

# Uruchomienie testów
npm test
```

## 📁 Struktura Projektu

```
src/
├── components/          # Komponenty wielokrotnego użytku
│   ├── auth/           # Komponenty autentykacji
│   ├── badges/         # Komponenty odznak
│   ├── camera/         # Komponenty aparatu
│   └── common/         # Wspólne komponenty
├── screens/            # Ekrany aplikacji
│   ├── AuthScreen.tsx
│   ├── CameraScreen.tsx
│   ├── AnalysisScreen.tsx
│   ├── GalleryScreen.tsx
│   ├── BadgeDetailScreen.tsx
│   └── ProfileScreen.tsx
├── services/           # Serwisy i API
│   ├── api.ts         # Integracja z n8n
│   ├── auth.ts        # Autentykacja
│   ├── badges.ts      # Zarządzanie odznakami
│   ├── camera.ts      # Obsługa aparatu
│   └── storage.ts     # AsyncStorage
├── navigation/         # Nawigacja
├── types/             # Definicje TypeScript
├── utils/             # Narzędzia i stałe
└── assets/            # Zasoby statyczne
```

## 🔧 Konfiguracja

### Zmienne Środowiskowe

Aplikacja używa endpointów n8n zdefiniowanych w `src/types/index.ts`:

```typescript
export const API_ENDPOINTS = {
  IDENTIFY_ANIMAL:
    "https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226",
  GENERATE_BADGE:
    "https://andrzej210-20210.wykr.es/webhook-test/a56adba0-37af-40b9-941a-3db55e4fc028",
};
```

### Uprawnienia

Aplikacja wymaga następujących uprawnień:

- **Camera**: Do robienia zdjęć zwierząt
- **Storage**: Do zapisywania odznak lokalnie

## 🎨 Design System

### Kolory

- **Primary**: #4CAF50 (Zielony)
- **Secondary**: #8BC34A (Jasny zielony)
- **Accent**: #FF9800 (Pomarańczowy)
- **Background**: #FAFAFA (Jasny szary)

### Typografia

- **Sizes**: xs(12), sm(14), md(16), lg(18), xl(20), xxl(24), xxxl(32)
- **Weights**: normal(400), medium(500), semibold(600), bold(700)

### Spacing

- **Base Unit**: 8px
- **Scale**: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48), xxxl(64)

## 🔄 Przepływ Aplikacji

1. **Autentykacja** → Logowanie/Rejestracja użytkownika
2. **Aparat** → Robienie zdjęcia zwierzęcia
3. **Analiza** → AI identyfikuje gatunek
4. **Generowanie** → Tworzenie odznaki przez AI
5. **Kolekcja** → Zapisywanie i przeglądanie odznak

## 🐛 Rozwiązywanie Problemów

### Typowe Problemy

**Błąd "Metro bundler not found"**

```bash
npx expo install --fix
```

**Błąd uprawnień aparatu**

- Sprawdź ustawienia uprawnień na urządzeniu
- Uruchom ponownie aplikację

**Błąd połączenia z API**

- Sprawdź połączenie internetowe
- Zweryfikuj endpointy w `src/types/index.ts`

### Debugowanie

```bash
# Włączenie debugowania
expo start --dev-client

# Logi w czasie rzeczywistym
expo logs
```

## 📊 Metryki i Analizy

Aplikacja śledzi następujące zdarzenia:

- `photo_captured`: Zrobienie zdjęcia
- `badge_unlocked`: Odkrycie nowej odznaki
- `collection_viewed`: Przeglądanie kolekcji
- `species_identified`: Identyfikacja gatunku

## 🔮 Planowane Funkcjonalności (Phase 2)

- [ ] Funkcje społecznościowe (udostępnianie odkryć)
- [ ] Tabele wyników i wyzwania
- [ ] Offline baza danych gatunków
- [ ] AR wizualizacja zwierząt
- [ ] Weryfikacja gatunków przez społeczność
- [ ] Zaawansowane filtrowanie i wyszukiwanie
- [ ] Eksport kolekcji

## 📄 Licencja

Ten projekt jest objęty licencją MIT. Zobacz plik `LICENSE` dla szczegółów.

## 👥 Wkład w Projekt

1. Fork projektu
2. Utwórz branch dla nowej funkcjonalności (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📞 Wsparcie

W przypadku problemów lub pytań:

- Otwórz issue w GitHub
- Skontaktuj się: support@animadex.app

---

**Animal Dex** - Odkryj świat zwierząt przez obiektyw! 🐾📸
