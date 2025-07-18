import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/utils/supabase';

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
    if (!user) {
      setSubscription({
        isActive: false,
        plan: 'free',
      });
      return;
    }

    try {
      console.log('📱 Loading subscription status from database...');
      
      // Load subscription data from the subscriptions table
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Also check for coupon access
      const { data: couponData, error: couponError } = await supabase
        .rpc('get_user_coupon_status', { user_id_input: user.id });

      let isActive = false;
      let plan: SubscriptionPlan = 'free';
      let expiresAt: Date | undefined;
      let trialEnd: Date | undefined;
      let isTrialActive = false;

      // Check subscription table data
      if (subscriptionData && !subscriptionError) {
        console.log('📊 Subscription data found:', subscriptionData);
        
        if (subscriptionData.has_active_subscription) {
          isActive = true;
          plan = subscriptionData.subscription_type as SubscriptionPlan || 'yearly';
          
          // For lifetime subscriptions, no expiry
          if (plan === 'lifetime') {
            expiresAt = undefined;
          } else if (subscriptionData.subscription_start_date) {
            // Calculate expiry based on plan
            const startDate = new Date(subscriptionData.subscription_start_date);
            if (plan === 'yearly') {
              expiresAt = new Date(startDate);
              expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            } else if (plan === 'weekly') {
              expiresAt = new Date(startDate);
              expiresAt.setDate(expiresAt.getDate() + 7);
            }
            
            // Check if subscription has expired
            if (expiresAt && expiresAt <= new Date()) {
              isActive = false;
              plan = 'free';
            }
          }
        }
        
        // Check trial status - only if trial dates exist
        if (subscriptionData.trial_start_date && subscriptionData.trial_end_date) {
          const trialEndDate = new Date(subscriptionData.trial_end_date);
          trialEnd = trialEndDate;
          isTrialActive = trialEndDate > new Date();
        }
      } else if (subscriptionError) {
        // If no subscription record found, this is a new user
        // They should see upgrade options, not automatic trial access
        console.log('📊 No subscription data found - new user should see upgrade options');
      }

      // Check coupon access (overrides subscription if user has active coupon)
      if (couponData && !couponError && couponData.has_active_coupon) {
        console.log('🎫 Active coupon found, updating subscription status');
        isActive = true;
        plan = couponData.subscription_plan || 'yearly';
        if (couponData.expires_at) {
          expiresAt = new Date(couponData.expires_at);
        }
        setCouponAccess(true);
      } else {
        setCouponAccess(false);
      }

      // User has access if they have active subscription OR active trial
      const hasAccess = isActive || isTrialActive;

      setSubscription({
        isActive: hasAccess,
        plan,
        expiresAt,
        trialEnd,
        isTrialActive,
      });

      console.log('📱 Final subscription status:', {
        plan,
        isActive: hasAccess,
        isTrialActive,
        expiresAt,
        trialEnd,
        hasCouponAccess: couponData?.has_active_coupon
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
    setSubscription((prev: SubscriptionStatus) => ({
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
    // FIXED: New users should NOT get automatic access
    // They must have either:
    // 1. Active paid subscription
    // 2. Active trial (only AFTER choosing a plan)
    // 3. Coupon access
    
    // Check for active paid subscription
    if (subscription.isActive && subscription.plan !== 'free') {
      return true;
    }
    
    // Check for trial access (only if they actually have a trial)
    if (subscription.isTrialActive && subscription.trialEnd) {
      return true;
    }
    
    // Check for coupon access
    if (hasCouponAccess) {
      return true;
    }
    
    // Default: no access for new users
    return false;
  };

  const setCouponAccess = (couponAccess: boolean): void => {
    setHasCouponAccess(couponAccess);
  };

  // Fixed upgrade functions to actually save to database
  const upgradeToLifetime = async (): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to upgrade subscription');
    }

    console.log('💰 Upgrading to lifetime plan...');
    
    try {
      // Save subscription to database using upsert with proper conflict resolution
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          subscription_type: 'lifetime',
          has_active_subscription: true,
          subscription_start_date: new Date().toISOString(),
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date().toISOString(), // End trial immediately
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Error saving lifetime subscription:', error);
        throw error;
      }

      // Update local state
      updateSubscription({
        isActive: true,
        plan: 'lifetime',
        expiresAt: undefined, // Lifetime doesn't expire
        isTrialActive: false,
      });

      console.log('✅ Lifetime subscription saved successfully');
    } catch (error) {
      console.error('❌ Failed to upgrade to lifetime:', error);
      // Still update local state so user can continue
      updateSubscription({
        isActive: true,
        plan: 'lifetime',
        expiresAt: undefined,
        isTrialActive: false,
      });
    }
  };

  const upgradeToYearly = async (): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to upgrade subscription');
    }

    console.log('💰 Starting yearly plan with 7-day trial...');
    
    try {
      // Use the new database function to start trial
      const { data: trialResult, error } = await supabase
        .rpc('start_user_trial', {
          user_id_input: user.id,
          subscription_type_input: 'yearly',
          trial_days: 7
        });

      if (error) {
        console.error('❌ Error starting yearly trial:', error);
        throw error;
      }

      if (trialResult && trialResult.success) {
        const trialEndDate = new Date(trialResult.trial_end_date);
        
        // Update local state - user gets trial access
        updateSubscription({
          isActive: true, // Trial access
          plan: 'yearly',
          expiresAt: undefined, // No expiry during trial
          trialEnd: trialEndDate,
          isTrialActive: true,
        });

        console.log('✅ Yearly trial started successfully');
      } else {
        throw new Error(trialResult?.error || 'Failed to start trial');
      }
    } catch (error) {
      console.error('❌ Failed to start yearly trial:', error);
      // Still update local state so user can continue
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      
      updateSubscription({
        isActive: true,
        plan: 'yearly',
        expiresAt: undefined,
        trialEnd: trialEndDate,
        isTrialActive: true,
      });
    }
  };

  const upgradeToWeekly = async (): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to upgrade subscription');
    }

    console.log('💰 Upgrading to weekly plan...');
    
    try {
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      // Use the existing activate_user_subscription function for immediate activation
      const { data: activationResult, error } = await supabase
        .rpc('activate_user_subscription', {
          user_id_input: user.id,
          subscription_type_input: 'weekly'
        });

      if (error) {
        console.error('❌ Error activating weekly subscription:', error);
        throw error;
      }

      if (activationResult && activationResult.success) {
        // Update local state
        updateSubscription({
          isActive: true,
          plan: 'weekly',
          expiresAt: expiryDate,
          isTrialActive: false,
        });

        console.log('✅ Weekly subscription activated successfully');
      } else {
        throw new Error(activationResult?.error || 'Failed to activate subscription');
      }
    } catch (error) {
      console.error('❌ Failed to upgrade to weekly:', error);
      // Still update local state so user can continue
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      updateSubscription({
        isActive: true,
        plan: 'weekly',
        expiresAt: expiryDate,
        isTrialActive: false,
      });
    }
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