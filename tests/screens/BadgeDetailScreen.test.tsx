import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BadgeDetailScreen from "../../src/screens/BadgeDetailScreen";
import { StoredBadge } from "../../src/types";
import BadgeService from "../../src/services/badges";

// Mock dla BadgeService
jest.mock("../../src/services/badges", () => ({
  deleteBadge: jest.fn(),
}));

// Mock dla komponentów
jest.mock("../../src/components/badges/BadgeImage", () => {
  return function MockBadgeImage({ badge, style }: any) {
    return (
      <div data-testid="badge-image" data-style={JSON.stringify(style)}>
        {badge.animalName}
      </div>
    );
  };
});

// Mock dla utils/helpers
jest.mock("../../src/utils/helpers", () => ({
  formatDateTime: jest.fn((date) => `Formatted: ${date}`),
}));

// Mock dla react-native Alert
jest.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  TouchableOpacity: "TouchableOpacity",
  ScrollView: "ScrollView",
  Alert: {
    alert: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
}));

// Mock dla Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const mockBadge: StoredBadge = {
  id: "1",
  animalName: "Lew",
  description: "Król dżungli, największy drapieżnik Afryki",
  imageBlob: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  discoveredAt: "2024-01-01T10:00:00Z",
};

// Mock dla react-navigation
const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: jest.fn(),
};

const mockRoute = {
  params: {
    badge: mockBadge,
  },
};

describe("BadgeDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders badge details correctly", () => {
    const { getByText } = render(
      <BadgeDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText("Lew")).toBeTruthy();
    expect(
      getByText("Król dżungli, największy drapieżnik Afryki")
    ).toBeTruthy();
    expect(getByText("Formatted: 2024-01-01T10:00:00Z")).toBeTruthy();
  });

  it("shows delete confirmation dialog", () => {
    const { Alert } = require("react-native");
    const { getByText } = render(
      <BadgeDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    fireEvent.press(getByText("Usuń odznakę"));

    expect(Alert.alert).toHaveBeenCalled();
  });

  it("renders with different badge data", () => {
    const differentRoute = {
      params: {
        badge: {
          ...mockBadge,
          animalName: "Tygrys",
          description: "Największy kot świata",
        },
      },
    };

    const { getByText } = render(
      <BadgeDetailScreen
        navigation={mockNavigation as any}
        route={differentRoute as any}
      />
    );

    expect(getByText("Tygrys")).toBeTruthy();
    expect(getByText("Największy kot świata")).toBeTruthy();
  });
});
