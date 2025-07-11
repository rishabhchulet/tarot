import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react-native';
import { signIn } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

export default function SignInScreen() {
  const { user, session } = useAuth();

  useEffect(() => {
    if (user && session) {
      router.replace('/(tabs)');
    }
  }, [user, session]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const glowScale = useSharedValue(1);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
  }, []);
  
  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));

  const handleSignIn = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setError(error);
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#171717', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#e5e7eb" />
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Continue your inner journey.</Text>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={18} color="#fca5a5" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#6b7280" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#6b7280" secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} />
            <Pressable style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </Pressable>
          </View>

          <Pressable style={styles.forgotPassword} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleSignIn} disabled={loading}>
            <LinearGradient
              style={StyleSheet.absoluteFill}
              colors={loading ? ['#475569', '#64748b'] : ['#3B82F6', '#60A5FA']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
            <Text style={styles.signInButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </Pressable>

          <Pressable style={styles.signUpLink} onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signUpLinkText}>
              Don't have an account? <Text style={styles.linkHighlight}>Create one</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  glow: {
    position: 'absolute', top: '5%', left: '50%', width: 400, height: 400,
    backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: 200,
    transform: [{ translateX: -200 }],
  },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingTop: 60, paddingHorizontal: 24, zIndex: 1,
  },
  backButton: { alignSelf: 'flex-start' },
  formContainer: { paddingHorizontal: 32, paddingBottom: 40 },
  title: {
    fontSize: 32, fontFamily: 'Inter-Bold', color: '#F9FAFB',
    textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    fontSize: 18, fontFamily: 'Inter-Regular', color: '#9ca3af',
    textAlign: 'center', marginBottom: 32,
  },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    fontSize: 14, fontFamily: 'Inter-Medium', color: '#fca5a5', marginLeft: 12, flex: 1,
  },
  inputContainer: {
    marginBottom: 16, position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 18, fontSize: 16,
    fontFamily: 'Inter-Regular', color: '#F9FAFB',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eyeButton: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    justifyContent: 'center', paddingHorizontal: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end', marginTop: 8, marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14, fontFamily: 'Inter-Medium', color: '#60a5fa',
  },
  button: {
    borderRadius: 12, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  signInButtonText: {
    fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#F9FAFB',
  },
  signUpLink: {
    marginTop: 32, alignItems: 'center',
  },
  signUpLinkText: {
    fontSize: 14, fontFamily: 'Inter-Regular', color: '#9ca3af',
  },
  linkHighlight: {
    fontFamily: 'Inter-SemiBold', color: '#60a5fa',
  },
});