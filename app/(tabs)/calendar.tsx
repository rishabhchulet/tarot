import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getJournalEntries } from '@/utils/database';
import { Calendar, CalendarUtils } from 'react-native-calendars';
import { router, useFocusEffect } from 'expo-router';
import { BookText, TrendingUp, Sparkles } from 'lucide-react-native';

const INITIAL_DATE = CalendarUtils.getToday();

export default function HistoryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(INITIAL_DATE);

  const loadEntries = useCallback(async () => {
    const journalEntries = await getJournalEntries();
    setEntries(journalEntries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};
    entries.forEach(entry => {
      const dateString = CalendarUtils.getCalendarDateString(entry.date);
      marked[dateString] = {
        marked: true,
        dotColor: '#A78BFA',
        // customStyles: { ... }
      };
    });
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
    } else {
      marked[selectedDate] = { selected: true, selectedColor: '#3B82F6' };
    }
    return marked;
  }, [entries, selectedDate]);

  const selectedEntry = useMemo(() => {
    return entries.find(entry => CalendarUtils.getCalendarDateString(entry.date) === selectedDate);
  }, [entries, selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <Calendar size={28} color="#3B82F6" />
        <Text style={styles.title}>History</Text>
      </View>
      <Calendar
        current={INITIAL_DATE}
        style={calendarTheme.calendar}
        theme={calendarTheme}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={markedDates}
      />
      <View style={styles.detailsContainer}>
        {selectedEntry ? (
            <Pressable style={styles.entryCard} onPress={() => router.push('/journal')}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardDate}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                </View>
                <View style={styles.cardBody}>
                    <Sparkles size={22} color="#FBBF24" style={{marginRight: 12}}/>
                    <View>
                        <Text style={styles.cardTitle}>{selectedEntry.card_name}</Text>
                        <Text style={styles.cardPreview} numberOfLines={2}>{selectedEntry.reflection}</Text>
                    </View>
                </View>
                <Text style={styles.viewEntryText}>View Full Entry →</Text>
            </Pressable>
        ) : (
            <View style={styles.emptyCard}>
                <BookText size={32} color="#4B5563" />
                <Text style={styles.emptyText}>No reflection recorded on this day.</Text>
            </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const calendarTheme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: '#A1A1AA',
    selectedDayBackgroundColor: '#3B82F6',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#8B5CF6',
    dayTextColor: '#D1D5DB',
    textDisabledColor: '#4B5563',
    dotColor: '#A78BFA',
    selectedDotColor: '#ffffff',
    arrowColor: '#3B82F6',
    disabledArrowColor: '#374151',
    monthTextColor: '#F9FAFB',
    indicatorColor: 'blue',
    textDayFontFamily: 'Inter-Regular',
    textMonthFontFamily: 'Inter-Bold',
    textDayHeaderFontFamily: 'Inter-SemiBold',
    textDayFontSize: 16,
    textMonthFontSize: 20,
    textDayHeaderFontSize: 12,
};

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
  detailsContainer: {
    flex: 1,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255, 0.08)',
  },
  entryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardDate: {
    fontFamily: 'Inter-SemiBold',
    color: '#A1A1AA',
    fontSize: 14,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    fontSize: 18,
    marginBottom: 4,
  },
  cardPreview: {
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  viewEntryText: {
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'right',
  },
  emptyCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    gap: 16,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    fontSize: 16,
  }
});