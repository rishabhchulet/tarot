import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export function SignOutTestButton() {
  const { signOut, user, session } = useAuth();
  const [testRunning, setTestRunning] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'success' | 'failure' | null>(null);

  const handleTestSignOut = async () => {
    setTestRunning(true);
    setTestResult(null);
    try {
      await signOut();
      setTimeout(() => {
        const success = !user && !session;
        setTestResult(success ? 'success' : 'failure');
        setTestRunning(false);
      }, 2000);
    } catch (e) {
      setTestResult('failure');
      setTestRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handleTestSignOut} disabled={testRunning}>
        <LogOut size={16} color={testResult === 'success' ? '#10B981' : testResult === 'failure' ? '#EF4444' : '#3B82F6'} />
        <Text style={styles.buttonText}>
          {testRunning ? 'Signing Out...' : testResult === 'success' ? 'Sign Out Success' : testResult === 'failure' ? 'Sign Out Failed' : 'Sign Out'}
        </Text>
      </Pressable>
      <Text style={styles.description}>Sign out of your account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
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
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    marginLeft: 8,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
}); 