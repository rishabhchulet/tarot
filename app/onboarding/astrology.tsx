import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

export default function AstrologyScreen() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    // Basic validation
    if (!birthDate || !birthLocation) {
      Alert.alert('Incomplete Information', 'Please enter your birthdate and location to continue.');
      return;
    }
    
    setLoading(true);
    console.log('🔮 Saving astrological data...', { birthDate, birthTime, birthLocation });

    // TODO:
    // 1. Add real date/time pickers
    // 2. Add location autocomplete with geocoding
    // 3. Save data to Supabase (profiles table)
    
    // For now, just navigate
    setTimeout(() => {
      setLoading(false);
      router.push('/onboarding/confirmation');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Let’s set up your energetic map</Text>
        
        {/* Placeholder Inputs */}
        <View style={styles.inputContainer}>
          <Calendar size={24} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Birthdate (YYYY-MM-DD)"
            placeholderTextColor="#6B7280"
            value={birthDate}
            onChangeText={setBirthDate}
          />
        </View>

        <View style={styles.inputContainer}>
          <Clock size={24} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Birth Time (optional)"
            placeholderTextColor="#6B7280"
            value={birthTime}
            onChangeText={setBirthTime}
          />
        </View>

        <View style={styles.inputContainer}>
          <MapPin size={24} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Birth Location (City, Country)"
            placeholderTextColor="#6B7280"
            value={birthLocation}
            onChangeText={setBirthLocation}
          />
        </View>

        <Text style={styles.subtitle}>
          Enter what you know—approximate values are okay.
        </Text>
      </View>
      
      <Pressable style={styles.button} onPress={handleContinue} disabled={loading}>
        <View style={[styles.buttonSolid, loading && styles.buttonSolidDisabled]}>
          <Text style={styles.buttonText}>{loading ? 'Generating...' : 'Generate My Map →'}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
    marginBottom: 16,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonSolid: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonSolidDisabled: {
    backgroundColor: '#4B5563',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
}); 