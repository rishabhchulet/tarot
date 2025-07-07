import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Mail, CheckCircle, Send } from 'lucide-react-native';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { resetPassword } from '@/utils/auth';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(40);
  const successOpacity = useSharedValue(0);
  const successScale = useSharedValue(0.8);
  const backgroundGlow = useSharedValue(0);

  useEffect(() => {
    if (emailSent) {
      startSuccessAnimations();
    } else {
      startFormAnimations();
    }
  }, [emailSent]);

  const startFormAnimations = () => {
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

  const startSuccessAnimations = () => {
    // Reset form animations
    headerOpacity.value = 0;
    formOpacity.value = 0;
    
    // Start success animations
    setTimeout(() => {
      animationHelpers.fadeIn(successOpacity, 1000);
      successScale.value = withSpring(1, designTokens.animations.spring.bouncy);
    }, 300);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    console.log('🔄 Enhanced password reset initiated');
    setError(null);

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

    setLoading(true);
    await HapticManager.triggerSelection();

    try {
      const { error } = await resetPassword(email.trim());

      if (error) {
        setError(error);
        await HapticManager.triggerError();
      } else {
        await HapticManager.triggerSuccess();
        setEmailSent(true);
      }
    } catch (error) {
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

  const handleSignInPress = async () => {
    await HapticManager.triggerSelection();
    router.push('/auth/signin');
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

  const successStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [{ scale: successScale.value }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.6]),
  }));

  // Enhanced Success Screen
  if (emailSent) {
    return (
      <LinearGradient
        colors={designTokens.colors.gradients.cosmic}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ParticleSystem count={20} animate={true} />
          
          <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
          
          <Animated.View style={[styles.successContainer, successStyle]}>
            <GlassCard style={styles.successCard} intensity="medium">
              <View style={styles.successIcon}>
                <View style={styles.iconBackground}>
                  <CheckCircle size={64} color={designTokens.colors.accent.emerald} />
                </View>
              </View>
              
              <Text style={styles.successTitle}>Check Your Email</Text>
              
              <Text style={styles.successMessage}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
                {'\n\n'}
                Please check your email and follow the instructions to reset your password.
              </Text>
              
              <View style={styles.successActions}>
                <ModernButton
                  title="Back to Sign In"
                  onPress={handleSignInPress}
                  variant="gradient"
                  size="lg"
                  style={styles.successButton}
                />
                
                <Pressable 
                  style={styles.resendLink}
                  onPress={() => setEmailSent(false)}
                >
                  <Text style={styles.resendText}>
                    Didn't receive email? <Text style={styles.linkHighlight}>Try again</Text>
                  </Text>
                </Pressable>
              </View>
            </GlassCard>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Enhanced Form Screen
  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={12} animate={true} />
        
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Enhanced Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <FloatingAction style={styles.backButton} onPress={handleBackPress}>
              <ArrowLeft size={24} color={designTokens.colors.text.primary} />
            </FloatingAction>
            
            <View style={styles.headerContent}>
              <View style={styles.titleIcon}>
                <Mail size={32} color={designTokens.colors.accent.brightBlue} />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to reset your password
              </Text>
            </View>
          </Animated.View>

          {/* Enhanced Form */}
          <Animated.View style={[styles.formContainer, formStyle]}>
            <GlassCard style={styles.formCard} intensity="medium">
              {error && (
                <GlassCard style={styles.errorContainer} intensity="strong">
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
                      placeholder="Enter your email address"
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

              {/* Enhanced Reset Button */}
              <ModernButton
                title={loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                onPress={handleResetPassword}
                variant="gradient"
                size="lg"
                disabled={loading}
                icon={Send}
                style={styles.resetButton}
              />

              {/* Sign In Link */}
              <Pressable 
                style={styles.signInLink} 
                onPress={handleSignInPress}
                disabled={loading}
              >
                <Text style={styles.signInText}>
                  Remember your password?{' '}
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
    top: '20%',
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

  titleIcon: {
    marginBottom: designTokens.spacing.lg,
    padding: designTokens.spacing.md,
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
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    maxWidth: 320,
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
    textAlign: 'center',
  },

  // Enhanced Input Styles
  inputContainer: {
    marginBottom: designTokens.spacing.xl,
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

  // Action Elements
  resetButton: {
    marginBottom: designTokens.spacing.lg,
    minHeight: 56,
  },

  signInLink: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.md,
  },

  signInText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },

  linkHighlight: {
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
  },

  // Enhanced Success Screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.md,
  },

  successCard: {
    paddingVertical: designTokens.spacing.xxxl,
    paddingHorizontal: designTokens.spacing.xl,
    alignItems: 'center',
  },

  successIcon: {
    marginBottom: designTokens.spacing.xl,
  },

  iconBackground: {
    padding: designTokens.spacing.lg,
    borderRadius: 40,
    backgroundColor: designTokens.colors.glass.background,
  },

  successTitle: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  successMessage: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.xl,
  },

  emailHighlight: {
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
  },

  successActions: {
    width: '100%',
    gap: designTokens.spacing.lg,
  },

  successButton: {
    minHeight: 56,
  },

  resendLink: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.md,
  },

  resendText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },
});