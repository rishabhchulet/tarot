import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { ArrowLeft, User } from 'lucide-react-native';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function NameScreen() {
  const { user, refreshUser } = useAuth();
  
  // Animation values
  const iconScale = useSharedValue(1);
  const iconOpacity = useSharedValue(0.8);
  
  React.useEffect(() => {
    // Start gentle pulse animation
    iconScale.value = withRepeat(
      withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    iconOpacity.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  
  // Create animated style
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
      opacity: iconOpacity.value,
    };
  });
  
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#F9FAFB" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Animated.View style={animatedIconStyle}>
            <User size={60} color="#1e3a8a" strokeWidth={1.5} />
          </Animated.View>
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
            placeholderTextColor="#6B7280"
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
        <View style={[styles.buttonSolid, (!name.trim() || loading) && styles.buttonSolidDisabled]}>
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Continue'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const animatedIconStyle = {
  transform: [{ scale: 1 }],
};

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
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
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
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
    textAlign: 'center',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSolid: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonSolidDisabled: {
    backgroundColor: '#4B5563',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
});