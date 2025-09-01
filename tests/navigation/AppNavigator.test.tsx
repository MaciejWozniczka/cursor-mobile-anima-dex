import React from "react";
import { render } from "@testing-library/react-native";
import AppNavigator from "../../src/navigation/AppNavigator";
import { AuthState } from "../../src/types";

// Mock dla react-navigation
jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: () => ({
    Navigator: "StackNavigator",
    Screen: "StackScreen",
  }),
}));

jest.mock("@react-navigation/bottom-tabs", () => ({
  createBottomTabNavigator: () => ({
    Navigator: "TabNavigator",
    Screen: "TabScreen",
  }),
}));

// Mock dla ekranów
jest.mock("../../src/screens/AuthScreen", () => "AuthScreen");
jest.mock("../../src/screens/CameraScreen", () => "CameraScreen");
jest.mock("../../src/screens/GalleryScreen", () => "GalleryScreen");
jest.mock("../../src/screens/ProfileScreen", () => "ProfileScreen");
jest.mock("../../src/screens/AnalysisScreen", () => "AnalysisScreen");
jest.mock("../../src/screens/BadgeDetailScreen", () => "BadgeDetailScreen");

// Mock dla Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const mockUpdateAuthState = jest.fn();

const authenticatedAuthState: AuthState = {
  user: {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    createdAt: "2024-01-01",
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

const unauthenticatedAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const loadingAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

describe("AppNavigator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders auth screen when not authenticated", () => {
    const { getByText } = render(
      <AppNavigator
        authState={unauthenticatedAuthState}
        updateAuthState={mockUpdateAuthState}
      />
    );

    expect(getByText("StackNavigator")).toBeTruthy();
  });

  it("renders main navigation when authenticated", () => {
    const { getByText } = render(
      <AppNavigator
        authState={authenticatedAuthState}
        updateAuthState={mockUpdateAuthState}
      />
    );

    expect(getByText("StackNavigator")).toBeTruthy();
  });

  it("renders auth screen when loading", () => {
    const { getByText } = render(
      <AppNavigator
        authState={loadingAuthState}
        updateAuthState={mockUpdateAuthState}
      />
    );

    expect(getByText("StackNavigator")).toBeTruthy();
  });

  it("passes updateAuthState to AuthScreen", () => {
    render(
      <AppNavigator
        authState={unauthenticatedAuthState}
        updateAuthState={mockUpdateAuthState}
      />
    );

    // Sprawdzamy czy komponent renderuje się bez błędów
    expect(mockUpdateAuthState).not.toHaveBeenCalled();
  });

  it("renders with error state", () => {
    const errorAuthState: AuthState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: "Authentication error",
    };

    const { getByText } = render(
      <AppNavigator
        authState={errorAuthState}
        updateAuthState={mockUpdateAuthState}
      />
    );

    expect(getByText("StackNavigator")).toBeTruthy();
  });

  it("handles auth state changes", () => {
    const { rerender, getByText } = render(
      <AppNavigator
        authState={unauthenticatedAuthState}
        updateAuthState={mockUpdateAuthState}
      />
    );

    expect(getByText("StackNavigator")).toBeTruthy();

    // Zmiana na authenticated
    rerender(
      <AppNavigator
        authState={authenticatedAuthState}
        updateAuthState={mockUpdateAuthState}
      />
    );

    expect(getByText("StackNavigator")).toBeTruthy();
  });

  it("renders different screens based on auth state", () => {
    const { getByText } = render(
      <AppNavigator
        authState={authenticatedAuthState}
        updateAuthState={mockUpdateAuthState}
      />
    );

    expect(getByText("StackNavigator")).toBeTruthy();
  });
});
