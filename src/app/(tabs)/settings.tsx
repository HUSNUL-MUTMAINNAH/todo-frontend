import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { TextInput, Button, Avatar, Divider } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster'
];

export default function SettingsScreen() {
  const { user, updateUser, changePassword, logout } = useAuth();
  const { colors, theme, toggleTheme, isDark } = useTheme();

  const [avatarUrl, setAvatarUrl] = useState(user?.photo || PRESET_AVATARS[0]);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Profile Form
  const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { isSubmitting: isProfileSubmitting } } = useForm({
    defaultValues: {
      fullname: user?.fullname || '',
      email: user?.email || '',
    }
  });

  // Password Form
  const { control: pwdControl, handleSubmit: handlePwdSubmit, reset: resetPwdForm, formState: { isSubmitting: isPwdSubmitting } } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    }
  });

  const onUpdateProfile = async (data: any) => {
    setProfileSuccess(null);
    setProfileError(null);
    try {
      await updateUser(data.fullname, data.email, avatarUrl);
      setProfileSuccess('Profil berhasil diperbarui!');
    } catch (err: any) {
      setProfileError(err.message || 'Gagal memperbarui profil.');
    }
  };

  const onChangePassword = async (data: any) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    try {
      await changePassword(data.oldPassword, data.newPassword);
      setPasswordSuccess('Password berhasil diubah!');
      resetPwdForm();
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah password.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar Aplikasi',
      'Apakah Anda yakin ingin keluar dari akun Anda?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive', 
          onPress: async () => {
            console.log('🔐 User confirmed logout');
            try {
              await logout();
              console.log('✅ Logout successful');
            } catch (error) {
              console.error('❌ Logout failed:', error);
              Alert.alert('Error', 'Gagal keluar dari akun. Coba lagi.');
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginTop: 12,
    },
    presetAvatarBtn: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 24,
      overflow: 'hidden',
    },
    activePresetAvatarBtn: {
      borderColor: colors.accent,
      borderWidth: 3,
    },
    inputWrapper: {
      marginBottom: 12,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    input: {
      backgroundColor: colors.background,
    },
    saveBtn: {
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 10,
      marginTop: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    saveBtnText: {
      fontWeight: 'bold',
      color: '#1E1E24',
    },
    themeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    alertSuccess: {
      backgroundColor: '#E8F5E9',
      borderWidth: 1.5,
      borderColor: '#81C784',
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
    alertSuccessText: {
      color: '#2E7D32',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    alertError: {
      backgroundColor: '#FFEBEE',
      borderWidth: 1.5,
      borderColor: '#E57373',
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
    alertErrorText: {
      color: '#C62828',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    logoutBtn: {
      borderColor: '#C62828',
      borderWidth: 2,
      borderRadius: 10,
      backgroundColor: '#FFEBEE',
      paddingVertical: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pengaturan Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Details Edit Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ubah Profil</Text>

          {profileSuccess && (
            <View style={styles.alertSuccess}>
              <Text style={styles.alertSuccessText}>{profileSuccess}</Text>
            </View>
          )}

          {profileError && (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{profileError}</Text>
            </View>
          )}

          {/* Avatar Selection */}
          <View style={styles.avatarSection}>
            <Avatar.Image size={72} source={{ uri: avatarUrl }} style={{ borderWidth: 2, borderColor: colors.border, backgroundColor: '#FFFFFF' }} />
            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Pilih Avatar Profil</Text>
            <View style={styles.avatarRow}>
              {PRESET_AVATARS.map((url, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.presetAvatarBtn, avatarUrl === url && styles.activePresetAvatarBtn]}
                  onPress={() => setAvatarUrl(url)}
                >
                  <Avatar.Image size={40} source={{ uri: url }} style={{ backgroundColor: '#FFFFFF' }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <Controller
              control={profileControl}
              name="fullname"
              rules={{ required: 'Nama lengkap wajib diisi' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  textColor={colors.textPrimary}
                />
              )}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <Controller
              control={profileControl}
              name="email"
              rules={{ required: 'Email wajib diisi' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  textColor={colors.textPrimary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleProfileSubmit(onUpdateProfile)}
            loading={isProfileSubmitting}
            disabled={isProfileSubmitting}
            style={styles.saveBtn}
            labelStyle={styles.saveBtnText}
          >
            Simpan Profil
          </Button>
        </View>

        {/* Change Password Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ubah Password</Text>

          {passwordSuccess && (
            <View style={styles.alertSuccess}>
              <Text style={styles.alertSuccessText}>{passwordSuccess}</Text>
            </View>
          )}

          {passwordError && (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{passwordError}</Text>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password Lama</Text>
            <Controller
              control={pwdControl}
              name="oldPassword"
              rules={{ required: 'Password lama wajib diisi' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  secureTextEntry
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  textColor={colors.textPrimary}
                  placeholder="Masukkan password saat ini"
                  placeholderTextColor={colors.textSecondary}
                />
              )}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password Baru</Text>
            <Controller
              control={pwdControl}
              name="newPassword"
              rules={{
                required: 'Password baru wajib diisi',
                minLength: { value: 8, message: 'Password baru minimal 8 karakter' }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  secureTextEntry
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  textColor={colors.textPrimary}
                  placeholder="Minimal 8 karakter"
                  placeholderTextColor={colors.textSecondary}
                />
              )}
            />
          </View>

          <Button
            mode="contained"
            onPress={handlePwdSubmit(onChangePassword)}
            loading={isPwdSubmitting}
            disabled={isPwdSubmitting}
            style={styles.saveBtn}
            labelStyle={styles.saveBtnText}
          >
            Ganti Password
          </Button>
        </View>

        {/* Application Preferences Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tampilan & Preferensi</Text>
          <View style={styles.themeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons 
                name={isDark ? "weather-night" : "weather-sunny"} 
                size={22} 
                color={colors.textPrimary} 
              />
              <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 'bold', marginLeft: 10 }}>
                Mode Gelap (Dark Mode)
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CCCCCC', true: colors.primary }}
              thumbColor={isDark ? colors.accent : '#F4F3F4'}
            />
          </View>
        </View>

        {/* Sign out */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutBtn}
          textColor="#C62828"
          labelStyle={{ fontWeight: 'bold' }}
          icon="logout"
        >
          Keluar dari Akun
        </Button>
      </ScrollView>
    </View>
  );
}
