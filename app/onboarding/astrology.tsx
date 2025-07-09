import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calendar, Clock, MapPin, Star } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

export default function AstrologyScreen() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const glowScale = useSharedValue(1);
  
  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
  }, []);
  
  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));

  const handleContinue = async () => {
    if (!birthDate || !birthLocation) {
      Alert.alert('Incomplete Information', 'Please enter your birthdate and location.');
      return;
    }
    setLoading(true);
    // TODO: Add real date/time pickers, location autocomplete, and save to Supabase
    setTimeout(() => {
      setLoading(false);
      router.push('/onboarding/confirmation');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient colors={['#f59e0b', '#fbbf24']} style={styles.iconGradient}>
            <Star size={60} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Your Energetic Map</Text>
        <Text style={styles.subtitle}>Enter what you know—approximations are okay.</Text>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <Calendar size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Birthdate (YYYY-MM-DD)" placeholderTextColor="#64748b" value={birthDate} onChangeText={setBirthDate} />
          </View>

          <View style={styles.inputContainer}>
            <Clock size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Birth Time (optional)" placeholderTextColor="#64748b" value={birthTime} onChangeText={setBirthTime} />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Birth Location (City, Country)" placeholderTextColor="#64748b" value={birthLocation} onChangeText={setBirthLocation} />
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleContinue} disabled={loading}>
          <LinearGradient
              colors={loading ? ['#475569', '#64748b'] : ['#f59e0b', '#fbbf24']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Generating...' : 'Generate My Map'}</Text>
            </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  glow: {
    position: 'absolute', top: '10%', left: '50%', width: 400, height: 400,
    backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: 200,
    transform: [{ translateX: -200 }], filter: 'blur(90px)', 
  },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  iconContainer: {
    width: 100, height: 100, alignItems: 'center', justifyContent: 'center',
    borderRadius: 25, shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, marginBottom: 32, alignSelf: 'center',
  },
  iconGradient: {
    width: '100%', height: '100%', borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 32, fontFamily: 'Inter-Bold', color: '#F8FAFC',
    textAlign: 'center', marginBottom: 12,
  },
  subtitle: {
    fontSize: 16, fontFamily: 'Inter-Regular', color: '#94a3b8',
    textAlign: 'center', marginBottom: 40,
  },
  inputGroup: { gap: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255, 0.05)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255, 0.1)',
  },
  inputIcon: { marginHorizontal: 16 },
  input: {
    flex: 1, paddingVertical: 18, fontSize: 16,
    fontFamily: 'Inter-Regular', color: '#F8FAFC',
  },
  buttonContainer: { paddingHorizontal: 32, paddingBottom: 40, paddingTop: 20 },
  primaryButton: {
    borderRadius: 12, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  primaryButtonText: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#0f172a' },
}); 