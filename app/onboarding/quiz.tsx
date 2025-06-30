import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Heart, DollarSign, Brain, Users } from 'lucide-react-native';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

const QUIZ_OPTIONS = [
  {
    id: 'inner',
    title: 'Inner Development',
    icon: Heart,
    description: 'Connecting with your inner wisdom and higher self',
  },
  {
    id: 'relationships',
    title: 'Relationships',
    icon: Users,
    description: 'Building meaningful connections with others',
  },
  {
    id: 'money',
    title: 'Money & Resources',
    icon: DollarSign,
    description: 'Creating abundance and financial wellbeing',
  },
  {
    id: 'health',
    title: 'Physical & Mental Health',
    icon: Brain,
    description: 'Nurturing your body, mind, and overall wellness',
  },
];

export default function QuizScreen() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  const handleContinue = async () => {
    if (!selectedOption) return;
    
    console.log('🎯 Quiz continue button pressed with option:', selectedOption);
    setLoading(true);
    
    try {
      console.log('💾 Updating user profile with focus area...');
      
      // CRITICAL FIX: Much shorter timeout and better error handling
      const updateWithTimeout = new Promise(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Profile update operation timeout'));
        }, 8000); // Reduced to 8 seconds
        
        try {
          const result = await updateUserProfile({ focusArea: selectedOption });
          clearTimeout(timeoutId);
          resolve(result);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
      
      let updateResult;
      try {
        updateResult = await updateWithTimeout as any;
      } catch (timeoutError) {
        console.warn('⚠️ Profile update timeout, proceeding anyway...');
        
        // CRITICAL FIX: If timeout, just proceed - the update might still work in background
        Alert.alert(
          'Slow Connection',
          'The update is taking longer than expected. We\'ll continue and you can change this setting later if needed.',
          [
            { 
              text: 'Continue', 
              onPress: () => {
                console.log('📱 Continuing despite timeout...');
                router.replace('/onboarding/intro');
              }
            }
          ]
        );
        return;
      }
      
      const { error } = updateResult;
      
      if (error) {
        console.error('❌ Error updating focus area:', error);
        
        // CRITICAL FIX: For any error, offer to continue
        Alert.alert(
          'Update Issue',
          'There was an issue saving your preference. You can change this later in settings. Continue anyway?',
          [
            { text: 'Try Again', style: 'cancel', onPress: () => setLoading(false) },
            { 
              text: 'Continue', 
              onPress: () => {
                console.log('📱 Continuing despite error...');
                router.replace('/onboarding/intro');
              }
            }
          ]
        );
        return;
      }

      console.log('✅ Focus area updated successfully');
      
      // CRITICAL FIX: Navigate immediately, refresh user in background
      console.log('📱 Navigating to intro screen...');
      router.replace('/onboarding/intro');
      
      // Refresh user data in background without blocking
      setTimeout(() => {
        refreshUser().catch(error => {
          console.warn('⚠️ Background user refresh failed:', error);
        });
      }, 500);
      
    } catch (error: any) {
      console.error('💥 Error in quiz continue:', error);
      setLoading(false);
      
      // Show user-friendly error and option to continue
      Alert.alert(
        'Connection Issue',
        'There was a problem saving your preference. You can change this later in settings.',
        [
          { text: 'Try Again', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              console.log('📱 Continuing despite error...');
              router.replace('/onboarding/intro');
            }
          }
        ]
      );
    }
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.greeting}>
          Welcome, {user?.name || 'friend'}
        </Text>
        <Text style={styles.title}>First, What Matters to You Right Now?</Text>
        <Text style={styles.subtitle}>
          Just choose what resonates, you can always change this later.
        </Text>
        
        <View style={styles.optionsContainer}>
          {QUIZ_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedOption === option.id;
            
            return (
              <Pressable
                key={option.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => {
                  console.log('🎯 Option selected:', option.id);
                  setSelectedOption(option.id);
                }}
                disabled={loading}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                    <IconComponent 
                      size={24} 
                      color={isSelected ? '#F59E0B' : '#9CA3AF'} 
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
      
      <Pressable 
        style={[styles.button, (!selectedOption || loading) && styles.buttonDisabled]} 
        onPress={handleContinue}
        disabled={!selectedOption || loading}
      >
        <LinearGradient
          colors={(selectedOption && !loading) ? ['#F59E0B', '#D97706'] : ['#6B7280', '#4B5563']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Continue'}
          </Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#F59E0B',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#F59E0B',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: '#D1D5DB',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});