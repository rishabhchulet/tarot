export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Get environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseAnonKey: supabaseAnonKey ? 'Set (length: ' + (supabaseAnonKey?.length || 0) + ')' : 'Missing',
      nodeEnv: process.env.NODE_ENV || 'undefined',
    },
    request: {
      url: url.toString(),
      origin: url.origin,
      host: url.host,
    },
    platform: 'web',
  };
  
  return Response.json(debugInfo, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}