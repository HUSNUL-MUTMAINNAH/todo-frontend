import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: any) => {
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      setErrorMsg(error.message || 'Login gagal. Silakan coba lagi.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    headerSection: {
      marginBottom: 32,
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    formSection: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 20,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      marginBottom: 24,
    },
    inputWrapper: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.background,
    },
    errorText: {
      color: '#E57373',
      fontSize: 12,
      marginTop: 4,
      fontWeight: '600',
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      paddingVertical: 6,
      marginTop: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    submitButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#1E1E24',
    },
    alertBox: {
      backgroundColor: '#FFEBEE',
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#E57373',
      padding: 12,
      marginBottom: 16,
    },
    alertText: {
      color: '#C62828',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    linkText: {
      color: colors.accent,
      fontWeight: 'bold',
      fontSize: 14,
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Masuk untuk mengelola tugas harian Anda secara produktif</Text>
        </View>

        <View style={styles.formSection}>
          {errorMsg && (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email wajib diisi',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Format email tidak valid'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  testID="login-email-input"
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textSecondary}
                  textColor={colors.textPrimary}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email-outline" />}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password wajib diisi',
                minLength: {
                  value: 8,
                  message: 'Password minimal terdiri dari 8 karakter'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  testID="login-password-input"
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  placeholder="Masukkan password Anda"
                  placeholderTextColor={colors.textSecondary}
                  textColor={colors.textPrimary}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          <Button
            testID="login-submit-button"
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
