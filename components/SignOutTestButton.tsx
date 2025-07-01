import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TestTube as TestTube2, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { testAuthState } from '@/utils/auth';
import { Alert } from 'react-native';

export function SignOutTestButton() {
  const { testSignOut, user, session } = useAuth();
  const [testRunning, setTestRunning] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'success' | 'failure' | null>(null);

  const handleRunTests = async () => {
    setTestRunning(true);
    setTestResult(null);
    console.log('🧪 Starting comprehensive sign out tests...');
    
    // Test 1: Check current auth state
    console.log('🧪 Test 1: Current auth state');
    await testAuthState();
    
    // Test 2: Test sign out process
    console.log('🧪 Test 2: Sign out process');
    if (testSignOut) {
      try {
        await testSignOut();
        
        // Schedule a check to verify results
        setTimeout(() => {
          const success = !user && !session;
          setTestResult(success ? 'success' : 'failure');
          setTestRunning(false);
          
          Alert.alert(
            success ? 'Sign Out Test Passed' : 'Sign Out Test Failed',
            success 
              ? 'The sign out process completed successfully. User and session were properly cleared.'
              : 'The sign out process failed. User or session still exist after sign out.',
            [{ text: 'OK' }]
          );
        }, 3000);
        
      } catch (error) {
        console.error('❌ Sign out test error:', error);
        setTestResult('failure');
        setTestRunning(false);
      }
    } else {
      console.error('❌ testSignOut function not available');
      setTestResult('failure');
      setTestRunning(false);
    }
  };

  // Button style based on state
  const buttonStyle = [
    styles.testButton,
    testRunning && styles.testButtonRunning,
    testResult === 'success' && styles.testButtonSuccess,
    testResult === 'failure' && styles.testButtonFailure,
  ];

  // Button text based on state
  let buttonText = 'Test Sign Out';
  if (testRunning) buttonText = 'Testing...';
  else if (testResult === 'success') buttonText = 'Test Passed';
  else if (testResult === 'failure') buttonText = 'Test Failed';

  // Button icon based on state
  const ButtonIcon = testResult === 'failure' 
    ? AlertTriangle 
    : TestTube2;

  // Button icon color based on state
  let iconColor = '#3B82F6';
  if (testRunning) iconColor = '#9CA3AF';
  else if (testResult === 'success') iconColor = '#10B981';
  else if (testResult === 'failure') iconColor = '#EF4444';

  return (
    <View style={styles.container}>
      <Pressable 
        style={buttonStyle} 
        onPress={handleRunTests}
        disabled={testRunning}
      >
        <ButtonIcon size={16} color={iconColor} />
        <Text style={[
          styles.testButtonText,
          testRunning && styles.testButtonTextRunning,
          testResult === 'success' && styles.testButtonTextSuccess,
          testResult === 'failure' && styles.testButtonTextFailure,
        ]}>
          {buttonText}
        </Text>
      </Pressable>
      
      {/* Description text */}
      <Text style={styles.description}>
        Run comprehensive sign out tests to verify functionality
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: 8,
  },
  testButtonRunning: {
    borderColor: 'rgba(156, 163, 175, 0.3)',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  testButtonSuccess: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  testButtonFailure: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  testButtonTextRunning: {
    color: '#9CA3AF',
  },
  testButtonTextSuccess: {
    color: '#10B981',
  },
  testButtonTextFailure: {
    color: '#EF4444',
  },
  description: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});