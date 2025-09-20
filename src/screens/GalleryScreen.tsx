import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
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
import BadgeGrid from "@/components/badges/BadgeGrid";
import StorageService from "@/services/storage";

type GalleryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "BadgeDetail"
>;

const GalleryScreen: React.FC = () => {
  const navigation = useNavigation<GalleryScreenNavigationProp>();
  const [badges, setBadges] = useState<StoredBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadBadges();
    }, [])
  );

  const loadBadges = async () => {
    try {
      setIsLoading(true);

      // Test FileSystem
      const fileSystemWorks = await StorageService.testFileSystem();
      if (!fileSystemWorks) {
        console.error("❌ FileSystem nie działa poprawnie");
        Alert.alert(
          "Błąd",
          "Problem z pamięcią aplikacji. Spróbuj uruchomić aplikację ponownie."
        );
        setBadges([]);
        return;
      }

      // Sprawdź i napraw system plików
      const repairResult = await StorageService.repairFileSystem();
      if (repairResult.repaired) {
        console.log("🔧 FileSystem naprawiony:", repairResult.message);
      }

      const allBadges = await BadgeService.getAllBadges();
      console.log("✅ Załadowano odznaki:", allBadges.length);
      setBadges(allBadges);
    } catch (error) {
      console.error("❌ Error loading badges:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się załadować kolekcji. Czy chcesz wyczyścić wszystkie dane?",
        [
          {
            text: "Anuluj",
            style: "cancel",
          },
          {
            text: "Wyczyść dane",
            style: "destructive",
            onPress: async () => {
              try {
                await StorageService.clearAllData();
                setBadges([]);
                Alert.alert("Sukces", "Wszystkie dane zostały wyczyszczone");
              } catch (clearError) {
                Alert.alert("Błąd", "Nie udało się wyczyścić danych");
              }
            },
          },
        ]
      );
      setBadges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBadges();
    setIsRefreshing(false);
  };

  const handleBadgePress = (badge: StoredBadge) => {
    navigation.navigate("BadgeDetail", { badge });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="images-outline"
          size={80}
          color={COLORS.textSecondary}
        />
      </View>
      <Text style={styles.emptyTitle}>Brak odznak</Text>
      <Text style={styles.emptyMessage}>
        Zrób zdjęcie zwierzęcia, aby rozpocząć kolekcję!
      </Text>
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => navigation.navigate("Main")}
      >
        <Ionicons name="camera" size={24} color={COLORS.white} />
        <Text style={styles.cameraButtonText}>Zrób zdjęcie</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen message="Ładowanie kolekcji..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header z tytułem */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Odznaki</Text>
      </View>

      {/* Grid odznak */}
      <BadgeGrid
        badges={badges}
        onBadgePress={handleBadgePress}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        numColumns={2}
        size="medium"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xxxl,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.grayLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 28,
    fontWeight: FONTS.weights.medium,
    paddingHorizontal: SPACING.lg,
  },
  cameraButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.medium,
  },
  cameraButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
});

export default GalleryScreen;
