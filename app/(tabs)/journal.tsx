import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NoteEntry } from '@/components/NoteEntry';
import { getJournalEntries } from '@/utils/database';
import { BookOpen, BookUser } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';

export default function JournalScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = useCallback(async () => {
    setRefreshing(true);
    const journalEntries = await getJournalEntries();
    setEntries(journalEntries);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <BookUser size={28} color="#A78BFA" />
        <Text style={styles.title}>Journal</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadEntries} tintColor="#A78BFA" />
        }
      >
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={64} color="#6B7280" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Your journal is a sacred space.</Text>
            <Text style={styles.emptyDescription}>
              As you complete your daily readings, your reflections will be safely stored here.
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '30%',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#E4E4E7',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  entriesContainer: {
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 16,
  },
});