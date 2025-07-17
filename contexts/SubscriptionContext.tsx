import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionPlan = 'free' | 'weekly' | 'yearly' | 'lifetime';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan;
  expiresAt?: Date;
  trialEnd?: Date;
  isTrialActive?: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionStatus;
  updateSubscription: (newStatus: Partial<SubscriptionStatus>) => void;
  hasActiveSubscription: () => boolean;
  isOnTrial: () => boolean;
  canAccessPremiumFeatures: () => boolean;
  upgradeToLifetime: () => Promise<void>;
  upgradeToYearly: () => Promise<void>;
  upgradeToWeekly: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  setCouponAccess: (hasCouponAccess: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: false,
    plan: 'free',
  });
  const [hasCouponAccess, setHasCouponAccess] = useState(false);

  // Initialize subscription status based on user data
  useEffect(() => {
    if (user) {
      loadSubscriptionStatus();
    } else {
      // Reset to free plan when no user
      setSubscription({
        isActive: false,
        plan: 'free',
      });
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      // TODO: In production, this would check with RevenueCat or your backend
      // For now, we'll simulate based on user data or default to free
      
      // Check if user has subscription info (this would come from your database)
      const storedPlan = user?.subscriptionPlan || 'free';
      const storedExpiry = user?.subscriptionExpiry;
      const trialEnd = user?.trialEnd;

      let isActive = false;
      let isTrialActive = false;

      // Check if trial is active
      if (trialEnd) {
        const trialEndDate = new Date(trialEnd);
        isTrialActive = trialEndDate > new Date();
      }

      // Check if subscription is active
      if (storedPlan === 'lifetime') {
        isActive = true;
      } else if (storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        isActive = expiryDate > new Date();
      }

      // User has access if they have active subscription OR active trial
      const hasAccess = isActive || isTrialActive;

      setSubscription({
        isActive: hasAccess,
        plan: storedPlan as SubscriptionPlan,
        expiresAt: storedExpiry ? new Date(storedExpiry) : undefined,
        trialEnd: trialEnd ? new Date(trialEnd) : undefined,
        isTrialActive,
      });

      console.log('📱 Subscription status loaded:', {
        plan: storedPlan,
        isActive: hasAccess,
        isTrialActive,
        expiresAt: storedExpiry,
        trialEnd,
      });
    } catch (error) {
      console.error('❌ Error loading subscription status:', error);
      // Default to free plan on error
      setSubscription({
        isActive: false,
        plan: 'free',
      });
    }
  };

  const updateSubscription = (newStatus: Partial<SubscriptionStatus>) => {
    setSubscription(prev => ({
      ...prev,
      ...newStatus,
    }));
  };

  const hasActiveSubscription = (): boolean => {
    return subscription.isActive && subscription.plan !== 'free';
  };

  const isOnTrial = (): boolean => {
    return subscription.isTrialActive || false;
  };

  const canAccessPremiumFeatures = (): boolean => {
    // User can access premium features if they have active subscription OR trial OR coupon access
    return subscription.isActive || isOnTrial() || hasCouponAccess;
  };

  const setCouponAccess = (couponAccess: boolean): void => {
    setHasCouponAccess(couponAccess);
  };

  // TODO: Implement actual payment processing with RevenueCat
  const upgradeToLifetime = async (): Promise<void> => {
    console.log('💰 Upgrading to lifetime plan...');
    // Simulate successful purchase
    updateSubscription({
      isActive: true,
      plan: 'lifetime',
      expiresAt: undefined, // Lifetime doesn't expire
      isTrialActive: false,
    });
  };

  const upgradeToYearly = async (): Promise<void> => {
    console.log('💰 Upgrading to yearly plan...');
    // Simulate successful purchase
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    updateSubscription({
      isActive: true,
      plan: 'yearly',
      expiresAt: expiryDate,
      isTrialActive: false,
    });
  };

  const upgradeToWeekly = async (): Promise<void> => {
    console.log('💰 Upgrading to weekly plan...');
    // Simulate successful purchase
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    updateSubscription({
      isActive: true,
      plan: 'weekly',
      expiresAt: expiryDate,
      isTrialActive: false,
    });
  };

  const cancelSubscription = async (): Promise<void> => {
    console.log('❌ Canceling subscription...');
    // TODO: Implement cancellation with RevenueCat
    updateSubscription({
      isActive: false,
      plan: 'free',
      expiresAt: undefined,
      isTrialActive: false,
    });
  };

  const contextValue: SubscriptionContextType = {
    subscription,
    updateSubscription,
    hasActiveSubscription,
    isOnTrial,
    canAccessPremiumFeatures,
    upgradeToLifetime,
    upgradeToYearly,
    upgradeToWeekly,
    cancelSubscription,
    setCouponAccess,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 