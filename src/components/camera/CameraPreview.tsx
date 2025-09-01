import React from "react";
import { View, StyleSheet } from "react-native";
import { CameraView } from "expo-camera";

interface CameraPreviewProps {
  cameraRef: React.RefObject<any>;
  cameraType: "front" | "back";
  flashMode: "off" | "on" | "auto";
  onCameraReady?: () => void;
  children?: React.ReactNode;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  cameraRef,
  cameraType,
  flashMode,
  onCameraReady,
  children,
}) => {
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
        onCameraReady={onCameraReady}
      >
        {children}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});

export default CameraPreview;
