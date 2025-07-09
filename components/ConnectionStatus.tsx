import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WifiOff, Wifi, CircleAlert as AlertCircle, RefreshCw } from 'lucide-react-native';

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  error?: string | null;
  onRetry?: () => void;
  lastSuccessfulConnection?: Date | null;
  retryCount?: number;
}

export function ConnectionStatus({ 
  status, 
  error, 
  onRetry, 
  lastSuccessfulConnection,
  retryCount = 0 
}: ConnectionStatusProps) {
  // Don't show anything if connected
  if (status === 'connected') {
    return null;
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: Wifi,
          color: '#F59E0B',
          title: 'Connecting...',
          message: 'Establishing secure connection',
          showRetry: false,
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: '#6B7280',
          title: 'Disconnected',
          message: 'No active connection',
          showRetry: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#EF4444',
          title: 'Connection Issue',
          message: error || 'Unable to connect to server',
          showRetry: true,
        };
      default:
        return {
          icon: WifiOff,
          color: '#6B7280',
          title: 'Unknown Status',
          message: 'Connection status unknown',
          showRetry: true,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  const formatLastConnection = () => {
    if (!lastSuccessfulConnection) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastSuccessfulConnection.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return lastSuccessfulConnection.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(10, 10, 10, 0.95)', 'rgba(15, 15, 15, 0.98)']}
        style={styles.banner}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <IconComponent size={16} color={statusInfo.color} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: statusInfo.color }]}>
              {statusInfo.title}
            </Text>
            <Text style={styles.message}>
              {statusInfo.message}
            </Text>
            
            {lastSuccessfulConnection && status === 'error' && (
              <Text style={styles.lastConnection}>
                Last connected: {formatLastConnection()}
              </Text>
            )}
            
            {retryCount > 0 && (
              <Text style={styles.retryInfo}>
                Retry attempt: {retryCount}/3
              </Text>
            )}
          </View>

          {statusInfo.showRetry && onRetry && (
            <Pressable 
              style={styles.retryButton} 
              onPress={onRetry}
              accessible={true}
              accessibilityLabel="Retry connection"
              accessibilityRole="button"
            >
              <RefreshCw size={14} color="#F3F4F6" />
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 58, 138, 0.2)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 16,
  },
  message: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 14,
  },
  lastConnection: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    lineHeight: 13,
  },
  retryInfo: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#F59E0B',
    lineHeight: 13,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    padding: 8,
    flexShrink: 0,
  },
});