import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Info } from 'lucide-react-native';

import imgAlchemist from '../../assets/images/image.png';
import imgSeer from '../../assets/images/image copy.png';
import imgCreator from '../../assets/images/image copy copy.png';
import imgMirror from '../../assets/images/back of the deck.jpeg';
import imgTrickster from '../../assets/images/icon.png';
import imgShapeshifter from '../../assets/images/favicon.png';

const ARCHETYPES = [
  {
    id: 'alchemist',
    name: 'The Alchemist',
    image: imgAlchemist,
    description: 'You walk the path of transformation and depth. Turning challenges into your power. Every obstacle is simply power in disguise.'
  },
  {
    id: 'seer',
    name: 'The Seer',
    image: imgSeer,
    description: 'The Seer navigates the world with an innate sense of direction, relying on inner knowing and intuition to guide decisions. Trust your inner voice—it always knows the way forward.'
  },
  {
    id: 'creator',
    name: 'The Creator',
    image: imgCreator,
    description: 'You are dedicated to creating something enduring and lasting, whether it be a home, a business, a personal legacy, or a work of art.'
  },
  {
    id: 'mirror',
    name: 'The Mirror',
    image: imgMirror,
    description: 'You have a unique gift for sensing the emotions and energies of those around you. You learn best by reflecting on your experiences, through meaningful relationships, and by trusting your emotions.'
  },
  {
    id: 'trickster',
    name: 'The Trickster',
    image: imgTrickster,
    description: 'You love shaking things up and challenging norms. With your humor, adaptability, and playful disruptions, you push others (and yourself) to grow and evolve.'
  },
  {
    id: 'shapeshifter',
    name: 'The Shapeshifter',
    image: imgShapeshifter,
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
    // TODO: Save archetype to user profile here
    setTimeout(() => {
      router.replace('/onboarding/intro');
    }, 500);
  };

  return (
    <LinearGradient
      colors={["#1F2937", "#374151", "#6B46C1"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
        <View style={styles.cardsContainer}>
          {ARCHETYPES.map((a) => (
            <Pressable
              key={a.id}
              style={[styles.card, selected === a.id && styles.cardSelected]}
              onPress={() => setSelected(a.id)}
              accessibilityLabel={a.name}
              accessibilityRole="button"
            >
              <Image source={a.image} style={styles.cardImage} resizeMode="cover" />
              <Text style={styles.cardTitle}>{a.name}</Text>
              <Text style={styles.cardDesc}>{a.description}</Text>
              {selected === a.id && <View style={styles.selectedGlow} />}
            </Pressable>
          ))}
        </View>
        <Pressable
          style={[styles.continueButton, (!selected || loading) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selected || loading}
        >
          <LinearGradient
            colors={selected && !loading ? ["#F59E0B", "#D97706"] : ["#6B7280", "#4B5563"]}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>{loading ? 'Saving...' : 'Continue'}</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 12,
  },
  intro: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 18,
    fontFamily: 'Inter-Regular',
  },
  cardsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    width: 170,
    backgroundColor: 'rgba(31,41,55,0.95)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: '#222',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 18,
  },
  selectedGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F59E0B',
    opacity: 0.25,
    zIndex: -1,
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: 220,
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