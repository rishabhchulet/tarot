interface AICardInterpretationRequest {
  cardName: string;
  cardKeywords: string[];
  hexagramName: string;
  hexagramNumber: number;
  focusArea?: string;
  userContext?: string;
}

interface AIReflectionPromptsRequest {
  cardName: string;
  cardKeywords: string[];
  hexagramName: string;
  focusArea?: string;
  previousEntries?: string[];
}

interface AIPersonalizedGuidanceRequest {
  cardName: string;
  hexagramName: string;
  focusArea?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  mood?: string;
}

// Helper function to get the correct API base URL for mobile/web
const getApiBaseUrl = () => {
  // For web development, use relative URLs
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // For mobile, we need to detect if we're in development
  // and use the appropriate URL format
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    // In development, mobile devices need the actual IP address
    // This will be set by Expo when using LAN mode
    const expoUrl = process.env.EXPO_PUBLIC_API_URL;
    if (expoUrl) {
      return expoUrl;
    }
    
    // Fallback: return empty string to use relative URLs
    // This will fail on mobile but won't crash the app
    return '';
  }
  
  // In production, use relative URLs
  return '';
};

// Enhanced error handling for mobile network issues
const handleNetworkError = (error: any, context: string) => {
  console.error(`AI ${context} error:`, error);
  
  // Check if this is a mobile network error
  const isMobileNetworkError = error.message?.includes('Network request failed') || 
                               error.message?.includes('fetch');
  
  if (isMobileNetworkError) {
    console.warn(`Mobile network error in ${context} - using fallback`);
    return 'Mobile network connectivity issue - using offline fallback';
  }
  
  return error.message || `Failed to generate ${context}`;
};

export const getAICardInterpretation = async (data: AICardInterpretationRequest) => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'card-interpretation',
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI interpretation');
    }

    const result = await response.json();
    return { interpretation: result.interpretation, error: null };
  } catch (error: any) {
    const enhancedError = handleNetworkError(error, 'interpretation');
    return { 
      interpretation: null, 
      error: enhancedError
    };
  }
};

export const getAIReflectionPrompts = async (data: AIReflectionPromptsRequest) => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'reflection-prompts',
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI reflection prompts');
    }

    const result = await response.json();
    return { questions: result.questions, error: null };
  } catch (error: any) {
    const enhancedError = handleNetworkError(error, 'reflection prompts');
    return { 
      questions: [], 
      error: enhancedError
    };
  }
};

export const getAIPersonalizedGuidance = async (data: AIPersonalizedGuidanceRequest) => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'personalized-guidance',
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI guidance');
    }

    const result = await response.json();
    return { guidance: result.guidance, error: null };
  } catch (error: any) {
    const enhancedError = handleNetworkError(error, 'guidance');
    return { 
      guidance: null, 
      error: enhancedError
    };
  }
};

// Helper function to determine time of day
export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

// Helper function to get recent journal entry themes
export const extractRecentThemes = (entries: any[]): string[] => {
  return entries
    .slice(0, 5) // Last 5 entries
    .map(entry => entry.reflection || entry.personal_meaning || entry.first_impressions)
    .filter(text => text && text.trim().length > 0)
    .map(text => {
      // Extract key themes/words from the text
      const words = text.toLowerCase().split(/\s+/);
      const meaningfulWords = words.filter(word => 
        word.length > 4 && 
        !['that', 'this', 'with', 'have', 'been', 'will', 'from', 'they', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word)
      );
      return meaningfulWords.slice(0, 3).join(' ');
    })
    .filter(theme => theme.length > 0);
};