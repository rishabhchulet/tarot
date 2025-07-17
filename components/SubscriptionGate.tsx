import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Lock, Sparkles, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
  description: string;
  requiredPlan?: 'trial' | 'paid' | 'lifetime';
  fallbackContent?: React.ReactNode;
}

export function SubscriptionGate({ 
  children, 
  feature, 
  description,
  requiredPlan = 'paid',
  fallbackContent 
}: SubscriptionGateProps) {
  const { canAccessPremiumFeatures, isOnTrial, hasActiveSubscription, subscription } = useSubscription();

  // Check if user has required access
  const hasAccess = () => {
    switch (requiredPlan) {
      case 'trial':
        return canAccessPremiumFeatures(); // Trial OR paid
      case 'paid':
        return hasActiveSubscription(); // Only paid plans
      case 'lifetime':
        return subscription.plan === 'lifetime';
      default:
        return canAccessPremiumFeatures();
    }
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  // Show upgrade prompt for free users
  const handleUpgrade = () => {
    router.push('/onboarding/subscription');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.1)']}
        style={styles.gateContainer}
      >
        <View style={styles.lockIcon}>
          <Crown size={32} color="#6366f1" />
        </View>
        
        <Text style={styles.featureTitle}>{feature}</Text>
        <Text style={styles.description}>{description}</Text>
        
        {isOnTrial() ? (
          <View style={styles.trialInfo}>
            <Text style={styles.trialText}>
              ✨ Available during your trial period
            </Text>
          </View>
        ) : null}
        
        <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.buttonGradient}
          >
            <Sparkles size={16} color="#FFFFFF" />
            <Text style={styles.upgradeText}>Unlock Premium</Text>
          </LinearGradient>
        </Pressable>
        
        {fallbackContent && (
          <View style={styles.fallbackSection}>
            <Text style={styles.fallbackLabel}>Basic Version:</Text>
            {fallbackContent}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

interface FreemiumPreviewProps {
  children: React.ReactNode;
  previewLines?: number;
  upgradePrompt?: string;
}

export function FreemiumPreview({ 
  children, 
  previewLines = 2,
  upgradePrompt = "Unlock full access" 
}: FreemiumPreviewProps) {
  const { canAccessPremiumFeatures } = useSubscription();
  
  if (canAccessPremiumFeatures()) {
    return <>{children}</>;
  }

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewContent}>
        {children}
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.9)', 'rgba(15, 23, 42, 1)']}
        style={styles.fadeOverlay}
      >
        <Pressable 
          style={styles.previewUpgrade} 
          onPress={() => router.push('/onboarding/subscription')}
        >
          <Lock size={16} color="#6366f1" />
          <Text style={styles.previewUpgradeText}>{upgradePrompt}</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  gateContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  lockIcon: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  trialInfo: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  trialText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#fbbf24',
    textAlign: 'center',
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  upgradeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  fallbackSection: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  fallbackLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 8,
  },
  previewContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  previewContent: {
    maxHeight: 120, // Limit preview height
    overflow: 'hidden',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    alignItems: 'center',
  },
  previewUpgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  previewUpgradeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
}); 