import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { TransitionPresets } from '@react-navigation/stack';

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // Smooth auth transitions
        animationEnabled: true,
        gestureEnabled: Platform.OS === 'ios',
        ...(Platform.OS === 'android' 
          ? {
              // Android-optimized fade transitions for auth
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 300,
                    easing: 'ease-out',
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 250,
                    easing: 'ease-in',
                  },
                },
              },
              cardStyleInterpolator: ({ current }) => {
                return {
                  cardStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                };
              },
            }
          : TransitionPresets.FadeFromBottomAndroid),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}