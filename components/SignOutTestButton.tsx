import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TestTube as TestTube2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { testAuthState } from '@/utils/auth';

export function SignOutTestButton() {
  const { testSignOut } = useAuth();

  const handleRunTests = async () => {
    console.log('🧪 Starting comprehensive sign out tests...');
    
    // Test 1: Check current auth state
    console.log('🧪 Test 1: Current auth state');
    await testAuthState();
    
    // Test 2: Test sign out process
    console.log('🧪 Test 2: Sign out process');
    if (testSignOut) {
      await testSignOut();
    } else {
      console.error('❌ testSignOut function not available');
    }
    
    // Test 3: Check auth state after sign out
    setTimeout(async () => {
      console.log('🧪 Test 3: Auth state after sign out (5s delay)');
      await testAuthState();
    }, 5000);
  };

  return (
    <Pressable style={styles.testButton} onPress={handleRunTests}>
      <TestTube2 size={16} color="#3B82F6" />
      <Text style={styles.testButtonText}>Test Sign Out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: 6,
    alignSelf: 'center',
    marginVertical: 16,
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
});