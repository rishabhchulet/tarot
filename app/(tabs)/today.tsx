import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LoadingState } from '@/components/LoadingState';

// This is an alias route that redirects to index
export default function TodayScreen() {
  useEffect(() => {
    console.log('📱 Today alias route - redirecting to index');
    
    // Navigate to the main index route
    try {
      router.replace('/(tabs)/index');
    } catch (error) {
      console.error('❌ Navigation error in today alias route:', error);
      
      // Wait a moment and try again
      setTimeout(() => {
        try {
          router.replace('/(tabs)');
        } catch (fallbackError) {
          console.error('❌ Fallback navigation error:', fallbackError);
        }
      }, 100);
    }
  }, []);

  return (
    <View style={styles.container}>
      <LoadingState message="Redirecting..." submessage="Taking you to Today's reflection" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
});