import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface AudioRecording {
  uri: string;
  duration: number;
}

let recording: Audio.Recording | null = null;

export const requestAudioPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // For web, we'll use the Web Audio API
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      return true;
    }

    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
};

export const startRecording = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation would use MediaRecorder API
      console.log('Web audio recording not fully implemented yet');
      return true;
    }

    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      console.error('Audio permission not granted');
      return false;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recording = newRecording;
    console.log('Recording started');
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
};

export const stopRecording = async (): Promise<AudioRecording | null> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation placeholder
      return {
        uri: 'web-recording-placeholder',
        duration: 5000, // 5 seconds placeholder
      };
    }

    if (!recording) {
      console.error('No recording in progress');
      return null;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const status = await recording.getStatusAsync();

    recording = null;

    if (!uri) {
      console.error('Recording URI is null');
      return null;
    }

    return {
      uri,
      duration: status.isLoaded ? status.durationMillis || 0 : 0,
    };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return null;
  }
};

export const playAudio = async (uri: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation would use HTML5 Audio
      console.log('Playing audio on web:', uri);
      return true;
    }

    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    return true;
  } catch (error) {
    console.error('Failed to play audio:', error);
    return false;
  }
};

export const saveAudioToDocuments = async (uri: string, filename: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // For web, we'd typically upload to a server or use IndexedDB
      return uri; // Return the original URI for web
    }

    const documentsDir = FileSystem.documentDirectory;
    if (!documentsDir) {
      console.error('Documents directory not available');
      return null;
    }

    const newUri = `${documentsDir}${filename}`;
    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });

    return newUri;
  } catch (error) {
    console.error('Failed to save audio file:', error);
    return null;
  }
};