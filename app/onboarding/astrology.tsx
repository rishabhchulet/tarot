import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calendar, Clock, MapPin, Star } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/utils/auth';

export default function AstrologyScreen() {
  const { user, updateUser } = useAuth();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');

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
    
    // Set default location text if user has one
    if (user?.birthLocation) {
      setLocation(user.birthLocation);
    }
  }, []);
  
  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  const handleContinue = async () => {
    if (!date || !location.trim()) {
      Alert.alert('Incomplete Information', 'Please provide your birthdate and location to continue.');
      return;
    }

    setLoading(true);

    const updates = {
      birthDate: date.toISOString().split('T')[0], // YYYY-MM-DD
      birthTime: time.toTimeString().split(' ')[0], // HH:MM:SS
      birthLocation: location.trim(),
      latitude: null, // No coordinates available with TextInput
      longitude: null, // No coordinates available with TextInput
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
      
      router.push('/onboarding/confirmation');
    } catch (error: any) {
      Alert.alert('Error', "We couldn't save your energetic map details. Please try again.");
      console.error("Error updating user's astrological data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon: React.ReactNode, placeholder: string, value: string, onPress: () => void) => (
    <Pressable onPress={onPress}>
      <View style={styles.inputContainer}>
        {icon}
        <Text style={[styles.inputText, value ? styles.inputTextValue : {}]}>
          {value || placeholder}
        </Text>
      </View>
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
          {renderInput(
            <Calendar size={20} color="#94a3b8" style={styles.inputIcon} />,
            'Birthdate (YYYY-MM-DD)',
            date ? date.toLocaleDateString() : '',
            () => setShowDatePicker(true)
          )}
          
          {renderInput(
            <Clock size={20} color="#94a3b8" style={styles.inputIcon} />,
            'Birth Time (optional)',
            time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            () => setShowTimePicker(true)
          )}

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputText}
              placeholder="Birth Location (City, Country)"
              placeholderTextColor="#64748b"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={date}
          mode="date"
          display="spinner"
          onChange={onDateChange}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={time}
          mode="time"
          display="spinner"
          onChange={onTimeChange}
        />
      )}

      <View style={styles.buttonContainer}>
        <Pressable onPress={handleContinue} disabled={loading} style={styles.primaryButton}>
            {loading ? 
              <ActivityIndicator color="#0f172a" /> : 
              <Text style={styles.primaryButtonText}>Generate My Map</Text>
            }
        </Pressable>
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
    minHeight: 58,
  },
  inputIcon: { marginHorizontal: 16 },
  inputText: {
    flex: 1, paddingVertical: 18, fontSize: 16,
    fontFamily: 'Inter-Regular', color: '#F8FAFC',
  },
  inputTextValue: {
    color: '#F8FAFC',
  },
  buttonContainer: { paddingHorizontal: 32, paddingBottom: 40, paddingTop: 20 },
  primaryButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  primaryButtonText: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#0f172a' },
});