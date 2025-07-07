import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle, User, Mail, Lock } from 'lucide-react-native';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { signUp } from '@/utils/auth';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced validation states
  const [validationState, setValidationState] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(40);
  const backgroundGlow = useSharedValue(0);

  useEffect(() => {
    startSignUpAnimations();
  }, []);

  useEffect(() => {
    // Real-time validation
    setValidationState({
      name: name.trim().length >= 2,
      email: validateEmail(email),
      password: password.length >= 6,
      confirmPassword: password === confirmPassword && confirmPassword.length > 0,
    });
  }, [name, email, password, confirmPassword]);

  const startSignUpAnimations = () => {
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

  const handleSignUp = async () => {
    console.log('🎯 Enhanced sign up initiated');
    setError(null);
    
    // Enhanced validation
    if (!name.trim()) {
      setError('Please enter your full name');
      await HapticManager.triggerError();
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      await HapticManager.triggerError();
      return;
    }

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
      setError('Please enter a password');
      await HapticManager.triggerError();
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      await HapticManager.triggerError();
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      await HapticManager.triggerError();
      return;
    }

    setLoading(true);
    await HapticManager.triggerSelection();
    console.log('🚀 Starting enhanced sign up process...');

    try {
      const { user, session, error } = await signUp(email.trim(), password, name.trim());

      console.log('📝 Sign up result:', { user: !!user, session: !!session, error });

      if (error) {
        console.error('❌ Sign up failed:', error);
        setError(error);
        await HapticManager.triggerError();
        setLoading(false);
        return;
      } 
      
      if (user) {
        console.log('✅ Sign up successful');
        await HapticManager.triggerSuccess();
        
        console.log('📱 Navigating to onboarding immediately...');
        router.replace('/onboarding/quiz');
        return;
      } else {
        console.error('❓ Unexpected sign up result: no user and no error');
        setError('An unexpected error occurred. Please try again.');
        await HapticManager.triggerError();
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Unexpected error during sign up:', error);
      setError('An unexpected error occurred. Please try again.');
      await HapticManager.triggerError();
      setLoading(false);
    }
  };

  const handleBackPress = async () => {
    await HapticManager.triggerSelection();
    router.back();
  };

  const handleSignInPress = async () => {
    await HapticManager.triggerSelection();
    router.push('/auth/signin');
  };

  const togglePasswordVisibility = async () => {
    await HapticManager.triggerSelection();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = async () => {
    await HapticManager.triggerSelection();
    setShowConfirmPassword(!showConfirmPassword);
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

  // Validation indicator component
  const ValidationIndicator = ({ isValid, show }: { isValid: boolean; show: boolean }) => {
    if (!show) return null;
    return (
      <View style={styles.validationIndicator}>
        <CheckCircle 
          size={16} 
          color={isValid ? designTokens.colors.accent.emerald : designTokens.colors.text.muted} 
        />
      </View>
    );
  };

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={15} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Enhanced Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <FloatingAction 
              style={styles.backButton} 
              onPress={handleBackPress}
            >
              <ArrowLeft size={24} color={loading ? designTokens.colors.text.muted : designTokens.colors.text.primary} />
            </FloatingAction>
            
            <View style={styles.headerContent}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Begin your inner journey</Text>
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

              {/* Enhanced Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <GlassCard style={styles.inputCard} intensity="light">
                  <View style={styles.inputWrapper}>
                    <User size={20} color={designTokens.colors.text.muted} />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor={designTokens.colors.text.muted}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!loading}
                      autoComplete="name"
                    />
                    <ValidationIndicator isValid={validationState.name} show={name.length > 0} />
                  </View>
                </GlassCard>
              </View>

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
                    <ValidationIndicator isValid={validationState.email} show={email.length > 0} />
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
                      placeholder="Create a password (min 6 characters)"
                      placeholderTextColor={designTokens.colors.text.muted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      autoComplete="password"
                    />
                    <ValidationIndicator isValid={validationState.password} show={password.length > 0} />
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

              {/* Enhanced Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <GlassCard style={styles.inputCard} intensity="light">
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color={designTokens.colors.text.muted} />
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor={designTokens.colors.text.muted}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      autoComplete="password"
                    />
                    <ValidationIndicator isValid={validationState.confirmPassword} show={confirmPassword.length > 0} />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={toggleConfirmPasswordVisibility}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color={designTokens.colors.text.muted} />
                      ) : (
                        <Eye size={20} color={designTokens.colors.text.muted} />
                      )}
                    </Pressable>
                  </View>
                </GlassCard>
              </View>

              {/* Enhanced Sign Up Button */}
              <ModernButton
                title={loading ? 'Creating Your Account...' : 'Begin Your Spiritual Journey'}
                onPress={handleSignUp}
                variant="gradient"
                size="lg"
                disabled={loading}
                style={styles.signUpButton}
              />

              {/* Sign In Link */}
              <Pressable 
                style={styles.signInLink} 
                onPress={handleSignInPress}
                disabled={loading}
              >
                <Text style={styles.signInLinkText}>
                  Already have an account?{' '}
                  <Text style={styles.linkHighlight}>Sign In</Text>
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
    top: '10%',
    left: '15%',
    right: '15%',
    height: '50%',
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
    paddingBottom: designTokens.spacing.lg,
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

  validationIndicator: {
    marginLeft: designTokens.spacing.xs,
  },

  eyeButton: {
    padding: designTokens.spacing.xs,
    marginLeft: designTokens.spacing.xs,
  },

  // Action Elements
  signUpButton: {
    marginTop: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.lg,
    minHeight: 56,
  },

  signInLink: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.md,
  },

  signInLinkText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },

  linkHighlight: {
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
  },
});