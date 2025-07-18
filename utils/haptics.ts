import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility that works on both iOS and Android
 * Provides different feedback types for different user interactions
 */

export type HapticType = 
  | 'light'        // Light tap - selection, navigation
  | 'medium'       // Medium tap - button press, toggle
  | 'heavy'        // Heavy tap - important actions, confirmations
  | 'success'      // Success feedback - save, complete
  | 'warning'      // Warning feedback - validation errors
  | 'error'        // Error feedback - failed actions
  | 'selection';   // Selection feedback - picker, segment control

/**
 * Trigger haptic feedback with fallback for unsupported platforms
 */
export const triggerHaptic = async (type: HapticType): Promise<void> => {
  // Skip haptics on web platform
  if (Platform.OS === 'web') {
    return;
  }

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
        
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
        
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
        
      case 'success':
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // Android fallback to medium impact
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        break;
        
      case 'warning':
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
          // Android fallback to heavy impact
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        break;
        
      case 'error':
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          // Android fallback to heavy impact
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        break;
        
      case 'selection':
        if (Platform.OS === 'ios') {
          await Haptics.selectionAsync();
        } else {
          // Android fallback to light impact
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;
        
      default:
        // Default to light feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail if haptics are not available
    console.log('Haptic feedback not available:', error);
  }
};

/**
 * Convenience functions for common haptic patterns
 */

// Navigation and basic interactions
export const hapticLight = () => triggerHaptic('light');
export const hapticMedium = () => triggerHaptic('medium');
export const hapticHeavy = () => triggerHaptic('heavy');

// Feedback for actions
export const hapticSuccess = () => triggerHaptic('success');
export const hapticWarning = () => triggerHaptic('warning');
export const hapticError = () => triggerHaptic('error');
export const hapticSelection = () => triggerHaptic('selection');

/**
 * Button-specific haptic patterns
 */
export const buttonHaptics = {
  // Primary action buttons (Save, Continue, Submit)
  primary: () => triggerHaptic('medium'),
  
  // Secondary buttons (Skip, Cancel, Back)
  secondary: () => triggerHaptic('light'),
  
  // Destructive buttons (Delete, Remove)
  destructive: () => triggerHaptic('heavy'),
  
  // Tab navigation
  tab: () => triggerHaptic('selection'),
  
  // Card/item selection
  select: () => triggerHaptic('light'),
  
  // Toggle switches
  toggle: () => triggerHaptic('selection'),
  
  // Voice recording
  record: () => triggerHaptic('medium'),
  
  // Success confirmations
  confirm: () => triggerHaptic('success'),
};

/**
 * Check if haptics are available on the device
 */
export const areHapticsAvailable = (): boolean => {
  return Platform.OS !== 'web';
};

/**
 * Haptic feedback for different UI elements
 */
export const uiHaptics = {
  // When opening modals or sheets
  modalOpen: () => triggerHaptic('light'),
  
  // When closing modals or sheets  
  modalClose: () => triggerHaptic('light'),
  
  // When revealing content (cards, accordions)
  reveal: () => triggerHaptic('medium'),
  
  // When completing onboarding steps
  stepComplete: () => triggerHaptic('success'),
  
  // When validation fails
  validationError: () => triggerHaptic('error'),
  
  // When scrolling to boundaries (if implemented)
  scrollBoundary: () => triggerHaptic('light'),
  
  // When refreshing content
  refresh: () => triggerHaptic('medium'),
};

export default {
  triggerHaptic,
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticWarning,
  hapticError,
  hapticSelection,
  buttonHaptics,
  uiHaptics,
  areHapticsAvailable,
}; 