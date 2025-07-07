import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Enhanced Haptic Feedback System
export class HapticManager {
  static async triggerCardReveal() {
    // Custom haptic pattern for card reveal
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 300);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 800);
    setTimeout(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1200);
  }

  static async triggerSuccess() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  static async triggerError() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  static async triggerWarning() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  static async triggerSelection() {
    await Haptics.selectionAsync();
  }

  static async triggerMeditation() {
    // Enhanced breathing rhythm haptic
    const breathingPattern = [
      { type: Haptics.ImpactFeedbackStyle.Light, delay: 0 },
      { type: Haptics.ImpactFeedbackStyle.Medium, delay: 4000 }, // Inhale peak
      { type: Haptics.ImpactFeedbackStyle.Light, delay: 8000 }, // Exhale
    ];

    breathingPattern.forEach(({ type, delay }) => {
      setTimeout(async () => {
        await Haptics.impactAsync(type);
      }, delay);
    });
  }

  static async triggerCardFlip() {
    // Quick double tap for card flipping
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 150);
  }

  static async triggerReflectionComplete() {
    // Celebration pattern
    const celebrationPattern = [
      { type: Haptics.ImpactFeedbackStyle.Light, delay: 0 },
      { type: Haptics.ImpactFeedbackStyle.Medium, delay: 100 },
      { type: Haptics.ImpactFeedbackStyle.Heavy, delay: 200 },
      { type: Haptics.NotificationFeedbackType.Success, delay: 400 },
    ];

    celebrationPattern.forEach(({ type, delay }) => {
      setTimeout(async () => {
        if (type === Haptics.NotificationFeedbackType.Success) {
          await Haptics.notificationAsync(type);
        } else {
          await Haptics.impactAsync(type as any);
        }
      }, delay);
    });
  }
}

// Enhanced Notification System
export class NotificationManager {
  static async setupNotifications() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Configure notification handling
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    return true;
  }

  static async scheduleDailyReflectionReminder(hour: number = 9, minute: number = 0) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌟 Your Daily Reflection Awaits",
          body: "Take a moment to connect with your inner wisdom",
          sound: 'default',
          data: { 
            type: 'daily_reflection',
            timestamp: Date.now() 
          },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      console.log('📅 Daily reflection reminder scheduled:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ Failed to schedule notification:', error);
      return null;
    }
  }

  static async scheduleWeeklyInsight() {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "✨ Weekly Wisdom",
          body: "Review your week's reflections and discover patterns",
          sound: 'default',
          data: { 
            type: 'weekly_insight',
            timestamp: Date.now() 
          },
        },
        trigger: {
          weekday: 1, // Monday
          hour: 19, // 7 PM
          minute: 0,
          repeats: true,
        },
      });

      console.log('📊 Weekly insight notification scheduled:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ Failed to schedule weekly insight:', error);
      return null;
    }
  }

  static async sendMotivationalMessage() {
    const messages = [
      "Your inner wisdom is your greatest guide 🌟",
      "Trust the process of your spiritual journey ✨",
      "Every reflection brings you closer to your true self 💫",
      "Your intuition knows the way forward 🧭",
      "You are exactly where you need to be 🙏",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Inspiration",
        body: randomMessage,
        data: { type: 'motivation' },
      },
      trigger: null, // Send immediately
    });
  }
}

// Enhanced Shortcuts Integration
export class ShortcutsManager {
  static async createQuickCardDraw() {
    // iOS Shortcuts integration
    const shortcut = {
      identifier: 'quick-card-draw',
      title: 'Draw Daily Card',
      subtitle: 'Get your daily tarot guidance instantly',
      suggestedInvocationPhrase: 'Draw my daily card',
      isEligibleForSearch: true,
      isEligibleForPrediction: true,
      userInfo: {
        action: 'draw_card',
        timestamp: Date.now(),
      },
    };

    // Register with system (iOS only)
    if (Platform.OS === 'ios') {
      // Would integrate with SiriKit for voice commands
      console.log('🍎 iOS Shortcut registered:', shortcut.identifier);
    }

    return shortcut;
  }

  static async createMeditationShortcut() {
    return {
      identifier: 'quick-meditation',
      title: 'Start Breathing Exercise',
      subtitle: 'Begin 3-minute guided breathing',
      suggestedInvocationPhrase: 'Start my meditation',
      isEligibleForSearch: true,
      isEligibleForPrediction: true,
      userInfo: {
        action: 'start_breathing',
        duration: 180, // 3 minutes
      },
    };
  }

  static async createJournalShortcut() {
    return {
      identifier: 'quick-journal',
      title: 'Open Journal',
      subtitle: 'Start writing your reflections',
      suggestedInvocationPhrase: 'Open my spiritual journal',
      isEligibleForSearch: true,
      isEligibleForPrediction: true,
      userInfo: {
        action: 'open_journal',
        page: 'new_entry',
      },
    };
  }

  static async createWeeklyReviewShortcut() {
    return {
      identifier: 'weekly-review',
      title: 'Weekly Wisdom Review',
      subtitle: 'Review your week\'s spiritual insights',
      suggestedInvocationPhrase: 'Show my weekly wisdom',
      isEligibleForSearch: true,
      isEligibleForPrediction: true,
      userInfo: {
        action: 'weekly_review',
        lookback_days: 7,
      },
    };
  }

  static handleShortcutActivation(shortcutInfo: any) {
    // Handle incoming shortcut activations
    const { action } = shortcutInfo.userInfo || {};
    
    switch (action) {
      case 'draw_card':
        // Navigate to card drawing
        return { screen: 'Today', action: 'draw_card' };
      case 'start_breathing':
        return { screen: 'Breathing' };
      case 'open_journal':
        return { screen: 'Journal', action: 'new_entry' };
      case 'weekly_review':
        return { screen: 'Calendar', action: 'weekly_view' };
      default:
        return { screen: 'Today' };
    }
  }
}

// Enhanced Accessibility Support
export class AccessibilityManager {
  static getCardDescription(card: any) {
    return {
      accessibilityLabel: `${card.name} tarot card`,
      accessibilityHint: `Tap to explore the spiritual meaning of ${card.name}. This card represents ${card.keywords.slice(0, 2).join(' and ')}.`,
      accessibilityRole: 'button',
      accessibilityState: { selected: false },
      accessibilityValue: {
        text: `Keywords: ${card.keywords.join(', ')}. Meaning: ${card.meaning}`,
      },
      accessibilityActions: [
        { name: 'activate', label: 'Draw this card' },
        { name: 'longpress', label: 'Learn more about this card' },
      ],
    };
  }

  static getAnimationDescription(phase: string) {
    const descriptions = {
      ambient: 'Gentle spiritual energy flows around you, creating a peaceful atmosphere',
      gathering: 'Cosmic forces gather, preparing to reveal your guidance',
      channeling: 'Divine energy channels through the mystical realm',
      cosmic: 'Universal alignment connects you to ancient wisdom',
      portal: 'A portal to spiritual insight opens before you',
      materialization: 'Your personal guidance materializes from the ether',
      reveal: 'Your tarot card has been revealed, bringing sacred wisdom',
      breathing: 'Breathe in peace, breathe out tension. Let your spirit find balance',
      reflection: 'Deep contemplation brings clarity to your spiritual path',
      completion: 'Your spiritual practice is complete. Wisdom flows within you',
    };

    return descriptions[phase] || 'Mystical energy flows through your spiritual practice';
  }

  static getJournalEntryDescription(entry: any) {
    const wordCount = entry.content?.split(' ').length || 0;
    const date = new Date(entry.created_at).toLocaleDateString();
    
    return {
      accessibilityLabel: `Journal entry from ${date}`,
      accessibilityHint: `${wordCount} words of spiritual reflection. Double tap to read or edit.`,
      accessibilityValue: {
        text: `Written on ${date}. Contains ${wordCount} words of personal insights.`,
      },
    };
  }

  static getBreatheInstructions(phase: 'inhale' | 'hold' | 'exhale') {
    const instructions = {
      inhale: 'Breathe in slowly and deeply. Fill your lungs with peaceful energy.',
      hold: 'Hold this breath gently. Feel the stillness within.',
      exhale: 'Release slowly and completely. Let go of all tension.',
    };

    return {
      accessibilityLabel: instructions[phase],
      accessibilityLiveRegion: 'polite',
      accessibilityRole: 'text',
    };
  }
}

// Performance Monitoring & Optimization
export class PerformanceManager {
  private static metrics: any[] = [];

  static trackAnimationPerformance(animationName: string, duration: number, framesDropped: number = 0) {
    const metric = {
      type: 'animation',
      name: animationName,
      duration,
      framesDropped,
      timestamp: Date.now(),
      platform: Platform.OS,
      deviceMemory: this.getDeviceMemoryEstimate(),
    };

    this.metrics.push(metric);
    console.log(`📊 Animation ${animationName}: ${duration}ms, ${framesDropped} frames dropped`);

    // Auto-optimize if performance is poor
    if (framesDropped > 5 || duration > 1000) {
      this.suggestOptimizations(animationName);
    }

    return metric;
  }

  static trackRenderPerformance(componentName: string, renderTime: number) {
    const metric = {
      type: 'render',
      component: componentName,
      renderTime,
      timestamp: Date.now(),
      platform: Platform.OS,
    };

    this.metrics.push(metric);
    
    if (renderTime > 100) {
      console.warn(`⚠️ Slow render detected: ${componentName} took ${renderTime}ms`);
    }

    return metric;
  }

  static optimizeForDevice() {
    const deviceCapabilities = this.analyzeDeviceCapabilities();
    
    const optimizations = {
      reduceMotion: deviceCapabilities.lowEnd,
      enableBlur: !deviceCapabilities.lowEnd,
      particleCount: deviceCapabilities.lowEnd ? 6 : 12,
      enableHaptics: deviceCapabilities.hasHaptics,
      maxAnimations: deviceCapabilities.lowEnd ? 2 : 5,
      useNativeDriver: true,
      enableGPUAcceleration: !deviceCapabilities.lowEnd,
    };

    console.log('🔧 Device optimizations applied:', optimizations);
    return optimizations;
  }

  private static analyzeDeviceCapabilities() {
    // Basic device capability analysis
    const isLowEnd = Platform.OS === 'android' && Platform.Version < 28;
    
    return {
      lowEnd: isLowEnd,
      hasHaptics: Platform.OS === 'ios' || Platform.Version >= 26,
      supportsBlur: true,
      memoryWarning: false, // Would be detected via native modules
    };
  }

  private static getDeviceMemoryEstimate() {
    // Rough estimate - would use actual device memory in production
    return Platform.OS === 'ios' ? '4GB+' : '3GB+';
  }

  private static suggestOptimizations(animationName: string) {
    const suggestions = [
      `Consider reducing particle count for ${animationName}`,
      `Use native driver for ${animationName} animation`,
      `Simplify ${animationName} easing function`,
      `Reduce ${animationName} duration on lower-end devices`,
    ];

    console.log(`💡 Optimization suggestions for ${animationName}:`, suggestions);
    return suggestions;
  }

  static getPerformanceReport() {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000); // Last 5 minutes

    const report = {
      totalAnimations: recentMetrics.filter(m => m.type === 'animation').length,
      averageAnimationDuration: this.calculateAverage(recentMetrics, 'duration'),
      totalFramesDropped: recentMetrics.reduce((sum, m) => sum + (m.framesDropped || 0), 0),
      slowRenders: recentMetrics.filter(m => m.type === 'render' && m.renderTime > 100).length,
      suggestions: this.generateOptimizationSuggestions(recentMetrics),
    };

    return report;
  }

  private static calculateAverage(metrics: any[], field: string) {
    const values = metrics.filter(m => m[field] !== undefined).map(m => m[field]);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private static generateOptimizationSuggestions(metrics: any[]) {
    const suggestions = [];
    
    const avgDuration = this.calculateAverage(metrics.filter(m => m.type === 'animation'), 'duration');
    if (avgDuration > 800) {
      suggestions.push('Consider reducing animation durations for better responsiveness');
    }

    const totalFramesDropped = metrics.reduce((sum, m) => sum + (m.framesDropped || 0), 0);
    if (totalFramesDropped > 10) {
      suggestions.push('Enable native driver for smoother animations');
    }

    return suggestions;
  }
}

// Deep Linking & Navigation Enhancement
export class DeepLinkManager {
  static createCardShareLink(cardData: any, userReflection?: string) {
    const params = new URLSearchParams({
      card: cardData.id,
      date: new Date().toISOString(),
      ...(userReflection && { reflection: encodeURIComponent(userReflection.slice(0, 100)) }),
    });

    return `dailyinner://card?${params.toString()}`;
  }

  static createJournalEntryLink(entryId: string, highlight?: string) {
    const params = new URLSearchParams({
      entry: entryId,
      ...(highlight && { highlight: encodeURIComponent(highlight) }),
    });

    return `dailyinner://journal?${params.toString()}`;
  }

  static createMeditationSessionLink(sessionType: string, duration: number) {
    return `dailyinner://breathe?type=${sessionType}&duration=${duration}`;
  }

  static createWeeklyInsightLink(startDate: string) {
    return `dailyinner://insights?start=${startDate}&type=weekly`;
  }

  static handleIncomingLink(url: string) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace('/', '');
      const params = Object.fromEntries(urlObj.searchParams);

      const routes = {
        card: () => ({
          screen: 'CardDetails',
          params: {
            cardId: params.card,
            date: params.date,
            sharedReflection: params.reflection,
          },
        }),
        journal: () => ({
          screen: 'Journal',
          params: {
            entryId: params.entry,
            highlight: params.highlight,
            action: 'view',
          },
        }),
        breathe: () => ({
          screen: 'Breathing',
          params: {
            sessionType: params.type || 'basic',
            duration: parseInt(params.duration) || 180,
            autoStart: true,
          },
        }),
        insights: () => ({
          screen: 'Calendar',
          params: {
            view: 'insights',
            startDate: params.start,
            type: params.type,
          },
        }),
      };

      const handler = routes[path as keyof typeof routes];
      return handler ? handler() : { screen: 'Today' };
    } catch (error) {
      console.error('❌ Error parsing deep link:', error);
      return { screen: 'Today' };
    }
  }

  static generateShareContent(type: 'card' | 'reflection' | 'insight', data: any) {
    const templates = {
      card: `🌟 Today's guidance: "${data.cardName}" \n\n${data.meaning}\n\nDiscover your daily wisdom with Daily Inner Reflection`,
      reflection: `✨ A moment of clarity:\n\n"${data.excerpt}"\n\nShared from my spiritual journey`,
      insight: `📊 This week I've discovered:\n\n${data.insights.join('\n• ')}\n\nTracking my growth with Daily Inner Reflection`,
    };

    return templates[type] || '';
  }
}

// Widget & Home Screen Integration (for future implementation)
export class WidgetManager {
  static async registerWidgets() {
    if (Platform.OS === 'ios') {
      // iOS Widget configuration
      const widgets = [
        {
          kind: 'TodayCardWidget',
          displayName: 'Today\'s Card',
          description: 'See your daily tarot card at a glance',
          supportedFamilies: ['systemSmall', 'systemMedium'],
        },
        {
          kind: 'ReflectionWidget',
          displayName: 'Daily Reflection',
          description: 'Quick access to your reflection practice',
          supportedFamilies: ['systemMedium', 'systemLarge'],
        },
      ];

      console.log('📱 iOS Widgets registered:', widgets.length);
      return widgets;
    } else if (Platform.OS === 'android') {
      // Android Widget configuration
      console.log('🤖 Android Widgets support planned for future release');
      return [];
    }
  }

  static async updateWidgetData(widgetKind: string, data: any) {
    // Update widget content
    console.log(`🔄 Updating ${widgetKind} widget with:`, data);
    
    // Would integrate with native widget APIs
    return true;
  }
}

// Export all managers
export default {
  HapticManager,
  NotificationManager,
  ShortcutsManager,
  AccessibilityManager,
  PerformanceManager,
  DeepLinkManager,
  WidgetManager,
}; 