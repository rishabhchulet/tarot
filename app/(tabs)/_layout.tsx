import { Tabs } from 'expo-router';
import { BookOpen, Settings, Sparkles, Home } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: 'rgba(251, 191, 36, 0.2)',
          borderTopWidth: 1,
          paddingTop: 16,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingHorizontal: 8,
          height: Platform.OS === 'ios' ? 92 : 76,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: '#fbbf24',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 12,
          marginTop: 6,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          marginHorizontal: 4,
          borderRadius: 16,
          backgroundColor: 'transparent',
        },
      }}>
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <Home 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? 'rgba(251, 191, 36, 0.1)' : 'transparent'}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ size, color }) => (
            <Sparkles size={size} color={color} strokeWidth={2} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ size, color, focused }) => (
            <BookOpen 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? 'rgba(251, 191, 36, 0.1)' : 'transparent'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color, focused }) => (
            <Settings 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? 'rgba(251, 191, 36, 0.1)' : 'transparent'}
            />
          ),
        }}
      />
    </Tabs>
  );
}