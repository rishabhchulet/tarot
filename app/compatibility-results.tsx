import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

export default function CompatibilityResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Note: For now, we're just displaying the raw data.
  // In the future, this data would be sent to an AI for analysis.
  const { personA, personB, reportType } = params;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1e293b', '#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#f8fafc" />
        </Pressable>
        <Text style={styles.title}>Compatibility Results</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Report Type</Text>
          <Text style={styles.cardText}>{reportType}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Person A's Data</Text>
          <Text style={styles.cardText}>{personA}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Person B's Data</Text>
          <Text style={styles.cardText}>{personB}</Text>
        </View>
        <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
                In the future, an AI-powered analysis of the compatibility between these two profiles will be displayed here.
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: { padding: 4 },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#e0e7ff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  cardText: {
    color: '#c7d2fe',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  placeholder: {
      marginTop: 16,
      padding: 16,
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: 16,
  },
  placeholderText: {
      color: '#94a3b8',
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
  }
}); 