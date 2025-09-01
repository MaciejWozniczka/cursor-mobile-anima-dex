import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BadgeCard from "../../src/components/badges/BadgeCard";
import { StoredBadge } from "../../src/types";

// Mock dla react-native
jest.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  TouchableOpacity: "TouchableOpacity",
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
}));

// Mock dla BadgeImage
jest.mock("../../src/components/badges/BadgeImage", () => "BadgeImage");

// Mock dla constants
jest.mock("../../src/utils/constants", () => ({
  COLORS: {
    white: "#FFFFFF",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
  },
  FONTS: {
    sizes: {
      sm: 14,
      md: 16,
      lg: 18,
    },
    weights: {
      semibold: "600",
    },
  },
  SPACING: {
    xs: 4,
    sm: 8,
    md: 16,
  },
  BORDER_RADIUS: {
    sm: 8,
    md: 12,
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
  formatDate: jest.fn((date) => "15 stycznia 2024"),
}));

describe("BadgeCard", () => {
  const mockBadge: StoredBadge = {
    id: "badge-1",
    animalName: "Kot domowy",
    description: "Mały drapieżnik domowy",
    imageBlob: "base64-encoded-image",
    discoveredAt: "2024-01-15T10:00:00Z",
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with default size", () => {
    const { getByText, getByTestId } = render(
      <BadgeCard badge={mockBadge} onPress={mockOnPress} />
    );

    expect(getByText("Kot domowy")).toBeTruthy();
    expect(getByText("15 stycznia 2024")).toBeTruthy();
    expect(getByTestId("badge-card")).toBeTruthy();
  });

  it("should render with small size", () => {
    const { getByTestId } = render(
      <BadgeCard badge={mockBadge} onPress={mockOnPress} size="small" />
    );

    expect(getByTestId("badge-card")).toBeTruthy();
  });

  it("should render with large size", () => {
    const { getByTestId } = render(
      <BadgeCard badge={mockBadge} onPress={mockOnPress} size="large" />
    );

    expect(getByTestId("badge-card")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const { getByTestId } = render(
      <BadgeCard badge={mockBadge} onPress={mockOnPress} />
    );

    const card = getByTestId("badge-card");
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledWith(mockBadge);
  });

  it("should display badge information correctly", () => {
    const { getByText } = render(
      <BadgeCard badge={mockBadge} onPress={mockOnPress} />
    );

    expect(getByText("Kot domowy")).toBeTruthy();
    expect(getByText("15 stycznia 2024")).toBeTruthy();
  });

  it("should handle long animal names", () => {
    const longNameBadge: StoredBadge = {
      ...mockBadge,
      animalName:
        "Bardzo długa nazwa zwierzęcia która może być dłuższa niż dwie linie",
    };

    const { getByText } = render(
      <BadgeCard badge={longNameBadge} onPress={mockOnPress} />
    );

    expect(
      getByText(
        "Bardzo długa nazwa zwierzęcia która może być dłuższa niż dwie linie"
      )
    ).toBeTruthy();
  });
});
