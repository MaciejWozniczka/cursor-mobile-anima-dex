import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/utils/constants";
import { StoredBadge } from "@/types";
import { formatDate } from "@/utils/helpers";
import BadgeImage from "./BadgeImage";

interface BadgeCardProps {
  badge: StoredBadge;
  onPress: (badge: StoredBadge) => void;
  size?: "small" | "medium" | "large";
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  onPress,
  size = "medium",
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: { width: 120, height: 160 },
          image: { width: 80, height: 80 },
          title: FONTS.sizes.sm,
        };
      case "large":
        return {
          container: { width: 200, height: 240 },
          image: { width: 140, height: 140 },
          title: FONTS.sizes.lg,
        };
      default:
        return {
          container: { width: 160, height: 200 },
          image: { width: 100, height: 100 },
          title: FONTS.sizes.md,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[styles.container, sizeStyles.container]}
      onPress={() => onPress(badge)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <BadgeImage badge={badge} style={[styles.image, sizeStyles.image]} />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, { fontSize: sizeStyles.title }]}
          numberOfLines={2}
        >
          {badge.animalName}
        </Text>

        <Text style={styles.date} numberOfLines={1}>
          {formatDate(badge.discoveredAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    margin: SPACING.xs,
    ...SHADOWS.small,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  image: {
    borderRadius: BORDER_RADIUS.sm,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default BadgeCard;
