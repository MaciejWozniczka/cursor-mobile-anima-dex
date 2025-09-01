import React from "react";
import { render, act } from "@testing-library/react-native";
import BadgeUnlockAnimation from "../../src/components/badges/BadgeUnlockAnimation";
import { StoredBadge } from "../../src/types";

// Mock dla BadgeImage
jest.mock("../../src/components/badges/BadgeImage", () => {
  const { View } = require("react-native");
  return function MockBadgeImage({ badge, style, showFallback }: any) {
    return (
      <View
        testID="badge-image"
        data-badge-id={badge.id}
        data-style={JSON.stringify(style)}
        data-show-fallback={showFallback}
      >
        {badge.animalName}
      </View>
    );
  };
});

// Mock dla react-native
jest.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  TouchableOpacity: "TouchableOpacity",
  Animated: {
    View: "Animated.View",
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => "0deg"),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(),
    })),
    sequence: jest.fn((animations) => ({
      start: (callback: () => void) => {
        // Symulujemy zakończenie animacji i wywołanie callback
        setTimeout(() => {
          callback();
        }, 0);
      },
    })),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 400, height: 800 })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
}));

const mockBadge: StoredBadge = {
  id: "1",
  animalName: "Lew",
  description: "Król dżungli",
  imageBlob: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  discoveredAt: "2024-01-01",
};

describe("BadgeUnlockAnimation", () => {
  const mockOnAnimationComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders nothing when not visible", () => {
    const { queryByTestId } = render(
      <BadgeUnlockAnimation
        badge={mockBadge}
        visible={false}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    expect(queryByTestId("badge-image")).toBeFalsy();
  });

  it("renders animation when visible", () => {
    const { getByTestId, getByText } = render(
      <BadgeUnlockAnimation
        badge={mockBadge}
        visible={true}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    expect(getByTestId("badge-image")).toBeTruthy();
    expect(getByText("Nowa odznaka!")).toBeTruthy();
    expect(getByText("Lew")).toBeTruthy();
    expect(getByText("Odkryłeś nowe zwierzę!")).toBeTruthy();
  });

  it("calls onAnimationComplete after animation", () => {
    render(
      <BadgeUnlockAnimation
        badge={mockBadge}
        visible={true}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    // Symulujemy upływ czasu po zakończeniu animacji
    act(() => {
      jest.advanceTimersByTime(2500); // 300 + 200 + 500 + 300 + 2000ms
    });

    expect(mockOnAnimationComplete).toHaveBeenCalled();
  });

  it("displays correct badge information", () => {
    const customBadge = {
      ...mockBadge,
      animalName: "Tygrys",
      description: "Największy kot świata",
    };

    const { getByText } = render(
      <BadgeUnlockAnimation
        badge={customBadge}
        visible={true}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    expect(getByText("Tygrys")).toBeTruthy();
    expect(getByText("Odkryłeś nowe zwierzę!")).toBeTruthy();
  });

  it("passes correct props to BadgeImage", () => {
    const { getByTestId } = render(
      <BadgeUnlockAnimation
        badge={mockBadge}
        visible={true}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    const badgeImage = getByTestId("badge-image");
    expect(badgeImage.props["data-badge-id"]).toBe("1");
    expect(badgeImage.props["data-show-fallback"]).toBe(false);
  });

  it("handles animation state changes", () => {
    const { rerender, queryByTestId } = render(
      <BadgeUnlockAnimation
        badge={mockBadge}
        visible={false}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    expect(queryByTestId("badge-image")).toBeFalsy();

    rerender(
      <BadgeUnlockAnimation
        badge={mockBadge}
        visible={true}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    expect(queryByTestId("badge-image")).toBeTruthy();
  });

  it("applies correct styles to badge image", () => {
    const { getByTestId } = render(
      <BadgeUnlockAnimation
        badge={mockBadge}
        visible={true}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    const badgeImage = getByTestId("badge-image");
    const style = JSON.parse(badgeImage.props["data-style"]);

    expect(style.width).toBe(80);
    expect(style.height).toBe(80);
    expect(style.borderRadius).toBeDefined();
  });

  it("renders with different badge data", () => {
    const differentBadge = {
      ...mockBadge,
      id: "2",
      animalName: "Niedźwiedź",
    };

    const { getByText } = render(
      <BadgeUnlockAnimation
        badge={differentBadge}
        visible={true}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    expect(getByText("Niedźwiedź")).toBeTruthy();
  });
});
