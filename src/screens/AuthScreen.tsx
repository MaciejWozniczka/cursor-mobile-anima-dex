import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/utils/constants";
import { AuthState } from "@/types";
import AuthService from "@/services/auth";

interface AuthScreenProps {
  navigation: any;
  updateAuthState: (newState: AuthState) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  navigation,
  updateAuthState,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola");
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert("Błąd", "Wprowadź swoje imię");
      return;
    }

    setIsLoading(true);

    try {
      let result: AuthState;

      if (isLogin) {
        result = await AuthService.login(email, password);
      } else {
        result = await AuthService.register(email, password);
      }

      if (result.error) {
        Alert.alert("Błąd", result.error);
      } else if (!isLogin) {
        // Po udanej rejestracji pokaż komunikat i przełącz na logowanie
        Alert.alert(
          "Sukces",
          "Konto zostało utworzone pomyślnie! Możesz się teraz zalogować.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsLogin(true);
                setEmail("");
                setPassword("");
                setName("");
              },
            },
          ]
        );
      } else if (isLogin && result.isAuthenticated) {
        // Po udanym logowaniu zaktualizuj stan autoryzacji
        updateAuthState(result);
      }
      // Jeśli logowanie sukces, nawigacja nastąpi automatycznie przez AppNavigator
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="paw" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Animal Dex</Text>
            <Text style={styles.subtitle}>
              Odkryj świat zwierząt przez obiektyw
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Imię"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={COLORS.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Hasło"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading
                  ? "Ładowanie..."
                  : isLogin
                    ? "Zaloguj się"
                    : "Zarejestruj się"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleAuthMode}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Nie masz konta? Zarejestruj się"
                  : "Masz już konto? Zaloguj się"}
              </Text>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Zapomniałeś hasła?
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.glassPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.primary,
    marginBottom: SPACING.xl,
    ...SHADOWS.glass,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.md,
    fontWeight: FONTS.weights.medium,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.glass,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    marginTop: SPACING.xl,
    ...SHADOWS.glass,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semibold,
  },
  switchButton: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  switchText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: SPACING.md,
  },
  forgotPasswordText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
});

export default AuthScreen;
