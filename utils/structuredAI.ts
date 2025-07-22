import { 
  TarotCardData, 
  IChingHexagramData, 
  StructuredReflectionResponse,
  getTarotCardByName,
  getHexagramByName,
  getTarotReflectionText
} from '@/data/structuredData';

import { getDevelopmentServerUrl, handleMobileNetworkError } from './mobileApiConfig';

// Helper function to get the correct API base URL for mobile/web
const getApiBaseUrl = () => {
  // For web development, check if we're in a proper web environment
  if (typeof window !== 'undefined') {
    // In web mode, try to use the current origin for API requests
    if (window.location && window.location.origin) {
      // Check if this is a development environment
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return window.location.origin;
      }
      // For production web, use the same origin
      return window.location.origin;
    }
    // Fallback to relative URLs
    return '';
  }
  
  return getDevelopmentServerUrl();
};

// Enhanced error handling for mobile network issues  
const handleNetworkError = (error: any, context: string) => {
  const mobileError = handleMobileNetworkError(error, context);
  
  if (mobileError.isMobileError) {
    console.warn(`📱 ${mobileError.message}`);
    if (mobileError.suggestion) {
      console.warn(`💡 ${mobileError.suggestion}`);
    }
    return mobileError.message;
  }
  
  return error.message || `Failed to generate ${context}`;
};

// Enhanced response parser that handles HTML error responses
const parseApiResponse = async (response: Response, context: string) => {
  let responseText = '';
  try {
    responseText = await response.text();
    console.log(`🔍 Raw API response for ${context}:`, responseText?.substring(0, 100));
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      throw new Error(`Empty response from AI service for ${context}`);
    }
    
    // Check if response contains HTML error page (common cause of unexpected token '<')
    if (responseText.trim().startsWith('<')) {
      console.error(`❌ Received HTML response instead of JSON for ${context}:`, responseText.substring(0, 200));
      throw new Error(`AI service returned HTML error page instead of JSON for ${context}`);
    }
    
    // Check for other non-JSON responses
    if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
      console.error(`❌ Received non-JSON response for ${context}:`, responseText.substring(0, 200));
      throw new Error(`AI service returned non-JSON response for ${context}`);
    }
    
    // Try to parse JSON
    return JSON.parse(responseText);
  } catch (parseError: any) {
    console.error(`❌ JSON parsing error for ${context}:`, parseError);
    console.error(`❌ Response that failed to parse:`, responseText?.substring(0, 200));
    throw new Error(`Failed to parse AI response for ${context}: ${parseError.message}`);
  }
};

// Create the structured prompt with more human, conversational language
const createStructuredPrompt = (
  card: TarotCardData, 
  hexagram: IChingHexagramData, 
  isReversed: boolean = false
): string => {
  const tarotOrientation = isReversed ? '(reversed)' : '(upright)';
  const tarotReference = isReversed 
    ? `- Neutral: ${card.neutral}\n- Distorted influence: ${card.distorted}`
    : `- Empowered: ${card.empowered}\n- Neutral: ${card.neutral}`;
    
  return `You are a warm, wise friend who understands Tarot and the I Ching. You speak like a real person - conversational, caring, and clear.

Your job is to help someone understand their current energy using:
- One Tarot card: ${card.name} ${tarotOrientation}
- One I Ching hexagram: ${hexagram.number}. ${hexagram.name}

REFERENCE INFO:
${tarotReference}
- Spectrum Insight: ${card.spectrumInsight}
- Traditional Symbol: ${hexagram.traditionalSymbols}
- Energetic Theme: ${hexagram.energeticTheme}
- Interpretation: ${hexagram.interpretationParagraph}

INSTRUCTIONS:
Write like you're talking to a friend. Use simple, everyday language. No mystical jargon or abstract concepts.

Return a JSON object with these 4 parts:

1. "iChingReflection" (1-2 sentences): Explain what ${hexagram.name} means in simple, human terms. Talk about what this might feel like in someone's actual life - their relationships, work, emotions, or daily experiences. Use conversational language like "you might be going through," "this feels like a time when," or "you could be noticing." Make it relatable and down-to-earth.

2. "tarotReflection" (1-2 sentences): ${isReversed ? 'Explain what this card means when it shows up reversed - focus on challenges or areas to work on.' : 'Explain what this card means in its positive state - focus on strengths or opportunities.'} Talk about emotions, relationships, or daily life situations.

3. "synthesis" (2-3 sentences): Connect both insights into one clear message about their current situation. Think: "Here's what's happening in your life right now and what you can do about it." Be specific about feelings, relationships, work, or personal growth.

4. "reflectionPrompt" (1 question): Ask a simple, direct question they can actually think about and answer. Make it about their real life - relationships, feelings, decisions they're facing. Don't copy the reference prompts word-for-word.

TONE RULES:
- Talk like a caring friend, not a fortune teller
- Use "you" and "your" a lot
- Simple words over fancy ones
- Focus on feelings and real-life situations
- Be encouraging and supportive
- No mystical language or abstract concepts

Return ONLY valid JSON.`;
};

// Enhanced fallback response generator
const createFallbackResponse = (
  card: TarotCardData,
  hexagram: IChingHexagramData,
  isReversed: boolean
): StructuredReflectionResponse => {
  const orientation = isReversed ? 'shadow' : 'empowered';
  const primaryTheme = card.empowered?.split(',')[0]?.toLowerCase() || 'growth';
  
  return {
    iChingReflection: `${hexagram.name} speaks to the energy of ${hexagram.energeticTheme.toLowerCase()}, offering guidance for navigating your current life situations and relationships.`,
    tarotReflection: `${card.name} in its ${orientation} state invites you to explore how ${primaryTheme} can manifest in your daily choices, relationships, and personal decisions.`,
    synthesis: `The convergence of ${card.name} and ${hexagram.name} creates meaningful insight for your current journey. This combination asks you to consider how the practical wisdom of ${hexagram.energeticTheme.toLowerCase()} can support you in embracing ${primaryTheme} within your real-life experiences. Together, they illuminate both where you are now and how you might move forward with greater authenticity and purpose.`,
    reflectionPrompt: `Where in your life are you being called to embody the essence of ${primaryTheme}, especially in situations or relationships that feel challenging or uncertain?`
  };
};
// Main function to get structured reflection
export const getStructuredReflection = async (
  cardName: string,
  hexagramName: string,
  isReversed: boolean = false
): Promise<{ reflection: StructuredReflectionResponse | null; error: string | null }> => {
  try {
    // Debug the hexagram lookup issue
    console.log('🔍 Debug: Testing hexagram lookup for:', hexagramName);
    
    // Find the data from our JSON files
    const card = getTarotCardByName(cardName);
    const hexagram = getHexagramByName(hexagramName);
    
    console.log('🔍 Debug: Hexagram lookup result:', hexagram ? 'FOUND' : 'NOT FOUND');
    if (hexagram) {
      console.log('🔍 Debug: Found hexagram:', hexagram.number, '-', hexagram.name);
    }
    
    if (!card) {
      throw new Error(`Tarot card "${cardName}" not found in structured data`);
    }
    
    if (!hexagram) {
      throw new Error(`I Ching hexagram "${hexagramName}" not found in data`);
    }

    console.log(`🎴 Creating structured reflection for: ${cardName} + ${hexagramName}`);
    
    // Create the structured prompt
    const prompt = createStructuredPrompt(card, hexagram, isReversed);
    
    const baseUrl = getApiBaseUrl();
    
    // Standardized timeout for gpt-4o-mini (fast model)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000); // 15 second timeout (standardized)
    });
    
    const fetchPromise = fetch(`${baseUrl}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'structured-reflection',
        data: {
          prompt,
          cardName,
          hexagramName,
          isReversed
        },
      }),
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Structured Reflection API Error:', errorBody?.substring(0, 200));
      throw new Error(`HTTP ${response.status}: Failed to get structured reflection from AI`);
    }

    // FIXED: Enhanced response parsing with better error handling
    let result;
    try {
      result = await parseApiResponse(response, 'structured reflection');
    } catch (parseError: any) {
      console.error('❌ Failed to parse structured reflection response:', parseError);
      throw parseError;
    }
    
    // Validate the response structure
    if (!result.iChingReflection || !result.tarotReflection || !result.synthesis || !result.reflectionPrompt) {
      console.warn('⚠️ AI response missing required fields, using fallback');
      return { 
        reflection: createFallbackResponse(card, hexagram, isReversed), 
        error: null 
      };
    }
    
    return { reflection: result, error: null };
  } catch (error: any) {
    const enhancedError = handleNetworkError(error, 'structured reflection');
    console.log('🔄 Using fallback reflection due to error:', enhancedError);
    
    // Try to create fallback with available data
    try {
      const card = getTarotCardByName(cardName);
      const hexagram = getHexagramByName(hexagramName);
      
      if (card && hexagram) {
        return { 
          reflection: createFallbackResponse(card, hexagram, isReversed), 
          error: null 
        };
      }
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
    }
    
    return { 
      reflection: null, 
      error: enhancedError
    };
  }
};

// Utility function for checking if data is loaded
export const isStructuredDataAvailable = (): boolean => {
  try {
    const testCard = getTarotCardByName('The Fool');
    const testHexagram = getHexagramByName('The Creative');
    return !!(testCard && testHexagram);
  } catch (error) {
    return false;
  }
}; 