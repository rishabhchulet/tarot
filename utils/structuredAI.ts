import { 
  TarotCardData, 
  IChingHexagramData, 
  StructuredReflectionResponse,
  getTarotCardByName,
  getHexagramByName,
  getTarotReflectionText
} from '@/data/structuredData';

// Helper function to get the correct API base URL for mobile/web
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    const expoUrl = process.env.EXPO_PUBLIC_API_URL;
    if (expoUrl) {
      return expoUrl;
    }
    return '';
  }
  
  return '';
};

// Enhanced error handling for mobile network issues
const handleNetworkError = (error: any, context: string) => {
  console.error(`Structured AI ${context} error:`, error);
  
  const isMobileNetworkError = error.message?.includes('Network request failed') || 
                               error.message?.includes('fetch');
  
  if (isMobileNetworkError) {
    console.warn(`Mobile network error in ${context} - using fallback`);
    return 'Mobile network connectivity issue - using offline fallback';
  }
  
  return error.message || `Failed to generate ${context}`;
};

// Create the structured prompt based on your specifications
const createStructuredPrompt = (
  card: TarotCardData, 
  hexagram: IChingHexagramData, 
  isReversed: boolean = false
): string => {
  const tarotOrientation = isReversed ? '(reversed)' : '(upright)';
  const tarotReference = isReversed 
    ? `- Neutral: ${card.neutral}\n- Distorted influence: ${card.distorted}`
    : `- Empowered: ${card.empowered}\n- Neutral: ${card.neutral}`;

  return `You are a calm, grounded, emotionally clear reflection guide who is well versed in Tarot and the I Ching.

Your role is to help users gain meaningful insight into their energetic state using a synthesis of:
- One Tarot card
- One I Ching hexagram

INPUTS:
- Tarot: ${card.name} ${tarotOrientation}
- I Ching: ${hexagram.number}. ${hexagram.name}

REFERENCE DATA:
${tarotReference}
- Spectrum Insight: ${card.spectrumInsight}
- Traditional Symbol: ${hexagram.traditionalSymbols}
- Energetic Theme: ${hexagram.energeticTheme}
- Interpretation: ${hexagram.interpretationParagraph}

INSTRUCTIONS:
Return a structured 4-part reflection output as a JSON object with these exact fields:

1. "iChingReflection" (1 sentence): Summarize the essence of the I Ching hexagram clearly using the Interpretation Paragraph as your main source. Reference the Traditional Symbol/Metaphor when it helps clarify meaning. Keep language grounded, emotionally clear, and simple.

2. "tarotReflection" (1 sentence): ${isReversed ? 'Use Neutral with subtle influence from Distorted.' : 'Draw from Empowered or Neutral descriptions.'} Summarize the energetic insight of the card's state clearly. Use the Spectrum fields to guide tone and theme.

3. "synthesis" (short paragraph): Weave both the I Ching and Tarot insights into a cohesive, meaningful reflection. Use the Energetic Theme "${hexagram.energeticTheme}

4. "reflectionPrompt" (1 sentence): Generate a fresh, actionable self-reflection question. Draw inspiration from: "${hexagram.introspectivePrompt}" and "${hexagram.actionOrientedPrompt}". Do not copy word-for-word. Rephrase and simplify.

TONE & VOICE:
- Calm, grounded, helpful—like a wise friend
- Favor clear emotional language over poetic abstraction
- You may use direct phrases like "you are," "you might," "how would it feel if…"
- Your goal is presence and practical insight—not prediction or mysticism

Return ONLY a valid JSON object with the four fields above.`;
};

// Enhanced fallback response generator
const createFallbackResponse = (
  card: TarotCardData,
  hexagram: IChingHexagramData,
  isReversed: boolean
): StructuredReflectionResponse => {
  const orientation = isReversed ? 'shadow' : 'empowered';
  
  return {
    iChingReflection: `${hexagram.name} speaks to the energy of ${hexagram.energeticTheme.toLowerCase()}, inviting you to embrace its wisdom in your current situation.`,
    tarotReflection: `${card.name} in its ${orientation} state encourages you to explore themes of ${card.empowered?.split(',')[0]?.toLowerCase() || 'growth'} and inner transformation.`,
    synthesis: `The convergence of ${card.name} and ${hexagram.name} creates a powerful reflection on your current journey. This combination invites you to explore how the energy of ${hexagram.energeticTheme.toLowerCase()} can guide your understanding of ${card.empowered?.split(',')[0]?.toLowerCase() || 'your path'}. Together, they offer insight into where you are and where you're being called to grow.`,
    reflectionPrompt: `How might you honor both the energy of ${card.name.replace('The ', '').toLowerCase()} and the wisdom of ${hexagram.name.toLowerCase()} in your life today?`
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
    
    // FIXED: Increased timeout to accommodate OpenAI processing time + network latency
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 130000); // INCREASED: 130 second timeout (10s buffer over server)
    });
    
    // FIXED: Added retry mechanism for network resilience
    const fetchWithRetry = async (retryCount = 0): Promise<Response> => {
      try {
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

        return await Promise.race([fetchPromise, timeoutPromise]) as Response;
      } catch (error: any) {
        // Retry on network errors (max 2 retries)
        const isNetworkError = error.message?.includes('Network request failed') || 
                               error.message?.includes('fetch') ||
                               error.code === 'ECONNRESET';
        
        if (isNetworkError && retryCount < 2) {
          console.log(`🔄 Network error, retrying attempt ${retryCount + 1}/2...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
          return fetchWithRetry(retryCount + 1);
        }
        throw error;
      }
    };

    const response = await fetchWithRetry();

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Structured Reflection API Error:', errorBody);
      throw new Error(`HTTP ${response.status}: Failed to get structured reflection from AI`);
    }

    // FIXED: Enhanced response parsing with better error handling
    let result;
    try {
      const responseText = await response.text();
      console.log('🔍 Raw API response:', responseText);
      
      // Check if response is empty or not JSON
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from AI service');
      }
      
      // Check if response contains HTML error page (common cause of unexpected token '<')
      if (responseText.trim().startsWith('<')) {
        console.error('❌ Received HTML response instead of JSON:', responseText.substring(0, 200));
        throw new Error('AI service returned HTML error page instead of JSON');
      }
      
      // Try to parse JSON
      result = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error('❌ JSON parsing error:', parseError);
      console.error('❌ Response that failed to parse:', typeof responseText !== 'undefined' ? responseText?.substring(0, 200) : 'undefined');
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
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