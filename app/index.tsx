import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { LoadingState } from '@/components/LoadingState';

export default function IndexScreen() {
  const { user, session, loading, error, connectionStatus, retryConnection } = useAuth();

  useEffect(() => {
    // Enhanced routing with connection status awareness
    const navigationTimeout = setTimeout(() => {
      console.log('🔍 Routing check:', { 
        hasSession: !!session, 
        hasUser: !!user, 
        userFocusArea: user?.focusArea,
        userName: user?.name,
        loading,
        error,
        connectionStatus
      });

      // Only route if not loading and connection is stable
      if (!loading && connectionStatus !== 'connecting') {
        try {
          if (session && user) {
            // User is authenticated and profile exists
            const focusArea = user.focusArea;
            const hasCompletedOnboarding = focusArea && typeof focusArea === 'string' && focusArea.trim().length > 0;
            
            console.log('🎯 Authenticated user routing:', { 
              focusArea: focusArea,
              hasCompletedOnboarding: hasCompletedOnboarding
            });
            
            if (!hasCompletedOnboarding) {
              console.log('📚 User needs onboarding - redirecting to quiz...');
              router.replace('/onboarding/quiz');
            } else {
              console.log('✅ User has completed onboarding - going to main app...');
              router.replace('/(tabs)');
            }
          } else if (session && !user) {
            // If we have session but no user, proceed to onboarding anyway
            console.log('⚠️ Session exists but no user data - proceeding to onboarding...');
            router.replace('/onboarding/quiz');
          } else {
            // No session means new user - go to auth
            console.log('🔐 No session found - redirecting to auth (new user)...');
            router.replace('/auth');
          }
        } catch (navigationError) {
          console.error('❌ Navigation error:', navigationError);
          // Don't navigate if there's a connection issue
          if (connectionStatus === 'connected') {
            router.replace('/auth');
          }
        }
      }
    }, 1000); // 1 second delay to account for connection status

    return () => clearTimeout(navigationTimeout);
  }, [loading, session, user, error, connectionStatus]);

  // Show enhanced loading state with connection status
  return (
    <View style={styles.container}>
      <ConnectionStatus 
        status={connectionStatus}
        error={error}
        onRetry={retryConnection}
      />
      <LoadingState 
        message={session && !user ? 'Setting up your profile...' : 'Connecting to your inner wisdom...'}
        submessage={session && !user ? 'Loading your data...' : 'Establishing secure connection...'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});