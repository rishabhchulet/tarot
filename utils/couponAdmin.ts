import { supabase } from './supabase';

export interface CreateCouponOptions {
  code?: string; // If not provided, will generate one
  type: 'trial' | 'subscription';
  durationType: 'days' | 'months' | 'years' | 'lifetime';
  durationValue?: number; // null for lifetime
  subscriptionPlan?: 'weekly' | 'yearly' | 'lifetime'; // required for subscription type
  usesTotal?: number;
  expiresAt?: Date;
  description?: string;
}

export interface CouponCode {
  id: string;
  code: string;
  type: 'trial' | 'subscription';
  durationType: 'days' | 'months' | 'years' | 'lifetime';
  durationValue?: number;
  subscriptionPlan?: 'weekly' | 'yearly' | 'lifetime';
  usesTotal: number;
  usesRemaining: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  userId: string;
  redeemedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

/**
 * Generate a random coupon code
 */
export function generateCouponCode(prefix?: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8;
  let result = prefix ? `${prefix}-` : '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Create a new coupon code
 */
export async function createCouponCode(options: CreateCouponOptions): Promise<{ success: boolean; couponCode?: CouponCode; error?: string }> {
  try {
    const code = options.code || generateCouponCode();
    
    // Validate options
    if (options.type === 'subscription' && !options.subscriptionPlan) {
      return {
        success: false,
        error: 'Subscription plan is required for subscription type coupons',
      };
    }
    
    if (options.durationType !== 'lifetime' && (!options.durationValue || options.durationValue <= 0)) {
      return {
        success: false,
        error: 'Duration value is required for non-lifetime coupons',
      };
    }
    
    // Check if code already exists
    const { data: existingCoupon } = await supabase
      .from('coupon_codes')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();
    
    if (existingCoupon) {
      return {
        success: false,
        error: 'A coupon with this code already exists',
      };
    }
    
    // Create the coupon
    const { data, error } = await supabase
      .from('coupon_codes')
      .insert({
        code: code.toUpperCase(),
        type: options.type,
        duration_type: options.durationType,
        duration_value: options.durationType === 'lifetime' ? null : options.durationValue,
        subscription_plan: options.subscriptionPlan,
        uses_total: options.usesTotal || 1,
        uses_remaining: options.usesTotal || 1,
        expires_at: options.expiresAt?.toISOString(),
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating coupon:', error);
      return {
        success: false,
        error: 'Failed to create coupon code',
      };
    }
    
    const couponCode: CouponCode = {
      id: data.id,
      code: data.code,
      type: data.type,
      durationType: data.duration_type,
      durationValue: data.duration_value,
      subscriptionPlan: data.subscription_plan,
      usesTotal: data.uses_total,
      usesRemaining: data.uses_remaining,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
    
    console.log('✅ Coupon code created:', couponCode);
    return { success: true, couponCode };
  } catch (error) {
    console.error('❌ Error creating coupon code:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get all coupon codes
 */
export async function getAllCouponCodes(): Promise<{ success: boolean; coupons?: CouponCode[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching coupons:', error);
      return {
        success: false,
        error: 'Failed to fetch coupon codes',
      };
    }
    
    const coupons: CouponCode[] = data.map(item => ({
      id: item.id,
      code: item.code,
      type: item.type,
      durationType: item.duration_type,
      durationValue: item.duration_value,
      subscriptionPlan: item.subscription_plan,
      usesTotal: item.uses_total,
      usesRemaining: item.uses_remaining,
      expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
      isActive: item.is_active,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
    
    return { success: true, coupons };
  } catch (error) {
    console.error('❌ Error fetching coupon codes:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Deactivate a coupon code
 */
export async function deactivateCouponCode(couponId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('coupon_codes')
      .update({ is_active: false })
      .eq('id', couponId);
    
    if (error) {
      console.error('❌ Error deactivating coupon:', error);
      return {
        success: false,
        error: 'Failed to deactivate coupon code',
      };
    }
    
    console.log('✅ Coupon code deactivated:', couponId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deactivating coupon code:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get coupon redemption history
 */
export async function getCouponRedemptions(couponId?: string): Promise<{ success: boolean; redemptions?: CouponRedemption[]; error?: string }> {
  try {
    let query = supabase
      .from('coupon_redemptions')
      .select('*')
      .order('redeemed_at', { ascending: false });
    
    if (couponId) {
      query = query.eq('coupon_id', couponId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching redemptions:', error);
      return {
        success: false,
        error: 'Failed to fetch coupon redemptions',
      };
    }
    
    const redemptions: CouponRedemption[] = data.map(item => ({
      id: item.id,
      couponId: item.coupon_id,
      userId: item.user_id,
      redeemedAt: new Date(item.redeemed_at),
      expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
      isActive: item.is_active,
    }));
    
    return { success: true, redemptions };
  } catch (error) {
    console.error('❌ Error fetching coupon redemptions:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// Preset coupon creation functions for common use cases

/**
 * Create a 30-day trial coupon
 */
export async function createTrialCoupon(code?: string, uses = 1): Promise<{ success: boolean; couponCode?: CouponCode; error?: string }> {
  return createCouponCode({
    code,
    type: 'trial',
    durationType: 'days',
    durationValue: 30,
    usesTotal: uses,
    description: '30-day trial access',
  });
}

/**
 * Create a 1-month premium subscription coupon
 */
export async function createOneMonthPremiumCoupon(code?: string, uses = 1): Promise<{ success: boolean; couponCode?: CouponCode; error?: string }> {
  return createCouponCode({
    code,
    type: 'subscription',
    durationType: 'months',
    durationValue: 1,
    subscriptionPlan: 'yearly', // Using yearly plan for premium access
    usesTotal: uses,
    description: '1 month premium subscription',
  });
}

/**
 * Create a 6-month premium subscription coupon
 */
export async function createSixMonthPremiumCoupon(code?: string, uses = 1): Promise<{ success: boolean; couponCode?: CouponCode; error?: string }> {
  return createCouponCode({
    code,
    type: 'subscription',
    durationType: 'months',
    durationValue: 6,
    subscriptionPlan: 'yearly',
    usesTotal: uses,
    description: '6 months premium subscription',
  });
}

/**
 * Create a lifetime premium subscription coupon
 */
export async function createLifetimePremiumCoupon(code?: string, uses = 1): Promise<{ success: boolean; couponCode?: CouponCode; error?: string }> {
  return createCouponCode({
    code,
    type: 'subscription',
    durationType: 'lifetime',
    subscriptionPlan: 'lifetime',
    usesTotal: uses,
    description: 'Lifetime premium subscription',
  });
}

/**
 * Create multiple coupon codes at once
 */
export async function createMultipleCoupons(
  template: CreateCouponOptions,
  count: number,
  prefix?: string
): Promise<{ success: boolean; coupons?: CouponCode[]; errors?: string[] }> {
  const coupons: CouponCode[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = generateCouponCode(prefix);
    const result = await createCouponCode({
      ...template,
      code,
    });
    
    if (result.success && result.couponCode) {
      coupons.push(result.couponCode);
    } else {
      errors.push(result.error || 'Unknown error');
    }
  }
  
  return {
    success: coupons.length > 0,
    coupons,
    errors: errors.length > 0 ? errors : undefined,
  };
} 