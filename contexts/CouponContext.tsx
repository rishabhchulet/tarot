import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import { supabase } from '@/utils/supabase';

export interface CouponStatus {
  hasActiveCoupon: boolean;
  couponType?: 'trial' | 'subscription';
  subscriptionPlan?: 'weekly' | 'yearly' | 'lifetime';
  expiresAt?: Date;
  isLifetime?: boolean;
}

export interface CouponRedemptionResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  couponType?: 'trial' | 'subscription';
  durationType?: 'days' | 'months' | 'years' | 'lifetime';
  durationValue?: number;
  subscriptionPlan?: 'weekly' | 'yearly' | 'lifetime';
  expiresAt?: Date;
}

interface CouponContextType {
  couponStatus: CouponStatus;
  isRedeeming: boolean;
  redeemError: string | null;
  redeemCoupon: (code: string) => Promise<CouponRedemptionResult>;
  refreshCouponStatus: () => Promise<void>;
  clearRedeemError: () => void;
  validateCouponCode: (code: string) => Promise<boolean>;
  hasActiveCouponAccess: () => boolean;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

interface CouponProviderProps {
  children: React.ReactNode;
}

export function CouponProvider({ children }: CouponProviderProps) {
  const { user } = useAuth();
  const { updateSubscription, setCouponAccess } = useSubscription();
  
  const [couponStatus, setCouponStatus] = useState<CouponStatus>({
    hasActiveCoupon: false,
  });
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Load coupon status when user changes
  useEffect(() => {
    if (user) {
      refreshCouponStatus();
    } else {
      // Reset coupon status when no user
      setCouponStatus({ hasActiveCoupon: false });
    }
  }, [user]);

  const refreshCouponStatus = async (): Promise<void> => {
    if (!user) {
      setCouponStatus({ hasActiveCoupon: false });
      return;
    }

    try {
      console.log('🎫 Refreshing coupon status...');
      
      // Call the database function to get user's coupon status
      const { data, error } = await supabase
        .rpc('get_user_coupon_status', { user_id_input: user.id });

      if (error) {
        console.error('❌ Error loading coupon status:', error);
        setCouponStatus({ hasActiveCoupon: false });
        return;
      }

      const status: CouponStatus = {
        hasActiveCoupon: data.has_active_coupon || false,
        couponType: data.coupon_type,
        subscriptionPlan: data.subscription_plan,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        isLifetime: data.is_lifetime || false,
      };

      setCouponStatus(status);

      // Update subscription context if user has active coupon
      if (status.hasActiveCoupon) {
        console.log('✅ Active coupon found, updating subscription status');
        setCouponAccess(true);
        updateSubscription({
          isActive: true,
          plan: status.subscriptionPlan || 'yearly', // Default to yearly for trial coupons
          expiresAt: status.expiresAt,
        });
      } else {
        setCouponAccess(false);
      }

      console.log('🎫 Coupon status loaded:', status);
    } catch (error) {
      console.error('❌ Error refreshing coupon status:', error);
      setCouponStatus({ hasActiveCoupon: false });
    }
  };

  const validateCouponCode = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;

    try {
      // Check if coupon exists and is valid
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('id, code, is_active, uses_remaining, expires_at')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .gt('uses_remaining', 0)
        .single();

      if (error || !data) {
        return false;
      }

      // Check if coupon has expired
      if (data.expires_at && new Date(data.expires_at) <= new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error validating coupon code:', error);
      return false;
    }
  };

  const redeemCoupon = async (code: string): Promise<CouponRedemptionResult> => {
    if (!user) {
      return {
        success: false,
        error: 'You must be signed in to redeem a coupon code',
        errorCode: 'NOT_AUTHENTICATED',
      };
    }

    if (!code.trim()) {
      return {
        success: false,
        error: 'Please enter a coupon code',
        errorCode: 'EMPTY_CODE',
      };
    }

    setIsRedeeming(true);
    setRedeemError(null);

    try {
      console.log('🎫 Redeeming coupon code:', code);

      // Call the database function to redeem the coupon
      const { data, error } = await supabase
        .rpc('redeem_coupon_code', {
          coupon_code_input: code.trim().toUpperCase(),
          user_id_input: user.id,
        });

      if (error) {
        console.error('❌ Error redeeming coupon:', error);
        const errorMessage = 'Failed to redeem coupon. Please try again.';
        setRedeemError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorCode: 'REDEMPTION_ERROR',
        };
      }

      if (!data.success) {
        console.log('❌ Coupon redemption failed:', data.error);
        setRedeemError(data.error);
        return {
          success: false,
          error: data.error,
          errorCode: data.error_code,
        };
      }

      // Success! Update local state
      console.log('✅ Coupon redeemed successfully:', data);

      const result: CouponRedemptionResult = {
        success: true,
        couponType: data.coupon_type,
        durationType: data.duration_type,
        durationValue: data.duration_value,
        subscriptionPlan: data.subscription_plan,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      };

      // Refresh coupon status to update UI
      await refreshCouponStatus();

      return result;
    } catch (error) {
      console.error('❌ Unexpected error redeeming coupon:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setRedeemError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorCode: 'UNEXPECTED_ERROR',
      };
    } finally {
      setIsRedeeming(false);
    }
  };

  const clearRedeemError = (): void => {
    setRedeemError(null);
  };

  const hasActiveCouponAccess = (): boolean => {
    if (!couponStatus.hasActiveCoupon) return false;
    
    // Check if coupon has expired
    if (couponStatus.expiresAt && couponStatus.expiresAt <= new Date()) {
      return false;
    }
    
    return true;
  };

  const contextValue: CouponContextType = {
    couponStatus,
    isRedeeming,
    redeemError,
    redeemCoupon,
    refreshCouponStatus,
    clearRedeemError,
    validateCouponCode,
    hasActiveCouponAccess,
  };

  return (
    <CouponContext.Provider value={contextValue}>
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupon(): CouponContextType {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
} 