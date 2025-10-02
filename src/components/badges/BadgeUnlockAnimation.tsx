import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";

import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/utils/constants";
import { StoredBadge } from "@/types";
import BadgeImage from "./BadgeImage";

interface BadgeUnlockAnimationProps {
  badge: StoredBadge;
  visible: boolean;
  onAnimationComplete: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BadgeUnlockAnimation: React.FC<BadgeUnlockAnimationProps> = ({
  badge,
  visible,
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      startAnimation();
    }
  }, [visible]);

  const startAnimation = () => {
    // Reset animations
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    rotateAnim.setValue(0);
    textOpacityAnim.setValue(0);

    // Sequence of animations
    Animated.sequence([
      // Initial scale and opacity
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Bounce effect
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Rotation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Show text
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wait a bit then complete
      setTimeout(() => {
        onAnimationComplete();
      }, 2000);
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
          },
        ]}
      >
        <View style={styles.badgeContainer}>
          <BadgeImage
            badge={badge}
            style={styles.badgeImage}
            showFallback={false}
          />
        </View>

        <Animated.View
          style={[styles.textContainer, { opacity: textOpacityAnim }]}
        >
          <Text style={styles.title}>Nowa odznaka!</Text>
          <Text style={styles.animalName}>{badge.animalName}</Text>
          <Text style={styles.description}>Odkryłeś nowe zwierzę!</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    maxWidth: SCREEN_WIDTH * 0.8,
    ...SHADOWS.large,
  },
  badgeContainer: {
    marginBottom: SPACING.lg,
  },
  badgeImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Okrągły kształt (połowa szerokości/wysokości)
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  animalName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default BadgeUnlockAnimation;
