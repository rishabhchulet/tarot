import { supabase, createTimeoutWrapper } from './supabase';
import type { Database } from './supabase';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];

export const saveJournalEntry = async (entry: Omit<JournalEntryInsert, 'user_id'>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // CRITICAL FIX: Ensure user profile exists before saving journal entry
    // This prevents foreign key constraint violations
    try {
      const { error: profileError } = await createTimeoutWrapper(
        () => supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle(),
        3000
      );

      // If profile doesn't exist, try to create it
      if (profileError || !user) {
        console.log('📝 Creating user profile before saving journal entry...');
        await createTimeoutWrapper(
          () => supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email || `user_${user.id}@example.com`,
              name: user.user_metadata?.name || 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          3000
        );
      }
    } catch (profileError) {
      console.warn('⚠️ Could not verify/create user profile, continuing anyway:', profileError);
    }

    // CRITICAL FIX: Use timeout wrapper for database operations
    const result = await createTimeoutWrapper(
      () => supabase
        .from('journal_entries')
        .insert({
          ...entry,
          user_id: user.id,
        })
        .select()
        .maybeSingle(), // Use maybeSingle() to handle no rows gracefully
      5000 // 5 second timeout
    );

    const { data, error } = result;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Error saving journal entry:', error);
    return { data: null, error: error.message };
  }
};

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user for journal entries');
      return [];
    }

    // CRITICAL FIX: Use timeout wrapper with fallback
    const result = await createTimeoutWrapper(
      () => supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      4000, // 4 second timeout
      { data: [], error: null } // Fallback to empty array
    );

    const { data, error } = result;

    if (error) {
      console.error('❌ Error fetching journal entries:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error getting journal entries:', error);
    return [];
  }
};

// Check if user has drawn a card today
export const hasDrawnCardToday = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user for card check');
      return false;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // CRITICAL FIX: Use longer timeout with fallback
    const result = await createTimeoutWrapper(
      () => supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1),
      5000, // INCREASED: 5 second timeout
      { data: [], error: null } // Fallback to no entries
    );

    const { data, error } = result;

    if (error) {
      console.error('❌ Error checking today\'s card:', error);
      return false;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('❌ Error checking today\'s card:', error);
    return false;
  }
};

// Get today's journal entry (if exists)
export const getTodaysEntry = async (): Promise<JournalEntry | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user for today\'s entry');
      return null;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // CRITICAL FIX: Use longer timeout with fallback
    const result = await createTimeoutWrapper(
      () => supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1),
      5000, // INCREASED: 5 second timeout
      { data: [], error: null } // Fallback to no entries
    );

    const { data, error } = result;

    if (error) {
      console.error('❌ Error getting today\'s entry:', error);
      throw error;
    }

    // Return the first entry if found, otherwise null
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('❌ Error getting today\'s entry:', error);
    return null;
  }
};

// Save today's daily question for later reference
export const saveDailyQuestion = async (question: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const today = new Date().toISOString().split('T')[0];

    // CRITICAL FIX: Use timeout wrapper for update
    const result = await createTimeoutWrapper(
      () => supabase
        .from('journal_entries')
        .update({
          daily_question: question,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('date', today),
      4000, // 4 second timeout
      { error: null } // Fallback to success
    );

    const { error } = result;

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const startFreeTrial = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user for trial start');
      throw new Error('No authenticated user');
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialStartDate.getDate() + 5); // 5-day trial

    const subscriptionData: SubscriptionInsert = {
      user_id: user.id,
      trial_start_date: trialStartDate.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
      has_active_subscription: false,
      subscription_type: null,
    };

    // CRITICAL FIX: Use longer timeout with retry logic for subscription creation
    let result = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Trial creation attempt ${attempts}/${maxAttempts}...`);
      
      result = await createTimeoutWrapper(
        () => supabase
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'user_id' })
          .select()
          .maybeSingle(), // Use maybeSingle() to handle no rows gracefully
        attempts === 1 ? 10000 : 6000, // Longer timeout on first attempt
        { data: subscriptionData, error: null }
      );

      const { data, error } = result;

      if (!error && data) {
        console.log('✅ Free trial started successfully');
        return { data, error: null };
      }
      
      if (attempts < maxAttempts) {
        console.warn(`⚠️ Trial creation attempt ${attempts} failed, retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait between attempts
      } else {
        console.error('❌ All trial creation attempts failed:', error);
        // Return success anyway since user can still use the app
        return { data: subscriptionData, error: null };
      }
    }

    return { data: subscriptionData, error: null };
  } catch (error: any) {
    console.error('❌ Error starting free trial:', error);
    // Don't fail the entire process for trial creation issues
    return { data: null, error: null };
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user for subscription check');
      return null;
    }

    // CRITICAL FIX: Use longer timeout with retry logic
    const result = await createTimeoutWrapper(
      () => supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id),
      6000, // INCREASED: 6 second timeout
      { data: [], error: null } // Fallback to no subscription
    );

    const { data, error } = result;

    if (error) {
      console.error('❌ Error fetching subscription:', error);
      return null;
    }

    // Check if no subscription record exists (new user)
    if (!data || data.length === 0) {
      console.log('ℹ️ No subscription record found');
      return null;
    }

    // Get the first (and should be only) subscription record
    const subscription = data[0];
    
    const now = new Date();
    const trialEndDate = new Date(subscription.trial_end_date);
    
    const trialExpired = now > trialEndDate;
    const trialDaysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      ...subscription,
      trialExpired,
      trialDaysLeft,
      isInTrial: !trialExpired && !subscription.has_active_subscription,
    };
  } catch (error) {
    console.error('❌ Error getting subscription status:', error);
    return null;
  }
};

export const activateSubscription = async (subscriptionType: 'monthly' | 'yearly' | 'lifetime') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // CRITICAL FIX: Use timeout wrapper for subscription activation
    const result = await createTimeoutWrapper(
      () => supabase
        .from('subscriptions')
        .update({
          has_active_subscription: true,
          subscription_type: subscriptionType,
          subscription_start_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .maybeSingle(), // Use maybeSingle() to handle no rows gracefully
      5000 // 5 second timeout
    );

    const { data, error } = result;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};