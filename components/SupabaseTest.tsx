import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { supabase } from '@/utils/supabase';
import { testDatabaseAccess } from '@/utils/auth';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [accessTest, setAccessTest] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    setAccessTest([]);

    try {
      // Test 1: Check environment variables
      console.log('🔧 Testing Supabase connection...');
      
      // Test 2: Simple query to test connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Supabase connection error:', error);
        setConnectionStatus('error');
        setErrorMessage(error.message);
        return;
      }

      // Test 3: Check auth status
      const { data: { user } } = await supabase.auth.getUser();
      
      // Test 4: Run database access test
      const accessResults = await testDatabaseAccess();
      setAccessTest(accessResults);
      
      console.log('✅ Supabase connection successful');
      setConnectionStatus('connected');
      setDebugInfo({
        hasUser: !!user,
        userId: user?.id || 'None',
        userEmail: user?.email || 'None',
        accessTestResults: accessResults.length,
      });

    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Unknown error');
    }
  };

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/supabase-debug');
      const data = await response.json();
      console.log('Debug info:', data);
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
      alert('Failed to fetch debug info');
    }
  };

  const runUserAccessDebug = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No authenticated user found');
        return;
      }

      const { data, error } = await supabase.rpc('debug_user_access', { user_uuid: user.id });
      
      if (error) {
        alert(`Debug error: ${error.message}`);
      } else {
        const debugText = data.map((row: any) => `${row.test_name}: ${row.result} - ${row.details}`).join('\n');
        alert(`User Access Debug:\n\n${debugText}`);
      }
    } catch (error: any) {
      alert(`Debug failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <View style={[
        styles.statusContainer,
        connectionStatus === 'connected' && styles.connected,
        connectionStatus === 'error' && styles.error
      ]}>
        <Text style={styles.statusText}>
          Status: {connectionStatus === 'testing' ? 'Testing...' : 
                   connectionStatus === 'connected' ? 'Connected ✅' : 
                   'Error ❌'}
        </Text>
        
        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
        
        {debugInfo && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>User: {debugInfo.hasUser ? 'Logged in' : 'Not logged in'}</Text>
            <Text style={styles.debugText}>ID: {debugInfo.userId}</Text>
            <Text style={styles.debugText}>Email: {debugInfo.userEmail}</Text>
            <Text style={styles.debugText}>Access Tests: {debugInfo.accessTestResults}</Text>
          </View>
        )}

        {accessTest.length > 0 && (
          <View style={styles.accessTestContainer}>
            <Text style={styles.accessTestTitle}>Database Access Test:</Text>
            {accessTest.map((test, index) => (
              <Text key={index} style={styles.accessTestItem}>
                {test.component}: {test.status}
              </Text>
            ))}
          </View>
        )}
      </View>

      <Pressable style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>Test Again</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={fetchDebugInfo}>
        <Text style={styles.buttonText}>Show Debug Info</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={runUserAccessDebug}>
        <Text style={styles.buttonText}>Debug User Access</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    marginBottom: 16,
  },
  connected: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
  debugInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  debugText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  accessTestContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  accessTestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  accessTestItem: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});