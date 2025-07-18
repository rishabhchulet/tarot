import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';

export type AmbientSoundType = 
  | 'cosmic-ambience'
  | 'gentle-rain'
  | 'forest-whispers'
  | 'ocean-waves'
  | 'singing-bowls'
  | 'celestial-chimes'
  | 'mountain-wind'
  | 'deep-space'
  | 'crystal-resonance'
  | 'earth-heartbeat';

export interface AmbientSoundConfig {
  name: string;
  description: string;
  volume: number;
  category: 'cosmic' | 'nature' | 'meditative';
  audioFile: string;
}

export const AMBIENT_SOUNDS: Record<AmbientSoundType, AmbientSoundConfig> = {
  'cosmic-ambience': {
    name: 'Cosmic Ambience',
    description: 'Ethereal space sounds with gentle frequencies',
    volume: 0.3,
    category: 'cosmic',
    audioFile: 'cosmic-ambience.wav',
  },
  'gentle-rain': {
    name: 'Gentle Rain',
    description: 'Soft rainfall creating peaceful atmosphere',
    volume: 0.4,
    category: 'nature',
    audioFile: 'gentle-rain.wav',
  },
  'forest-whispers': {
    name: 'Forest Whispers',
    description: 'Subtle forest sounds with distant birdsong',
    volume: 0.3,
    category: 'nature',
    audioFile: 'forest-whispers.wav',
  },
  'ocean-waves': {
    name: 'Ocean Waves',
    description: 'Rhythmic waves for deep contemplation',
    volume: 0.35,
    category: 'nature',
    audioFile: 'ocean-waves.wav',
  },
  'singing-bowls': {
    name: 'Singing Bowls',
    description: 'Resonant Tibetan bowls for meditation',
    volume: 0.25,
    category: 'meditative',
    audioFile: 'singing-bowls.wav',
  },
  'celestial-chimes': {
    name: 'Celestial Chimes',
    description: 'Gentle chimes like distant stars',
    volume: 0.2,
    category: 'cosmic',
    audioFile: 'celestial-chimes.wav',
  },
  'mountain-wind': {
    name: 'Mountain Wind',
    description: 'Soft wind through high peaks',
    volume: 0.4,
    category: 'nature',
    audioFile: 'mountain-wind.wav',
  },
  'deep-space': {
    name: 'Deep Space',
    description: 'Mysterious cosmos with subtle drones',
    volume: 0.25,
    category: 'cosmic',
    audioFile: 'deep-space.wav',
  },
  'crystal-resonance': {
    name: 'Crystal Resonance',
    description: 'Crystal singing bowls with harmonics',
    volume: 0.3,
    category: 'meditative',
    audioFile: 'crystal-resonance.wav',
  },
  'earth-heartbeat': {
    name: 'Earth Heartbeat',
    description: 'Grounding pulse like mother earth',
    volume: 0.35,
    category: 'nature',
    audioFile: 'earth-heartbeat.wav',
  },
};

export interface AmbientSettings {
  enabled: boolean;
  currentSound: AmbientSoundType | null;
  volume: number;
  fadeEnabled: boolean;
  screenSpecificSounds: {
    cardDraw: AmbientSoundType | null;
    reflection: AmbientSoundType | null;
    onboarding: AmbientSoundType | null;
    compatibility: AmbientSoundType | null;
    astrology: AmbientSoundType | null;
  };
}

const DEFAULT_SETTINGS: AmbientSettings = {
  enabled: true,
  currentSound: 'cosmic-ambience',
  volume: 0.3,
  fadeEnabled: true,
  screenSpecificSounds: {
    cardDraw: 'celestial-chimes',
    reflection: 'forest-whispers',
    onboarding: 'cosmic-ambience',
    compatibility: 'crystal-resonance',
    astrology: 'deep-space',
  },
};

class AmbientSoundManager {
  private currentSound: Audio.Sound | null = null;
  private settings: AmbientSettings = DEFAULT_SETTINGS;
  private fadingOut = false;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Load user settings
      await this.loadSettings();
      
      // Configure audio mode for background sounds
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
      }

      this.initialized = true;
      console.log('🎵 Ambient sound manager initialized');
    } catch (error) {
      console.error('Failed to initialize ambient sound manager:', error);
    }
  }

  async loadSettings(): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem('ambientSoundSettings');
      if (settingsJson) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
      }
    } catch (error) {
      console.error('Failed to load ambient sound settings:', error);
      this.settings = DEFAULT_SETTINGS;
    }
  }

  async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('ambientSoundSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save ambient sound settings:', error);
    }
  }

  getSettings(): AmbientSettings {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<AmbientSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  private async createSoundFromType(soundType: AmbientSoundType): Promise<Audio.Sound | null> {
    try {
      const config = AMBIENT_SOUNDS[soundType];
      if (!config.audioFile) {
        console.log(`🎵 No audio file specified for ${soundType}, simulating...`);
        return null;
      }

      if (Platform.OS === 'web') {
        // Web implementation would use HTML5 Audio with actual files
        console.log(`🎵 Playing ambient sound: ${config.name} (web)`);
        return null;
      }

      // Try to load the actual audio file
      try {
        // First try to load from assets
        const asset = Asset.fromModule(require(`../assets/sounds/${config.audioFile}`));
        await asset.downloadAsync();
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: asset.localUri || asset.uri },
          { 
            shouldPlay: false, 
            isLooping: true,
            volume: config.volume * this.settings.volume
          }
        );
        
        console.log(`🎵 Loaded ambient sound: ${config.name}`);
        return sound;
      } catch (fileError) {
        // Fallback: If file doesn't exist, simulate the sound
        console.log(`🎵 Audio file not found for ${config.name}, simulating...`);
        console.log(`📝 Please download ${config.audioFile} and place it in assets/sounds/`);
        return null;
      }
    } catch (error) {
      console.error(`Failed to create sound for ${soundType}:`, error);
      return null;
    }
  }

  async playSound(soundType: AmbientSoundType, fadeIn = true): Promise<boolean> {
    if (!this.settings.enabled || !this.initialized) return false;

    try {
      // Stop current sound if playing
      await this.stopCurrentSound(fadeIn);

      const sound = await this.createSoundFromType(soundType);
      if (!sound) {
        // Simulated success for development/missing files
        console.log(`🎵 Simulating ambient sound: ${AMBIENT_SOUNDS[soundType].name}`);
        return true;
      }

      // Set volume and start playing
      const targetVolume = AMBIENT_SOUNDS[soundType].volume * this.settings.volume;
      await sound.setVolumeAsync(fadeIn ? 0 : targetVolume);
      await sound.playAsync();

      this.currentSound = sound;

      // Fade in if enabled
      if (fadeIn && this.settings.fadeEnabled) {
        await this.fadeIn(sound, targetVolume);
      }

      return true;
    } catch (error) {
      console.error(`Failed to play ambient sound ${soundType}:`, error);
      return false;
    }
  }

  async stopCurrentSound(fadeOut = true): Promise<void> {
    if (!this.currentSound) return;

    try {
      if (fadeOut && this.settings.fadeEnabled) {
        await this.fadeOut(this.currentSound);
      }

      await this.currentSound.stopAsync();
      await this.currentSound.unloadAsync();
      this.currentSound = null;
    } catch (error) {
      console.error('Failed to stop current ambient sound:', error);
    }
  }

  private async fadeIn(sound: Audio.Sound, targetVolume: number, duration = 2000): Promise<void> {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;

    for (let i = 1; i <= steps; i++) {
      if (!this.currentSound) break; // Sound was stopped
      
      try {
        await sound.setVolumeAsync(volumeStep * i);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      } catch (error) {
        console.error('Error during fade in:', error);
        break;
      }
    }
  }

  private async fadeOut(sound: Audio.Sound, duration = 1500): Promise<void> {
    this.fadingOut = true;
    const steps = 15;
    const stepDuration = duration / steps;

    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;

      const currentVolume = status.volume || 0.3;
      const volumeStep = currentVolume / steps;

      for (let i = steps - 1; i >= 0; i--) {
        if (!this.fadingOut) break; // Fade was interrupted
        
        try {
          await sound.setVolumeAsync(volumeStep * i);
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        } catch (error) {
          console.error('Error during fade out:', error);
          break;
        }
      }
    } finally {
      this.fadingOut = false;
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    await this.saveSettings();

    if (this.currentSound) {
      try {
        const currentSoundType = this.settings.currentSound;
        if (currentSoundType) {
          const targetVolume = AMBIENT_SOUNDS[currentSoundType].volume * this.settings.volume;
          await this.currentSound.setVolumeAsync(targetVolume);
        }
      } catch (error) {
        console.error('Failed to update volume:', error);
      }
    }
  }

  // Screen-specific sound management
  async playForScreen(screen: keyof AmbientSettings['screenSpecificSounds']): Promise<void> {
    const soundType = this.settings.screenSpecificSounds[screen];
    if (soundType && soundType !== this.settings.currentSound) {
      const success = await this.playSound(soundType);
      if (success) {
        this.settings.currentSound = soundType;
        await this.saveSettings();
      }
    }
  }

  async pause(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.pauseAsync();
      } catch (error) {
        console.error('Failed to pause ambient sound:', error);
      }
    }
  }

  async resume(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.playAsync();
      } catch (error) {
        console.error('Failed to resume ambient sound:', error);
      }
    }
  }

  getCurrentSoundInfo(): { type: AmbientSoundType | null; config: AmbientSoundConfig | null } {
    const currentType = this.settings.currentSound;
    return {
      type: currentType,
      config: currentType ? AMBIENT_SOUNDS[currentType] : null,
    };
  }

  getSoundsByCategory(category: 'cosmic' | 'nature' | 'meditative'): Array<{ type: AmbientSoundType; config: AmbientSoundConfig }> {
    return Object.entries(AMBIENT_SOUNDS)
      .filter(([_, config]) => config.category === category)
      .map(([type, config]) => ({ type: type as AmbientSoundType, config }));
  }
}

// Singleton instance
export const ambientSoundManager = new AmbientSoundManager();

// Convenience functions
export const initializeAmbientSounds = () => ambientSoundManager.initialize();
export const playAmbientSound = (type: AmbientSoundType) => ambientSoundManager.playSound(type);
export const stopAmbientSound = () => ambientSoundManager.stopCurrentSound();
export const setAmbientVolume = (volume: number) => ambientSoundManager.setVolume(volume);
export const playScreenAmbient = (screen: keyof AmbientSettings['screenSpecificSounds']) => 
  ambientSoundManager.playForScreen(screen); 