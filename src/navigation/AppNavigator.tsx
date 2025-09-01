import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, FONTS, SHADOWS } from "@/utils/constants";
import { AuthState, RootStackParamList, MainTabParamList } from "@/types";

// Screens
import AuthScreen from "@/screens/AuthScreen";
import CameraScreen from "@/screens/CameraScreen";
import GalleryScreen from "@/screens/GalleryScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import AnalysisScreen from "@/screens/AnalysisScreen";
import BadgeDetailScreen from "@/screens/BadgeDetailScreen";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

interface AppNavigatorProps {
  authState: AuthState;
  updateAuthState: (newState: AuthState) => void;
}

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Gallery"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Camera") {
            iconName = focused ? "camera" : "camera-outline";
          } else if (route.name === "Gallery") {
            iconName = focused ? "images" : "images-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          ...SHADOWS.medium,
        },
        tabBarLabelStyle: {
          fontSize: FONTS.sizes.xs,
          fontWeight: FONTS.weights.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          title: "Aparat",
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          title: "Kolekcja",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC<AppNavigatorProps> = ({
  authState,
  updateAuthState,
}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: FONTS.weights.semibold,
        },
        headerBackTitleVisible: false,
      }}
    >
      {!authState.isAuthenticated ? (
        // Auth Stack
        <Stack.Screen
          name="Auth"
          options={{
            headerShown: false,
          }}
        >
          {(props) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <AuthScreen {...props} updateAuthState={updateAuthState} />
          )}
        </Stack.Screen>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Analysis"
            component={AnalysisScreen}
            options={{
              title: "Analiza",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="BadgeDetail"
            component={BadgeDetailScreen}
            options={{
              title: "Szczegóły odznaki",
              headerShown: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
