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

3. "synthesis" (short paragraph): Weave both the I Ching and Tarot insights into a cohesive, meaningful reflection. Use the Energetic Theme "${hexagram.energeticTheme}" as the main thread of synthesis. Reference both systems equally, with presence and clarity. Avoid fluff or abstract spiritual jargon—speak directly to the human experience.

4. "reflectionPrompt" (1 sentence): Generate a fresh, actionable self-reflection question. Draw inspiration from: "${hexagram.introspectivePrompt}" and "${hexagram.actionOrientedPrompt}". Do not copy word-for-word. Rephrase and simplify.

TONE & VOICE:
- Calm, grounded, helpful—like a wise friend
- Favor clear emotional language over poetic abstraction
- You may use direct phrases like "you are," "you might," "how would it feel if…"
- Your goal is presence and practical insight—not prediction or mysticism

Return ONLY a valid JSON object with the four fields above.`;
};

// Create a fallback response when AI is unavailable
const createFallbackResponse = (
  card: TarotCardData, 
  hexagram: IChingHexagramData, 
  isReversed: boolean = false
): StructuredReflectionResponse => {
  const tarotText = getTarotReflectionText(card, isReversed);
  
  return {
    iChingReflection: `${hexagram.name} invites you to embrace ${hexagram.energeticTheme.toLowerCase()}.`,
    tarotReflection: `${card.name} ${isReversed ? 'reversed' : ''} speaks to ${tarotText.substring(0, 100)}...`,
    synthesis: `Together, ${card.name} and ${hexagram.name} create a powerful reflection on ${hexagram.energeticTheme.toLowerCase()}. This combination invites you to explore how ${card.name.toLowerCase()} energy can guide your current journey. The wisdom of ${hexagram.name} provides a foundation for understanding your present moment.`,
    reflectionPrompt: `How might you honor both the energy of ${card.name.toLowerCase()} and the wisdom of ${hexagram.name.toLowerCase()} in your life today?`
  };
};

// Main function to get structured reflection
export const getStructuredReflection = async (
  cardName: string,
  hexagramName: string,
  isReversed: boolean = false
): Promise<{ reflection: StructuredReflectionResponse | null; error: string | null }> => {
  try {
    // Find the data from our JSON files
    const card = getTarotCardByName(cardName);
    const hexagram = getHexagramByName(hexagramName);
    
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
    const response = await fetch(`${baseUrl}/ai`, {
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

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Structured Reflection API Error:', errorBody);
      throw new Error('Failed to get structured reflection from AI');
    }

    const result = await response.json();
    
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