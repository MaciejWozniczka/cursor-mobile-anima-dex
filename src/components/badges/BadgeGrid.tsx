import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';

import { COLORS, SPACING } from '@/utils/constants';
import { StoredBadge } from '@/types';
import BadgeCard from './BadgeCard';

interface BadgeGridProps {
  badges: StoredBadge[];
  onBadgePress: (badge: StoredBadge) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  numColumns?: number;
  size?: 'small' | 'medium' | 'large';
}

const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  onBadgePress,
  onRefresh,
  refreshing = false,
  numColumns = 2,
  size = 'medium',
}) => {
  const renderBadgeItem = ({ item }: { item: StoredBadge }) => (
    <BadgeCard
      badge={item}
      onPress={onBadgePress}
      size={size}
    />
  );

  const getItemLayout = (data: any, index: number) => {
    const itemHeight = size === 'small' ? 160 : size === 'large' ? 240 : 200;
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index,
    };
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={badges}
        renderItem={renderBadgeItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
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
    padding: SPACING.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default BadgeGrid;
