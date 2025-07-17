/**
 * Mobile API Configuration for React Native
 * Fixes network request failures on Android/iOS
 */

// Get the development server URL for mobile devices
export function getDevelopmentServerUrl(): string {
  // For web, use relative URLs
  if (typeof window !== 'undefined') {
    return '';
  }

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
  
  if (!isDevelopment) {
    // In production, API routes won't work - you'll need a separate server
    console.warn('⚠️ API routes don\'t work in production builds. Consider using a separate API server.');
    return '';
  }

  // Try to get Expo's tunnel URL first (most reliable)
  const expoTunnelUrl = process.env.EXPO_PUBLIC_TUNNEL_URL;
  if (expoTunnelUrl) {
    console.log('✅ Using Expo tunnel URL for mobile API requests');
    return expoTunnelUrl;
  }

  // Try to get local network URL from Expo
  const expoDevServerUrl = process.env.EXPO_PUBLIC_DEV_SERVER_URL;
  if (expoDevServerUrl) {
    console.log('✅ Using Expo dev server URL for mobile API requests');
    return expoDevServerUrl;
  }

  // Last resort: try to construct from Metro bundler info
  // This is set by Expo CLI when using --host lan or tunnel
  const expoHost = process.env.EXPO_PUBLIC_HOST;
  if (expoHost) {
    const serverUrl = `http://${expoHost}:8081`;
    console.log('✅ Using constructed server URL for mobile API requests:', serverUrl);
    return serverUrl;
  }

  // Final fallback - return empty string and log the issue
  console.error('❌ Could not determine development server URL for mobile.');
  console.error('💡 Try starting Expo with: npx expo start --tunnel');
  console.error('💡 Or set EXPO_PUBLIC_TUNNEL_URL in your .env file');
  
  return '';
}

// Enhanced error handling specifically for mobile network issues
export function handleMobileNetworkError(error: any, context: string) {
  console.error(`🔥 Mobile network error in ${context}:`, error);
  
  // Check for common mobile network error patterns
  const errorMessage = error.message || error.toString();
  const isMobileNetworkError = 
    errorMessage.includes('Network request failed') ||
    errorMessage.includes('TypeError: Failed to fetch') ||
    errorMessage.includes('Connection refused') ||
    errorMessage.includes('ERR_NETWORK') ||
    errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
    error.code === 'NETWORK_ERROR';

  if (isMobileNetworkError) {
    console.warn(`📱 Detected mobile network connectivity issue in ${context}`);
    
    // Provide helpful debugging info
    const serverUrl = getDevelopmentServerUrl();
    if (!serverUrl) {
      console.error('💡 Mobile API requests failing because server URL is not configured.');
      console.error('💡 Make sure to start Expo with: npx expo start --tunnel');
      console.error('💡 Or use: npx expo start --host lan (and be on same WiFi)');
    }
    
    return {
      isMobileError: true,
      message: 'Mobile network connectivity issue - using offline fallback',
      suggestion: 'Try restarting Expo with tunnel mode: npx expo start --tunnel'
    };
  }

  return {
    isMobileError: false,
    message: errorMessage,
    suggestion: null
  };
}

// Test network connectivity for mobile debugging
export async function testMobileConnectivity(): Promise<{
  canReachServer: boolean;
  serverUrl: string;
  error?: string;
}> {
  const serverUrl = getDevelopmentServerUrl();
  
  if (!serverUrl) {
    return {
      canReachServer: false,
      serverUrl: '',
      error: 'No development server URL configured'
    };
  }

  try {
    // Try to reach the health endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${serverUrl}/debug`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return {
      canReachServer: response.ok,
      serverUrl,
      error: response.ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error: any) {
    return {
      canReachServer: false,
      serverUrl,
      error: error.message
    };
  }
} 