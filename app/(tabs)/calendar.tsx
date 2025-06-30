import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getJournalEntries } from '@/utils/database';
import { Calendar as CalendarIcon, TrendingUp } from 'lucide-react-native';

export default function CalendarScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const journalEntries = await getJournalEntries();
    setEntries(journalEntries);
    calculateStreak(journalEntries);
  };

  const calculateStreak = (entries: any[]) => {
    // Simple streak calculation - consecutive days
    const today = new Date().toDateString();
    let currentStreak = 0;
    
    // Sort entries by date (most recent first)
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date).toDateString();
      const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
      
      if (entryDate === expectedDate) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const groupEntriesByMonth = () => {
    const grouped: { [key: string]: any[] } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(entry);
    });
    
    return grouped;
  };

  const groupedEntries = groupEntriesByMonth();

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Journey</Text>
        <Text style={styles.subtitle}>Tracking your inner growth</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <CalendarIcon size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{entries.length}</Text>
            <Text style={styles.statLabel}>Total Reflections</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedEntries).length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={64} color="#6B7280" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Your journey begins</Text>
            <Text style={styles.emptyDescription}>
              Start your daily practice to see your inner growth over time.
            </Text>
          </View>
        ) : (
          <View style={styles.historyContainer}>
            {Object.entries(groupedEntries).map(([month, monthEntries]) => (
              <View key={month} style={styles.monthSection}>
                <Text style={styles.monthTitle}>{month}</Text>
                <View style={styles.monthEntries}>
                  {monthEntries.map((entry, index) => (
                    <View key={entry.id || index} style={styles.historyEntry}>
                      <View style={styles.entryDate}>
                        <Text style={styles.entryDay}>
                          {new Date(entry.date).getDate()}
                        </Text>
                      </View>
                      <View style={styles.entryContent}>
                        <Text style={styles.entryCardName}>{entry.card_name}</Text>
                        <Text style={styles.entryPreview} numberOfLines={2}>
                          {entry.reflection}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
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
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
  historyContainer: {
    paddingBottom: 100,
  },
  monthSection: {
    marginBottom: 32,
  },
  monthTitle: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    marginBottom: 16,
  },
  monthEntries: {
    gap: 12,
  },
  historyEntry: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  entryDate: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  entryDay: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  entryContent: {
    flex: 1,
  },
  entryCardName: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  entryPreview: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    lineHeight: 20,
  },
});