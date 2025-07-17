import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCoupon } from '@/contexts/CouponContext';
import { StarfieldBackground } from '@/components/StarfieldBackground';
import { Ionicons } from '@expo/vector-icons';

export default function CouponCodeScreen() {
  const [couponCode, setCouponCode] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [successAnimation] = useState(new Animated.Value(0));
  const [shakeAnimation] = useState(new Animated.Value(0));
  
  const {
    redeemCoupon,
    isRedeeming,
    redeemError,
    clearRedeemError,
    validateCouponCode,
  } = useCoupon();

  // Validate coupon code as user types
  useEffect(() => {
    const validateCode = async () => {
      if (couponCode.length >= 3) {
        const valid = await validateCouponCode(couponCode);
        setIsValid(valid);
      } else {
        setIsValid(null);
      }
    };

    const debounce = setTimeout(validateCode, 500);
    return () => clearTimeout(debounce);
  }, [couponCode, validateCouponCode]);

  // Clear error when user starts typing
  useEffect(() => {
    if (redeemError) {
      clearRedeemError();
    }
  }, [couponCode, clearRedeemError, redeemError]);

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) {
      triggerShakeAnimation();
      return;
    }

    const result = await redeemCoupon(couponCode);

    if (result.success) {
      triggerSuccessAnimation();
      
      // Show success message
      const message = getSuccessMessage(result);
      Alert.alert('🎉 Coupon Redeemed!', message, [
        {
          text: 'Continue',
          onPress: () => router.back(),
        },
      ]);
    } else {
      triggerShakeAnimation();
    }
  };

  const getSuccessMessage = (result: any) => {
    if (result.durationType === 'lifetime') {
      return 'You now have lifetime premium access! Enjoy unlimited cosmic wisdom.';
    }
    
    const duration = result.durationValue;
    const unit = result.durationType === 'days' ? 'day' : 
                 result.durationType === 'months' ? 'month' : 'year';
    const plural = duration === 1 ? '' : 's';
    
    return `You now have ${duration} ${unit}${plural} of premium access! Your journey into deeper wisdom begins now.`;
  };

  const triggerSuccessAnimation = () => {
    Animated.sequence([
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(successAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getInputBorderColor = () => {
    if (isValid === true) return '#10B981'; // Green for valid
    if (isValid === false) return '#EF4444'; // Red for invalid
    return '#8B5CF6'; // Purple default
  };

  const getInputIconName = () => {
    if (isValid === true) return 'checkmark-circle';
    if (isValid === false) return 'close-circle';
    return 'ticket-outline';
  };

  const getInputIconColor = () => {
    if (isValid === true) return '#10B981';
    if (isValid === false) return '#EF4444';
    return '#8B5CF6';
  };

  return (
    <View style={styles.container}>
      <StarfieldBackground />
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Coupon Code</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [
                      { scale: successAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      })},
                    ],
                  },
                ]}
              >
                <Ionicons name="ticket" size={60} color="#8B5CF6" />
              </Animated.View>
            </View>

            <Text style={styles.subtitle}>Enter Your Coupon Code</Text>
            <Text style={styles.description}>
              Unlock premium features with your special access code
            </Text>

            {/* Coupon Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  borderColor: getInputBorderColor(),
                  transform: [{ translateX: shakeAnimation }],
                },
              ]}
            >
              <TextInput
                style={styles.input}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Enter coupon code"
                placeholderTextColor="#A1A1AA"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={20}
                editable={!isRedeeming}
              />
              <View style={styles.inputIcon}>
                <Ionicons 
                  name={getInputIconName()} 
                  size={24} 
                  color={getInputIconColor()} 
                />
              </View>
            </Animated.View>

            {/* Error Message */}
            {redeemError && (
              <Animated.View
                style={styles.errorContainer}
                entering={true}
              >
                <Ionicons name="warning" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{redeemError}</Text>
              </Animated.View>
            )}

            {/* Validation Status */}
            {isValid === false && couponCode.length >= 3 && !redeemError && (
              <View style={styles.statusContainer}>
                <Ionicons name="close-circle" size={16} color="#EF4444" />
                <Text style={styles.statusText}>Invalid or expired coupon code</Text>
              </View>
            )}

            {isValid === true && (
              <View style={styles.statusContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.statusText, { color: '#10B981' }]}>
                  Valid coupon code
                </Text>
              </View>
            )}

            {/* Redeem Button */}
            <TouchableOpacity
              style={[
                styles.redeemButton,
                {
                  opacity: (!couponCode.trim() || isRedeeming) ? 0.5 : 1,
                },
              ]}
              onPress={handleRedeemCoupon}
              disabled={!couponCode.trim() || isRedeeming}
            >
              <View style={styles.buttonContent}>
                {isRedeeming ? (
                  <>
                    <Animated.View
                      style={[
                        styles.loadingSpinner,
                        {
                          transform: [
                            {
                              rotate: successAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    </Animated.View>
                    <Text style={styles.buttonText}>Redeeming...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="gift" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Redeem Coupon</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How it works</Text>
            <View style={styles.infoItem}>
              <Ionicons name="ticket-outline" size={16} color="#8B5CF6" />
              <Text style={styles.infoText}>Enter your coupon code above</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#8B5CF6" />
              <Text style={styles.infoText}>We'll validate and apply it instantly</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="star-outline" size={16} color="#8B5CF6" />
              <Text style={styles.infoText}>Enjoy your premium features</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  description: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
  },
  inputIcon: {
    marginLeft: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  redeemButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 24,
    width: '100%',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  infoSection: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    color: '#A1A1AA',
    fontSize: 14,
    marginLeft: 12,
    fontFamily: 'Inter',
  },
}); 