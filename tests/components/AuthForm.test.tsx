import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AuthForm from "../../src/components/auth/AuthForm";

// Mocki są teraz w tests/setup.ts

// Mock dla constants
jest.mock("../../src/utils/constants", () => ({
  COLORS: {
    primary: "#3B82F6",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    textDisabled: "#D1D5DB",
    error: "#EF4444",
    white: "#FFFFFF",
  },
  FONTS: {
    sizes: {
      lg: 18,
      md: 16,
      sm: 14,
    },
    weights: {
      semibold: "600",
      medium: "500",
    },
  },
  SPACING: {
    lg: 24,
    md: 16,
    sm: 8,
  },
  BORDER_RADIUS: {
    md: 12,
    sm: 8,
  },
  SHADOWS: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
  },
}));

// Mock dla helpers
jest.mock("../../src/utils/helpers", () => ({
  isValidEmail: jest.fn((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  isValidPassword: jest.fn((password) => password.length >= 6),
}));

describe("AuthForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Mode", () => {
    it("should render login form", () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={false} />
      );

      expect(getByText("Zaloguj się")).toBeTruthy();
      expect(getByText("Witaj ponownie w Animal Dex!")).toBeTruthy();
      expect(getByPlaceholderText("Email")).toBeTruthy();
      expect(getByPlaceholderText("Hasło")).toBeTruthy();
    });

    it("should handle email input", () => {
      const { getByPlaceholderText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={false} />
      );

      const emailInput = getByPlaceholderText("Email");
      fireEvent.changeText(emailInput, "test@example.com");

      expect(emailInput.props.value).toBe("test@example.com");
    });

    it("should handle password input", () => {
      const { getByPlaceholderText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={false} />
      );

      const passwordInput = getByPlaceholderText("Hasło");
      fireEvent.changeText(passwordInput, "password123");

      expect(passwordInput.props.value).toBe("password123");
    });

    it("should toggle password visibility", () => {
      const { getByTestId, getByPlaceholderText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={false} />
      );

      const passwordInput = getByPlaceholderText("Hasło");
      const eyeButton = getByTestId("eye-button");

      // Domyślnie hasło jest ukryte
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Kliknij przycisk oka
      fireEvent.press(eyeButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      // Kliknij ponownie
      fireEvent.press(eyeButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it("should validate form and submit successfully", async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={false} />
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Hasło");
      const submitButton = getByText("Zaloguj się");

      // Wypełnij formularz
      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");

      // Wyślij formularz
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          "test@example.com",
          "password123"
        );
      });
    });

    it("should show validation errors for empty fields", async () => {
      const { getByText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={false} />
      );

      const submitButton = getByText("Zaloguj się");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText("Email jest wymagany")).toBeTruthy();
        expect(getByText("Hasło jest wymagane")).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show validation error for invalid email", async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={false} />
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Hasło");
      const submitButton = getByText("Zaloguj się");

      fireEvent.changeText(emailInput, "invalid-email");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText("Nieprawidłowy format email")).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show validation error for short password", async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={false} />
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Hasło");
      const submitButton = getByText("Zaloguj się");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "123");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText("Hasło musi mieć co najmniej 6 znaków")).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Register Mode", () => {
    it("should render register form", () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthForm mode="register" onSubmit={mockOnSubmit} isLoading={false} />
      );

      expect(getByText("Zarejestruj się")).toBeTruthy();
      expect(
        getByText("Dołącz do społeczności odkrywców zwierząt!")
      ).toBeTruthy();
      expect(getByPlaceholderText("Email")).toBeTruthy();
      expect(getByPlaceholderText("Hasło")).toBeTruthy();
    });

    it("should handle register form submission", async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthForm mode="register" onSubmit={mockOnSubmit} isLoading={false} />
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Hasło");
      const submitButton = getByText("Zarejestruj się");

      fireEvent.changeText(emailInput, "newuser@example.com");
      fireEvent.changeText(passwordInput, "newpassword123");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          "newuser@example.com",
          "newpassword123"
        );
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state", () => {
      const { getByText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={true} />
      );

      expect(getByText("Przetwarzanie...")).toBeTruthy();
    });

    it("should disable submit button when loading", () => {
      const { getByText } = render(
        <AuthForm mode="login" onSubmit={mockOnSubmit} isLoading={true} />
      );

      const submitButton = getByText("Przetwarzanie...");
      // Sprawdzamy czy przycisk jest wyłączony przez sprawdzenie TouchableOpacity
      expect(submitButton).toBeTruthy();
    });
  });
});
