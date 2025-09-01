import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SPACING } from "@/utils/constants";

// eslint-disable-next-line react/require-default-props
interface CameraControlsProps {
  cameraType: "front" | "back";
  flashMode: "off" | "on" | "auto";
  onCameraTypeChange: (type: "front" | "back") => void;
  onFlashModeChange: (mode: "off" | "on" | "auto") => void;
  onCapture: () => void;
  isCapturing?: boolean;
}

const CameraControls = ({
  cameraType,
  flashMode,
  onCameraTypeChange,
  onFlashModeChange,
  onCapture,
  isCapturing = false,
}: CameraControlsProps) => {
  const toggleFlashMode = () => {
    switch (flashMode) {
      case "off":
        onFlashModeChange("on");
        break;
      case "on":
        onFlashModeChange("auto");
        break;
      case "auto":
        onFlashModeChange("off");
        break;
      default:
        onFlashModeChange("off");
    }
  };

  const toggleCameraType = () => {
    onCameraTypeChange(cameraType === "back" ? "front" : "back");
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case "on":
        return "flash";
      case "auto":
        return "flash-outline";
      case "off":
      default:
        return "flash-off";
    }
  };

  return (
    <View style={styles.container}>
      {/* Górne kontrolki */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleFlashMode}
        >
          <Ionicons name={getFlashIcon()} size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraType}
        >
          <Ionicons name="camera-reverse" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Dolne kontrolki */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            isCapturing && styles.captureButtonDisabled,
          ]}
          onPress={onCapture}
          disabled={isCapturing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  bottomControls: {
    alignItems: "center",
    paddingBottom: SPACING.xl,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
});

CameraControls.defaultProps = {
  isCapturing: false,
};

export default CameraControls;
