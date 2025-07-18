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
            // User is authenticated and profile exists.
            // Onboarding is complete if they have set a name AND birth data.
            const hasCompletedOnboarding = 
              user.name && 
              user.name !== 'User' && 
              user.archetype &&
              user.birthDate &&
              user.birthLocation;
            
            console.log('🎯 Authenticated user routing:', { 
              userName: user.name,
              archetype: user.archetype,
              hasBirthData: !!(user.birthDate && user.birthLocation),
              hasCompletedOnboarding: hasCompletedOnboarding
            });
            
            if (!hasCompletedOnboarding) {
              console.log('📚 User needs to complete onboarding - redirecting to welcome...');
              router.replace('/onboarding/welcome');
            } else {
              console.log('✅ User has completed onboarding - going to main app...');
              // Fixed: Direct navigation to home tab to avoid routing loop
              router.replace('/(tabs)/index');
            }
          } else if (session) {
            // Session exists but no user profile - redirect to name collection
            console.log('🔑 Session found but no user profile - redirecting to onboarding...');
            router.replace('/onboarding/welcome');
          } else {
            // No session - redirect to auth
            console.log('🔐 No session found - redirecting to auth...');
            router.replace('/auth');
          }
        } catch (routingError) {
          console.error('❌ Routing error:', routingError);
          // Fallback routing
          if (session) {
            router.replace('/(tabs)/index');
          } else {
            router.replace('/auth');
          }
        }
      }
    }, 100); // Short delay to ensure auth state is settled

    return () => clearTimeout(navigationTimeout);
  }, [session, user, loading, connectionStatus]);

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