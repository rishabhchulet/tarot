import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MagicalCardDraw } from '@/components/MagicalCardDraw';
import { TarotCardFlow } from '@/components/TarotCardFlow';

export default function DrawScreen() {
  const [showCardFlow, setShowCardFlow] = useState(false);

  const handleAnimationComplete = () => {
    console.log('🎉 Card draw animation complete, showing card selection');
    setShowCardFlow(true);
  };

  const handleCardFlowComplete = () => {
    console.log('🎴 Card flow complete, navigating to daily question');
    router.replace('/daily-question');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      
      {!showCardFlow ? (
        <MagicalCardDraw onComplete={handleAnimationComplete} />
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