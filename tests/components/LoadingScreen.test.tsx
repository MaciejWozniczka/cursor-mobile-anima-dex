import React from "react";
import { render } from "@testing-library/react-native";
import LoadingScreen from "../../src/components/common/LoadingScreen";

// Mock dla react-native
jest.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  ActivityIndicator: "ActivityIndicator",
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
}));

// Mock dla constants
jest.mock("../../src/utils/constants", () => ({
  COLORS: {
    primary: "#3B82F6",
    background: "#F8FAFC",
    white: "#FFFFFF",
    border: "#E5E7EB",
    textSecondary: "#6B7280",
  },
  FONTS: {
    sizes: {
      lg: 18,
    },
    weights: {
      medium: "500",
    },
  },
  SPACING: {
    lg: 24,
    xxl: 48,
  },
  BORDER_RADIUS: {
    xl: 24,
  },
  SHADOWS: {
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
}));

describe("LoadingScreen", () => {
  it("should render with default message", () => {
    const { getByText } = render(<LoadingScreen />);

    expect(getByText("Ładowanie...")).toBeTruthy();
  });

  it("should render with custom message", () => {
    const customMessage = "Proszę czekać...";
    const { getByText } = render(<LoadingScreen message={customMessage} />);

    expect(getByText(customMessage)).toBeTruthy();
  });

  it("should render ActivityIndicator", () => {
    const { getByTestId } = render(<LoadingScreen />);

    // Sprawdź czy ActivityIndicator jest renderowany
    expect(getByTestId("activity-indicator")).toBeTruthy();
  });

  it("should have proper structure", () => {
    const { getByTestId } = render(<LoadingScreen />);

    expect(getByTestId("loading-container")).toBeTruthy();
    expect(getByTestId("loading-card")).toBeTruthy();
    expect(getByTestId("loading-message")).toBeTruthy();
  });
});
