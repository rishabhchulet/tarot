export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Get environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  // Try different sources for OpenAI API key
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiPublicKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  
  // List all environment variables that might contain API keys
  const envKeys = Object.keys(process.env || {});
  const apiKeyEnvs = envKeys.filter(key => 
    key.toLowerCase().includes('openai') || 
    key.toLowerCase().includes('api_key')
  );
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseAnonKey: supabaseAnonKey ? 'Set (length: ' + (supabaseAnonKey?.length || 0) + ')' : 'Missing',
      openaiApiKey: openaiApiKey ? 'Set (length: ' + (openaiApiKey?.length || 0) + ')' : 'Missing',
      openaiPublicKey: openaiPublicKey ? 'Set (length: ' + (openaiPublicKey?.length || 0) + ')' : 'Missing',
      nodeEnv: process.env.NODE_ENV || 'undefined',
      platform: typeof window !== 'undefined' ? 'browser' : 'server',
      totalEnvVars: envKeys.length,
      apiKeyEnvVars: apiKeyEnvs,
    },
    request: {
      url: url.toString(),
      origin: url.origin,
      host: url.host,
      userAgent: request.headers.get('user-agent'),
    },
    // Test OpenAI connection if key is available
    openai: {
      keyStatus: openaiApiKey || openaiPublicKey ? 'Available' : 'Missing',
      keyPreview: openaiApiKey ? 
        `${openaiApiKey.substring(0, 8)}...${openaiApiKey.substring(openaiApiKey.length - 4)}` : 
        openaiPublicKey ? `${openaiPublicKey.substring(0, 8)}...${openaiPublicKey.substring(openaiPublicKey.length - 4)}` :
        'N/A',
      keySource: openaiApiKey ? 'OPENAI_API_KEY' : openaiPublicKey ? 'EXPO_PUBLIC_OPENAI_API_KEY' : 'None',
    },
    system: {
      memoryUsage: typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : 'N/A',
      uptime: typeof process !== 'undefined' && process.uptime ? process.uptime() : 'N/A',
    },
    // Add diagnostic info
    diagnostics: {
      canAccessProcess: typeof process !== 'undefined',
      canAccessGlobalThis: typeof globalThis !== 'undefined',
      processEnvKeys: envKeys.slice(0, 10), // First 10 env vars for debugging
    }
  };
  
  return Response.json(debugInfo, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}