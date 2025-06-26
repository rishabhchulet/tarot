import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { I_CHING_HEXAGRAMS } from '@/data/iChing';

export function IChing() {
  const [hexagram, setHexagram] = useState<any>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * I_CHING_HEXAGRAMS.length);
    setHexagram(I_CHING_HEXAGRAMS[randomIndex]);
  }, []);

  if (!hexagram) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your I Ching Guidance</Text>
      <View style={styles.hexagramContainer}>
        <Text style={styles.hexagramNumber}>#{hexagram.number}</Text>
        <Text style={styles.hexagramName}>{hexagram.name}</Text>
        <View style={styles.hexagramSymbol}>
          {hexagram.lines.map((line: boolean, index: number) => (
            <View
              key={index}
              style={[
                styles.line,
                line ? styles.solidLine : styles.brokenLine
              ]}
            />
          ))}
        </View>
        <Text style={styles.hexagramMeaning}>{hexagram.meaning}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 20,
  },
  hexagramContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hexagramNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  hexagramName: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 20,
  },
  hexagramSymbol: {
    marginBottom: 20,
    gap: 4,
  },
  line: {
    height: 4,
    width: 80,
    backgroundColor: '#F59E0B',
  },
  solidLine: {
    // Solid line style
  },
  brokenLine: {
    // Broken line - create gap in middle
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  hexagramMeaning: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
  },
});