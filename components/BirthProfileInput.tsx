import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { PlatformAwareDateTimePicker } from '@/components/PlatformAwareDateTimePicker';
import { LocationInput } from '@/components/LocationInput';
import { User, Sun } from 'lucide-react-native';

export interface BirthProfile {
  name: string;
  date: Date | null;
  time: Date | null;
  location: string;
  coordinates: { latitude: number; longitude: number } | null;
}

interface BirthProfileInputProps {
  title: string;
  profile: BirthProfile;
  onProfileChange: (profile: BirthProfile) => void;
}

export function BirthProfileInput({ title, profile, onProfileChange }: BirthProfileInputProps) {
  const handleNameChange = (newName: string) => {
    onProfileChange({ ...profile, name: newName });
  };

  const handleDateChange = (newDate: Date) => {
    onProfileChange({ ...profile, date: newDate });
  };

  const handleTimeChange = (newTime: Date) => {
    onProfileChange({ ...profile, time: newTime });
  };

  const handleLocationChange = (newLocation: string, newCoordinates?: { latitude: number; longitude: number }) => {
    onProfileChange({ 
      ...profile, 
      location: newLocation, 
      coordinates: newCoordinates || null 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <User size={20} color="#c7d2fe" />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.inputGroup}>
        <View style={styles.nameInputContainer}>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter name"
            placeholderTextColor="#94a3b8"
            value={profile.name}
            onChangeText={handleNameChange}
          />
        </View>
        <PlatformAwareDateTimePicker
          mode="date"
          value={profile.date}
          onChange={handleDateChange}
          placeholder="Birth Date"
        />
        <PlatformAwareDateTimePicker
          mode="time"
          value={profile.time}
          onChange={handleTimeChange}
          placeholder="Birth Time (optional)"
        />
        <LocationInput
          value={profile.location}
          onLocationChange={handleLocationChange}
          placeholder="Birth Location"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#e0e7ff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginLeft: 8,
  },
  inputGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  nameInputContainer: {
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
}); 