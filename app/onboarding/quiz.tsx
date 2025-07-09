import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Info, FlaskConical, Eye, PenTool, Sparkles, Shuffle, User, Check } from 'lucide-react-native';

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

const ARCHETYPE_EXPLANATION =
  'An archetype is a universal personality or pattern that shows how people tend to think, feel, or act across time and cultures.';

export default function ArchetypeQuiz() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      router.replace('/onboarding/intro');
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1E293B", "#6B46C1", "#F59E0B"]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>This app is your mirror.</Text>
          <Text style={styles.subtitle}>
            It will help you uncover who you are, and your deeper inner mysteries...
          </Text>
          <Text style={styles.description}>
            In your journey, an archetype has arrived to be your guide. Choose the one you currently feel the most drawn to now.
          </Text>
          
          <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.infoButton}>
            <Info size={18} color="#F59E0B" />
            <Text style={styles.infoText}>What is an archetype?</Text>
          </TouchableOpacity>
          
          <Text style={styles.chooseHint}>
            (Choose with your gut for now. Don't worry, you will be able to adjust your choice later.)
          </Text>
        </View>

        {/* Cards Section */}
        <View style={styles.cardsSection}>
          {ARCHETYPES.map((archetype) => {
            const IconComponent = archetype.icon;
            const isSelected = selected === archetype.id;
            
            return (
              <Pressable
                key={archetype.id}
                style={[
                  styles.archetypeCard,
                  isSelected && [styles.selectedCard, { borderColor: archetype.color }]
                ]}
                onPress={() => setSelected(archetype.id)}
                accessibilityLabel={archetype.name}
                accessibilityRole="button"
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: archetype.color + '15' }]}>
                    <IconComponent 
                      size={32} 
                      color={archetype.color} 
                      strokeWidth={2.5} 
                    />
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: archetype.color }]}>
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      </View>
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
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Continue Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.continueButton, (!selected || loading) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selected || loading}
        >
          <LinearGradient
            colors={selected && !loading ? ["#F59E0B", "#EF4444"] : ["#64748B", "#475569"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Info Modal */}
      <Modal visible={showInfo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What is an archetype?</Text>
            <Text style={styles.modalText}>{ARCHETYPE_EXPLANATION}</Text>
            <Pressable style={styles.modalCloseButton} onPress={() => setShowInfo(false)}>
              <Text style={styles.modalCloseText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for sticky button
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    maxWidth: width * 0.9,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 16,
  },
  infoText: {
    color: '#F59E0B',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  chooseHint: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  cardsSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  archetypeCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedCard: {
    borderWidth: 2,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    transform: [{ scale: 1.02 }],
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalCloseButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
  },
  modalCloseText: {
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
});