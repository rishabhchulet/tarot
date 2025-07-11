import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, Users } from 'lucide-react-native';
import { BirthProfileInput, BirthProfile } from '@/components/BirthProfileInput';
import { useAuth } from '@/contexts/AuthContext';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const initialProfileState: BirthProfile = {
  name: '',
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
    name: user?.name || '',
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
  
  const isReady = personA.name.trim() && personA.date && personA.location && 
                  personB.name.trim() && personB.date && personB.location;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Enhanced Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#F9FAFB" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Users size={24} color="#a78bfa" />
          <Text style={styles.title}>Compatibility</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Beautiful intro section */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Discover Your Connection</Text>
          <Text style={styles.introSubtitle}>
            Explore the cosmic harmony between two souls through astrology and ancient wisdom
          </Text>
        </View>

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

        {/* Enhanced selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Report Type</Text>
          <View style={styles.segmentWrapper}>
            <SegmentedControl
              values={reportTypes}
              selectedIndex={reportType}
              onChange={(event) => {
                setReportType(event.nativeEvent.selectedSegmentIndex);
              }}
              backgroundColor={'rgba(139, 92, 246, 0.1)'}
              tintColor={'#8b5cf6'}
              fontStyle={{ color: '#d1d5db', fontFamily: 'Inter-Medium', fontSize: 14 }}
              activeFontStyle={{ color: '#ffffff', fontFamily: 'Inter-Bold', fontSize: 14 }}
            />
          </View>
        </View>
        
        {/* Enhanced Calculate Button */}
        <Pressable 
          onPress={handleCalculate} 
          disabled={!isReady || loading}
          style={[styles.primaryButton, (!isReady || loading) && styles.primaryButtonDisabled]}
        >
          <LinearGradient
            colors={!isReady || loading ? ['#374151', '#374151'] : ['#8b5cf6', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Heart size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>
                  Calculate Compatibility
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        {/* Validation hints */}
        {!isReady && (
          <View style={styles.validationHints}>
            <Text style={styles.hintText}>
              Please fill in names, birth dates, and locations for both profiles
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: { 
    padding: 8,
    borderRadius: 12,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  introTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 8,
  },
  introSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 24,
  },
  selectorContainer: {
    marginVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectorLabel: {
    color: '#F9FAFB',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  segmentWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButton: {
    marginTop: 24,
    borderRadius: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  validationHints: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  hintText: {
    color: '#fbbf24',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
}); 