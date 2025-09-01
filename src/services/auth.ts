import { User, AuthState } from "@/types";
import StorageService from "./storage";
import { createError, retry, createTimeoutSignal } from "@/utils/helpers";
import { API_ENDPOINTS, API_TIMEOUTS } from "@/utils/constants";

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Inicjalizacja stanu autoryzacji
   */
  async initialize(): Promise<AuthState> {
    try {
      const token = await StorageService.getAuthToken();
      const user = await StorageService.getUser();

      if (token && user) {
        // Sprawdź czy token jest nadal ważny
        const isValid = await this.validateToken(token);

        if (isValid) {
          this.authState = {
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          };
        } else {
          // Token wygasł, wyczyść dane
          await this.logout();
        }
      } else {
        this.authState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        };
      }

      return this.authState;
    } catch (error) {
      console.error("Error initializing auth:", error);
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Błąd inicjalizacji autoryzacji",
      };
      return this.authState;
    }
  }

  /**
   * Logowanie użytkownika
   */
  async login(email: string, password: string): Promise<AuthState> {
    try {
      this.authState.isLoading = true;
      this.authState.error = null;

      const response = await retry(
        async () => {
          const result = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            signal: createTimeoutSignal(API_TIMEOUTS.request),
          });

          if (!result.ok) {
            if (result.status === 401) {
              throw createError(
                "INVALID_CREDENTIALS",
                "Nieprawidłowy email lub hasło"
              );
            } else if (result.status === 404) {
              throw createError("USER_NOT_FOUND", "Użytkownik nie istnieje");
            } else {
              throw createError(
                "LOGIN_FAILED",
                `Błąd logowania: ${result.status}`
              );
            }
          }

          return result;
        },
        3,
        1000
      );

      const data = await response.json();

      if (!data.success || !data.value?.accessToken) {
        throw createError(
          "INVALID_RESPONSE",
          "Nieprawidłowa odpowiedź z serwera - brak tokenu"
        );
      }

      const user: User = {
        id: data.value.id || email,
        email,
        name: email.split("@")[0], // Używamy części email jako nazwy użytkownika
        avatar: undefined,
        createdAt: new Date().toISOString(),
      };

      // Zapisz dane lokalnie
      await StorageService.saveAuthToken(data.value.accessToken);
      await StorageService.saveUser(user);

      this.authState = {
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      return this.authState;
    } catch (error) {
      console.error("Error logging in:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Nieznany błąd logowania";
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      };

      return this.authState;
    }
  }

  /**
   * Rejestracja użytkownika
   */
  async register(email: string, password: string): Promise<AuthState> {
    try {
      this.authState.isLoading = true;
      this.authState.error = null;

      const response = await retry(
        async () => {
          const result = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            signal: createTimeoutSignal(API_TIMEOUTS.request),
          });

          if (!result.ok) {
            if (result.status === 409) {
              throw createError(
                "USER_EXISTS",
                "Użytkownik z tym emailem już istnieje"
              );
            } else if (result.status === 400) {
              throw createError(
                "INVALID_DATA",
                "Nieprawidłowe dane rejestracji"
              );
            } else {
              throw createError(
                "REGISTRATION_FAILED",
                `Błąd rejestracji: ${result.status}`
              );
            }
          }

          return result;
        },
        3,
        1000
      );

      const data = await response.json();

      if (!data.success || !data.value?.id) {
        throw createError(
          "INVALID_RESPONSE",
          "Nieprawidłowa odpowiedź z serwera - brak ID użytkownika"
        );
      }

      // Po rejestracji nie logujemy automatycznie - użytkownik musi się zalogować
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

      return this.authState;
    } catch (error) {
      console.error("Error registering:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Nieznany błąd rejestracji";
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      };

      return this.authState;
    }
  }

  /**
   * Wylogowanie użytkownika
   */
  async logout(): Promise<AuthState> {
    try {
      // Wyczyść dane lokalne
      await StorageService.clearAuthToken();
      await StorageService.clearUser();

      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

      return this.authState;
    } catch (error) {
      console.error("Error logging out:", error);

      // Nawet jeśli wystąpi błąd, zresetuj stan
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

      return this.authState;
    }
  }

  /**
   * Pobierz aktualny stan autoryzacji
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Sprawdź czy użytkownik jest zalogowany
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  /**
   * Pobierz aktualnego użytkownika
   */
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  /**
   * Resetowanie hasła (placeholder)
   */
  // eslint-disable-next-line class-methods-use-this
  async resetPassword(email: string): Promise<boolean> {
    try {
      // TODO: Implementacja resetowania hasła
      console.log("Password reset requested for:", email);
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  }

  /**
   * Walidacja tokenu
   */
  // eslint-disable-next-line class-methods-use-this
  async validateToken(token: string): Promise<boolean> {
    try {
      // TODO: Implementacja walidacji tokenu z serwerem
      // Na razie zwracamy true, jeśli token istnieje
      return !!token;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }
}

export default AuthService.getInstance();
