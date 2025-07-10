import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PlanetaryCardReveal } from '@/components/PlanetaryCardReveal';
import { TarotCardFlow } from '@/components/TarotCardFlow';

export default function DrawScreen() {
  const [showCardFlow, setShowCardFlow] = useState(false);

  const handleAnimationComplete = () => {
    console.log('🎉 Planetary animation complete, showing card selection');
    setShowCardFlow(true);
  };

  const handleCardFlowComplete = () => {
    console.log('🎴 Card flow complete, navigating to daily question');
    router.replace('/daily-question');
  };

  return (
    <View style={styles.container}>
      {!showCardFlow ? (
        <PlanetaryCardReveal onComplete={handleAnimationComplete} />
      ) : (
        <TarotCardFlow onComplete={handleCardFlowComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});