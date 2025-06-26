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
      return [];
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
};

export const startFreeTrial = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
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
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return null;
    }

    const now = new Date();
    const trialEndDate = new Date(data.trial_end_date);
    
    const trialExpired = now > trialEndDate;
    const trialDaysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      ...data,
      trialExpired,
      trialDaysLeft,
      isInTrial: !trialExpired && !data.has_active_subscription,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
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