import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NoteEntry } from '@/components/NoteEntry';
import { getJournalEntries } from '@/utils/database';
import { BookOpen } from 'lucide-react-native';

export default function JournalScreen() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const journalEntries = await getJournalEntries();
    setEntries(journalEntries);
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Journal</Text>
        <Text style={styles.subtitle}>Your reflection archive</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={64} color="#6B7280" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyDescription}>
              Your daily reflections will appear here as you build your inner practice.
            </Text>
          </View>
        ) : (
          <View style={styles.entriesContainer}>
            {entries.map((entry, index) => (
              <NoteEntry
                key={entry.id || index}
                entry={entry}
                onUpdate={loadEntries}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#9CA3AF',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  entriesContainer: {
    paddingBottom: 100,
    gap: 16,
  },
});