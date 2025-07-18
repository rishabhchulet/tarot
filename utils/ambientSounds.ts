import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  remoteUrl?: string; // Remote URL for streaming
}

// Configuration for sound loading
const SOUND_CONFIG = {
  // Set to false initially due to S3 403 errors - will auto-retry once per session
  useRemoteFiles: false,
  // Base URL for your AWS S3 bucket or CDN
  remoteBaseUrl: 'https://allforonedeanxious.s3.us-east-1.amazonaws.com/Micro+Meditation/sound/',
  // Enable caching for better performance (optional)
  enableCaching: false,
  // Retry remote loading once per session
  hasTriedRemote: false,
  // Timeout for remote loading (5 seconds)
  remoteTimeout: 5000,
};

// Remote URL mapping for each sound
const REMOTE_SOUND_URLS: Record<AmbientSoundType, string> = {
  'cosmic-ambience': `${SOUND_CONFIG.remoteBaseUrl}cosmic-ambience.wav`,
  'gentle-rain': `${SOUND_CONFIG.remoteBaseUrl}gentle-rain.wav`,
  'forest-whispers': `${SOUND_CONFIG.remoteBaseUrl}forest-whispers.wav`,
  'ocean-waves': `${SOUND_CONFIG.remoteBaseUrl}ocean-waves.wav`,
  'singing-bowls': `${SOUND_CONFIG.remoteBaseUrl}singing-bowls.wav`,
  'celestial-chimes': `${SOUND_CONFIG.remoteBaseUrl}celestial-chimes.wav`,
  'mountain-wind': `${SOUND_CONFIG.remoteBaseUrl}mountain-wind.wav`,
  'deep-space': `${SOUND_CONFIG.remoteBaseUrl}deep-space.wav`,
  'crystal-resonance': `${SOUND_CONFIG.remoteBaseUrl}crystal-resonance.wav`,
  'earth-heartbeat': `${SOUND_CONFIG.remoteBaseUrl}earth-heartbeat.wav`,
};

// Local sound file mapping (fallback or when useRemoteFiles is false)
const LOCAL_SOUND_FILES: Record<AmbientSoundType, any> = {
  'cosmic-ambience': null, // Will be loaded when local files are available
  'gentle-rain': null,
  'forest-whispers': null,
  'ocean-waves': null,
  'singing-bowls': null,
  'celestial-chimes': null,
  'mountain-wind': null,
  'deep-space': null,
  'crystal-resonance': null,
  'earth-heartbeat': null,
};

// Track failed remote loads to avoid spamming
const FAILED_REMOTE_LOADS = new Set<AmbientSoundType>();

// Future: When you add actual local sound files, you can replace nulls with:
// 'cosmic-ambience': require('../assets/sounds/cosmic-ambience.wav'),
// etc.

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
    description: 'Harmonic chimes creating sacred space',
    volume: 0.3,
    category: 'cosmic',
    audioFile: 'celestial-chimes.wav',
  },
  'mountain-wind': {
    name: 'Mountain Wind',
    description: 'High altitude winds through ancient peaks',
    volume: 0.35,
    category: 'nature',
    audioFile: 'mountain-wind.wav',
  },
  'deep-space': {
    name: 'Deep Space',
    description: 'Vast cosmic silence with subtle resonance',
    volume: 0.25,
    category: 'cosmic',
    audioFile: 'deep-space.wav',
  },
  'crystal-resonance': {
    name: 'Crystal Resonance',
    description: 'Pure crystal frequencies for clarity',
    volume: 0.28,
    category: 'meditative',
    audioFile: 'crystal-resonance.wav',
  },
  'earth-heartbeat': {
    name: 'Earth Heartbeat',
    description: 'Primordial rhythm connecting to Gaia',
    volume: 0.32,
    category: 'nature',
    audioFile: 'earth-heartbeat.wav',
  },
};

// Screen-specific ambient sound mapping
export const SCREEN_AMBIENT_SOUNDS = {
  cardDraw: 'celestial-chimes' as AmbientSoundType,
  reflection: 'forest-whispers' as AmbientSoundType,
  onboarding: 'cosmic-ambience' as AmbientSoundType,
  compatibility: 'crystal-resonance' as AmbientSoundType,
  astrology: 'deep-space' as AmbientSoundType,
  journal: 'gentle-rain' as AmbientSoundType,
  meditation: 'singing-bowls' as AmbientSoundType,
};

export interface AmbientSettings {
  enabled: boolean;
  currentSound: AmbientSoundType;
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

// Add timeout wrapper for remote loading
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

class AmbientSoundManager {
  private currentSound: Audio.Sound | null = null;
  private settings: AmbientSettings = DEFAULT_SETTINGS;
  private fadingOut = false;
  private initialized = false;
  private simulationMode = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Load user settings
      await this.loadSettings();
      
      // Configure audio mode for background sounds (non-blocking)
      if (Platform.OS !== 'web') {
        Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        }).catch((error: any) => {
          console.log('📱 Audio mode setup skipped:', error.message);
        });
      }

      this.initialized = true;
      console.log('🎵 Ambient sound manager initialized');
      
      // Try one remote file to test connectivity (non-blocking)
      if (!SOUND_CONFIG.hasTriedRemote) {
        this.testRemoteConnectivity();
      }
    } catch (error) {
      console.log('🎵 Ambient sound manager initialized in simulation mode');
      this.simulationMode = true;
      this.initialized = true;
    }
  }

  private async testRemoteConnectivity() {
    try {
      SOUND_CONFIG.hasTriedRemote = true;
      
      // Test with a small remote file request (non-blocking)
      const testUrl = REMOTE_SOUND_URLS['cosmic-ambience'];
      const testPromise = fetch(testUrl, { method: 'HEAD' });
      
      withTimeout(testPromise, 3000)
        .then(response => {
          if (response.ok) {
            console.log('🌐 Remote sounds available, enabling remote loading');
            SOUND_CONFIG.useRemoteFiles = true;
          } else if (response.status === 403) {
            console.log('🔒 Remote sounds require authentication - using simulation mode');
          } else {
            console.log(`🌐 Remote sounds unavailable (${response.status}) - using simulation mode`);
          }
        })
        .catch(() => {
          console.log('🌐 Remote sounds not accessible - using simulation mode');
        });
    } catch (error) {
      // Silently fail - simulation mode is fine
    }
  }

  async loadSettings(): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem('ambientSoundSettings');
      if (settingsJson) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
      }
    } catch (error) {
      // Use defaults if loading fails
      this.settings = DEFAULT_SETTINGS;
    }
  }

  async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('ambientSoundSettings', JSON.stringify(this.settings));
    } catch (error) {
      // Fail silently - not critical
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
      
      if (Platform.OS === 'web') {
        // Web implementation would use HTML5 Audio with actual files
        console.log(`🎵 Playing ambient sound: ${config.name} (web simulation)`);
        return null;
      }

      // Check if this sound failed before to avoid repeated attempts
      if (FAILED_REMOTE_LOADS.has(soundType)) {
        console.log(`🎵 Simulating ambient sound: ${config.name} (previous load failed)`);
        return null;
      }

      let soundSource;
      let sourceType = 'unknown';

      if (SOUND_CONFIG.useRemoteFiles) {
        // Try remote URL first
        const remoteUrl = REMOTE_SOUND_URLS[soundType];
        if (remoteUrl && !remoteUrl.includes('your-bucket-name')) {
          soundSource = { uri: remoteUrl };
          sourceType = 'remote';
          console.log(`🌐 Loading remote sound: ${config.name} from ${remoteUrl}`);
        } else {
          soundSource = LOCAL_SOUND_FILES[soundType];
          sourceType = 'local';
        }
      } else {
        // Use local files
        soundSource = LOCAL_SOUND_FILES[soundType];
        sourceType = 'local';
      }

      // Check if we have a valid sound source
      if (!soundSource) {
        // Simulate the sound for now - will work when files are added
        console.log(`🎵 Simulating ambient sound: ${config.name} (${sourceType} file not available)`);
        return null;
      }

      // Create sound from source with timeout (either remote URL or local file)
      const soundPromise = Audio.Sound.createAsync(
        soundSource,
        { 
          shouldPlay: false, 
          isLooping: true,
          volume: config.volume * this.settings.volume
        }
      );

      const { sound } = await withTimeout(soundPromise, SOUND_CONFIG.remoteTimeout);
      
      console.log(`🎵 Loaded ambient sound: ${config.name}`);
      return sound;
    } catch (error: any) {
      // Mark this sound as failed to avoid repeated attempts
      FAILED_REMOTE_LOADS.add(soundType);
      
      // Only log the first failure for each sound
      if (error?.message?.includes('403') || error?.message?.includes('Network')) {
        console.log(`🔒 Remote sound ${soundType} not accessible - using simulation`);
      } else if (!error?.message?.includes('timed out')) {
        console.log(`🎵 Sound ${soundType} unavailable - using simulation`);
      }
      
      return null;
    }
  }

  async playSound(soundType: AmbientSoundType, fadeIn = true): Promise<boolean> {
    if (!this.settings.enabled || !this.initialized) return false;

    try {
      // Stop current sound if playing (non-blocking)
      this.stopCurrentSound(fadeIn).catch(() => {});

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

      // Fade in if enabled (non-blocking)
      if (fadeIn && this.settings.fadeEnabled) {
        this.fadeIn(sound, targetVolume).catch(() => {});
      }

      return true;
    } catch (error) {
      // Fail silently - ambient sounds are not critical
      console.log(`🎵 Simulating ambient sound: ${AMBIENT_SOUNDS[soundType].name}`);
      return true; // Return true to indicate the "simulation" succeeded
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
      // Fail silently - just reset the reference
      this.currentSound = null;
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
        break; // Exit fade if there's an error
      }
    }
  }

  private async fadeOut(sound: Audio.Sound, duration = 1500): Promise<void> {
    this.fadingOut = true;
    const steps = 15;
    const stepDuration = duration / steps;
    
    try {
      const currentVolume = await sound.getStatusAsync();
      const volume = currentVolume.isLoaded ? currentVolume.volume || 0.3 : 0.3;
      const volumeStep = volume / steps;

      for (let i = steps - 1; i >= 0; i--) {
        if (!this.fadingOut) break; // Fade was interrupted
        
        try {
          await sound.setVolumeAsync(volumeStep * i);
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        } catch (error) {
          break; // Exit fade if there's an error
        }
      }
    } catch (error) {
      // Fail silently
    } finally {
      this.fadingOut = false;
    }
  }

  async previewSound(soundType: AmbientSoundType): Promise<void> {
    if (!this.initialized) return;

    try {
      // Create a temporary sound for preview
      const sound = await this.createSoundFromType(soundType);
      if (!sound) {
        console.log(`🎵 Previewing ambient sound: ${AMBIENT_SOUNDS[soundType].name} (simulation)`);
        return;
      }

      const config = AMBIENT_SOUNDS[soundType];
      await sound.setVolumeAsync(config.volume * this.settings.volume);
      await sound.playAsync();

      // Stop preview after 3 seconds
      setTimeout(async () => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          // Fail silently
        }
      }, 3000);
    } catch (error) {
      console.log(`🎵 Previewing ambient sound: ${AMBIENT_SOUNDS[soundType].name} (simulation)`);
    }
  }

  isPlaying(): boolean {
    return this.currentSound !== null;
  }

  getCurrentSoundType(): AmbientSoundType | null {
    return this.settings.currentSound;
  }
}

// Global instance
export const ambientSoundManager = new AmbientSoundManager();

// Convenience functions
export async function initializeAmbientSounds(): Promise<void> {
  // Non-blocking initialization
  ambientSoundManager.initialize().catch(() => {
    console.log('🎵 Ambient sounds initialized in simulation mode');
  });
}

export async function playScreenAmbient(screenType: keyof typeof SCREEN_AMBIENT_SOUNDS): Promise<void> {
  const soundType = SCREEN_AMBIENT_SOUNDS[screenType];
  if (soundType) {
    // Non-blocking sound playing
    ambientSoundManager.playSound(soundType).catch(() => {
      console.log(`🎵 Playing ambient sound for ${screenType} (simulation)`);
    });
  }
}

export async function stopAmbientSounds(): Promise<void> {
  // Non-blocking stop
  ambientSoundManager.stopCurrentSound().catch(() => {});
}

export async function setAmbientVolume(volume: number): Promise<void> {
  const settings = ambientSoundManager.getSettings();
  ambientSoundManager.updateSettings({ ...settings, volume }).catch(() => {});
}

export function getAmbientSoundCategories() {
  const categories: { [key: string]: AmbientSoundType[] } = {};
  
  Object.entries(AMBIENT_SOUNDS).forEach(([key, config]) => {
    const soundType = key as AmbientSoundType;
    if (!categories[config.category]) {
      categories[config.category] = [];
    }
    categories[config.category].push(soundType);
  });
  
  return categories;
} 