import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';

interface WebDateTimePickerProps {
  mode: 'date' | 'time';
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder: string;
  disabled?: boolean;
}

export function WebDateTimePicker({ 
  mode, 
  value, 
  onChange, 
  placeholder, 
  disabled = false 
}: WebDateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    if (mode === 'date') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const handleWebInput = (event: any) => {
    const inputValue = event.target.value;
    if (!inputValue) return;

    if (mode === 'date') {
      const date = new Date(inputValue);
      if (!isNaN(date.getTime())) {
        onChange(date);
      }
    } else {
      // For time input, we need to create a proper Date object
      const [hours, minutes] = inputValue.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChange(timeDate);
    }
  };

  const getInputValue = () => {
    if (!value) return '';
    if (mode === 'date') {
      return value.toISOString().split('T')[0]; // YYYY-MM-DD format
    } else {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          {mode === 'date' ? (
            <Calendar size={20} color="#94a3b8" style={styles.inputIcon} />
          ) : (
            <Clock size={20} color="#94a3b8" style={styles.inputIcon} />
          )}
          
          <View style={styles.webInputWrapper}>
            <input
              type={mode}
              value={getInputValue()}
              onChange={handleWebInput}
              disabled={disabled}
              placeholder={placeholder}
              className="web-date-input"
              style={{
                flex: 1,
                padding: '18px 0',
                fontSize: '16px',
                fontFamily: 'Inter-Regular',
                color: value ? '#F8FAFC' : '#64748b',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                ...(mode === 'date' && {
                  colorScheme: 'dark',
                }),
                ...(disabled && {
                  color: '#64748b',
                  cursor: 'not-allowed',
                }),
              }}
              min={mode === 'date' ? '1900-01-01' : undefined}
              max={mode === 'date' ? new Date().toISOString().split('T')[0] : undefined}
            />
          </View>
          
          {!value && <Text style={styles.requiredIndicator}>*</Text>}
        </View>
      </View>
    );
  }

  // For mobile platforms, we'll use a custom picker
  return (
    <View style={styles.container}>
      <Pressable 
        onPress={() => !disabled && setShowPicker(!showPicker)} 
        style={[styles.inputContainer, disabled && styles.inputDisabled]}
      >
        {mode === 'date' ? (
          <Calendar size={20} color="#94a3b8" style={styles.inputIcon} />
        ) : (
          <Clock size={20} color="#94a3b8" style={styles.inputIcon} />
        )}
        
        <Text style={[styles.inputText, value ? styles.inputTextValue : {}]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        
        {!value && <Text style={styles.requiredIndicator}>*</Text>}
        
        <View style={styles.chevronContainer}>
          {showPicker ? (
            <ChevronUp size={16} color="#94a3b8" />
          ) : (
            <ChevronDown size={16} color="#94a3b8" />
          )}
        </View>
      </Pressable>

      {showPicker && (
        <MobileDateTimePicker
          mode={mode}
          value={value}
          onChange={(date) => {
            onChange(date);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </View>
  );
}

// Mobile-specific picker component
function MobileDateTimePicker({ 
  mode, 
  value, 
  onChange, 
  onClose 
}: {
  mode: 'date' | 'time';
  value: Date | null;
  onChange: (date: Date) => void;
  onClose: () => void;
}) {
  const currentDate = value || new Date();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  if (mode === 'date') {
    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Select Date</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </Pressable>
        </View>
        
        <View style={styles.datePickerGrid}>
          {/* Year Selector */}
          <View style={styles.dateColumn}>
            <Text style={styles.columnLabel}>Year</Text>
            <View style={styles.scrollContainer}>
              {Array.from({ length: 125 }, (_, i) => 2024 - i).map(year => (
                <Pressable
                  key={year}
                  style={[
                    styles.dateOption,
                    selectedDate.getFullYear() === year && styles.dateOptionSelected
                  ]}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(year);
                    setSelectedDate(newDate);
                    onChange(newDate);
                  }}
                >
                  <Text style={[
                    styles.dateOptionText,
                    selectedDate.getFullYear() === year && styles.dateOptionTextSelected
                  ]}>
                    {year}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Month Selector */}
          <View style={styles.dateColumn}>
            <Text style={styles.columnLabel}>Month</Text>
            <View style={styles.scrollContainer}>
              {Array.from({ length: 12 }, (_, i) => i).map(month => (
                <Pressable
                  key={month}
                  style={[
                    styles.dateOption,
                    selectedDate.getMonth() === month && styles.dateOptionSelected
                  ]}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(month);
                    setSelectedDate(newDate);
                    onChange(newDate);
                  }}
                >
                  <Text style={[
                    styles.dateOptionText,
                    selectedDate.getMonth() === month && styles.dateOptionTextSelected
                  ]}>
                    {new Date(2000, month).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Day Selector */}
          <View style={styles.dateColumn}>
            <Text style={styles.columnLabel}>Day</Text>
            <View style={styles.scrollContainer}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <Pressable
                  key={day}
                  style={[
                    styles.dateOption,
                    selectedDate.getDate() === day && styles.dateOptionSelected
                  ]}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(day);
                    setSelectedDate(newDate);
                    onChange(newDate);
                  }}
                >
                  <Text style={[
                    styles.dateOptionText,
                    selectedDate.getDate() === day && styles.dateOptionTextSelected
                  ]}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Time picker
  return (
    <View style={styles.pickerContainer}>
      <View style={styles.pickerHeader}>
        <Text style={styles.pickerTitle}>Select Time</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Done</Text>
        </Pressable>
      </View>
      
      <View style={styles.timePickerGrid}>
        {/* Hour Selector */}
        <View style={styles.timeColumn}>
          <Text style={styles.columnLabel}>Hour</Text>
          <View style={styles.scrollContainer}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
              <Pressable
                key={hour}
                style={[
                  styles.dateOption,
                  (selectedDate.getHours() % 12 || 12) === hour && styles.dateOptionSelected
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  const isPM = selectedDate.getHours() >= 12;
                  newDate.setHours(isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour));
                  setSelectedDate(newDate);
                  onChange(newDate);
                }}
              >
                <Text style={[
                  styles.dateOptionText,
                  (selectedDate.getHours() % 12 || 12) === hour && styles.dateOptionTextSelected
                ]}>
                  {hour}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Minute Selector */}
        <View style={styles.timeColumn}>
          <Text style={styles.columnLabel}>Min</Text>
          <View style={styles.scrollContainer}>
            {Array.from({ length: 60 }, (_, i) => i).filter(m => m % 5 === 0).map(minute => (
              <Pressable
                key={minute}
                style={[
                  styles.dateOption,
                  Math.floor(selectedDate.getMinutes() / 5) * 5 === minute && styles.dateOptionSelected
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMinutes(minute);
                  setSelectedDate(newDate);
                  onChange(newDate);
                }}
              >
                <Text style={[
                  styles.dateOptionText,
                  Math.floor(selectedDate.getMinutes() / 5) * 5 === minute && styles.dateOptionTextSelected
                ]}>
                  {minute.toString().padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* AM/PM Selector */}
        <View style={styles.timeColumn}>
          <Text style={styles.columnLabel}>Period</Text>
          <View style={styles.scrollContainer}>
            {['AM', 'PM'].map(period => (
              <Pressable
                key={period}
                style={[
                  styles.dateOption,
                  ((selectedDate.getHours() >= 12) ? 'PM' : 'AM') === period && styles.dateOptionSelected
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  const currentHour = selectedDate.getHours();
                  if (period === 'AM' && currentHour >= 12) {
                    newDate.setHours(currentHour - 12);
                  } else if (period === 'PM' && currentHour < 12) {
                    newDate.setHours(currentHour + 12);
                  }
                  setSelectedDate(newDate);
                  onChange(newDate);
                }}
              >
                <Text style={[
                  styles.dateOptionText,
                  ((selectedDate.getHours() >= 12) ? 'PM' : 'AM') === period && styles.dateOptionTextSelected
                ]}>
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  inputDisabled: {
    opacity: 0.6,
  },
  inputIcon: {
    marginHorizontal: 16,
  },
  webInputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  inputText: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  inputTextValue: {
    color: '#F8FAFC',
  },
  requiredIndicator: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ef4444',
    marginRight: 8,
  },
  chevronContainer: {
    marginRight: 16,
  },
  
  // Mobile picker styles
  pickerContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.98)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
    maxHeight: 300,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  pickerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F8FAFC',
  },
  closeButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0f172a',
  },
  datePickerGrid: {
    flexDirection: 'row',
    height: 200,
  },
  timePickerGrid: {
    flexDirection: 'row',
    height: 200,
  },
  dateColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  timeColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  columnLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  scrollContainer: {
    flex: 1,
  },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  dateOptionSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  dateOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F8FAFC',
  },
  dateOptionTextSelected: {
    color: '#f59e0b',
    fontFamily: 'Inter-SemiBold',
  },
});