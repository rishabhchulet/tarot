import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { supabase } from '@/utils/supabase';
import { testDatabaseAccess } from '@/utils/auth';
import { diagnostics } from '@/utils/diagnostics';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [accessTest, setAccessTest] = useState<any[]>([]);
  const [diagnosticReport, setDiagnosticReport] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

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

  const runDiagnostics = async () => {
    try {
      const report = await diagnostics.runComprehensiveDiagnostics();
      setDiagnosticReport(report);
      setShowDiagnostics(true);
      console.log('🔍 Full diagnostic report:', report);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
      alert('Failed to run diagnostics');
    }
  };

  const formatDiagnosticStatus = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'WARNING': return '⚠️';
      case 'INFO': return 'ℹ️';
      default: return '❓';
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
      
      <Pressable style={styles.button} onPress={runDiagnostics}>
        <Text style={styles.buttonText}>Run Full Diagnostics</Text>
      </Pressable>
      
      {showDiagnostics && diagnosticReport && (
        <View style={styles.diagnosticsContainer}>
          <Text style={styles.diagnosticsTitle}>
            🔍 System Health Report
          </Text>
          
          <View style={styles.overallStatus}>
            <Text style={styles.overallStatusText}>
              Overall: {diagnosticReport.overall.status} 
              {diagnosticReport.overall.status === 'HEALTHY' ? ' ✅' : 
               diagnosticReport.overall.status === 'DEGRADED' ? ' ⚠️' : ' ❌'}
            </Text>
            {diagnosticReport.overall.criticalIssues > 0 && (
              <Text style={styles.criticalIssues}>
                Critical Issues: {diagnosticReport.overall.criticalIssues}
              </Text>
            )}
            {diagnosticReport.overall.warnings > 0 && (
              <Text style={styles.warnings}>
                Warnings: {diagnosticReport.overall.warnings}
              </Text>
            )}
          </View>
          
          <Text style={styles.sectionTitle}>Connectivity Tests:</Text>
          {diagnosticReport.connectivity.map((test: any, index: number) => (
            <Text key={index} style={styles.testResult}>
              {formatDiagnosticStatus(test.status)} {test.name}: {test.status}
              {test.duration && ` (${test.duration}ms)`}
              {test.error && ` - ${test.error}`}
            </Text>
          ))}
          
          <Text style={styles.sectionTitle}>Auth Tests:</Text>
          {diagnosticReport.auth.map((test: any, index: number) => (
            <Text key={index} style={styles.testResult}>
              {formatDiagnosticStatus(test.status)} {test.name}: {test.status}
              {test.duration && ` (${test.duration}ms)`}
              {test.error && ` - ${test.error}`}
            </Text>
          ))}
          
          <Text style={styles.sectionTitle}>Database Tests:</Text>
          {diagnosticReport.database.map((test: any, index: number) => (
            <Text key={index} style={styles.testResult}>
              {formatDiagnosticStatus(test.status)} {test.name}: {test.status}
              {test.duration && ` (${test.duration}ms)`}
              {test.error && ` - ${test.error}`}
            </Text>
          ))}
          
          <Text style={styles.sectionTitle}>Recommendations:</Text>
          {diagnosticReport.overall.recommendations.map((rec: string, index: number) => (
            <Text key={index} style={styles.recommendation}>
              • {rec}
            </Text>
          ))}
          
          <Pressable 
            style={styles.button} 
            onPress={() => setShowDiagnostics(false)}
          >
            <Text style={styles.buttonText}>Close Diagnostics</Text>
          </Pressable>
        </View>
      )}
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
  diagnosticsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  diagnosticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: 12,
    textAlign: 'center',
  },
  overallStatus: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
  },
  overallStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  criticalIssues: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 2,
  },
  warnings: {
    fontSize: 14,
    color: '#F59E0B',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F3F4F6',
    marginTop: 12,
    marginBottom: 6,
  },
  testResult: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  recommendation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    lineHeight: 16,
  },
});