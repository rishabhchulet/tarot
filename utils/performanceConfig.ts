import { Platform } from 'react-native';

// Conditionally import and enable screens for better performance
let enableScreens: any = null;
try {
  enableScreens = require('react-native-screens').enableScreens;
} catch (error) {
  console.log('react-native-screens not available');
}

// Enable native screens for better performance
if (Platform.OS === 'android' && enableScreens) {
  enableScreens(true);
}

// Performance optimization configurations
export const navigationConfig = {
  // Optimized for Android performance
  android: {
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: 'ease-out' as const,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 250,
          easing: 'ease-in' as const,
        },
      },
    },
    // Smooth slide transition with opacity fade
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width * 0.25, 0],
              }),
            },
          ],
          opacity: current.progress.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 0.85, 1],
          }),
        },
      };
    },
  },
  // iOS uses system defaults for best native feel
  ios: {
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          stiffness: 1000,
          damping: 500,
          mass: 3,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: 'ease-in' as const,
        },
      },
    },
  },
};

// Animation utilities
export const getOptimizedTransition = () => {
  return Platform.OS === 'android' ? navigationConfig.android : navigationConfig.ios;
};

// Performance flags
export const performanceFlags = {
  enableHermes: Platform.OS === 'android',
  useNativeDriver: true,
  removeClippedSubviews: Platform.OS === 'android',
  windowSize: Platform.OS === 'android' ? 10 : 21,
  initialNumToRender: Platform.OS === 'android' ? 5 : 10,
  maxToRenderPerBatch: Platform.OS === 'android' ? 3 : 5,
  updateCellsBatchingPeriod: Platform.OS === 'android' ? 100 : 50,
  getItemLayout: true, // Enable if list items have fixed heights
};

// Memory optimization
export const optimizeMemory = () => {
  if (Platform.OS === 'android') {
    // Request garbage collection on Android for better memory management
    if (global.gc) {
      global.gc();
    }
  }
}; 