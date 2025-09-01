# Animal Dex - Mobile App Requirements & PRD

## Project Overview
Animal Dex to mobilna aplikacja typu "Pokedex" dla realnych zwierząt, umożliwiająca użytkownikom odkrywanie i kolekcjonowanie zwierząt poprzez fotografowanie ich aparatem telefonu. Aplikacja wykorzystuje AI do identyfikacji zwierząt i generuje personalizowane odznaki za każde odkrycie.

## Tech Stack
- **Frontend**: React Native + Expo
- **IDE**: Cursor AI
- **Backend/Automation**: n8n (istniejące endpointy)
- **Authentication**: Expo Auth Session lub Firebase Auth
- **Database**: AsyncStorage (lokalne) + zewnętrzna baza (przez n8n)
- **Camera**: Expo Camera
- **Image Processing**: Expo ImageManipulator

## Core Features

### 1. Authentication System
- **Login/Register**: Email/password lub social login (Google/Apple)
- **User Profile**: Podstawowe informacje użytkownika
- **Session Management**: Bezpieczne przechowywanie tokenów
- **Logout**: Wylogowanie z czyszczeniem danych lokalnych

### 2. Camera & Photo Capture
- **Native Camera**: Integracja z Expo Camera
- **Photo Capture**: Robienie zdjęć zwierząt w wysokiej jakości
- **Image Preview**: Podgląd zrobionego zdjęcia przed wysłaniem
- **Image Optimization**: Kompresja i optymalizacja przed wysłaniem do API
- **Permissions**: Obsługa uprawnień do aparatu

### 3. Animal Recognition & Badge Generation Flow
- **Photo Upload**: Wysyłanie zdjęć jako multipart/form-data do pierwszego endpointu
- **Species Detection**: Otrzymanie nazwy i opisu zwierzęcia z API
- **Badge Generation**: Automatyczne generowanie odznaki przez drugi endpoint
- **Duplicate Check**: Sprawdzanie czy dane zwierzę już zostało odkryte
- **Local Storage**: Zapisywanie odznaki (obraz + metadane) w AsyncStorage
- **Error Handling**: Obsługa błędów API i nierozpoznanych zwierząt
- **Success Flow**: Płynne przejście od zdjęcia do zapisanej odznaki

### 4. Badge Generation & Storage System
- **Dynamic Badge Creation**: Automatyczne pobieranie odznak z endpointu n8n
- **Binary Image Handling**: Konwersja plików binarnych do base64 dla storage
- **Local Persistence**: Trwałe przechowywanie w AsyncStorage (offline access)
- **Badge Metadata**: Nazwa zwierzęcia, opis, data odkrycia, obraz
- **No Rarity System**: Wszystkie odznaki równorzędne (bez poziomów rzadkości)
- **Achievement Animation**: Efektowne potwierdzenie odkrycia nowej odznaki
- **Unique Collection**: Każde zwierzę może być odkryte tylko raz

### 5. Collection Management & Local Storage
- **Local Badge Storage**: Przechowywanie odznak w AsyncStorage
- **Badge Gallery**: Przegląd wszystkich lokalnie zapisanych odznak
- **Search & Filter**: Wyszukiwanie po nazwie zwierzęcia, dacie odkrycia
- **Sorting Options**: Sortowanie według daty, nazwy alfabetycznie
- **Badge Details**: Szczegółowy widok każdej odznaki z pełnym opisem
- **Statistics**: Liczba zebranych odznak, lista gatunków
- **Data Persistence**: Trwałe przechowywanie bez potrzeby synchronizacji z serwerem
- **Image Caching**: Efektywne przechowywanie obrazów odznak w base64
- **Duplicate Detection**: Sprawdzanie czy zwierzę już zostało odkryte

### 6. Discovery Experience
- **Photo Analysis Flow**: Płynny przepływ od zdjęcia do odznaki
- **Loading States**: Przyjemne animacje podczas analizy
- **Success Animation**: Efektowne potwierdzenie odkrycia
- **Species Information**: Detale o zidentyfikowanym zwierzęciu
- **Fun Facts**: Ciekawe informacje o gatunku

## Technical Specifications

### Project Structure
```
animal-dex/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── camera/
│   │   ├── badges/
│   │   └── auth/
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── GalleryScreen.tsx
│   │   ├── BadgeDetailScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/
│   │   ├── api.ts           // Obsługa endpointów n8n
│   │   ├── auth.ts          // Autentykacja użytkowników  
│   │   ├── storage.ts       // AsyncStorage dla odznak
│   │   ├── camera.ts        // Obsługa aparatu i zdjęć
│   │   └── badges.ts        // Logika zarządzania odznakami
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── types.ts
│   └── assets/
└── App.tsx
```

### Required Dependencies
```json
{
  "@expo/vector-icons": "latest",
  "@react-navigation/native": "latest",
  "@react-navigation/stack": "latest",
  "@react-navigation/bottom-tabs": "latest",
  "expo": "latest",
  "expo-camera": "latest",
  "expo-image-manipulator": "latest",
  "expo-image-picker": "latest",
  "expo-auth-session": "latest",
  "expo-async-storage": "latest",
  "expo-file-system": "latest",
  "react-native-reanimated": "latest",
  "react-native-gesture-handler": "latest",
  "react-native-safe-area-context": "latest",
  "react-native-screens": "latest",
  "axios": "latest",
  "react-query": "latest",
  "uuid": "latest"
}
```

### API Endpoints (n8n Integration)
```typescript
interface APIEndpoints {
  // Identyfikacja zwierzęcia (multipart/form-data)
  identifyAnimal: {
    method: 'POST';
    url: 'https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226';
    contentType: 'multipart/form-data';
    body: FormData; // image file as form field
    response: {
      name: string;        // nazwa zwierzęcia
      description: string; // opis zwierzęcia
    };
  };

  // Generowanie odznaki (query parameter)
  generateBadge: {
    method: 'GET';
    url: 'https://andrzej210-20210.wykr.es/webhook-test/a56adba0-37af-40b9-941a-3db55e4fc028';
    params: { name: string }; // nazwa zwierzęcia z pierwszego endpointu
    response: Blob | ArrayBuffer; // binarny plik obrazu (gemini)
  };
}

// Lokalne typy danych
interface StoredBadge {
  id: string;              // unikalny identyfikator
  animalName: string;      // nazwa z API
  description: string;     // opis z API
  imageBlob: string;       // base64 encoded image data
  discoveredAt: string;    // ISO timestamp
  originalPhoto?: string;  // base64 zdjęcia użytkownika (opcjonalnie)
}

interface BadgeCollection {
  badges: StoredBadge[];
  totalCount: number;
  lastSync: string;
}
```

## Screen Specifications

### 1. AuthScreen
- **Purpose**: Logowanie i rejestracja użytkowników
- **Elements**: 
  - Email/password inputs
  - Login/Register buttons
  - Social auth buttons
  - "Forgot password" link
- **State Management**: User authentication status
- **Navigation**: Po zalogowaniu -> CameraScreen

### 2. CameraScreen (Main Screen)
- **Purpose**: Główny ekran do robienia zdjęć
- **Elements**:
  - Full-screen camera preview
  - Capture button (duży, centralny)
  - Gallery shortcut button
  - Settings button
- **Functionality**:
  - Real-time camera feed
  - Photo capture with feedback
  - Automatic transition to analysis
- **State**: Camera permissions, photo capture state

### 3. AnalysisScreen
- **Purpose**: Analiza zdjęcia i prezentacja wyniku
- **Elements**:
  - Captured photo preview
  - Loading animation during analysis
  - Species result card
  - "Add to Collection" button
- **Flow**: Photo -> Loading -> Result -> Badge unlock animation
- **Error States**: "Unknown species", "Poor quality", API errors

### 4. GalleryScreen
- **Purpose**: Przegląd kolekcji odznak
- **Elements**:
  - Grid layout odznak
  - Search bar
  - Filter chips (category, rarity)
  - Sort dropdown
  - Statistics header
- **Interactions**: Tap badge -> BadgeDetailScreen
- **Performance**: Lazy loading, image optimization

### 5. BadgeDetailScreen
- **Purpose**: Szczegóły konkretnej odznaki
- **Elements**:
  - Large badge image
  - Species information
  - Discovery date/location
  - Fun facts section
  - Share button
- **Data**: Full species info, user discovery metadata

### 6. ProfileScreen
- **Purpose**: Profil użytkownika i ustawienia
- **Elements**:
  - User avatar/name
  - Collection statistics
  - Settings options
  - Logout button
- **Features**: Profile editing, app preferences

## UI/UX Guidelines

### Design System
- **Color Palette**: Nature-inspired (greens, browns, blues)
- **Typography**: Clean, readable fonts (System default)
- **Iconography**: Consistent icon family (@expo/vector-icons)
- **Spacing**: 8px base unit system
- **Animations**: Smooth transitions (react-native-reanimated)

### User Experience Principles
- **Intuitive Navigation**: Clear bottom tab structure
- **Quick Actions**: One-tap photo capture
- **Visual Feedback**: Loading states, success animations
- **Error Recovery**: Clear error messages with retry options
- **Offline Support**: Basic functionality without internet

### Responsive Design
- **Target Devices**: iOS/Android phones
- **Screen Sizes**: Support from iPhone SE to large Android phones
- **Orientation**: Portrait-first, camera landscape option
- **Safe Areas**: Proper handling of notches and home indicators

## Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Component Structure**: Functional components with hooks
- **State Management**: React Query + useState/useContext

### Performance Requirements
- **App Launch**: < 3 seconds cold start
- **Photo Capture**: < 1 second response
- **API Calls**: Proper caching and retry logic
- **Memory Usage**: Efficient image handling
- **Battery Life**: Optimized camera usage

### Testing Strategy
- **Unit Tests**: Critical business logic
- **Integration Tests**: API connections
- **E2E Tests**: Key user flows
- **Device Testing**: iOS/Android physical devices

## Security & Privacy

### Data Protection
- **User Authentication**: Secure token storage
- **API Security**: Proper headers and HTTPS
- **Image Handling**: Temporary storage, auto-cleanup
- **Location Data**: Optional, user consent required

### Privacy Compliance
- **Permissions**: Camera, location (optional)
- **Data Collection**: Minimal, purpose-specific
- **User Control**: Data deletion options
- **Transparency**: Clear privacy policy

## Deployment & Distribution

### Build Configuration
- **Expo EAS Build**: Production builds
- **Environment Variables**: API endpoints, keys
- **App Icons**: Multiple sizes, platform-specific
- **Splash Screen**: Branded loading screen

### Release Strategy
- **Beta Testing**: Internal testing phase
- **App Store Submission**: iOS App Store, Google Play
- **Version Management**: Semantic versioning
- **OTA Updates**: Expo Updates for quick fixes

## Success Metrics

### Key Performance Indicators
- **User Engagement**: Daily active users, session length
- **Feature Usage**: Photos captured, badges collected
- **Technical Performance**: Crash rate, API response times
- **User Satisfaction**: App store ratings, user feedback

### Analytics Events
```typescript
interface AnalyticsEvents {
  photo_captured: { species?: string; confidence?: number };
  badge_unlocked: { species: string; rarity: string };
  collection_viewed: { badge_count: number };
  species_identified: { species: string; success: boolean };
}
```

## Future Enhancements (Phase 2)
- Social features (sharing discoveries)
- Leaderboards and challenges
- Offline species database
- AR visualization of animals
- Community-driven species verification
- Advanced filtering and search
- Export collection functionality

---

## Implementation Notes for Cursor AI

### Kluczowe szczegóły implementacji API:

```typescript
// services/api.ts - przykład implementacji
class AnimalAPI {
  // Endpoint 1: Rozpoznawanie zwierzęcia
  async identifyAnimal(imageUri: string): Promise<{name: string, description: string}> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'animal.jpg',
    } as any);

    const response = await fetch(
      'https://andrzej210-20210.wykr.es/webhook/c30c62ee-7f2e-435c-972c-2873603e0226',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.json();
  }

  // Endpoint 2: Generowanie odznaki
  async generateBadge(animalName: string): Promise<ArrayBuffer> {
    const response = await fetch(
      `https://andrzej210-20210.wykr.es/webhook-test/a56adba0-37af-40b9-941a-3db55e4fc028?name=${encodeURIComponent(animalName)}`
    );
    return response.arrayBuffer();
  }
}

// services/badges.ts - zarządzanie odznakami
class BadgeManager {
  private static STORAGE_KEY = 'animal_badges';
  
  async saveBadge(animalName: string, description: string, imageBuffer: ArrayBuffer): Promise<void> {
    const base64Image = this.arrayBufferToBase64(imageBuffer);
    const badge: StoredBadge = {
      id: uuid.v4(),
      animalName,
      description,
      imageBlob: base64Image,
      discoveredAt: new Date().toISOString(),
    };
    
    const existingBadges = await this.getBadges();
    const updatedBadges = [...existingBadges, badge];
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedBadges));
  }

  async getBadges(): Promise<StoredBadge[]> {
    const data = await AsyncStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async checkIfAnimalExists(animalName: string): Promise<boolean> {
    const badges = await this.getBadges();
    return badges.some(badge => badge.animalName.toLowerCase() === animalName.toLowerCase());
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    // Konwersja ArrayBuffer do base64 dla przechowywania
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
  }
}

### Priority Order
1. **Setup & Navigation**: Project initialization, navigation structure
2. **Authentication**: User login/register system
3. **Camera Integration**: Photo capture functionality
4. **API Integration**: n8n endpoint connections
5. **Badge System**: Dynamic badge generation and display
6. **Collection Management**: Gallery and badge details
7. **Polish & Testing**: Animations, error handling, testing

### Key Commands for Cursor
- Focus on TypeScript strict mode
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for all async operations
- Include proper TypeScript interfaces for all data structures
- Follow React Native best practices for performance

### Testing Priorities
- Camera permissions and functionality
- API integration with n8n endpoints
- Image upload and processing
- Badge generation and storage
- User authentication flow
- Navigation between screens