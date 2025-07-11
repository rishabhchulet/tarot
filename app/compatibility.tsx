import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { BirthProfileInput, BirthProfile } from '@/components/BirthProfileInput';
import { useAuth } from '@/contexts/AuthContext';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const initialProfileState: BirthProfile = {
  date: null,
  time: null,
  location: '',
  coordinates: null,
};

export default function CompatibilityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [personA, setPersonA] = useState<BirthProfile>({
    ...initialProfileState,
    location: user?.birthLocation || '',
    coordinates: (user?.latitude && user?.longitude) ? { latitude: user.latitude, longitude: user.longitude } : null,
    date: user?.birthDate ? new Date(user.birthDate) : null,
    time: user?.birthTime ? new Date(`1970-01-01T${user.birthTime}`) : null,
  });
  const [personB, setPersonB] = useState<BirthProfile>(initialProfileState);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState(0);
  const reportTypes = ['Relationship', 'Marriage', 'Friendship'];

  const handleCalculate = () => {
    setLoading(true);

    const dataToSend = {
      personA: JSON.stringify(personA),
      personB: JSON.stringify(personB),
      reportType: reportTypes[reportType],
    };

    // Simulate API call
    setTimeout(() => {
      router.push({
        pathname: '/compatibility-results',
        params: dataToSend,
      });
      setLoading(false);
    }, 1000);
  };
  
  const isReady = personA.date && personA.location && personB.date && personB.location;

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
        <Text style={styles.title}>Compatibility</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <BirthProfileInput
          title="Your Profile"
          profile={personA}
          onProfileChange={setPersonA}
        />

        <BirthProfileInput
          title="Their Profile"
          profile={personB}
          onProfileChange={setPersonB}
        />

        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Report Type</Text>
          <SegmentedControl
            values={reportTypes}
            selectedIndex={reportType}
            onChange={(event) => {
              setReportType(event.nativeEvent.selectedSegmentIndex);
            }}
            backgroundColor={'rgba(255, 255, 255, 0.1)'}
            tintColor={'#6366f1'}
            fontStyle={{ color: '#e0e7ff', fontFamily: 'Inter-SemiBold' }}
            activeFontStyle={{ color: '#fff', fontFamily: 'Inter-Bold' }}
          />
        </View>
        
        <Pressable 
          onPress={handleCalculate} 
          disabled={!isReady || loading}
          style={[styles.primaryButton, (!isReady || loading) && styles.primaryButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#1e293b" />
          ) : (
            <>
              <Heart size={20} color={!isReady ? "#94a3b8" : "#c7d2fe"} />
              <Text style={[styles.primaryButtonText, !isReady && styles.primaryButtonTextDisabled]}>
                Calculate Compatibility
              </Text>
            </>
          )}
        </Pressable>
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
  selectorContainer: {
    marginVertical: 16,
  },
  selectorLabel: {
    color: '#e0e7ff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 16,
    borderRadius: 999,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    gap: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#334155',
  },
  primaryButtonText: {
    color: '#1e293b',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  primaryButtonTextDisabled: {
    color: '#94a3b8',
  }
}); 