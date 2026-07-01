import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Button, Portal, Modal, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { categoryService, Category } from '../../services/categoryService';

const AVAILABLE_COLORS = ['#4FB0C6', '#FF7A59', '#FFD54F', '#81C784', '#BA68C8', '#FF8A65', '#90A4AE', '#64B5F6'];
const AVAILABLE_ICONS = ['briefcase', 'book-open-page-variant', 'home', 'cart', 'heart', 'dumbbell', 'music', 'plane', 'food', 'cog'];

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Form states for creating/editing
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const fetched = await categoryService.getCategories();
      setCategories(fetched);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSelectedColor(AVAILABLE_COLORS[0]);
    setSelectedIcon(AVAILABLE_ICONS[0]);
    setErrorMsg(null);
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedColor(category.color);
    setSelectedIcon(category.icon);
    setErrorMsg(null);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!name || name.trim().length === 0) {
      setErrorMsg('Nama kategori wajib diisi.');
      return;
    }

    try {
      if (editingCategory) {
        // Edit category
        await categoryService.updateCategory(editingCategory.id, {
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon
        });
      } else {
        // Create category
        await categoryService.createCategory({
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon
        });
      }
      setModalVisible(false);
      loadCategories();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Gagal menyimpan kategori.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    addBtn: {
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 1.5, height: 1.5 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    addBtnText: {
      fontWeight: 'bold',
      color: '#1E1E24',
      fontSize: 12,
      marginLeft: 4,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    categoryGrid: {
      gap: 12,
    },
    categoryCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 42,
      height: 42,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    categoryNameText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    cardRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.card,
      margin: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 16,
      textAlign: 'center',
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    colorPaletteRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16,
      marginTop: 8,
    },
    colorCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    activeColorCircle: {
      borderWidth: 3,
      borderColor: colors.border,
      transform: [{ scale: 1.1 }],
    },
    iconSelectRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
      marginTop: 8,
    },
    iconBtnWrapper: {
      width: 38,
      height: 38,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeIconBtnWrapper: {
      backgroundColor: colors.primary,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalBtn: {
      flex: 0.48,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 8,
    },
    saveBtn: {
      backgroundColor: colors.accent,
    },
    cancelBtn: {
      backgroundColor: colors.background,
    },
    alertBox: {
      backgroundColor: '#FFEBEE',
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: '#E57373',
      padding: 10,
      marginBottom: 12,
    },
    alertText: {
      color: '#C62828',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kategori Tugas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <MaterialCommunityIcons name="plus" size={16} color="#1E1E24" />
          <Text style={styles.addBtnText}>Kategori</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.categoryGrid}>
          {categories.length === 0 ? (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontWeight: 'bold' }}>
              Belum ada kategori. Silakan buat baru.
            </Text>
          ) : (
            categories.map((cat) => (
              <View key={cat.id} style={styles.categoryCard}>
                <View style={styles.cardLeft}>
                  <View style={[styles.iconWrapper, { backgroundColor: cat.color }]}>
                    <MaterialCommunityIcons name={cat.icon as any} size={22} color="#1E1E24" />
                  </View>
                  <Text style={styles.categoryNameText}>{cat.name}</Text>
                </View>

                <View style={styles.cardRight}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    iconColor={colors.textPrimary}
                    onPress={() => openEditModal(cat)}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#E57373"
                    onPress={() => handleDelete(cat.id)}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit / Add Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>
            {editingCategory ? 'Edit Kategori' : 'Kategori Baru'}
          </Text>

          {errorMsg && (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Nama Kategori</Text>
          <TextInput
            mode="outlined"
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            placeholder="Contoh: Pekerjaan, Kuliah..."
            value={name}
            onChangeText={setName}
            textColor={colors.textPrimary}
            style={{ backgroundColor: colors.background, marginBottom: 16 }}
          />

          <Text style={styles.inputLabel}>Pilih Warna</Text>
          <View style={styles.colorPaletteRow}>
            {AVAILABLE_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  selectedColor === color && styles.activeColorCircle
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <Text style={styles.inputLabel}>Pilih Icon</Text>
          <View style={styles.iconSelectRow}>
            {AVAILABLE_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconBtnWrapper,
                  selectedIcon === icon && styles.activeIconBtnWrapper
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <MaterialCommunityIcons 
                  name={icon as any} 
                  size={20} 
                  color={selectedIcon === icon ? '#1E1E24' : colors.textPrimary} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={[styles.modalBtn, styles.cancelBtn]}
              textColor={colors.textPrimary}
              labelStyle={{ fontWeight: 'bold' }}
            >
              Batal
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[styles.modalBtn, styles.saveBtn]}
              labelStyle={{ fontWeight: 'bold', color: '#1E1E24' }}
            >
              Simpan
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
