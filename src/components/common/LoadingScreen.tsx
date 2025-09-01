import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/utils/constants";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Ładowanie..." }: LoadingScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  message: {
    marginTop: SPACING.lg,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontWeight: FONTS.weights.medium,
  },
});

LoadingScreen.defaultProps = {
  message: "Ładowanie...",
};

export default LoadingScreen;
