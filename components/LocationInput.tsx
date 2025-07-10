import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { MapPin, Navigation, Search, X } from 'lucide-react-native';
import { geocodeLocation, getCurrentLocation } from '@/utils/geocoding';

interface LocationInputProps {
  value: string;
  onLocationChange: (location: string, coordinates?: { latitude: number; longitude: number }) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Extended list of popular cities for better suggestions
const POPULAR_CITIES = [
  'New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Toronto', 'Berlin', 'Mumbai', 
  'Beijing', 'Moscow', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Vancouver',
  'Mexico City', 'Buenos Aires', 'São Paulo', 'Rio de Janeiro', 'Cape Town', 'Cairo',
  'Dubai', 'Singapore', 'Hong Kong', 'Seoul', 'Bangkok', 'Jakarta', 'Manila', 'Delhi',
  'Bangalore', 'Kolkata', 'Chennai', 'Karachi', 'Lahore', 'Dhaka', 'Istanbul', 'Madrid',
  'Barcelona', 'Rome', 'Milan', 'Amsterdam', 'Brussels', 'Zurich', 'Vienna', 'Stockholm',
  'Oslo', 'Copenhagen', 'Helsinki', 'Warsaw', 'Prague', 'Budapest', 'Bucharest', 'Athens',
  'Lisbon', 'Dublin', 'Edinburgh', 'Manchester', 'Birmingham', 'Glasgow', 'Montreal',
  'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City', 'Halifax', 'Melbourne',
  'Brisbane', 'Perth', 'Adelaide', 'Auckland', 'Wellington', 'Christchurch'
];

export function LocationInput({ 
  value, 
  onLocationChange, 
  placeholder = "Enter city name (e.g., New York, London)",
  disabled = false 
}: LocationInputProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-search for coordinates when user stops typing
  useEffect(() => {
    if (value.trim() && value.length > 2) {
      const timeoutId = setTimeout(() => {
        autoSearchCoordinates();
      }, 1500); // Wait 1.5 seconds after user stops typing

      return () => clearTimeout(timeoutId);
    }
  }, [value]);

  const autoSearchCoordinates = async () => {
    if (!value.trim() || loading || isSearching) return;

    setIsSearching(true);
    setError(null);

    try {
      const result = await geocodeLocation(value.trim());
      
      if (result.coordinates) {
        onLocationChange(value.trim(), {
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude
        });
        setError(null);
        console.log('📍 Auto-found location:', result.coordinates);
      }
    } catch (err: any) {
      // Don't show error for auto-search, just log it
      console.log('Auto-search failed:', err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!value.trim() || loading) return;

    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const result = await geocodeLocation(value.trim());
      
      if (result.coordinates) {
        onLocationChange(value.trim(), {
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude
        });
        setError(null);
        console.log('📍 Manual search - location found:', result.coordinates);
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
    setShowSuggestions(false);

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
    
    // Generate suggestions based on input
    if (text.length > 1) {
      const filtered = POPULAR_CITIES.filter(city => 
        city.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Show top 5 matches
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onLocationChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Auto-search for coordinates after selection
    setTimeout(() => {
      autoSearchCoordinates();
    }, 100);
  };

  const clearInput = () => {
    onLocationChange('');
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
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
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        
        {/* Loading indicator for auto-search */}
        {isSearching && (
          <ActivityIndicator size="small" color="#f59e0b" style={styles.actionButton} />
        )}
        
        {/* Clear button */}
        {value.length > 0 && !loading && !isSearching && (
          <Pressable style={styles.actionButton} onPress={clearInput}>
            <X size={16} color="#64748b" />
          </Pressable>
        )}
        
        {/* Manual search button */}
        {!isSearching && (
          <>
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
          </>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
            {suggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                style={[
                  styles.suggestionItem,
                  index === suggestions.length - 1 && styles.suggestionItemLast
                ]}
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <MapPin size={14} color="#64748b" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

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

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Try entering a major city name like "New York" or "London"</Text>
        </View>
      )}

      {/* Helper Text */}
      <Text style={styles.helperText}>
        {isSearching ? 'Searching for coordinates...' : 
         'Enter a city name to get coordinates for your astrology chart'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    position: 'relative',
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
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F8FAFC',
    flex: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    marginBottom: 4,
  },
  errorHint: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#fca5a5',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
  },
});