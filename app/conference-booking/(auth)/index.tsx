import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "../theme/_colors";

const LOGO = require("../../../assets/images/smartspace-logo.png");

export default function ConferenceBookingLogin() {
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // For now, just navigate to the authenticated tabs; auth wiring can be added later.
    router.replace("/conference-booking/(tabs)/home");
  };

  const handleCreateAccount = () => {
    router.push("/conference-booking/(auth)/sign-up");
  };

  const handleForgotPassword = () => {
    router.push("/conference-booking/(auth)/forgot-password");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />

        <View style={styles.formHeader}>
          <Text style={styles.title}>Log In</Text>
          <Text style={styles.subtitle}>Enter your staff ID to log in</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Staff ID</Text>
          <TextInput
            value={staffId}
            onChangeText={setStaffId}
            placeholder="ERT567"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>Create an Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 420,
  },
  logo: {
    width: 200,
    height: 44,
    alignSelf: "center",
    marginBottom: 56,
  },
  formHeader: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: "#F9FAFB",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberMeText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
});
