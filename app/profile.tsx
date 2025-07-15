import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Save, User, Sun, Moon, Star, Sparkles } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/utils/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FOCUS_AREAS = [
  { 
    id: 'inner_development', 
    title: 'Inner\nDevelopment', 
    icon: Sun,
    color: '#3b82f6',
    description: 'Personal growth & self-discovery'
  },
  { 
    id: 'relationships', 
    title: 'Relationships', 
    icon: Moon,
    color: '#8b5cf6',
    description: 'Love, family & connections'
  },
  { 
    id: 'career_finance', 
    title: 'Career &\nFinance', 
    icon: Star,
    color: '#06b6d4',
    description: 'Professional & material success'
  },
  { 
    id: 'wellbeing', 
    title: 'Wellbeing', 
    icon: User,
    color: '#10b981',
    description: 'Health, balance & vitality'
  },
];

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [selectedFocusArea, setSelectedFocusArea] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSelectedFocusArea(user.focusArea || '');
    }
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile({ name: name.trim(), focusArea: selectedFocusArea });
      await refreshUser();
      Alert.alert('Profile Saved', 'Your information has been updated.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [name, selectedFocusArea, refreshUser]);

  return (
    <View style={styles.container}>
      {/* Enhanced gradient background */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Enhanced header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backButtonInner}>
            <ArrowLeft size={22} color="#f8fafc" />
          </View>
        </Pressable>
        
        <View style={styles.titleContainer}>
          <Sparkles size={20} color="#3b82f6" />
          <Text style={styles.title}>Edit Profile</Text>
        </View>
        
        <Pressable 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave} 
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#6b7280', '#4b5563'] : ['#3b82f6', '#2563eb']}
            style={styles.saveButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#f8fafc" />
            ) : (
              <>
                <Save size={18} color="#f8fafc" />
                <Text style={styles.saveButtonText}>Save</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={18} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email || ''}
                editable={false}
                placeholder="Email address"
                placeholderTextColor="#475569"
              />
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>
        </View>

        {/* Focus Area Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={18} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Primary Focus</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Choose your main area of interest to personalize your experience and receive tailored insights.
          </Text>
          
          <View style={styles.focusGrid}>
            {FOCUS_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = selectedFocusArea === area.id;
              return (
                <Pressable
                  key={area.id}
                  style={[
                    styles.focusOption, 
                    isSelected && [styles.focusOptionSelected, { borderColor: area.color }]
                  ]}
                  onPress={() => setSelectedFocusArea(area.id)}
                >
                  <LinearGradient
                    colors={isSelected 
                      ? [`${area.color}30`, `${area.color}20`] 
                      : ['rgba(30, 41, 59, 0.6)', 'rgba(30, 41, 59, 0.4)']
                    }
                    style={styles.focusOptionGradient}
                  >
                    <View style={[
                      styles.focusIconContainer,
                      isSelected && { backgroundColor: `${area.color}20` }
                    ]}>
                      <Icon 
                        size={24} 
                        color={isSelected ? area.color : '#64748b'} 
                      />
                    </View>
                    
                    <Text style={[
                      styles.focusOptionTitle, 
                      isSelected && { color: area.color }
                    ]}>
                      {area.title}
                    </Text>
                    
                    <Text style={[
                      styles.focusOptionDescription,
                      isSelected && styles.focusOptionDescriptionSelected
                    ]}>
                      {area.description}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#f8fafc',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#f8fafc',
  },
  sectionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  inputWrapperDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#f8fafc',
  },
  inputDisabled: {
    color: '#64748b',
  },
  helperText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  focusGrid: {
    gap: 16,
  },
  focusOption: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.5)',
  },
  focusOptionSelected: {
    borderWidth: 2,
  },
  focusOptionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  focusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  focusOptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  focusOptionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  focusOptionDescriptionSelected: {
    color: '#94a3b8',
  },
  footer: {
    height: 20,
  },
});