import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming 
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function NameScreen() {
  const [name, setName] = useState('');
  const { user, refreshUser } = useAuth();
  const mascotScale = useSharedValue(1);
  const chatBubbleOpacity = useSharedValue(0);

  useEffect(() => {
    // Pre-fill with existing name if available
    if (user?.name) {
      setName(user.name);
    }

    // Animate mascot entrance
    mascotScale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    
    // Show chat bubble after mascot animation
    setTimeout(() => {
      chatBubbleOpacity.value = withTiming(1, { duration: 800 });
    }, 500);
  }, [user]);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Please enter your name', 'We\'d love to know what to call you on this journey.');
      return;
    }
    
    try {
      const { error } = await updateUserProfile({ name: name.trim() });
      
      if (error) {
        Alert.alert('Error', 'Failed to update your profile. Please try again.');
        return;
      }

      await refreshUser();
      router.push('/onboarding/quiz');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const animatedMascotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: mascotScale.value }],
    };
  });

  const animatedChatStyle = useAnimatedStyle(() => {
    return {
      opacity: chatBubbleOpacity.value,
    };
  });

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.mascotContainer, animatedMascotStyle]}>
          <View style={styles.mascot}>
            <Heart size={60} color="#F59E0B" fill="#F59E0B" />
          </View>
        </Animated.View>
        
        <Animated.View style={[styles.chatBubble, animatedChatStyle]}>
          <Text style={styles.chatText}>
            Hello there! I'm so excited to be your spiritual companion. 
            What should I call you?
          </Text>
          <View style={styles.chatArrow} />
        </Animated.View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      </View>
      
      <Pressable 
        style={[styles.button, !name.trim() && styles.buttonDisabled]} 
        onPress={handleContinue}
        disabled={!name.trim()}
      >
        <LinearGradient
          colors={name.trim() ? ['#F59E0B', '#D97706'] : ['#6B7280', '#4B5563']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    marginBottom: 30,
  },
  mascot: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  chatBubble: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
    maxWidth: 280,
    position: 'relative',
  },
  chatText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  chatArrow: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
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