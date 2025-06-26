import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Save, User, Mail, Heart } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/utils/auth';

const FOCUS_AREAS = [
  { id: 'spiritual', title: 'Spiritual Development', icon: Heart },
  { id: 'relationships', title: 'Relationships', icon: User },
  { id: 'money', title: 'Money & Resources', icon: Mail },
  { id: 'health', title: 'Physical & Mental Health', icon: Heart },
];

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [selectedFocusArea, setSelectedFocusArea] = useState(user?.focusArea || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setSelectedFocusArea(user.focusArea || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      console.log('💾 Updating profile...');
      const { error } = await updateUserProfile({
        name: name.trim(),
        focusArea: selectedFocusArea,
      });

      if (error) {
        console.error('❌ Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      } else {
        console.log('✅ Profile updated successfully');
        await refreshUser();
        Alert.alert(
          'Success',
          'Your profile has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            }
          ]
        );
      }
    } catch (error) {
      console.error('💥 Unexpected error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFocusAreaTitle = (id: string) => {
    const area = FOCUS_AREAS.find(area => area.id === id);
    return area ? area.title : 'Not selected';
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#F3F4F6" />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Focus Area</Text>
            <View style={styles.focusAreaContainer}>
              <Text style={styles.focusAreaText}>
                {getFocusAreaTitle(selectedFocusArea)}
              </Text>
              <Text style={styles.helperText}>
                This helps personalize your daily guidance
              </Text>
            </View>
            
            <View style={styles.focusOptions}>
              {FOCUS_AREAS.map((area) => {
                const IconComponent = area.icon;
                const isSelected = selectedFocusArea === area.id;
                
                return (
                  <Pressable
                    key={area.id}
                    style={[styles.focusOption, isSelected && styles.focusOptionSelected]}
                    onPress={() => setSelectedFocusArea(area.id)}
                  >
                    <View style={[styles.focusIconContainer, isSelected && styles.focusIconContainerSelected]}>
                      <IconComponent 
                        size={20} 
                        color={isSelected ? '#F59E0B' : '#9CA3AF'} 
                        strokeWidth={2}
                      />
                    </View>
                    <Text style={[styles.focusOptionTitle, isSelected && styles.focusOptionTitleSelected]}>
                      {area.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']}
              style={styles.saveButtonGradient}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#9CA3AF',
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 6,
  },
  focusAreaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  focusAreaText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  focusOptions: {
    gap: 12,
  },
  focusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  focusOptionSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#F59E0B',
  },
  focusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  focusIconContainerSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  focusOptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F3F4F6',
    flex: 1,
  },
  focusOptionTitleSelected: {
    color: '#F59E0B',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});