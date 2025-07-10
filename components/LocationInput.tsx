import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { MapPin, Navigation, Search } from 'lucide-react-native';
import { geocodeLocation, getCurrentLocation } from '@/utils/geocoding';

interface LocationInputProps {
  value: string;
  onLocationChange: (location: string, coordinates?: { latitude: number; longitude: number }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function LocationInput({ 
  value, 
  onLocationChange, 
  placeholder = "Enter city name (e.g., New York, London)",
  disabled = false 
}: LocationInputProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleLocationSearch = async () => {
    if (!value.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await geocodeLocation(value.trim());
      
      if (result.coordinates) {
        onLocationChange(value.trim(), {
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude
        });
        setError(null);
        console.log('📍 Location found:', result.coordinates);
      } else {
        setError(result.error || 'Location not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to find location');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCurrentLocation();
      
      if (result.coordinates) {
        onLocationChange('Current Location', {
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude
        });
        setError(null);
        console.log('📍 Current location found:', result.coordinates);
      } else {
        setError(result.error || 'Could not get current location');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    onLocationChange(text);
    setError(null);
    
    // Simple suggestions based on common city patterns
    if (text.length > 2) {
      const commonCities = [
        'New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Toronto', 
        'Berlin', 'Mumbai', 'Beijing', 'Moscow', 'Los Angeles', 'Chicago'
      ];
      
      const filtered = commonCities.filter(city => 
        city.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <MapPin size={20} color="#94a3b8" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          value={value}
          onChangeText={handleTextChange}
          editable={!disabled && !loading}
          onSubmitEditing={handleLocationSearch}
          returnKeyType="search"
        />
        
        {loading ? (
          <ActivityIndicator size="small" color="#f59e0b" style={styles.actionButton} />
        ) : (
          <Pressable 
            style={styles.actionButton} 
            onPress={handleLocationSearch}
            disabled={!value.trim() || disabled}
          >
            <Search size={16} color={value.trim() && !disabled ? "#f59e0b" : "#64748b"} />
          </Pressable>
        )}
      </View>

      {/* Current Location Button */}
      <Pressable 
        style={[styles.currentLocationButton, disabled && styles.buttonDisabled]} 
        onPress={handleCurrentLocation}
        disabled={disabled || loading}
      >
        <Navigation size={16} color={disabled ? "#64748b" : "#f59e0b"} />
        <Text style={[styles.currentLocationText, disabled && styles.textDisabled]}>
          Use Current Location
        </Text>
      </Pressable>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                onLocationChange(suggestion);
                setSuggestions([]);
                // Auto-search for coordinates
                setTimeout(() => handleLocationSearch(), 100);
              }}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Helper Text */}
      <Text style={styles.helperText}>
        Enter a city name to get coordinates for your astrology chart
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 58,
  },
  inputIcon: {
    marginHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F8FAFC',
  },
  inputDisabled: {
    color: '#64748b',
  },
  actionButton: {
    padding: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  currentLocationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#f59e0b',
  },
  textDisabled: {
    color: '#64748b',
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F8FAFC',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#ef4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
  },
});