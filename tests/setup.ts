// Globalne mocki dla testów
import "react-native-gesture-handler/jestSetup";

// Mock dla react-native
jest.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  TextInput: "TextInput",
  TouchableOpacity: "TouchableOpacity",
  TouchableHighlight: "TouchableHighlight",
  ScrollView: "ScrollView",
  FlatList: "FlatList",
  RefreshControl: "RefreshControl",
  Image: "Image",
  ActivityIndicator: "ActivityIndicator",
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 400, height: 800 })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
  Animated: {
    View: "Animated.View",
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => "0deg"),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(),
    })),
    sequence: jest.fn((animations) => ({
      start: (callback: () => void) => {
        setTimeout(() => {
          callback();
        }, 0);
      },
    })),
  },
}));

// Mock dla expo-camera
jest.mock("expo-camera", () => ({
  CameraView: "CameraView",
  CameraType: {
    front: "front",
    back: "back",
  },
  FlashMode: {
    off: "off",
    on: "on",
    auto: "auto",
  },
}));

// Mock dla @react-navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock("@react-navigation/stack", () => ({
  StackNavigationProp: jest.fn(),
  RouteProp: jest.fn(),
}));

// Mock dla AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock dla react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  PanGestureHandler: "PanGestureHandler",
  TapGestureHandler: "TapGestureHandler",
  State: {},
}));

// Mock dla react-native-reanimated
jest.mock("react-native-reanimated", () => ({
  View: "ReanimatedView",
  Text: "ReanimatedText",
  Image: "ReanimatedImage",
  ScrollView: "ReanimatedScrollView",
  FlatList: "ReanimatedFlatList",
  TouchableOpacity: "ReanimatedTouchableOpacity",
  TouchableHighlight: "ReanimatedTouchableHighlight",
  TouchableWithoutFeedback: "ReanimatedTouchableWithoutFeedback",
  TouchableNativeFeedback: "ReanimatedTouchableNativeFeedback",
  Touchable: "ReanimatedTouchable",
}));

// Mocki dla @expo/vector-icons są dodawane w poszczególnych plikach testowych
