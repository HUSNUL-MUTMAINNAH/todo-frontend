import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { taskService, Task } from '../../../services/taskService';
import { categoryService, Category } from '../../../services/categoryService';
import { scheduleTaskReminder, cancelTaskReminder } from '../../../utils/notifications';

export default function EditTaskScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Date and Time picker states
  const [deadlineDate, setDeadlineDate] = useState<Date>(new Date());
  const [deadlineTime, setDeadlineTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      priority: 'Medium',
      status: 'Pending',
      reminder_type: 'none',
    }
  });

  const selectedPriority = watch('priority');
  const selectedStatus = watch('status');
  const selectedReminderType = watch('reminder_type');
  const selectedCategoryId = watch('category_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedTask, fetchedCategories] = await Promise.all([
          taskService.getTaskById(id as string),
          categoryService.getCategories()
        ]);
        
        setCategories(fetchedCategories);

        // Prepopulate form fields
        reset({
          title: fetchedTask.title,
          description: fetchedTask.description || '',
          category_id: fetchedTask.category_id ? String(fetchedTask.category_id) : '',
          priority: fetchedTask.priority,
          status: fetchedTask.status,
          reminder_type: fetchedTask.reminder_type,
        });

        // Set Date and Time pickers
        if (fetchedTask.deadline_date) {
          setDeadlineDate(new Date(fetchedTask.deadline_date));
        }
        if (fetchedTask.deadline_time) {
          // Construct date object for time picker using HH:MM:SS
          const [h, m, s] = fetchedTask.deadline_time.split(':');
          const t = new Date();
          t.setHours(Number(h));
          t.setMinutes(Number(m));
          t.setSeconds(Number(s || 0));
          setDeadlineTime(t);
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to load task for editing:', error);
        setErrorMsg('Gagal memuat data tugas.');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const onDateChange = (event: any, selectedDateValue?: Date) => {
    setShowDatePicker(false);
    if (selectedDateValue) {
      setDeadlineDate(selectedDateValue);
    }
  };

  const onTimeChange = (event: any, selectedTimeValue?: Date) => {
    setShowTimePicker(false);
    if (selectedTimeValue) {
      setDeadlineTime(selectedTimeValue);
    }
  };

  const calculateReminderDateTime = (date: Date, time: Date, reminderType: string): Date | null => {
    if (reminderType === 'none') return null;

    const deadline = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      0
    );

    const reminder = new Date(deadline);

    switch (reminderType) {
      case '15_min':
        reminder.setMinutes(deadline.getMinutes() - 15);
        break;
      case '30_min':
        reminder.setMinutes(deadline.getMinutes() - 30);
        break;
      case '1_hour':
        reminder.setHours(deadline.getHours() - 1);
        break;
      case '3_hours':
        reminder.setHours(deadline.getHours() - 3);
        break;
      case '1_day':
        reminder.setDate(deadline.getDate() - 1);
        break;
      case 'exact':
        break;
    }

    return reminder;
  };

  const onSubmit = async (data: any) => {
    setErrorMsg(null);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const deadlineDateStr = deadlineDate.toISOString().split('T')[0];
      
      // 1. Validate deadline date not in past
      if (deadlineDateStr < todayStr) {
        setErrorMsg('Tanggal deadline tidak boleh kurang dari tanggal saat ini.');
        return;
      }

      // Format time as HH:MM:SS
      const hours = String(deadlineTime.getHours()).padStart(2, '0');
      const minutes = String(deadlineTime.getMinutes()).padStart(2, '0');
      const deadlineTimeStr = `${hours}:${minutes}:00`;

      // 2. Validate reminder is before deadline
      let reminderDateTimeStr: string | null = null;
      if (data.reminder_type !== 'none') {
        const reminderDate = calculateReminderDateTime(deadlineDate, deadlineTime, data.reminder_type);
        const deadlineDateObj = new Date(
          deadlineDate.getFullYear(),
          deadlineDate.getMonth(),
          deadlineDate.getDate(),
          deadlineTime.getHours(),
          deadlineTime.getMinutes()
        );

        if (reminderDate) {
          if (reminderDate >= deadlineDateObj) {
            setErrorMsg('Waktu reminder harus sebelum waktu deadline.');
            return;
          }
          
          if (reminderDate <= new Date()) {
            setErrorMsg('Waktu reminder sudah lewat. Harap pilih deadline atau reminder lain.');
            return;
          }
          const year = reminderDate.getFullYear();
          const month = String(reminderDate.getMonth() + 1).padStart(2, '0');
          const day = String(reminderDate.getDate()).padStart(2, '0');
          const hrs = String(reminderDate.getHours()).padStart(2, '0');
          const mins = String(reminderDate.getMinutes()).padStart(2, '0');
          reminderDateTimeStr = `${year}-${month}-${day} ${hrs}:${mins}:00`;
        }
      }

      // 3. Update task
      const updatedTask = await taskService.updateTask(id as string, {
        title: data.title,
        description: data.description,
        category_id: data.category_id ? Number(data.category_id) : null,
        priority: data.priority as any,
        status: data.status as any,
        deadline_date: deadlineDateStr,
        deadline_time: deadlineTimeStr,
        reminder_type: data.reminder_type,
        reminder_datetime: reminderDateTimeStr
      });

      // 4. Update scheduled notification
      if (updatedTask.status === 'Completed' || updatedTask.reminder_type === 'none') {
        await cancelTaskReminder(updatedTask.id);
      } else if (updatedTask.reminder_datetime) {
        await scheduleTaskReminder(updatedTask.id, updatedTask.title, new Date(updatedTask.reminder_datetime));
      }

      router.back();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Gagal memperbarui tugas. Coba lagi.');
    }
  };

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTimeLabel = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginLeft: 12,
    },
    scrollContent: {
      padding: 20,
    },
    formBlock: {
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
    fieldLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    inputWrapper: {
      marginBottom: 16,
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
    dateTimeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    dateTimeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      backgroundColor: colors.background,
      flex: 0.48,
    },
    dateTimeBtnText: {
      fontSize: 13,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginLeft: 8,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    pill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    activePill: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    activePillText: {
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
    submitButton: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      paddingVertical: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    submitText: {
      fontWeight: 'bold',
      color: '#1E1E24',
      fontSize: 16,
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Tugas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {errorMsg && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>{errorMsg}</Text>
          </View>
        )}

        <View style={styles.formBlock}>
          {/* Title */}
          <View style={styles.inputWrapper}>
            <Text style={styles.fieldLabel}>Judul Tugas</Text>
            <Controller
              control={control}
              name="title"
              rules={{
                required: 'Judul tugas wajib diisi',
                minLength: {
                  value: 3,
                  message: 'Judul tugas minimal terdiri dari 3 karakter'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  placeholder="Masukkan judul tugas..."
                  placeholderTextColor={colors.textSecondary}
                  textColor={colors.textPrimary}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputWrapper}>
            <Text style={styles.fieldLabel}>Catatan / Deskripsi</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  placeholder="Masukkan detail catatan..."
                  placeholderTextColor={colors.textSecondary}
                  textColor={colors.textPrimary}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* Status Picker */}
          <View style={styles.inputWrapper}>
            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.pillRow}>
              {[
                { value: 'Pending', label: 'To Do' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Overdue', label: 'Overdue' }
              ].map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.pill, selectedStatus === s.value && styles.activePill]}
                  onPress={() => setValue('status', s.value as any)}
                >
                  <Text style={[styles.pillText, selectedStatus === s.value && styles.activePillText]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Picker */}
          {categories.length > 0 && (
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Kategori</Text>
              <View style={styles.pillRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.pill,
                      selectedCategoryId === String(cat.id) && { backgroundColor: cat.color || colors.primary }
                    ]}
                    onPress={() => setValue('category_id', String(cat.id))}
                  >
                    <Text style={[styles.pillText, selectedCategoryId === String(cat.id) && styles.activePillText]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Priority Pill Selector */}
          <View style={styles.inputWrapper}>
            <Text style={styles.fieldLabel}>Prioritas</Text>
            <View style={styles.pillRow}>
              {['Low', 'Medium', 'High'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.pill, selectedPriority === p && styles.activePill]}
                  onPress={() => setValue('priority', p)}
                >
                  <Text style={[styles.pillText, selectedPriority === p && styles.activePillText]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Deadline Date & Time Buttons */}
          <Text style={styles.fieldLabel}>Deadline</Text>
          <View style={styles.dateTimeRow}>
            {Platform.OS === 'web' ? (
              <>
                <View style={[styles.dateTimeBtn, { overflow: 'hidden' }]}>
                  <MaterialCommunityIcons name="calendar" size={20} color={colors.textPrimary} />
                  <input
                    type="date"
                    value={deadlineDate.toISOString().split('T')[0]}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e: any) => {
                      if (e.target.value) setDeadlineDate(new Date(e.target.value + 'T00:00:00'));
                    }}
                    style={{ border: 'none', background: 'transparent', color: colors.textPrimary, fontWeight: 'bold', fontSize: 13, marginLeft: 8, cursor: 'pointer', outline: 'none' }}
                  />
                </View>
                <View style={[styles.dateTimeBtn, { overflow: 'hidden' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={colors.textPrimary} />
                  <input
                    type="time"
                    value={`${String(deadlineTime.getHours()).padStart(2,'0')}:${String(deadlineTime.getMinutes()).padStart(2,'0')}`}
                    onChange={(e: any) => {
                      if (e.target.value) {
                        const [h, m] = e.target.value.split(':');
                        const t = new Date();
                        t.setHours(Number(h)); t.setMinutes(Number(m));
                        setDeadlineTime(t);
                      }
                    }}
                    style={{ border: 'none', background: 'transparent', color: colors.textPrimary, fontWeight: 'bold', fontSize: 13, marginLeft: 8, cursor: 'pointer', outline: 'none' }}
                  />
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowDatePicker(true)}>
                  <MaterialCommunityIcons name="calendar" size={20} color={colors.textPrimary} />
                  <Text style={styles.dateTimeBtnText}>{formatDateLabel(deadlineDate)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowTimePicker(true)}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={colors.textPrimary} />
                  <Text style={styles.dateTimeBtnText}>{formatTimeLabel(deadlineTime)}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Reminder Dropdown */}
          <View style={styles.inputWrapper}>
            <Text style={styles.fieldLabel}>Atur Pengingat</Text>
            <View style={styles.pillRow}>
              {[
                { label: 'Tidak Ada', value: 'none' },
                { label: 'Tepat Waktu', value: 'exact' },
                { label: '15 Menit', value: '15_min' },
                { label: '30 Menit', value: '30_min' },
                { label: '1 Jam', value: '1_hour' },
                { label: '3 Jam', value: '3_hours' },
                { label: '1 Hari', value: '1_day' }
              ].map((rem) => (
                <TouchableOpacity
                  key={rem.value}
                  style={[styles.pill, selectedReminderType === rem.value && styles.activePill]}
                  onPress={() => setValue('reminder_type', rem.value)}
                >
                  <Text style={[styles.pillText, selectedReminderType === rem.value && styles.activePillText]}>
                    {rem.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            labelStyle={styles.submitText}
          >
            Simpan Perubahan
          </Button>
        </View>
      </ScrollView>

      {/* Date & Time Picker Triggers (native only) */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={deadlineDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          value={deadlineTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </KeyboardAvoidingView>
  );
}
