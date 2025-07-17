/**
 * Coupon Code Generation Script
 * 
 * This script helps you quickly create coupon codes for your tarot app.
 * 
 * Usage:
 * node scripts/createCoupons.js
 * 
 * Or modify the COUPONS_TO_CREATE array below and run the script.
 */

// You'll need to set up your Supabase client here
// For now, this shows the structure - you can adapt it to work with your setup

const COUPONS_TO_CREATE = [
  // Trial coupons (30 days free access)
  {
    type: 'trial',
    prefix: 'TRIAL30',
    count: 10,
    durationType: 'days',
    durationValue: 30,
    description: '30-day trial access'
  },
  
  // 1-month premium coupons
  {
    type: 'subscription',
    prefix: 'PREMIUM1M',
    count: 5,
    durationType: 'months',
    durationValue: 1,
    subscriptionPlan: 'yearly',
    description: '1 month premium subscription'
  },
  
  // 6-month premium coupons  
  {
    type: 'subscription',
    prefix: 'PREMIUM6M',
    count: 3,
    durationType: 'months',
    durationValue: 6,
    subscriptionPlan: 'yearly',
    description: '6 months premium subscription'
  },
  
  // Lifetime premium coupons (limited)
  {
    type: 'subscription',
    prefix: 'LIFETIME',
    count: 2,
    durationType: 'lifetime',
    subscriptionPlan: 'lifetime',
    description: 'Lifetime premium subscription'
  }
];

// Sample coupon codes that will be created:
console.log(`
🎫 COUPON CODE GENERATION SCRIPT
================================

This script will create the following coupon codes:

TRIAL COUPONS (30 days free):
- TRIAL30-XXXXXXXX (10 codes)
- Perfect for giving users a taste of premium features

PREMIUM 1-MONTH COUPONS:
- PREMIUM1M-XXXXXXXX (5 codes)  
- Great for subscriber rewards or promotions

PREMIUM 6-MONTH COUPONS:
- PREMIUM6M-XXXXXXXX (3 codes)
- Excellent for special occasions or partnerships

LIFETIME PREMIUM COUPONS:
- LIFETIME-XXXXXXXX (2 codes)
- Ultimate reward for special subscribers

INTEGRATION INSTRUCTIONS:
========================

1. Set up your Supabase client in this script
2. Import the coupon admin utilities from utils/couponAdmin.ts
3. Run the migration first: 
   Apply the migration in supabase/migrations/20250114000000_coupon_system.sql

4. Then run this script to generate your initial coupon codes

SAMPLE CODES ALREADY IN DATABASE:
================================
After running the migration, these sample codes will be available:

- WELCOME30: 30-day trial (100 uses)
- PREMIUM1MONTH: 1-month premium (50 uses)  
- PREMIUM6MONTHS: 6-month premium (20 uses)
- LIFETIMEACCESS: Lifetime premium (5 uses)
- BETA2024: 2-month trial (200 uses)

MANAGING COUPONS:
================

Use the admin utilities in utils/couponAdmin.ts:

// Create a custom coupon
import { createCouponCode } from '@/utils/couponAdmin';

const result = await createCouponCode({
  code: 'CUSTOM2024',
  type: 'subscription',
  durationType: 'months', 
  durationValue: 3,
  subscriptionPlan: 'yearly',
  usesTotal: 10
});

// Create bulk coupons
import { createMultipleCoupons } from '@/utils/couponAdmin';

const bulkResult = await createMultipleCoupons({
  type: 'trial',
  durationType: 'days',
  durationValue: 30
}, 50, 'BULK');

// Get all coupons
import { getAllCouponCodes } from '@/utils/couponAdmin';

const { coupons } = await getAllCouponCodes();

// Deactivate a coupon
import { deactivateCouponCode } from '@/utils/couponAdmin';

await deactivateCouponCode(couponId);

FOR YOUR SUBSCRIBERS:
====================

You can give your subscribers these codes to grant them free access:

1. Trial codes: Give 30-day trial access to new users
2. Premium codes: Reward loyal subscribers with extended access  
3. Lifetime codes: Ultimate reward for special contributors

Users can redeem codes in the app:
Settings → Subscription → "Have a coupon code? Redeem here"

Or from the subscription screen during onboarding.

NEXT STEPS:
==========

1. Run the migration to create database tables
2. Update this script with your Supabase configuration  
3. Generate your initial batch of coupon codes
4. Start distributing codes to your community!

The coupon system is fully integrated with your subscription logic,
so users with active coupons will have full access to premium features.
`);

// To implement this script, you would:
/*
import { createClient } from '@supabase/supabase-js';
import { createMultipleCoupons } from '../utils/couponAdmin';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateCoupons() {
  for (const batch of COUPONS_TO_CREATE) {
    console.log(`Creating ${batch.count} ${batch.prefix} coupons...`);
    
    const result = await createMultipleCoupons(
      {
        type: batch.type,
        durationType: batch.durationType,
        durationValue: batch.durationValue,
        subscriptionPlan: batch.subscriptionPlan,
      },
      batch.count,
      batch.prefix
    );
    
    if (result.success) {
      console.log(`✅ Created ${result.coupons?.length} coupons`);
      result.coupons?.forEach(coupon => {
        console.log(`  - ${coupon.code}`);
      });
    } else {
      console.error(`❌ Failed to create ${batch.prefix} coupons:`, result.errors);
    }
  }
}

generateCoupons().catch(console.error);
*/ 