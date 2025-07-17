import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';
import { DETAILED_ARCHETYPES } from '@/data/archetypes';
import { ArchetypeDetailModal } from '@/components/ArchetypeDetailModal';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  withDelay
} from 'react-native-reanimated';

// Animated Icon Component with gentle spinning
const AnimatedIcon = ({ IconComponent, index, isSelected }: { 
  IconComponent: any; 
  index: number; 
  isSelected: boolean; 
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Staggered animation start for each icon
    // Reduce animation complexity on Android for better performance
    const animationDuration = Platform.OS === 'ios' ? 8000 + (index * 1000) : 10000;
    
    rotation.value = withDelay(
      index * 200, // 200ms delay between each icon
      withRepeat(
        withTiming(360, { 
          duration: animationDuration, // Different speeds for variety
          easing: Easing.linear 
        }),
        -1,
        false
      )
    );

    // Selected card gets a subtle bounce
    if (isSelected) {
      scale.value = withRepeat(
        withTiming(1.05, { 
          duration: 1000, 
          easing: Easing.inOut(Easing.ease) 
        }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [isSelected, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <IconComponent size={28} color="#FFFFFF" strokeWidth={2} />
    </Animated.View>
  );
};

export default function ArchetypeQuiz() {
  const { refreshUser } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<typeof DETAILED_ARCHETYPES[0] | null>(null);

  // Debug modal state
  React.useEffect(() => {
    console.log('🎭 Quiz modal state changed:', modalVisible, selectedArchetype?.name);
  }, [modalVisible, selectedArchetype]);

  const handleArchetypeSelect = async (archetypeId: string) => {
    console.log('🎯 Archetype selected:', archetypeId);
    
    // Add haptic feedback on iOS
    if (Platform.OS === 'ios') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptic feedback not available');
      }
    }
    
    const archetype = DETAILED_ARCHETYPES.find(a => a.id === archetypeId);
    console.log('🎭 Found archetype:', archetype?.name);
    if (archetype) {
      setSelectedArchetype(archetype);
      
      // Add slight delay for better UX on Android
      if (Platform.OS === 'android') {
        setTimeout(() => {
          setModalVisible(true);
        }, 100);
      } else {
        setModalVisible(true);
      }
      
      console.log('✅ Modal should be visible now');
    } else {
      console.error('❌ Archetype not found:', archetypeId);
    }
  };

  const handleModalConfirm = async () => {
    if (selectedArchetype) {
      console.log('✅ User confirmed archetype:', selectedArchetype.name);
      
      // Add haptic feedback on iOS for confirmation
      if (Platform.OS === 'ios') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.log('Haptic feedback not available');
        }
      }
      
      setSelected(selectedArchetype.id);
      setModalVisible(false);
      await handleContinue();
    }
  };

  const handleModalClose = () => {
    console.log('🚪 Modal closing');
    setModalVisible(false);
    setSelectedArchetype(null);
  };

  const handleSkipModal = async () => {
    console.log('⏭️ Skipping modal, continuing with first archetype...');
    setSelected('alchemist'); // Default to first archetype
    setModalVisible(false); // Ensure modal is closed
    await handleContinue();
  };

  const handleDirectArchetypeSelection = async (archetypeId: string) => {
    console.log('🎯 Direct archetype selection (bypass modal):', archetypeId);
    setSelected(archetypeId);
    await handleContinue();
  };

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { error } = await updateUserProfile({ archetype: selected });
      if (error) {
        Alert.alert('Update Failed', "Couldn't save your choice, but you can change it later.",
          [{ text: 'OK', onPress: () => router.push('/onboarding/about') }]
        );
      } else {
        await refreshUser();
        router.push('/onboarding/about');
      }
    } catch (error) {
      router.push('/onboarding/about');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#111111', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>This app is your mirror.</Text>
          <Text style={styles.subtitle}>
            In your journey, an archetype has arrived to be your guide. Choose the one you feel most drawn to now.
          </Text>
        </View>

        <View style={styles.cardsSection}>
          {DETAILED_ARCHETYPES.map((archetype, index) => {
            const IconComponent = archetype.icon;
            const isSelected = selected === archetype.id;
            return (
              <View key={archetype.id}>
                <Pressable 
                  onPress={() => handleArchetypeSelect(archetype.id)} 
                  style={[styles.archetypeCard, isSelected && styles.selectedCard]}
                >
                  <View style={styles.cardContent}>
                    <LinearGradient colors={archetype.colors} style={styles.iconContainer}>
                      <AnimatedIcon IconComponent={IconComponent} index={index} isSelected={isSelected} />
                    </LinearGradient>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{archetype.name}</Text>
                      <Text style={styles.cardDescription}>{archetype.description}</Text>
                      <Text style={styles.tapToLearnMore}>Tap to learn more →</Text>
                    </View>
                  </View>
                </Pressable>
                
                {/* Direct selection button for Android users having modal issues */}
                {Platform.OS === 'android' && (
                  <Pressable 
                    onPress={() => handleDirectArchetypeSelection(archetype.id)}
                    style={styles.directSelectButton}
                  >
                    <Text style={styles.directSelectButtonText}>
                      Choose {archetype.name} ✓
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <ArchetypeDetailModal
        visible={modalVisible}
        archetype={selectedArchetype}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />

      {/* Emergency fallback button */}
      <View style={styles.fallbackContainer}>
        <Pressable style={styles.fallbackButton} onPress={handleSkipModal}>
          <Text style={styles.fallbackButtonText}>
            {Platform.OS === 'android' ? 'Continue with The Alchemist' : 'Having trouble? Tap here to continue'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { paddingBottom: 140 },
  headerSection: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
  mainTitle: { fontSize: 28, fontFamily: 'Inter-Bold', color: '#F9FAFB', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 18, fontFamily: 'Inter-Regular', color: '#A1A1AA', textAlign: 'center', lineHeight: 26, maxWidth: 340 },
  cardsSection: { paddingHorizontal: 16, gap: 12 },
  archetypeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: '#8b5cf6',
    backgroundColor: '#110F18',
  },
  cardContent: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontFamily: 'Inter-SemiBold', color: '#FFFFFF', marginBottom: 4 },
  cardDescription: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#A1A1AA', lineHeight: 24, marginBottom: 8 },
  tapToLearnMore: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#6366F1', opacity: 0.8 },
  buttonContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20,
    backgroundColor: 'transparent',
  },
  continueButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  buttonTextDisabled: { color: '#666' },
  fallbackContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  fallbackButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: Platform.OS === 'ios' ? 12 : 8,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    shadowColor: Platform.OS === 'ios' ? '#6366f1' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
    elevation: Platform.OS === 'android' ? 4 : undefined,
  },
  fallbackButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  directSelectButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  directSelectButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});