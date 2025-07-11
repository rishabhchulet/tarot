import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react-native';
import { signUp } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

export default function SignUpScreen() {
  const { user, session } = useAuth();

  useEffect(() => {
    if (user && session) {
      router.replace('/(tabs)');
    }
  }, [user, session]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSignUp = async () => {
    setError(null);
    if (!name.trim()) { setError("Please enter your name."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password, name.trim());
      if (error) {
        setError(error);
      } else {
        router.replace('/onboarding/welcome');
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
          <Pressable style={styles.backButton} onPress={() => router.back()} disabled={loading}>
            <ArrowLeft size={24} color={loading ? "#6b7280" : "#e5e7eb"} />
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Begin your inner journey.</Text>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={18} color="#fca5a5" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your Name" placeholderTextColor="#6b7280" autoCapitalize="words" editable={!loading} /></View>
          <View style={styles.inputContainer}><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email Address" placeholderTextColor="#6b7280" keyboardType="email-address" autoCapitalize="none" editable={!loading} /></View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#6b7280" secureTextEntry={!showPassword} editable={!loading} />
            <Pressable style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)} disabled={loading}><EyeOff size={20} color={showPassword ? "#e5e7eb" : "#6b7280"} /></Pressable>
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password" placeholderTextColor="#6b7280" secureTextEntry={!showConfirmPassword} editable={!loading} />
            <Pressable style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}><EyeOff size={20} color={showConfirmPassword ? "#e5e7eb" : "#6b7280"} /></Pressable>
          </View>

          <Pressable onPress={handleSignUp} disabled={loading}>
            <LinearGradient
              colors={loading ? ['#475569', '#64748b'] : ['#3B82F6', '#60A5FA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.signUpButton}
            >
              <Text style={styles.signUpButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.signInLink} onPress={() => router.push('/auth/signin')} disabled={loading}>
            <Text style={styles.signInLinkText}>
              Already have an account? <Text style={styles.linkHighlight}>Sign in</Text>
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
  signUpButton: {
    borderRadius: 12, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8, marginTop: 16,
  },
  signUpButtonText: {
    fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#F9FAFB',
  },
  signInLink: {
    marginTop: 32, alignItems: 'center',
  },
  signInLinkText: {
    fontSize: 14, fontFamily: 'Inter-Regular', color: '#9ca3af',
  },
  linkHighlight: {
    fontFamily: 'Inter-SemiBold', color: '#60a5fa',
  },
});