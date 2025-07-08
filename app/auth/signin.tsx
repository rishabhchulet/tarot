import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, FloatingAction, designTokens } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clean, simple animations
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  React.useEffect(() => {
    // Simple entrance animation
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
  }, []);

  const handleSignIn = async () => {
    await HapticManager.triggerSelection();
    
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Attempting sign in...');
      const { error } = await signIn(email, password);

      if (error) {
        console.error('❌ Sign in error:', error);
        Alert.alert('Sign In Failed', error.message || 'Please check your credentials and try again.');
      } else {
        console.log('✅ Sign in successful');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('💥 Unexpected sign in error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    await HapticManager.triggerSelection();
    router.back();
  };

  const handleForgotPassword = async () => {
    await HapticManager.triggerSelection();
    router.push('/auth/forgot-password');
  };

  const handleCreateAccount = async () => {
    await HapticManager.triggerSelection();
    router.push('/auth/signup');
  };

  const togglePasswordVisibility = async () => {
    await HapticManager.triggerSelection();
    setShowPassword(!showPassword);
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.main}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Clean header */}
        <View style={styles.header}>
          <FloatingAction onPress={handleBack}>
            <View style={styles.backButton}>
              <ArrowLeft size={20} color={designTokens.colors.text.primary} strokeWidth={1.5} />
            </View>
          </FloatingAction>
        </View>

        {/* Content with excellent readability */}
        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Continue your inner journey</Text>
          </View>

          <GlassCard style={styles.formCard}>
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Mail size={18} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={designTokens.colors.text.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={designTokens.colors.text.muted}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <FloatingAction onPress={togglePasswordVisibility}>
                    <View style={styles.eyeButton}>
                      {showPassword ? (
                        <EyeOff size={18} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                      ) : (
                        <Eye size={18} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                      )}
                    </View>
                  </FloatingAction>
                </View>
              </View>

              {/* Forgot Password Link */}
              <FloatingAction onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </FloatingAction>

              {/* Sign In Button */}
              <FloatingAction onPress={handleSignIn} disabled={loading}>
                <View style={[styles.signInButton, loading && styles.buttonDisabled]}>
                  <LinearGradient
                    colors={loading ? [designTokens.colors.background.tertiary, designTokens.colors.background.elevated] : designTokens.colors.gradients.primary}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Signing In...' : 'Sign In to Your Journey'}
                    </Text>
                  </LinearGradient>
                </View>
              </FloatingAction>
            </View>
          </GlassCard>

          {/* Create Account Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <FloatingAction onPress={handleCreateAccount}>
              <Text style={styles.createAccountLink}>Create Account</Text>
            </FloatingAction>
          </View>
        </Animated.View>
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

  header: {
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.sm,
    paddingBottom: designTokens.spacing.md,
  },

  backButton: {
    padding: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },

  content: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.md,
    justifyContent: 'center',
  },

  titleSection: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xl,
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
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },

  formCard: {
    backgroundColor: designTokens.colors.background.tertiary,
    marginBottom: designTokens.spacing.lg,
  },

  form: {
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.lg,
  },

  inputGroup: {
    gap: designTokens.spacing.sm,
  },

  label: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.text.primary,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background.elevated,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    gap: designTokens.spacing.sm,
  },

  input: {
    flex: 1,
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.primary,
    paddingVertical: designTokens.spacing.sm,
  },

  eyeButton: {
    padding: designTokens.spacing.xs,
  },

  forgotPassword: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.primary,
    textAlign: 'right',
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  signInButton: {
    borderRadius: designTokens.borderRadius.md,
    overflow: 'hidden',
    marginTop: designTokens.spacing.sm,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonGradient: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
  },

  createAccountLink: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.primary,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },
});