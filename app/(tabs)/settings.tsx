import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, User, CreditCard, HelpCircle, LogOut, Settings as SettingsIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SignOutTestButton } from '@/components/SignOutTestButton';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const SettingItem = ({ icon: Icon, title, onPress, rightElement, isDestructive = false }) => (
    <Pressable style={styles.itemContainer} onPress={onPress}>
        <View style={[styles.iconContainer, isDestructive && { backgroundColor: 'rgba(239, 68, 68, 0.1)'}]}>
            <Icon size={22} color={isDestructive ? '#F87171' : '#3B82F6'} />
        </View>
        <Text style={[styles.itemTitle, isDestructive && { color: '#F87171'}]}>{title}</Text>
        <View style={{flex: 1}} />
        {rightElement}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <SettingsIcon size={28} color="#3B82F6" />
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon={User}
            title="Profile"
            onPress={() => router.push('/profile')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            icon={Bell}
            title="Daily Reminders"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#374151', true: '#3B82F6' }}
                thumbColor={notificationsEnabled ? '#F9FAFB' : '#6B7280'}
              />
            }
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & More</Text>
          <SettingItem
            icon={CreditCard}
            title="Manage Subscription"
            onPress={() => Alert.alert('Subscription', 'Manage your subscription here.')}
          />
          <SettingItem
            icon={HelpCircle}
            title="Help & Support"
            onPress={() => Alert.alert('Help', 'Contact support@example.com for help.')}
          />
        </View>

        <View style={[styles.section, {marginTop: 24, alignItems: 'center'}]}>
            <SignOutTestButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 16,
        paddingHorizontal: 24,
        gap: 12,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
        color: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#A1A1AA',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    iconContainer: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: 8,
        borderRadius: 99,
        marginRight: 16,
    },
    itemTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#F9FAFB',
    },
});