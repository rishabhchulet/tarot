import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { WebDateTimePicker } from './WebDateTimePicker'; // Keep using this for web

interface PlatformAwareDateTimePickerProps {
  mode: 'date' | 'time';
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder: string;
  disabled?: boolean;
}

export const PlatformAwareDateTimePicker = ({
  mode,
  value,
  onChange,
  placeholder,
  disabled = false,
}: PlatformAwareDateTimePickerProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleNativeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false); // Hide picker on selection or dismissal
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  const formattedValue = () => {
    if (!value) return placeholder;
    if (mode === 'date') {
      return value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (Platform.OS !== 'web') {
    return (
      <View>
        <Pressable
          style={[styles.inputButton, disabled && styles.disabled]}
          onPress={() => !disabled && setShowPicker(true)}
          disabled={disabled}
        >
          {mode === 'date' 
            ? <Calendar size={20} color={value ? '#FBBF24' : '#64748B'} /> 
            : <Clock size={20} color={value ? '#FBBF24' : '#64748B'} />
          }
          <Text style={[styles.inputText, !value && styles.placeholderText]}>
            {formattedValue()}
          </Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display="spinner"
            onChange={handleNativeChange}
            textColor={Platform.OS === 'ios' ? '#FFFFFF' : undefined}
          />
        )}
      </View>
    );
  }

  // Fallback to the existing WebDateTimePicker for web
  return (
    <WebDateTimePicker
      mode={mode}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

const styles = StyleSheet.create({
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  inputText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#F9FAFB',
  },
  placeholderText: {
    color: '#64748B',
  },
  disabled: {
    opacity: 0.6,
  },
}); 