import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, User } from 'lucide-react-native';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function NameScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    console.log('📝 Updating user name...');
    setLoading(true);

    try {
      const { error } = await updateUserProfile({ name: name.trim() });
      
      if (error) {
        console.warn('⚠️ Name update had error:', error);
        // Continue anyway, show friendly message
        Alert.alert(
          'Almost There!',
          'We\'ll save your name once everything is set up. You can change it later in settings.',
          [{ text: 'Continue', onPress: () => router.push('/onboarding/quiz') }]
        );
      } else {
        console.log('✅ Name updated successfully');
        await refreshUser();
        router.push('/onboarding/quiz');
      }
    } catch (error) {
      console.warn('⚠️ Name update failed:', error);
      // Continue anyway
      router.push('/onboarding/quiz');
    } finally {
      setLoading(false);
    }
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
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <User size={60} color="#F59E0B" strokeWidth={1.5} />
        </View>
        
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          This helps us personalize your daily reflections.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus={true}
          />
        </View>
      </View>
      
      <Pressable 
        style={[styles.button, (!name.trim() || loading) && styles.buttonDisabled]} 
        onPress={handleContinue}
        disabled={!name.trim() || loading}
      >
        <LinearGradient
          colors={name.trim() && !loading ? ['#F59E0B', '#D97706'] : ['#6B7280', '#4B5563']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Continue'}
          </Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 280,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});