import React from "react";
import { View, StyleSheet } from "react-native";
import { CameraView } from "expo-camera";

// eslint-disable-next-line react/require-default-props
interface CameraPreviewProps {
  cameraRef: React.RefObject<any>;
  cameraType: "front" | "back";
  flashMode: "off" | "on" | "auto";
  onCameraReady?: () => void;
  children?: React.ReactNode;
}

const CameraPreview = ({
  cameraRef,
  cameraType,
  flashMode,
  onCameraReady,
  children,
}: CameraPreviewProps) => {
  return (
    <View style={styles.container} testID="camera-preview">
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

CameraPreview.defaultProps = {
  onCameraReady: undefined,
  children: undefined,
};

export default CameraPreview;
