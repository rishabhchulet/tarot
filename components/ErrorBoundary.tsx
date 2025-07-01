import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert as AlertTriangle, RefreshCw, Bug } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📍 Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    console.log('🔄 ErrorBoundary retry triggered...');
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReportBug = () => {
    const errorReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    };
    
    console.log('🐛 Error report generated:', errorReport);
    
    // In a real app, you would send this to your error reporting service
    // For now, we'll just copy to clipboard (web only) or log it
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      alert('Error report copied to clipboard');
    } else {
      console.log('📋 Error Report:', JSON.stringify(errorReport, null, 2));
      alert('Error report logged to console');
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <LinearGradient
          colors={['#1F2937', '#374151', '#6B46C1']}
          style={styles.container}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={64} color="#EF4444" />
            </View>
            
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred. Don't worry, your data is safe.
            </Text>
            
            {this.state.retryCount > 0 && (
              <Text style={styles.retryInfo}>
                Retry attempts: {this.state.retryCount}
              </Text>
            )}
            
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.message || 'Unknown error'}
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <Pressable style={styles.retryButton} onPress={this.handleRetry}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.buttonGradient}
                >
                  <RefreshCw size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Try Again</Text>
                </LinearGradient>
              </Pressable>
              
              <Pressable style={styles.reportButton} onPress={this.handleReportBug}>
                <View style={styles.outlineButton}>
                  <Bug size={20} color="#9CA3AF" />
                  <Text style={styles.outlineButtonText}>Report Bug</Text>
                </View>
              </Pressable>
            </View>
            
            <Text style={styles.supportText}>
              If this problem persists, please contact support at support@dailyinner.com
            </Text>
          </View>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  retryInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDetails: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    lineHeight: 16,
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  reportButton: {
    alignItems: 'center',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  outlineButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
  },
  supportText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});