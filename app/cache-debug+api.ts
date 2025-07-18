/**
 * Cache Debug API Endpoint
 * Provides cache information and clearing capabilities for debugging
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  try {
    if (action === 'info') {
      // Return cache information
      return Response.json({
        timestamp: new Date().toISOString(),
        message: 'Cache info endpoint - use mobile app settings to view cache details',
        platform: 'server',
        note: 'Cache operations are handled client-side for security'
      });
    }
    
    if (action === 'clear') {
      // For security, cache clearing should only be done client-side
      return Response.json({
        timestamp: new Date().toISOString(),
        message: 'Cache clearing must be done from the mobile app for security',
        instruction: 'Go to Settings → Clear App Cache in the mobile app'
      });
    }
    
    return Response.json({
      timestamp: new Date().toISOString(),
      availableActions: ['info', 'clear'],
      usage: {
        info: '/cache-debug?action=info',
        clear: '/cache-debug?action=clear'
      }
    });
    
  } catch (error: any) {
    return Response.json({
      error: 'Cache debug endpoint error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'force-clear-all-users') {
      // This would be a dangerous operation, so we just log it
      console.log('🧹 Force clear all users cache requested');
      
      return Response.json({
        timestamp: new Date().toISOString(),
        message: 'Cache clearing is handled client-side for security',
        recommendation: 'Ask users to update to latest app version with improved cache management'
      });
    }
    
    return Response.json({
      error: 'Unknown action',
      availableActions: ['force-clear-all-users']
    }, { status: 400 });
    
  } catch (error: any) {
    return Response.json({
      error: 'Invalid request',
      message: error.message
    }, { status: 400 });
  }
}