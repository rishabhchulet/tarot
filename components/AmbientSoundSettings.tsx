import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeX, Music, Waves, TreePine, Sparkles } from 'lucide-react-native';
import { ambientSoundManager, AMBIENT_SOUNDS, AmbientSoundType, AmbientSettings } from '@/utils/ambientSounds';
import { buttonHaptics, hapticLight } from '@/utils/haptics';

interface AmbientSoundSettingsProps {
  onSettingsChange?: (settings: AmbientSettings) => void;
}

export function AmbientSoundSettings({ onSettingsChange }: AmbientSoundSettingsProps) {
  const [settings, setSettings] = useState<AmbientSettings>(ambientSoundManager.getSettings());
  const [currentlyPlaying, setCurrentlyPlaying] = useState<AmbientSoundType | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const currentSettings = ambientSoundManager.getSettings();
    setSettings(currentSettings);
    setCurrentlyPlaying(currentSettings.currentSound);
  };

  const updateSettings = async (newSettings: Partial<AmbientSettings>) => {
    await ambientSoundManager.updateSettings(newSettings);
    const updatedSettings = ambientSoundManager.getSettings();
    setSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  };

  const toggleEnabled = async () => {
    buttonHaptics.toggle();
    const newEnabled = !settings.enabled;
    await updateSettings({ enabled: newEnabled });
    
    if (!newEnabled) {
      await ambientSoundManager.stopCurrentSound();
      setCurrentlyPlaying(null);
    }
  };

  const playPreview = async (soundType: AmbientSoundType) => {
    buttonHaptics.select();
    
    // Use the new preview method instead of full playback
    await ambientSoundManager.previewSound(soundType);
    
    // Update UI to show which sound was previewed
    setCurrentlyPlaying(soundType);
    await updateSettings({ currentSound: soundType });
    
    // Clear the preview indicator after 3 seconds
    setTimeout(() => {
      setCurrentlyPlaying(null);
    }, 3000);
  };

  const adjustVolume = async (delta: number) => {
    hapticLight();
    const newVolume = Math.max(0, Math.min(1, settings.volume + delta));
    await updateSettings({ volume: newVolume });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cosmic': return <Sparkles size={16} color="#a855f7" />;
      case 'nature': return <TreePine size={16} color="#10b981" />;
      case 'meditative': return <Waves size={16} color="#3b82f6" />;
      default: return <Music size={16} color="#6b7280" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cosmic': return ['#a855f7', '#7c3aed'];
      case 'nature': return ['#10b981', '#059669'];
      case 'meditative': return ['#3b82f6', '#2563eb'];
      default: return ['#6b7280', '#4b5563'];
    }
  };

  const soundCategories = ['cosmic', 'nature', 'meditative'] as const;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Music size={24} color="#fbbf24" />
          <Text style={styles.title}>Ambient Sounds</Text>
        </View>
        <Text style={styles.subtitle}>
          Enhance your spiritual practice with subtle background sounds
        </Text>
      </View>

      {/* Main Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Enable Ambient Sounds</Text>
            <Text style={styles.toggleSubtitle}>
              Play gentle background sounds during your practice
            </Text>
          </View>
          <View style={styles.toggleSwitchContainer}>
            <Switch
              value={settings.enabled}
              onValueChange={toggleEnabled}
              trackColor={{ false: '#374151', true: '#fbbf24' }}
              thumbColor={settings.enabled ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>
      </View>

      {settings.enabled && (
        <>
          {/* Volume Control */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volume</Text>
            <View style={styles.volumeContainer}>
              <Pressable
                style={styles.volumeButton}
                onPress={() => adjustVolume(-0.1)}
                disabled={settings.volume <= 0}
              >
                <VolumeX size={20} color={settings.volume <= 0 ? '#6b7280' : '#fbbf24'} />
              </Pressable>
              
              <View style={styles.volumeSliderContainer}>
                <View style={styles.volumeTrack}>
                  <View 
                    style={[
                      styles.volumeFill, 
                      { width: `${settings.volume * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.volumeText}>{Math.round(settings.volume * 100)}%</Text>
              </View>
              
              <Pressable
                style={styles.volumeButton}
                onPress={() => adjustVolume(0.1)}
                disabled={settings.volume >= 1}
              >
                <Volume2 size={20} color={settings.volume >= 1 ? '#6b7280' : '#fbbf24'} />
              </Pressable>
            </View>
          </View>

          {/* Sound Categories */}
          {soundCategories.map((category) => {
            const sounds = ambientSoundManager.getSoundsByCategory(category);
            const categoryColors = getCategoryColor(category);
            
            return (
              <View key={category} style={styles.section}>
                <View style={styles.categoryHeader}>
                  {getCategoryIcon(category)}
                  <Text style={styles.categoryTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </View>
                
                <View style={styles.soundGrid}>
                  {sounds.map(({ type, config }) => {
                    // Defensive check to handle undefined config
                    if (!config) {
                      console.warn(`Missing config for sound type: ${type}`);
                      return null;
                    }
                    
                    return (
                      <Pressable
                        key={type}
                        style={styles.soundCard}
                        onPress={() => playPreview(type)}
                      >
                        <LinearGradient
                          colors={currentlyPlaying === type 
                            ? ['#fbbf24', '#f59e0b'] 
                            : ['#1f2937', '#111827']
                          }
                          style={[
                            styles.soundCardGradient,
                            currentlyPlaying === type && styles.soundCardActive
                          ]}
                        >
                          <View style={styles.soundCardContent}>
                            <Text style={[
                              styles.soundName,
                              currentlyPlaying === type && styles.soundNameActive
                            ]}>
                              {config?.name || 'Unknown Sound'}
                            </Text>
                            <Text style={[
                              styles.soundDescription,
                              currentlyPlaying === type && styles.soundDescriptionActive
                            ]}>
                              {config?.description || 'No description available'}
                            </Text>
                            
                            {currentlyPlaying === type && (
                              <View style={styles.playingIndicator}>
                                <View style={styles.waveBar} />
                                <View style={[styles.waveBar, styles.waveBar2]} />
                                <View style={[styles.waveBar, styles.waveBar3]} />
                              </View>
                            )}
                          </View>
                        </LinearGradient>
                      </Pressable>
                    );
                  }).filter(Boolean)}
                </View>
              </View>
            );
          })}

          {/* Auto-fade Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Smooth Transitions</Text>
                <Text style={styles.toggleSubtitle}>
                  Fade sounds in and out when changing screens
                </Text>
              </View>
              <View style={styles.toggleSwitchContainer}>
                <Switch
                  value={settings.fadeEnabled}
                  onValueChange={(enabled: boolean) => updateSettings({ fadeEnabled: enabled })}
                  trackColor={{ false: '#374151', true: '#fbbf24' }}
                  thumbColor={settings.fadeEnabled ? '#ffffff' : '#9ca3af'}
                />
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    paddingRight: 20, // Extra padding on right for Android switches
    minHeight: 70, // Ensure consistent height
  },
  toggleTextContainer: {
    flex: 1, // Allow text to take available space
    paddingRight: 12, // Space before switch
  },
  toggleSwitchContainer: {
    // Ensure switch is always visible on Android
    minWidth: 60, 
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  volumeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  volumeSliderContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  volumeTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginBottom: 8,
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 3,
  },
  volumeText: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: '600',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  soundGrid: {
    gap: 12,
  },
  soundCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  soundCardGradient: {
    padding: 16,
    borderRadius: 12,
  },
  soundCardActive: {
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  soundCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  soundNameActive: {
    color: '#0f172a',
  },
  soundDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    flex: 2,
    marginLeft: 12,
  },
  soundDescriptionActive: {
    color: '#374151',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 3,
    height: 12,
    backgroundColor: '#0f172a',
    borderRadius: 1.5,
    opacity: 0.8,
  },
  waveBar2: {
    height: 18,
    animationDelay: 0.1,
  },
  waveBar3: {
    height: 8,
    animationDelay: 0.2,
  },
}); 