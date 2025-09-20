import React from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";

import { COLORS, SPACING } from "@/utils/constants";
import { StoredBadge } from "@/types";
import BadgeCard from "./BadgeCard";

// eslint-disable-next-line react/require-default-props
interface BadgeGridProps {
  badges: StoredBadge[];
  onBadgePress: (badge: StoredBadge) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  numColumns?: number;
  size?: "small" | "medium" | "large";
}

const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  onBadgePress,
  onRefresh,
  refreshing = false,
  numColumns = 2,
  size = "medium",
}) => {
  const renderBadgeItem = ({ item }: { item: StoredBadge }) => (
    <BadgeCard badge={item} onPress={onBadgePress} size={size} />
  );

  const getItemLayout = (data: any, index: number) => {
    const itemHeight = size === "small" ? 160 : size === "large" ? 240 : 200;
    return {
      length: itemHeight,
      offset: itemHeight * Math.floor(index / numColumns),
      index,
    };
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🏆</Text>
      </View>
      <Text style={styles.emptyTitle}>Brak odznak</Text>
      <Text style={styles.emptyMessage}>
        Zrób zdjęcie zwierzęcia, aby rozpocząć kolekcję!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={badges}
        renderItem={renderBadgeItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        windowSize={10}
        initialNumToRender={9}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: SPACING.md,
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
  emptyIcon: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 28,
    paddingHorizontal: SPACING.lg,
  },
});

export default BadgeGrid;
