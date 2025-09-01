import React, { useState, useEffect } from "react";
import { Image, ImageStyle, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StoredBadge } from "@/types";
import StorageService from "@/services/storage";
import { COLORS } from "@/utils/constants";

// eslint-disable-next-line react/require-default-props
interface BadgeImageProps {
  badge: StoredBadge;
  style?: ImageStyle;
  showFallback?: boolean;
}

const BadgeImage: React.FC<BadgeImageProps> = ({
  badge,
  style,
  showFallback = true,
}) => {
  const [imageUri, setImageUri] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [badge]);

  const loadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Sprawdź czy imageBlob to ścieżka do pliku
      if (
        badge.imageBlob &&
        (badge.imageBlob.startsWith("file://") ||
          badge.imageBlob.startsWith("/"))
      ) {
        // To ścieżka do pliku - sprawdź czy istnieje
        const fileInfo = await StorageService.getBadgeImageUri(badge);
        if (fileInfo) {
          setImageUri(badge.imageBlob);
        } else {
          setHasError(true);
        }
      } else {
        // Jeśli to base64, spróbuj załadować przez StorageService
        const uri = await StorageService.getBadgeImageUri(badge);
        if (uri) {
          setImageUri(uri);
        } else {
          setHasError(true);
        }
      }
    } catch (error) {
      console.error("❌ Error loading badge image:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: COLORS.grayLight,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
          },
        ]}
      >
        <Ionicons name="image-outline" size={24} color={COLORS.gray} />
      </View>
    );
  }

  if (hasError || !imageUri) {
    if (showFallback) {
      return (
        <View
          style={[
            style,
            {
              backgroundColor: COLORS.grayLight,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 8,
            },
          ]}
        >
          <Ionicons name="image-outline" size={24} color={COLORS.gray} />
        </View>
      );
    }
    return null;
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={style}
      resizeMode="contain"
      onError={() => {
        console.error("❌ Image failed to load:", imageUri);
        setHasError(true);
      }}
      onLoad={() => {
        setIsLoading(false);
      }}
    />
  );
};

export default BadgeImage;
