import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Info, FlaskConical, Eye, PenTool, Sparkles, Shuffle, User, Check, X } from 'lucide-react-native';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const ARCHETYPES = [
  {
    id: 'alchemist',
    name: 'The Alchemist',
    icon: FlaskConical,
    color: '#F59E0B',
    description: 'You walk the path of transformation and depth. Turning challenges into your power. Every obstacle is simply power in disguise.'
  },
  {
    id: 'seer',
    name: 'The Seer',
    icon: Eye,
    color: '#6B46C1',
    description: 'The Seer navigates the world with an innate sense of direction, relying on inner knowing and intuition to guide decisions. Trust your inner voice—it always knows the way forward.'
  },
  {
    id: 'creator',
    name: 'The Creator',
    icon: PenTool,
    color: '#10B981',
    description: 'You are dedicated to creating something enduring and lasting, whether it be a home, a business, a personal legacy, or a work of art.'
  },
  {
    id: 'mirror',
    name: 'The Mirror',
    icon: User,
    color: '#60A5FA',
    description: 'You have a unique gift for sensing the emotions and energies of those around you. You learn best by reflecting on your experiences, through meaningful relationships, and by trusting your emotions.'
  },
  {
    id: 'trickster',
    name: 'The Trickster',
    icon: Sparkles,
    color: '#EC4899',
    description: 'You love shaking things up and challenging norms. With your humor, adaptability, and playful disruptions, you push others (and yourself) to grow and evolve.'
  },
  {
    id: 'shapeshifter',
    name: 'The Shapeshifter',
    icon: Shuffle,
    color: '#F472B6',
    description: 'You effortlessly move between different roles and identities. Your strength lies in your adaptability and versatility. Yet, deep down, you might sometimes wonder: "Which of these forms is truly me?"'
  },
];

const ARCHETYPE_EXPLANATION = 'An archetype is a universal personality or pattern that shows how people tend to think, feel, or act across time and cultures.';

export default function ArchetypeQuiz() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(50);
  const cardsOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  const backgroundGlow = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    startEnhancedQuizAnimations();
  }, []);

  useEffect(() => {
    if (showInfo) {
      startModalAnimations();
    }
  }, [showInfo]);

  const startEnhancedQuizAnimations = () => {
    // Background glow
    backgroundGlow.value = withTiming(1, { duration: 3000 });
    
    // Staggered entrance animations
    setTimeout(() => {
      animationHelpers.fadeIn(headerOpacity, 1000);
      headerTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 300);

    setTimeout(() => {
      animationHelpers.fadeIn(cardsOpacity, 1200);
    }, 800);

    setTimeout(() => {
      animationHelpers.fadeIn(buttonOpacity, 800);
      buttonTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 1200);
  };

  const startModalAnimations = () => {
    animationHelpers.fadeIn(modalOpacity, 300);
    modalScale.value = withSpring(1, designTokens.animations.spring.bouncy);
  };

  const closeModal = () => {
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalScale.value = withTiming(0.8, { duration: 200 }, () => {
      runOnJS(setShowInfo)(false);
    });
  };

  const handleArchetypeSelect = async (archetypeId: string) => {
    await HapticManager.triggerSelection();
    setSelected(archetypeId);
  };

  const handleInfoPress = async () => {
    await HapticManager.triggerSelection();
    setShowInfo(true);
  };

  const handleContinue = async () => {
    if (!selected) return;
    
    await HapticManager.triggerSuccess();
    setLoading(true);
    
    setTimeout(() => {
      router.replace('/onboarding/intro');
    }, 500);
  };

  // Enhanced animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.7]),
  }));

  const modalOverlayStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const modalContentStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={25} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Header Section */}
          <Animated.View style={[styles.headerSection, headerStyle]}>
            <GlassCard style={styles.headerCard} intensity="medium">
              <Text style={styles.mainTitle}>This app is your mirror.</Text>
              <Text style={styles.subtitle}>
                It will help you uncover who you are, and your deeper inner mysteries...
              </Text>
              <Text style={styles.description}>
                In your journey, an archetype has arrived to be your guide. Choose the one you currently feel the most drawn to now.
              </Text>
              
              <FloatingAction onPress={handleInfoPress} style={styles.infoButton}>
                <Info size={18} color={designTokens.colors.accent.gold} />
                <Text style={styles.infoText}>What is an archetype?</Text>
              </FloatingAction>
              
              <Text style={styles.chooseHint}>
                (Choose with your gut for now. Don't worry, you will be able to adjust your choice later.)
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Enhanced Cards Section */}
          <Animated.View style={[styles.cardsSection, cardsStyle]}>
            {ARCHETYPES.map((archetype, index) => {
              const IconComponent = archetype.icon;
              const isSelected = selected === archetype.id;
              
              return (
                <ArchetypeCard
                  key={archetype.id}
                  archetype={archetype}
                  isSelected={isSelected}
                  onPress={() => handleArchetypeSelect(archetype.id)}
                  index={index}
                />
              );
            })}
          </Animated.View>
        </ScrollView>

        {/* Enhanced Sticky Continue Button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <GlassCard style={styles.buttonCard} intensity="strong">
            <ModernButton
              title={loading ? 'Saving...' : 'Continue Your Journey'}
              onPress={handleContinue}
              variant={selected && !loading ? "gradient" : "disabled"}
              size="lg"
              disabled={!selected || loading}
              style={styles.continueButton}
            />
          </GlassCard>
        </Animated.View>

        {/* Enhanced Info Modal */}
        {showInfo && (
          <Modal visible={showInfo} transparent animationType="none">
            <Animated.View style={[styles.modalOverlay, modalOverlayStyle]}>
              <Animated.View style={[styles.modalContainer, modalContentStyle]}>
                <GlassCard style={styles.modalContent} intensity="strong">
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>What is an archetype?</Text>
                    <FloatingAction onPress={closeModal} style={styles.modalClose}>
                      <X size={20} color={designTokens.colors.text.secondary} />
                    </FloatingAction>
                  </View>
                  
                  <Text style={styles.modalText}>{ARCHETYPE_EXPLANATION}</Text>
                  
                  <ModernButton
                    title="Got it"
                    onPress={closeModal}
                    variant="gradient"
                    size="md"
                    style={styles.modalButton}
                  />
                </GlassCard>
              </Animated.View>
            </Animated.View>
          </Modal>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// Enhanced Archetype Card Component
const ArchetypeCard = ({ archetype, isSelected, onPress, index }: {
  archetype: typeof ARCHETYPES[0];
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) => {
  const IconComponent = archetype.icon;
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(30);

  useEffect(() => {
    setTimeout(() => {
      animationHelpers.fadeIn(cardOpacity, 600);
      cardTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
      cardScale.value = withSpring(1, designTokens.animations.spring.gentle);
    }, index * 100 + 1000);
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value }
    ],
  }));

  const handlePress = async () => {
    await HapticManager.triggerSelection();
    cardScale.value = withSpring(0.95, designTokens.animations.spring.bouncy, () => {
      cardScale.value = withSpring(1, designTokens.animations.spring.bouncy);
    });
    onPress();
  };

  return (
    <Animated.View style={cardStyle}>
      <Pressable onPress={handlePress} style={styles.archetypeCardWrapper}>
        <GlassCard 
          style={[
            styles.archetypeCard,
            isSelected && styles.selectedCard
          ]} 
          intensity={isSelected ? "strong" : "medium"}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: archetype.color + '20' }]}>
              <IconComponent 
                size={32} 
                color={archetype.color} 
                strokeWidth={2.5} 
              />
              {isSelected && (
                <FloatingAction style={[styles.checkmark, { backgroundColor: archetype.color }]}>
                  <Check size={16} color="#FFFFFF" strokeWidth={3} />
                </FloatingAction>
              )}
            </View>
            
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: archetype.color }]}>
                {archetype.name}
              </Text>
              <Text style={styles.cardDescription}>
                {archetype.description}
              </Text>
            </View>
          </View>
          
          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: archetype.color }]} />
          )}
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  backgroundGlow: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    height: '60%',
    borderRadius: 200,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.4,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 120, // Space for sticky button
  },

  // Enhanced Header
  headerSection: {
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.xl,
  },

  headerCard: {
    paddingVertical: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
    alignItems: 'center',
  },

  mainTitle: {
    fontSize: designTokens.typography.fontSize['4xl'],
    fontWeight: designTokens.typography.fontWeight.extrabold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: designTokens.typography.lineHeight.tight * designTokens.typography.fontSize['4xl'],
  },

  subtitle: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.md,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.lg,
  },

  description: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    maxWidth: 320,
  },

  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },

  infoText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.gold,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  chooseHint: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Enhanced Cards
  cardsSection: {
    paddingHorizontal: designTokens.spacing.md,
    gap: designTokens.spacing.md,
  },

  archetypeCardWrapper: {
    marginBottom: designTokens.spacing.sm,
  },

  archetypeCard: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
    position: 'relative',
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: designTokens.colors.accent.brightBlue,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designTokens.spacing.md,
  },

  iconContainer: {
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.lg,
    position: 'relative',
  },

  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    padding: 4,
    borderRadius: 12,
  },

  cardText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    marginBottom: designTokens.spacing.sm,
  },

  cardDescription: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.sm,
  },

  selectedIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: designTokens.borderRadius.lg,
    borderBottomLeftRadius: designTokens.borderRadius.lg,
  },

  // Enhanced Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xl,
  },

  buttonCard: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
  },

  continueButton: {
    minHeight: 56,
  },

  // Enhanced Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },

  modalContent: {
    paddingVertical: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  modalTitle: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    flex: 1,
  },

  modalClose: {
    padding: designTokens.spacing.xs,
  },

  modalText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.xl,
  },

  modalButton: {
    minHeight: 48,
  },
});