import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types";

import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/utils/constants";

type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Camera"
>;
type CameraScreenRouteProp = RouteProp<RootStackParamList, "Camera">;

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  const cameraRef = useRef<any>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("off");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    initializeCamera();
  }, []);

  // Obsługa focus/blur eventów dla kamery
  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 Camera screen focused - reinicializing camera");
      setIsCameraReady(false);

      // Sprawdź czy trzeba zresetować kamerę
      const shouldReset = route.params?.resetCamera;

      // Krótkie opóźnienie przed reinicjalizacją
      const timer = setTimeout(() => {
        if (shouldReset) {
          console.log("🔄 Forced camera reset requested");
          forceReinitialize();
        } else {
          initializeCamera();
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        console.log("🔄 Camera screen unfocused");
        setIsCameraReady(false);
      };
    }, [route.params?.resetCamera])
  );

  // Automatyczne resetowanie kamery po 10 sekundach jeśli nie jest gotowa
  useEffect(() => {
    if (hasPermission && !isCameraReady) {
      const resetTimer = setTimeout(() => {
        console.log("⏰ Camera not ready after 10s, auto-resetting...");
        forceReinitialize();
      }, 10000);

      return () => clearTimeout(resetTimer);
    }
  }, [hasPermission, isCameraReady]);

  // Cleanup przy unmount
  useEffect(() => {
    return () => {
      console.log("🔄 Camera screen unmounting - cleanup");
      setIsCameraReady(false);
      if (cameraRef.current) {
        cameraRef.current = null;
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      console.log("🔄 Initializing camera...");
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        console.log("✅ Camera permissions granted");
        // Krótkie opóźnienie aby kamera miała czas się zainicjalizować
        setTimeout(() => {
          setIsCameraReady(true);
          console.log("✅ Camera ready");
        }, 500);
      } else {
        console.log("❌ Camera permissions denied");
        setIsCameraReady(false);
      }
    } catch (error) {
      console.error("❌ Error requesting camera permission:", error);
      setHasPermission(false);
      setIsCameraReady(false);
    }
  };

  // Funkcja do sprawdzenia stanu kamery
  const checkCameraStatus = () => {
    console.log("🔍 Camera status check:", {
      hasPermission,
      isCameraReady,
      cameraRef: !!cameraRef.current,
    });
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || !isCameraReady) {
      console.log("❌ Cannot capture: camera not ready or already capturing");
      checkCameraStatus();
      return;
    }

    try {
      setIsCapturing(true);
      console.log("📸 Capturing photo...");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      console.log("✅ Photo captured:", photo.uri);
      navigation.navigate("Analysis", { photoUri: photo.uri });
    } catch (error) {
      console.error("❌ Error capturing photo:", error);
      Alert.alert("Błąd", "Nie udało się zrobić zdjęcia");

      // Spróbuj zresetować kamerę po błędzie
      setTimeout(() => {
        forceReinitialize();
      }, 1000);
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCameraType = () => {
    console.log("🔄 Switching camera type...");
    setCameraType((current) => (current === "back" ? "front" : "back"));

    // Reset kamery po zmianie typu
    setTimeout(() => {
      forceReinitialize();
    }, 100);
  };

  const toggleFlashMode = () => {
    console.log("🔄 Switching flash mode...");
    setFlashMode((current) => {
      switch (current) {
        case "off":
          return "on";
        case "on":
          return "auto";
        case "auto":
          return "off";
        default:
          return "off";
      }
    });
  };

  // Funkcja do wymuszenia reinicjalizacji kamery
  const forceReinitialize = () => {
    console.log("🔄 Force reinitializing camera...");
    setIsCameraReady(false);

    // Wyczyść referencję do kamery
    if (cameraRef.current) {
      cameraRef.current = null;
    }

    // Dłuższe opóźnienie dla wymuszonej reinicjalizacji
    setTimeout(() => {
      initializeCamera();
    }, 500);
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

  // Debug info - tylko w development
  if (__DEV__) {
    console.log("📊 Camera state:", {
      hasPermission,
      isCameraReady,
      isCapturing,
      cameraType,
      flashMode,
    });
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.message}>Sprawdzanie uprawnień aparatu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="camera" size={80} color={COLORS.error} />
          <Text style={styles.message}>Brak dostępu do aparatu</Text>
          <TouchableOpacity style={styles.button} onPress={initializeCamera}>
            <Text style={styles.buttonText}>Udziel uprawnień</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        {!isCameraReady && hasPermission && (
          <View style={styles.cameraLoading}>
            <Text style={styles.loadingText}>Inicjalizacja aparatu...</Text>
          </View>
        )}

        <CameraView
          ref={cameraRef}
          style={[styles.camera, !isCameraReady && styles.cameraHidden]}
          facing={cameraType}
          flash={flashMode}
          onCameraReady={() => {
            console.log("📷 Camera component ready");
            setIsCameraReady(true);
          }}
          onMountError={(error) => {
            console.error("❌ Camera mount error:", error);
            setIsCameraReady(false);
          }}
        />

        {/* Overlay z kontrolkami */}
        <View style={styles.overlay}>
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

            {!isCameraReady && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={forceReinitialize}
              >
                <Ionicons name="refresh" size={24} color={COLORS.white} />
              </TouchableOpacity>
            )}

            {__DEV__ && (
              <>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={checkCameraStatus}
                >
                  <Ionicons name="bug" size={24} color={COLORS.white} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={forceReinitialize}
                >
                  <Ionicons name="reload" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Dolne kontrolki */}
          <View style={styles.bottomControls}>
            <View style={styles.captureContainer}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  (isCapturing || !isCameraReady) &&
                    styles.captureButtonDisabled,
                ]}
                onPress={handleCapture}
                disabled={isCapturing || !isCameraReady}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  message: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    fontWeight: FONTS.weights.medium,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.glass,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  bottomControls: {
    paddingBottom: SPACING.xl,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.glass,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.glass,
  },
  captureContainer: {
    alignItems: "center",
  },
  captureButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.glass,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.primary,
    ...SHADOWS.glass,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  cameraLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
  },
  cameraHidden: {
    opacity: 0,
  },
});

export default CameraScreen;
