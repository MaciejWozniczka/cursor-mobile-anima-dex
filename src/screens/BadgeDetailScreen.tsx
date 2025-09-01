import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
import { formatDateTime } from "@/utils/helpers";
import BadgeService from "@/services/badges";
import BadgeImage from "@/components/badges/BadgeImage";

type BadgeDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "BadgeDetail"
>;
type BadgeDetailScreenRouteProp = RouteProp<RootStackParamList, "BadgeDetail">;

interface BadgeDetailScreenProps {
  navigation: BadgeDetailScreenNavigationProp;
  route: BadgeDetailScreenRouteProp;
}

const BadgeDetailScreen: React.FC<BadgeDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { badge } = route.params;

  const handleDeleteBadge = () => {
    Alert.alert(
      "Usuń odznakę",
      `Czy na pewno chcesz usunąć odznakę "${badge.animalName}"?`,
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await BadgeService.deleteBadge(badge.id);
              if (success) {
                navigation.goBack();
              } else {
                Alert.alert("Błąd", "Nie udało się usunąć odznaki");
              }
            } catch (error) {
              Alert.alert("Błąd", "Wystąpił błąd podczas usuwania odznaki");
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    // TODO: Implementacja udostępniania (Phase 2)
    Alert.alert(
      "Informacja",
      "Funkcja udostępniania będzie dostępna w przyszłej wersji"
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Odznaka */}
        <View style={styles.badgeContainer}>
          <BadgeImage badge={badge} style={styles.badgeImage} />
        </View>

        {/* Informacje o zwierzęciu */}
        <View style={styles.infoContainer}>
          <Text style={styles.animalName}>{badge.animalName}</Text>
          <Text style={styles.animalDescription}>{badge.description}</Text>
        </View>

        {/* Szczegóły odkrycia */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Data odkrycia</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(badge.discoveredAt)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time" size={20} color={COLORS.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>ID odznaki</Text>
              <Text style={styles.detailValue}>{badge.id}</Text>
            </View>
          </View>
        </View>

        {/* Oryginalne zdjęcie (jeśli dostępne) */}
        {badge.originalPhoto && (
          <View style={styles.originalPhotoContainer}>
            <Text style={styles.sectionTitle}>Oryginalne zdjęcie</Text>
            <Image
              source={{ uri: badge.originalPhoto }}
              style={styles.originalPhoto}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Akcje */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={COLORS.primary} />
            <Text style={styles.shareButtonText}>Udostępnij</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteBadge}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Usuń odznakę</Text>
          </TouchableOpacity>
        </View>
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
  badgeContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  badgeImage: {
    width: 220,
    height: 220,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.glass,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.glass,
  },
  animalName: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  animalDescription: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    lineHeight: 28,
    textAlign: "center",
    fontWeight: FONTS.weights.medium,
  },
  detailsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.glass,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  detailContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  originalPhotoContainer: {
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
  originalPhoto: {
    width: "100%",
    height: 220,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  actionsContainer: {
    gap: SPACING.md,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.glass,
  },
  shareButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.error,
    ...SHADOWS.glass,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
});

export default BadgeDetailScreen;
