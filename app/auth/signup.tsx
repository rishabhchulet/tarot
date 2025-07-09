import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { signUp } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const { user, session } = useAuth();

  // Add guard to redirect authenticated users
  React.useEffect(() => {
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    console.log('🎯 Sign up button pressed');
    setError(null);
    
    // Validation
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    console.log('🚀 Starting sign up process...');

    try {
      const { user, session, error } = await signUp(email.trim(), password, name.trim());

      console.log('📝 Sign up result:', { user: !!user, session: !!session, error });

      if (error) {
        console.error('❌ Sign up failed:', error);
        setError(error);
        setLoading(false);
        return;
      } 
      
      if (user) {
        console.log('✅ Sign up successful');
        
        // CRITICAL FIX: Navigate immediately without any delays or success states
        console.log('📱 Navigating to onboarding immediately...');
        
        // Use replace to prevent going back to sign-up
        router.replace('/onboarding/quiz');
        
        // Don't set loading to false here since we're navigating away
        return;
      } else {
        console.error('❓ Unexpected sign up result: no user and no error');
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Unexpected error during sign up:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton} 
            onPress={() => router.back()} 
            disabled={loading}
          >
            <ArrowLeft size={24} color={loading ? "#6B7280" : "#F9FAFB"} />
          </Pressable>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Begin your inner journey</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, loading && styles.inputDisabled]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#6B7280"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Full name"
              accessibilityHint="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, loading && styles.inputDisabled]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Email address"
              accessibilityHint="Enter your email address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, loading && styles.inputDisabled]}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessibilityLabel="Password"
                accessibilityHint="Enter your password"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                accessibilityRole="button"
              >
                {showPassword ? (
                  <EyeOff size={20} color={loading ? "#6B7280" : "#6B7280"} />
                ) : (
                  <Eye size={20} color={loading ? "#6B7280" : "#6B7280"} />
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.passwordContainer, loading && styles.inputDisabled]}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessibilityLabel="Confirm password"
                accessibilityHint="Re-enter your password"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                accessibilityLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                accessibilityRole="button"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={loading ? "#6B7280" : "#6B7280"} />
                ) : (
                  <Eye size={20} color={loading ? "#6B7280" : "#6B7280"} />
                )}
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.signUpButton, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            accessibilityLabel={loading ? "Creating account" : "Create account"}
            accessibilityRole="button"
          >
            <View style={[styles.buttonSolid, loading && styles.buttonSolidDisabled]}>
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </View>
          </Pressable>

          <Pressable 
            style={styles.signInLink} 
            onPress={() => router.push('/auth/signin')}
            disabled={loading}
            accessibilityLabel="Go to sign in"
            accessibilityRole="button"
          >
            <Text style={[styles.signInLinkText, loading && styles.linkDisabled]}>
              Already have an account? <Text style={[styles.linkHighlight, loading && styles.linkDisabled]}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 60,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  form: {
    flex: 1,
    paddingBottom: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(30, 58, 138, 0.04)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  signUpButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 24,
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
  signUpButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
  signInLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signInLinkText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  linkHighlight: {
    color: '#1e3a8a',
    fontFamily: 'Inter-SemiBold',
  },
  linkDisabled: {
    color: '#6B7280',
  },
});