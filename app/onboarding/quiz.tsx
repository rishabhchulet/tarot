import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
    rotation.value = withDelay(
      index * 200, // 200ms delay between each icon
      withRepeat(
        withTiming(360, { 
          duration: 8000 + (index * 1000), // Different speeds for variety
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

  const handleArchetypeSelect = (archetypeId: string) => {
    const archetype = DETAILED_ARCHETYPES.find(a => a.id === archetypeId);
    if (archetype) {
      setSelectedArchetype(archetype);
      setModalVisible(true);
    }
  };

  const handleModalConfirm = async () => {
    if (selectedArchetype) {
      setSelected(selectedArchetype.id);
      setModalVisible(false);
      await handleContinue();
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedArchetype(null);
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

      <ArchetypeDetailModal
        visible={modalVisible}
        archetype={selectedArchetype}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
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
});