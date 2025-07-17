import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';
import { DETAILED_ARCHETYPES } from '@/data/archetypes';
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
      
      // Pass the archetype ID directly to avoid race condition
      await handleContinue(selectedArchetype.id);
    }
  };

  const handleModalClose = () => {
    console.log('🚪 Modal closing');
    setModalVisible(false);
    setSelectedArchetype(null);
  };



  const handleContinue = async (archetypeId?: string) => {
    const selectedId = archetypeId || selected;
    if (!selectedId) {
      console.warn('❌ No archetype selected');
      return;
    }
    
    console.log('🚀 Continuing with archetype:', selectedId);
    setLoading(true);
    
    try {
      const { error } = await updateUserProfile({ archetype: selectedId });
      if (error) {
        console.warn('⚠️ Profile update error:', error);
        Alert.alert('Update Failed', "Couldn't save your choice, but you can change it later.",
          [{ text: 'OK', onPress: () => router.push('/onboarding/about') }]
        );
      } else {
        console.log('✅ Profile updated successfully');
        await refreshUser();
        console.log('📱 Navigating to about screen...');
        router.push('/onboarding/about');
      }
    } catch (error) {
      console.error('❌ Error in handleContinue:', error);
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
              <Pressable 
                key={archetype.id}
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
            );
          })}
        </View>
      </ScrollView>

      {/* Inline modal for better Android compatibility */}
      {modalVisible && selectedArchetype && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBackdrop} />
          <View style={styles.inlineModalContent}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Close Button */}
              <Pressable style={styles.modalCloseButton} onPress={handleModalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>

              {/* Header with Icon */}
              <View style={styles.modalHeader}>
                <LinearGradient
                  colors={selectedArchetype.colors}
                  style={styles.modalIconContainer}
                >
                  <selectedArchetype.icon size={40} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
                
                <Text style={styles.modalArchetypeName}>{selectedArchetype.name}</Text>
                <Text style={styles.modalShortDescription}>{selectedArchetype.description}</Text>
              </View>

              {/* Keywords */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>✨ Keywords</Text>
                <View style={styles.modalKeywordsContainer}>
                  {selectedArchetype.keywords.map((keyword: string, index: number) => (
                    <View key={index} style={styles.modalKeywordTag}>
                      <Text style={styles.modalKeywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Detailed Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>🌟 Your Journey</Text>
                <Text style={styles.modalDetailedText}>{selectedArchetype.detailedDescription}</Text>
              </View>

              {/* Strengths */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>💪 Your Strengths</Text>
                {selectedArchetype.strengths.map((strength: string, index: number) => (
                  <View key={index} style={styles.modalListItem}>
                    <View style={styles.modalBullet} />
                    <Text style={styles.modalListText}>{strength}</Text>
                  </View>
                ))}
              </View>

              {/* Challenges */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>⚡ Growth Areas</Text>
                {selectedArchetype.challenges.map((challenge: string, index: number) => (
                  <View key={index} style={styles.modalListItem}>
                    <View style={styles.modalBullet} />
                    <Text style={styles.modalListText}>{challenge}</Text>
                  </View>
                ))}
              </View>

              {/* Guidance */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>🧭 Your Guidance</Text>
                <Text style={styles.modalGuidanceText}>{selectedArchetype.guidance}</Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <Pressable style={styles.modalBackButton} onPress={handleModalClose}>
                <Text style={styles.modalBackButtonText}>Choose Different</Text>
              </Pressable>
              
              <Pressable onPress={handleModalConfirm} style={styles.modalConfirmButtonWrapper}>
                <LinearGradient
                  colors={selectedArchetype.colors}
                  style={styles.modalConfirmButton}
                >
                  <Text style={styles.modalConfirmButtonText}>✓ This Is Me</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      )}

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
  // Inline modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  inlineModalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#0f0f0f',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#94A3B8',
    fontFamily: 'Inter-Medium',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalArchetypeName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalShortDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  modalKeywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalKeywordTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modalKeywordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#A855F7',
  },
  modalDetailedText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 24,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 8,
    marginRight: 12,
  },
  modalListText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 22,
  },
  modalGuidanceText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F3F4F6',
    lineHeight: 24,
    fontStyle: 'italic',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalBackButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
  },
  modalConfirmButtonWrapper: {
    flex: 1,
  },
  modalConfirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});