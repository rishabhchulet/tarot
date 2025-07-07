import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, CircleAlert as AlertCircle, Mail, Lock } from 'lucide-react-native';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { signIn } from '@/utils/auth';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withDelay,
  interpolate
} from 'react-native-reanimated';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(40);
  const backgroundGlow = useSharedValue(0);

  useEffect(() => {
    startSignInAnimations();
  }, []);

  const startSignInAnimations = () => {
    // Background glow
    backgroundGlow.value = withTiming(1, { duration: 2000 });
    
    // Staggered entrance
    setTimeout(() => {
      animationHelpers.fadeIn(headerOpacity, 800);
      headerTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 200);

    setTimeout(() => {
      animationHelpers.fadeIn(formOpacity, 800);
      formTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 600);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    console.log('🎯 Enhanced sign in initiated');
    setError(null);
    
    // Validation
    if (!email.trim()) {
      setError('Please enter your email address');
      await HapticManager.triggerError();
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      await HapticManager.triggerError();
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      await HapticManager.triggerError();
      return;
    }

    setLoading(true);
    await HapticManager.triggerSelection();
    console.log('🚀 Starting enhanced sign in process...');

    try {
      const { user, error } = await signIn(email.trim(), password);

      console.log('📝 Sign in result:', { user: !!user, error });

      if (error) {
        console.error('❌ Sign in failed:', error);
        setError(error);
        await HapticManager.triggerError();
      } else if (user) {
        console.log('✅ Sign in successful, navigating to main app...');
        await HapticManager.triggerSuccess();
        router.replace('/(tabs)');
      } else {
        console.error('❓ Unexpected sign in result: no user and no error');
        setError('An unexpected error occurred. Please try again.');
        await HapticManager.triggerError();
      }
    } catch (error) {
      console.error('💥 Unexpected error during sign in:', error);
      setError('An unexpected error occurred. Please try again.');
      await HapticManager.triggerError();
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = async () => {
    await HapticManager.triggerSelection();
    router.back();
  };

  const handleForgotPassword = async () => {
    await HapticManager.triggerSelection();
    router.push('/auth/forgot-password');
  };

  const handleSignUpPress = async () => {
    await HapticManager.triggerSelection();
    router.push('/auth/signup');
  };

  const togglePasswordVisibility = async () => {
    await HapticManager.triggerSelection();
    setShowPassword(!showPassword);
  };

  // Enhanced animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.6]),
  }));

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={12} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Enhanced Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <FloatingAction style={styles.backButton} onPress={handleBackPress}>
              <ArrowLeft size={24} color={designTokens.colors.text.primary} />
            </FloatingAction>
            
            <View style={styles.headerContent}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Continue your inner journey</Text>
            </View>
          </Animated.View>

          {/* Enhanced Form */}
          <Animated.View style={[styles.formContainer, formStyle]}>
            <GlassCard style={styles.formCard} intensity="medium">
              {error && (
                <GlassCard style={styles.errorContainer} intensity="strong">
                  <AlertCircle size={20} color={designTokens.colors.accent.rose} />
                  <Text style={styles.errorText}>{error}</Text>
                </GlassCard>
              )}

              {/* Enhanced Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <GlassCard style={styles.inputCard} intensity="light">
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color={designTokens.colors.text.muted} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={designTokens.colors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      autoComplete="email"
                    />
                  </View>
                </GlassCard>
              </View>

              {/* Enhanced Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <GlassCard style={styles.inputCard} intensity="light">
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color={designTokens.colors.text.muted} />
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={designTokens.colors.text.muted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      autoComplete="password"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={togglePasswordVisibility}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={designTokens.colors.text.muted} />
                      ) : (
                        <Eye size={20} color={designTokens.colors.text.muted} />
                      )}
                    </Pressable>
                  </View>
                </GlassCard>
              </View>

              {/* Forgot Password Link */}
              <Pressable
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>

              {/* Enhanced Sign In Button */}
              <ModernButton
                title={loading ? 'Signing In...' : 'Sign In to Your Journey'}
                onPress={handleSignIn}
                variant="gradient"
                size="lg"
                disabled={loading}
                style={styles.signInButton}
              />

              {/* Sign Up Link */}
              <Pressable 
                style={styles.signUpLink} 
                onPress={handleSignUpPress}
                disabled={loading}
              >
                <Text style={styles.signUpLinkText}>
                  Don't have an account?{' '}
                  <Text style={styles.linkHighlight}>Create Account</Text>
                </Text>
              </Pressable>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  backgroundGlow: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    right: '15%',
    height: '40%',
    borderRadius: 150,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.4,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.md,
  },

  // Enhanced Header
  header: {
    paddingTop: designTokens.spacing.xl,
    paddingBottom: designTokens.spacing.xl,
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    left: 0,
    top: designTokens.spacing.xl,
    padding: designTokens.spacing.sm,
  },

  headerContent: {
    alignItems: 'center',
    paddingTop: designTokens.spacing.lg,
  },

  title: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.sm,
  },

  subtitle: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },

  // Enhanced Form
  formContainer: {
    flex: 1,
    paddingBottom: designTokens.spacing.xxxl,
  },

  formCard: {
    paddingVertical: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.accent.rose,
  },

  errorText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.rose,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    flex: 1,
  },

  // Enhanced Input Styles
  inputContainer: {
    marginBottom: designTokens.spacing.lg,
  },

  label: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.sm,
  },

  inputCard: {
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  input: {
    flex: 1,
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.primary,
    paddingVertical: designTokens.spacing.sm,
    minHeight: 24,
  },

  passwordInput: {
    flex: 1,
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.primary,
    paddingVertical: designTokens.spacing.sm,
    paddingRight: designTokens.spacing.sm,
    minHeight: 24,
  },

  eyeButton: {
    padding: designTokens.spacing.xs,
  },

  // Action Elements
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: designTokens.spacing.xl,
  },

  forgotPasswordText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  signInButton: {
    marginBottom: designTokens.spacing.lg,
    minHeight: 56,
  },

  signUpLink: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.md,
  },

  signUpLinkText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },

  linkHighlight: {
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
  },
});