import { supabase } from './supabase';
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

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        ...entry,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
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

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

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

    const { data, error } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .limit(1);

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

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .limit(1);

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

    // Update today's entry with the daily question
    const { error } = await supabase
      .from('journal_entries')
      .update({
        daily_question: question,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('date', today);

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

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('❌ Error starting trial:', error);
      throw error;
    }

    console.log('✅ Free trial started successfully');
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Error starting free trial:', error);
    return { data: null, error: error.message };
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user for subscription check');
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

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

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        has_active_subscription: true,
        subscription_type: subscriptionType,
        subscription_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};