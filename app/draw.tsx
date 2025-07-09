import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { MagicalCardDraw } from '@/components/MagicalCardDraw';

export default function DrawScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MagicalCardDraw
        onComplete={() => {
          console.log('🎉 Card draw complete, navigating to daily question');
          router.replace('/daily-question');
        }}
      />
    </View>
  );
} 