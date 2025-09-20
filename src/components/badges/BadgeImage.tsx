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

  // Funkcja pomocnicza do generowania stylów placeholdera
  const getPlaceholderStyle = () => {
    const badgeType = badge.badgeType || 'standard';
    
    switch (badgeType) {
      case 'odyssey':
      case 'journey':
        return {
          backgroundColor: '#FFF3CD', // Jasny żółty
          iconColor: '#856404',
          icon: 'airplane',
        };
      case 'challenge':
      case 'scoop':
      case 'festival':
        return {
          backgroundColor: '#D1ECF1', // Jasny niebieski
          iconColor: '#0C5460',
          icon: 'star',
        };
      default:
        return {
          backgroundColor: '#F8F9FA', // Jasny szary
          iconColor: '#6C757D',
          icon: 'leaf',
        };
    }
  };

  // Funkcja pomocnicza do renderowania placeholdera
  const renderPlaceholder = () => {
    const placeholder = getPlaceholderStyle();
    
    return (
      <View
        style={[
          style,
          {
            backgroundColor: placeholder.backgroundColor,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: COLORS.border,
          },
        ]}
      >
        <Ionicons 
          name={placeholder.icon as any} 
          size={Math.min(24, (style?.width as number || 100) * 0.3)} 
          color={placeholder.iconColor} 
        />
      </View>
    );
  };

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
    return renderPlaceholder();
  }

  if (hasError || !imageUri) {
    if (showFallback) {
      return renderPlaceholder();
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
