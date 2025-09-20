import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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

// eslint-disable-next-line react/require-default-props
interface BadgeCardProps {
  badge: StoredBadge;
  onPress: (badge: StoredBadge) => void;
  size?: "small" | "medium" | "large";
}

const BadgeCard = ({ badge, onPress, size = "medium" }: BadgeCardProps) => {
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

  const getBadgeStyle = () => {
    const badgeType = badge.badgeType || 'standard';
    
    switch (badgeType) {
      case 'odyssey':
      case 'journey':
        return {
          borderColor: COLORS.badgeOdyssey,
          borderWidth: 3,
          backgroundColor: COLORS.white,
        };
      case 'challenge':
      case 'scoop':
      case 'festival':
        return {
          borderColor: COLORS.badgeChallenge,
          borderWidth: 3,
          backgroundColor: COLORS.white,
        };
      default:
        return {
          borderColor: COLORS.badgeStandard,
          borderWidth: 1,
          backgroundColor: COLORS.white,
        };
    }
  };

  const getBadgeIcon = () => {
    const badgeType = badge.badgeType || 'standard';
    
    switch (badgeType) {
      case 'odyssey':
      case 'journey':
        return {
          icon: 'diamond',
          color: COLORS.black,
          size: 16,
        };
      case 'challenge':
      case 'scoop':
      case 'festival':
        return {
          icon: 'diamond',
          color: COLORS.badgeChallenge,
          size: 16,
        };
      default:
        return null;
    }
  };

  const getSpecialIcon = () => {
    if (badge.specialIcon === '50') {
      return {
        icon: '50',
        color: COLORS.black,
        size: 14,
      };
    }
    return null;
  };

  const sizeStyles = getSizeStyles();
  const badgeStyle = getBadgeStyle();
  const badgeIcon = getBadgeIcon();
  const specialIcon = getSpecialIcon();

  return (
    <TouchableOpacity
      style={[styles.container, sizeStyles.container, badgeStyle]}
      onPress={() => onPress(badge)}
      activeOpacity={0.8}
      testID="badge-card"
    >
      <View style={styles.imageContainer}>
        <BadgeImage
          badge={badge}
          style={[styles.image, sizeStyles.image] as any}
        />
        
        {/* Baner z tekstem (np. "Big Ben", "Chichen Itza") */}
        {badge.overlayText && (
          <View style={styles.overlayBanner}>
            <Text style={styles.overlayText}>{badge.overlayText}</Text>
          </View>
        )}
        
        {/* Specjalna ikona odznaki (np. diament) */}
        {badgeIcon && (
          <View style={styles.badgeIconContainer}>
            <Ionicons 
              name={badgeIcon.icon as any} 
              size={badgeIcon.size} 
              color={badgeIcon.color} 
            />
          </View>
        )}
        
        {/* Specjalna ikona (np. "50") */}
        {specialIcon && (
          <View style={styles.specialIconContainer}>
            <Text style={styles.specialIconText}>{specialIcon.icon}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, { fontSize: sizeStyles.title }]}
          numberOfLines={2}
        >
          {badge.category || badge.animalName}
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
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    margin: SPACING.xs,
    ...SHADOWS.small,
    position: 'relative',
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
    position: 'relative',
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
  overlayBanner: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  overlayText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
  },
  badgeIconContainer: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specialIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specialIconText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
  },
});

BadgeCard.defaultProps = {
  size: "medium",
};

export default BadgeCard;
