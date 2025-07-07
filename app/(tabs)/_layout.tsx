import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { designTokens } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { Star, BookOpen, Calendar, Settings, Home, Heart } from 'lucide-react-native';

export default function TabLayout() {
  const handleTabPress = async () => {
    await HapticManager.triggerSelection();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: designTokens.colors.accent.brightBlue,
        tabBarInactiveTintColor: designTokens.colors.text.muted,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: designTokens.typography.fontSize.xs,
          fontWeight: designTokens.typography.fontWeight.medium as any,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 25 : 15,
          left: 20,
          right: 20,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 34 : 10,
          paddingTop: 8,
          borderRadius: designTokens.borderRadius.xl,
          shadowColor: designTokens.colors.accent.blue,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <BlurView 
              intensity={80} 
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tabBarGlass} />
            <View style={styles.tabBarBorder} />
          </View>
        ),
        tabBarItemStyle: {
          borderRadius: designTokens.borderRadius.md,
          marginHorizontal: 4,
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              Icon={Star} 
              color={color} 
              focused={focused}
              onPress={handleTabPress}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Wisdom',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              Icon={Heart} 
              color={color} 
              focused={focused}
              onPress={handleTabPress}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              Icon={BookOpen} 
              color={color} 
              focused={focused}
              onPress={handleTabPress}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              Icon={Calendar} 
              color={color} 
              focused={focused}
              onPress={handleTabPress}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              Icon={Settings} 
              color={color} 
              focused={focused}
              onPress={handleTabPress}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// Enhanced Tab Icon Component
interface TabIconProps {
  Icon: React.ComponentType<any>;
  color: string;
  focused: boolean;
  onPress?: () => void;
}

function TabIcon({ Icon, color, focused, onPress }: TabIconProps) {
  const iconSize = focused ? 26 : 22;
  
  return (
    <View style={[
      styles.tabIcon,
      focused && styles.tabIconFocused
    ]}>
      {focused && <View style={styles.tabIconGlow} />}
      <Icon 
        size={iconSize} 
        color={color}
        strokeWidth={focused ? 2.5 : 2}
      />
      {focused && (
        <View style={styles.focusIndicator} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    borderRadius: designTokens.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: designTokens.colors.glass.background,
  },
  
  tabBarGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designTokens.colors.glass.backgroundStrong,
    borderRadius: designTokens.borderRadius.xl,
  },
  
  tabBarBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: designTokens.borderRadius.xl,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },
  
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: designTokens.borderRadius.sm,
  },
  
  tabIconFocused: {
    backgroundColor: designTokens.colors.glass.background,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },
  
  tabIconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: designTokens.colors.accent.brightBlue,
    opacity: 0.15,
  },
  
  focusIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: designTokens.colors.accent.brightBlue,
  },
});