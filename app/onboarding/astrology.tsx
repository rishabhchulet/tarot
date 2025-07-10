import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calendar, Clock, Star } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/utils/auth';
import { LocationInput } from '@/components/LocationInput';

export default function AstrologyScreen() {
  const { user, updateUser } = useAuth();

  // Initialize with empty/default values instead of current date/time
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [loading, setLoading] = useState(false);
  
  const glowScale = useSharedValue(1);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
    
    // Load existing user data if available
    if (user?.birthLocation) {
      setLocation(user.birthLocation);
      if (user.latitude && user.longitude) {
        setCoordinates({
          latitude: user.latitude,
          longitude: user.longitude
        });
      }
    }
    
    // Load existing birth date/time if available
    if (user?.birthDate) {
      setDate(new Date(user.birthDate));
    }
    if (user?.birthTime) {
      // Parse time string (HH:MM:SS) and create a Date object
      const [hours, minutes] = user.birthTime.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setTime(timeDate);
    }
  }, [user]);
  
  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleLocationChange = (newLocation: string, newCoordinates?: { latitude: number; longitude: number }) => {
    setLocation(newLocation);
    if (newCoordinates) {
      setCoordinates(newCoordinates);
      console.log('📍 Location coordinates updated:', newCoordinates);
    }
  };

  const handleContinue = async () => {
    if (!date || !location.trim()) {
      Alert.alert('Incomplete Information', 'Please provide your birthdate and location to continue.');
      return;
    }

    // Show warning if no coordinates found
    if (!coordinates) {
      Alert.alert(
        'Location Coordinates',
        'We couldn\'t find exact coordinates for this location. You can continue and update this later, or try entering a major city name.',
        [
          { text: 'Continue Anyway', onPress: () => proceedWithSave() },
          { text: 'Try Again', style: 'cancel' }
        ]
      );
      return;
    }

    proceedWithSave();
  };

  const proceedWithSave = async () => {
    setLoading(true);

    const updates = {
      birthDate: date!.toISOString().split('T')[0], // YYYY-MM-DD
      birthTime: time ? time.toTimeString().split(' ')[0] : '12:00:00', // HH:MM:SS or default noon
      birthLocation: location.trim(),
      latitude: coordinates?.latitude || null,
      longitude: coordinates?.longitude || null,
      onboardingStep: 'confirmation',
    };

    try {
      const { error } = await updateUserProfile(updates);
      if (error) throw new Error(error);
      
      await updateUser({
        id: user!.id,
        email: user!.email,
        name: user!.name,
        archetype: user!.archetype,
        ...updates
      });
      
      console.log('✅ Astrology data saved:', updates);
      router.push('/onboarding/confirmation');
    } catch (error: any) {
      Alert.alert('Error', "We couldn't save your energetic map details. Please try again.");
      console.error("Error updating user's astrological data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: Date | null) => {
    if (!time) return '';
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderDateInput = () => (
    <Pressable onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
      <Calendar size={20} color="#94a3b8" style={styles.inputIcon} />
      <Text style={[styles.inputText, date ? styles.inputTextValue : {}]}>
        {date ? formatDate(date) : 'Select your birth date'}
      </Text>
      {!date && <Text style={styles.requiredIndicator}>*</Text>}
    </Pressable>
  );

  const renderTimeInput = () => (
    <Pressable onPress={() => setShowTimePicker(true)} style={styles.inputContainer}>
      <Clock size={20} color="#94a3b8" style={styles.inputIcon} />
      <Text style={[styles.inputText, time ? styles.inputTextValue : {}]}>
        {time ? formatTime(time) : 'Select birth time (optional)'}
      </Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Star size={60} color="#0f172a" fill="#facc15" strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Your Energetic Map</Text>
          <Text style={styles.subtitle}>Enter what you know—approximations are okay.</Text>
        </View>
        
        <View style={styles.inputGroup}>
          {renderDateInput()}
          {renderTimeInput()}

          <LocationInput
            value={location}
            onLocationChange={handleLocationChange}
            placeholder="Birth Location (City, Country)"
            disabled={loading}
          />

          {/* Show coordinates if found */}
          {coordinates && (
            <View style={styles.coordinatesDisplay}>
              <Text style={styles.coordinatesText}>
                📍 Coordinates: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
              </Text>
              <Text style={styles.coordinatesSubtext}>
                Perfect for accurate astrology charts
              </Text>
            </View>
          )}

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, date && styles.progressDotComplete]} />
              <Text style={[styles.progressText, date && styles.progressTextComplete]}>Birth Date</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, time && styles.progressDotComplete]} />
              <Text style={[styles.progressText, time && styles.progressTextComplete]}>Birth Time</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, coordinates && styles.progressDotComplete]} />
              <Text style={[styles.progressText, coordinates && styles.progressTextComplete]}>Location</Text>
            </View>
          </View>
        </View>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={date || new Date(1990, 0, 1)} // Default to Jan 1, 1990 if no date selected
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()} // Can't be born in the future
          minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={time || new Date(2000, 0, 1, 12, 0)} // Default to noon if no time selected
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      <View style={styles.buttonContainer}>
        <Pressable 
          onPress={handleContinue} 
          disabled={loading || !date || !location.trim()} 
          style={[styles.primaryButton, (loading || !date || !location.trim()) && styles.primaryButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={[styles.primaryButtonText, (loading || !date || !location.trim()) && styles.primaryButtonTextDisabled]}>
              Generate My Map
            </Text>
          )}
        </Pressable>
        
        {/* Helper text */}
        <Text style={styles.buttonHelperText}>
          {!date ? 'Please select your birth date' : 
           !location.trim() ? 'Please enter your birth location' :
           !coordinates ? 'Searching for coordinates...' :
           'Ready to create your energetic map'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  glow: {
    position: 'absolute', top: '5%', left: '50%', width: 400, height: 400,
    backgroundColor: 'rgba(245, 158, 11, 0.25)', borderRadius: 200,
    transform: [{ translateX: -200 }],
  },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 32, paddingTop: 80, paddingBottom: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  iconContainer: {
    width: 100, height: 100, alignItems: 'center', justifyContent: 'center',
    borderRadius: 25, backgroundColor: '#facc15',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 15, marginBottom: 24,
  },
  title: {
    fontSize: 32, fontFamily: 'Inter-Bold', color: '#F8FAFC',
    textAlign: 'center', marginBottom: 12,
  },
  subtitle: {
    fontSize: 16, fontFamily: 'Inter-Regular', color: '#94a3b8',
    textAlign: 'center', marginBottom: 20,
  },
  inputGroup: { gap: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12, borderWidth: 1, borderColor: '#334155',
    minHeight: 58, position: 'relative',
  },
  inputIcon: { marginHorizontal: 16 },
  inputText: {
    flex: 1, paddingVertical: 18, fontSize: 16,
    fontFamily: 'Inter-Regular', color: '#64748b',
  },
  inputTextValue: {
    color: '#F8FAFC',
  },
  requiredIndicator: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ef4444',
    marginRight: 16,
  },
  coordinatesDisplay: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
    textAlign: 'center',
  },
  coordinatesSubtext: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#6ee7b7',
    textAlign: 'center',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
    marginBottom: 8,
  },
  progressDotComplete: {
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
  },
  progressTextComplete: {
    color: '#10b981',
  },
  progressLine: {
    height: 2,
    backgroundColor: '#334155',
    flex: 0.5,
    marginHorizontal: 8,
    marginBottom: 20,
  },
  buttonContainer: { paddingHorizontal: 32, paddingBottom: 40, paddingTop: 20, alignItems: 'center' },
  primaryButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
    width: '100%',
  },
  primaryButtonDisabled: {
    backgroundColor: '#64748b',
    shadowOpacity: 0,
  },
  primaryButtonText: { 
    fontSize: 18, 
    fontFamily: 'Inter-SemiBold', 
    color: '#0f172a' 
  },
  primaryButtonTextDisabled: {
    color: '#334155',
  },
  buttonHelperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 280,
  },
});