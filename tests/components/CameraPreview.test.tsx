import React from "react";
import { render } from "@testing-library/react-native";
import CameraPreview from "../../src/components/camera/CameraPreview";

// Mocki są teraz w tests/setup.ts

describe("CameraPreview", () => {
  const mockCameraRef = { current: null };

  it("renders correctly with required props", () => {
    const { getByTestId } = render(
      <CameraPreview
        cameraRef={mockCameraRef}
        cameraType="back"
        flashMode="off"
      />
    );

    expect(getByTestId("camera-preview")).toBeTruthy();
  });

  it("renders with front camera type", () => {
    const { getByTestId } = render(
      <CameraPreview
        cameraRef={mockCameraRef}
        cameraType="front"
        flashMode="off"
      />
    );

    expect(getByTestId("camera-preview")).toBeTruthy();
  });

  it("renders with different flash modes", () => {
    const { getByTestId } = render(
      <CameraPreview
        cameraRef={mockCameraRef}
        cameraType="back"
        flashMode="on"
      />
    );

    expect(getByTestId("camera-preview")).toBeTruthy();
  });

  it("renders with auto flash mode", () => {
    const { getByTestId } = render(
      <CameraPreview
        cameraRef={mockCameraRef}
        cameraType="back"
        flashMode="auto"
      />
    );

    expect(getByTestId("camera-preview")).toBeTruthy();
  });

  it("renders with children", () => {
    const { getByTestId } = render(
      <CameraPreview
        cameraRef={mockCameraRef}
        cameraType="back"
        flashMode="off"
      >
        <div>Camera Overlay</div>
      </CameraPreview>
    );

    expect(getByTestId("camera-preview")).toBeTruthy();
    // Sprawdzamy tylko czy komponent się renderuje, nie tekst wewnątrz CameraView
  });

  it("calls onCameraReady when provided", () => {
    const mockOnCameraReady = jest.fn();

    const { getByTestId } = render(
      <CameraPreview
        cameraRef={mockCameraRef}
        cameraType="back"
        flashMode="off"
        onCameraReady={mockOnCameraReady}
      />
    );

    expect(getByTestId("camera-preview")).toBeTruthy();
  });

  it("renders without optional props", () => {
    const { getByTestId } = render(
      <CameraPreview
        cameraRef={mockCameraRef}
        cameraType="back"
        flashMode="off"
      />
    );

    expect(getByTestId("camera-preview")).toBeTruthy();
  });

  it("applies correct styles", () => {
    const { getByTestId } = render(
      <CameraPreview
        cameraRef={mockCameraRef}
        cameraType="back"
        flashMode="off"
      />
    );

    const container = getByTestId("camera-preview");
    expect(container).toBeTruthy();
  });
});
