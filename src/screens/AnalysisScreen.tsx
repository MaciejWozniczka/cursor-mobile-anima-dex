import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
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
import { StoredBadge } from "@/types";
import BadgeService from "@/services/badges";
import LoadingScreen from "@/components/common/LoadingScreen";
import BadgeUnlockAnimation from "@/components/badges/BadgeUnlockAnimation";
import BadgeImage from "@/components/badges/BadgeImage";

type AnalysisScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Analysis"
>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, "Analysis">;

interface AnalysisScreenProps {
  navigation: AnalysisScreenNavigationProp;
  route: AnalysisScreenRouteProp;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  navigation,
  route,
}) => {
  const { photoUri } = route.params;

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [result, setResult] = useState<StoredBadge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    analyzePhoto();
  }, []);

  const analyzePhoto = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const badge = await BadgeService.discoverAnimal(photoUri);
      setResult(badge);

      // Pokaż animację po udanej analizie
      setShowAnimation(true);
    } catch (error) {
      console.error("Error analyzing photo:", error);
      setError(error instanceof Error ? error.message : "Nieznany błąd");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    analyzePhoto();
  };

  const handleViewBadge = () => {
    if (result) {
      navigation.navigate("BadgeDetail", { badge: result });
    }
  };

  const handleBackToCamera = () => {
    // Przejdź do kamery z resetowaniem
    navigation.navigate("Main", {
      screen: "Camera",
      params: { resetCamera: true },
    });
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const handleBadgePress = () => {
    // Przenieś do ekranu listy odznak (Gallery)
    navigation.navigate("Main", { screen: "Gallery" });
  };

  // Animacja zdobycia odznaki
  if (showAnimation && result) {
    return (
      <BadgeUnlockAnimation
        badge={result}
        visible={showAnimation}
        onAnimationComplete={handleAnimationComplete}
      />
    );
  }

  // Jeśli analiza się zakończyła sukcesem, pokaż szczegółowy widok
  if (!isAnalyzing && !error && result) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            {/* Zdjęcie w pionie */}
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            </View>

            {/* Sukces animacja */}
            <View style={styles.successAnimation}>
              <Ionicons
                name="checkmark-circle"
                size={60}
                color={COLORS.success}
              />
              <Text style={styles.successTitle}>Nowe odkrycie!</Text>
            </View>

            {/* Wynik analizy */}
            <View style={styles.resultCard}>
              <Text style={styles.animalName}>{result.animalName}</Text>
              <Text style={styles.animalDescription}>{result.description}</Text>
            </View>

            {/* Odznaka - klikalna */}
            <TouchableOpacity
              style={styles.badgeContainer}
              onPress={handleBadgePress}
              activeOpacity={0.8}
            >
              <BadgeImage badge={result} style={styles.badgeImage} />
              <Text style={styles.badgeLabel}>Nowa odznaka</Text>
              <Text style={styles.badgeHint}>
                Dotknij aby zobaczyć kolekcję
              </Text>
            </TouchableOpacity>

            {/* Akcje */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleViewBadge}
              >
                <Ionicons name="eye" size={20} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Zobacz szczegóły</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBackToCamera}
              >
                <Text style={styles.secondaryButtonText}>
                  Kontynuuj odkrywanie
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Domyślny widok z paskiem analizy lub błędem
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.analysisContainer}>
        {/* Zdjęcie w pionie podczas analizy */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        </View>

        {/* Poziomy pasek analizy na dole */}
        {isAnalyzing && (
          <View style={styles.analysisBar}>
            <View style={styles.analysisContent}>
              <Ionicons name="analytics" size={20} color={COLORS.white} />
              <Text style={styles.analysisText}>Analizuję zdjęcie...</Text>
            </View>
          </View>
        )}

        {/* Błąd analizy */}
        {!isAnalyzing && error && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle" size={60} color={COLORS.error} />
              <Text style={styles.errorTitle}>Błąd analizy</Text>
              <Text style={styles.errorMessage}>{error}</Text>

              <View style={styles.errorActions}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Ionicons name="refresh" size={20} color={COLORS.white} />
                  <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackToCamera}
                >
                  <Text style={styles.backButtonText}>Wróć do aparatu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  analysisContainer: {
    flex: 1,
    position: "relative",
  },
  // Kontener dla zdjęcia w pionie
  photoContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.6, // 60% wysokości ekranu
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.black,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Zachowaj proporcje, wyświetl w pionie
  },
  // Poziomy pasek analizy na dole ekranu
  analysisBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.large,
  },
  analysisContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  analysisText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
  // Overlay dla błędu analizy
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  errorContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    maxWidth: 300,
    ...SHADOWS.large,
  },
  errorTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.md,
    lineHeight: 24,
  },
  errorActions: {
    marginTop: SPACING.xl,
    width: "100%",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  successContainer: {
    padding: SPACING.lg,
  },
  successAnimation: {
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  successTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.success,
    marginTop: SPACING.lg,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  animalName: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  animalDescription: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    lineHeight: 28,
    fontWeight: FONTS.weights.medium,
  },
  badgeContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  badgeImage: {
    width: 140,
    height: 140,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  badgeLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.semibold,
    marginBottom: SPACING.xs,
  },
  badgeHint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  actions: {
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    alignItems: "center",
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
});

export default AnalysisScreen;
