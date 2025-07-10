import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Save, User, Sun, Moon, Star } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/utils/auth';

const FOCUS_AREAS = [
  { id: 'inner_development', title: 'Inner Development', icon: Sun },
  { id: 'relationships', title: 'Relationships', icon: Moon },
  { id: 'career_finance', title: 'Career & Finance', icon: Star },
  { id: 'wellbeing', title: 'Wellbeing', icon: User },
];

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [selectedFocusArea, setSelectedFocusArea] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSelectedFocusArea(user.archetype || '');
    }
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile({ name: name.trim(), archetype: selectedFocusArea });
      await refreshUser();
      Alert.alert('Profile Saved', 'Your information has been updated.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [name, selectedFocusArea, refreshUser]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#171717', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#F3F4F6" />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <Pressable style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#A78BFA" /> : <Save size={24} color="#A78BFA" />}
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user?.email || ''}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Primary Focus</Text>
          <Text style={styles.subtitle}>This helps tailor your experience.</Text>
          <View style={styles.focusGrid}>
            {FOCUS_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = selectedFocusArea === area.id;
              return (
                <Pressable
                  key={area.id}
                  style={[styles.focusOption, isSelected && styles.focusOptionSelected]}
                  onPress={() => setSelectedFocusArea(area.id)}
                >
                  <Icon size={28} color={isSelected ? '#F9FAFB' : '#A1A1AA'} />
                  <Text style={[styles.focusOptionText, isSelected && styles.focusOptionTextSelected]}>
                    {area.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  title: { fontFamily: 'Inter-Bold', fontSize: 20, color: '#F9FAFB' },
  saveButton: { padding: 8 },
  scrollView: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  formGroup: { marginBottom: 32 },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#E4E4E7',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputDisabled: { color: '#6B7280' },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  focusOption: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  focusOptionSelected: {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderColor: 'rgba(167, 139, 250, 0.5)',
  },
  focusOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#A1A1AA',
  },
  focusOptionTextSelected: {
    color: '#F9FAFB',
    fontFamily: 'Inter-SemiBold',
  },
});