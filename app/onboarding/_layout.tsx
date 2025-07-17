import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { TransitionPresets } from '@react-navigation/stack';

export default function OnboardingLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // Optimized smooth transitions for onboarding flow
        animationEnabled: true,
        gestureEnabled: false, // Disable swipe back during onboarding
        ...(Platform.OS === 'android' 
          ? {
              // Android-specific smooth transitions
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 350,
                    easing: 'ease-out',
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 300,
                    easing: 'ease-in',
                  },
                },
              },
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width * 0.3, 0],
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0, 0.9, 1],
                    }),
                  },
                };
              },
            }
          : {
              // iOS smooth fade + slide transition
              ...TransitionPresets.FadeFromBottomAndroid,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 400,
                    easing: 'ease-out',
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 300,
                    easing: 'ease-in',
                  },
                },
              },
            }),
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="name" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="about" />
      <Stack.Screen name="astrology" />
      <Stack.Screen name="intention" />
      <Stack.Screen name="breath" />
      <Stack.Screen name="tutorial" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}