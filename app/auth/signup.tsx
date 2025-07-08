import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, FloatingAction, designTokens } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { router } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clean, simple animations
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  React.useEffect(() => {
    // Simple entrance animation
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
  }, []);

  const handleSignUp = async () => {
    await HapticManager.triggerSelection();
    
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Creating account...');
      const { error } = await signUp(email, password, name);

      if (error) {
        console.error('❌ Sign up error:', error);
        Alert.alert('Sign Up Failed', error.message || 'Please try again.');
      } else {
        console.log('✅ Account created successfully');
        router.replace('/onboarding/quiz');
      }
    } catch (error) {
      console.error('💥 Unexpected sign up error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    await HapticManager.triggerSelection();
    router.back();
  };

  const handleSignIn = async () => {
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Begin your inner journey</Text>
          </View>

          <GlassCard style={styles.formCard}>
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <User size={18} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={designTokens.colors.text.muted}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>

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
                    placeholder="Create a secure password"
                    placeholderTextColor={designTokens.colors.text.muted}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
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

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor={designTokens.colors.text.muted}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                  />
                  <FloatingAction onPress={toggleConfirmPasswordVisibility}>
                    <View style={styles.eyeButton}>
                      {showConfirmPassword ? (
                        <EyeOff size={18} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                      ) : (
                        <Eye size={18} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                      )}
                    </View>
                  </FloatingAction>
                </View>
              </View>

              {/* Sign Up Button */}
              <FloatingAction onPress={handleSignUp} disabled={loading}>
                <View style={[styles.signUpButton, loading && styles.buttonDisabled]}>
                  <LinearGradient
                    colors={loading ? [designTokens.colors.background.tertiary, designTokens.colors.background.elevated] : designTokens.colors.gradients.primary}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Creating Account...' : 'Begin Your Spiritual Journey'}
                    </Text>
                  </LinearGradient>
                </View>
              </FloatingAction>
            </View>
          </GlassCard>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <FloatingAction onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
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

  signUpButton: {
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

  signInLink: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.primary,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },
});