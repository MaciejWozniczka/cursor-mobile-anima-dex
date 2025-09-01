import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/utils/constants";
import { User } from "@/types";
import AuthService from "@/services/auth";
import BadgeService from "@/services/badges";
import LoadingScreen from "@/components/common/LoadingScreen";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalBadges: 0,
    uniqueSpecies: 0,
    lastDiscovery: null as string | null,
    averageDiscoveriesPerDay: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      // Pobieranie danych użytkownika
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);

      // Pobieranie statystyk
      const collectionStats = await BadgeService.getCollectionStats();
      setStats(collectionStats);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Wylogowanie", "Czy na pewno chcesz się wylogować?", [
      {
        text: "Anuluj",
        style: "cancel",
      },
      {
        text: "Wyloguj",
        style: "destructive",
        onPress: async () => {
          try {
            await AuthService.logout();
            // Nawigacja nastąpi automatycznie przez AppNavigator
          } catch (error) {
            Alert.alert("Błąd", "Wystąpił błąd podczas wylogowania");
          }
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      "Wyczyść dane",
      "Czy na pewno chcesz usunąć wszystkie odznaki? Tej operacji nie można cofnąć.",
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Usuń wszystko",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await BadgeService.clearAllBadges();
              if (success) {
                Alert.alert("Sukces", "Wszystkie odznaki zostały usunięte");
                loadProfileData(); // Odświeżenie statystyk
              } else {
                Alert.alert("Błąd", "Nie udało się usunąć odznak");
              }
            } catch (error) {
              Alert.alert("Błąd", "Wystąpił błąd podczas usuwania danych");
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    // TODO: Implementacja eksportu (Phase 2)
    Alert.alert(
      "Informacja",
      "Funkcja eksportu będzie dostępna w przyszłej wersji"
    );
  };

  if (isLoading) {
    return <LoadingScreen message="Ładowanie profilu..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profil użytkownika */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBackground}>
              <Ionicons name="person" size={40} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || "Użytkownik"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Statystyki */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statystyki kolekcji</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{stats.totalBadges}</Text>
              <Text style={styles.statLabel}>Odznaki</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="paw" size={24} color={COLORS.secondary} />
              <Text style={styles.statValue}>{stats.uniqueSpecies}</Text>
              <Text style={styles.statLabel}>Gatunki</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color={COLORS.accent} />
              <Text style={styles.statValue}>
                {stats.averageDiscoveriesPerDay}
              </Text>
              <Text style={styles.statLabel}>Dziennie</Text>
            </View>
          </View>

          {stats.lastDiscovery && (
            <View style={styles.lastDiscovery}>
              <Text style={styles.lastDiscoveryLabel}>Ostatnie odkrycie:</Text>
              <Text style={styles.lastDiscoveryDate}>
                {new Date(stats.lastDiscovery).toLocaleDateString("pl-PL")}
              </Text>
            </View>
          )}
        </View>

        {/* Akcje */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Akcje</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.actionButtonText}>Eksportuj kolekcję</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
              Wyczyść wszystkie odznaki
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Informacje o aplikacji */}
        <View style={styles.appInfoSection}>
          <Text style={styles.sectionTitle}>O aplikacji</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Wersja</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Animal Dex</Text>
            <Text style={styles.infoValue}>Odkryj świat zwierząt</Text>
          </View>
        </View>

        {/* Wylogowanie */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.logoutButtonText}>Wyloguj się</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatarBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.glassPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.primary,
    ...SHADOWS.glass,
  },
  userName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  userEmail: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  statsSection: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.glass,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  statValue: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontWeight: FONTS.weights.medium,
  },
  lastDiscovery: {
    alignItems: "center",
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lastDiscoveryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  lastDiscoveryDate: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  actionsSection: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.glass,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionButtonText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  appInfoSection: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.glass,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.glass,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
});

export default ProfileScreen;
