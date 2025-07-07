import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity, Dimensions, FlatList, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Info, FlaskConical, Eye, PenTool, Sparkles, Shuffle, User } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const CARD_WIDTH = width * 0.8;
const CARD_SPACING = 16;

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
    icon: User, // fallback icon for Mirror
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
  const flatListRef = useRef<FlatList>(null);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      router.replace('/onboarding/intro');
    }, 500);
  };

  const renderCard = ({ item, index }: { item: typeof ARCHETYPES[0]; index: number }) => {
    const IconComponent = item.icon;
    const isSelected = selected === item.id;
    return (
      <Pressable
        style={[styles.card, isSelected && { borderColor: item.color, shadowColor: item.color, transform: [{ scale: 1.06 }] }]}
        onPress={() => setSelected(item.id)}
        accessibilityLabel={item.name}
        accessibilityRole="button"
      >
        <View style={[styles.iconCircle, { backgroundColor: item.color + '22', borderColor: item.color }]}> 
          <IconComponent size={54} color={item.color} strokeWidth={2.5} />
          {isSelected && <View style={[styles.selectedGlow, { borderColor: item.color }]} />}
        </View>
        <Text style={[styles.cardTitle, { color: item.color }]}>{item.name}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#232946", "#6B46C1", "#F59E0B"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>This app is your mirror.</Text>
        <Text style={styles.intro}>
          It will help you uncover who you are, and your deeper inner mysteries...{"\n\n"}
          In your journey, an archetype has arrived to be your guide. Choose the one you currently feel the most drawn to now.
        </Text>
        <View style={styles.infoRow}>
          <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.infoButton}>
            <Info size={20} color="#F59E0B" />
            <Text style={styles.infoText}>What is an archetype?</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.chooseText}>
          (Choose with your gut for now. Don't worry, you will be able to adjust your choice later.)
        </Text>
      </View>
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={ARCHETYPES}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate={Platform.OS === 'ios' ? 0 : 0.98}
          contentContainerStyle={styles.cardsContainer}
          ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
          getItemLayout={(_, index) => ({ length: CARD_WIDTH + CARD_SPACING, offset: (CARD_WIDTH + CARD_SPACING) * index, index })}
        />
      </View>
      <View style={styles.stickyButtonWrapper}>
        <Pressable
          style={[styles.continueButton, (!selected || loading) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selected || loading}
        >
          <LinearGradient
            colors={selected && !loading ? ["#F59E0B", "#6B46C1"] : ["#6B7280", "#4B5563"]}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>{loading ? 'Saving...' : 'Continue'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <Modal visible={showInfo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What is an archetype?</Text>
            <Text style={styles.modalText}>{ARCHETYPE_EXPLANATION}</Text>
            <Pressable style={styles.modalClose} onPress={() => setShowInfo(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },
  header: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 10,
  },
  intro: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  infoText: {
    color: '#F59E0B',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  chooseText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  carouselWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  cardsContainer: {
    alignItems: 'center',
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    // This centers the first and last card
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(31,41,55,0.97)',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    marginBottom: 16,
    transform: [{ scale: 1 }],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    backgroundColor: '#232946',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  selectedGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 44,
    borderWidth: 3,
    opacity: 0.25,
    zIndex: -1,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 20,
  },
  stickyButtonWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'center',
    marginTop: 10,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#232946',
    borderRadius: 18,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 18,
  },
  modalClose: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
  },
  modalCloseText: {
    color: '#232946',
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
  },
});