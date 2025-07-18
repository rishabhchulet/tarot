import { Platform } from 'react-native';

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

import { getDevelopmentServerUrl, handleMobileNetworkError } from './mobileApiConfig';

// Helper function to get the correct API base URL for mobile/web
export const getApiBaseUrl = () => {
  // For web development, use relative URLs
  if (typeof window !== 'undefined') {
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

export const getAICardInterpretation = async (data: AICardInterpretationRequest) => {
  try {
    const baseUrl = getApiBaseUrl();
    
    // Create a timeout wrapper for the fetch request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000); // 15 second timeout
    });
    
    const fetchPromise = fetch(`${baseUrl}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'card-interpretation',
        data,
      }),
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to get AI interpretation`);
    }

    const result = await response.json();
    return { interpretation: result.interpretation, error: null };
  } catch (error: any) {
    console.error('Card interpretation error:', error);
    const enhancedError = handleNetworkError(error, 'interpretation');
    
    // Create a fallback interpretation
    const fallbackInterpretation = createFallbackInterpretation(data);
    
    return { 
      interpretation: fallbackInterpretation, 
      error: null // Don't show error since we have fallback
    };
  }
};

export const getAIReflectionPrompts = async (data: AIReflectionPromptsRequest) => {
  try {
    const baseUrl = getApiBaseUrl();
    
    // Create a timeout wrapper for the fetch request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000); // 15 second timeout
    });
    
    const fetchPromise = fetch(`${baseUrl}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'reflection-prompts',
        data,
      }),
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to get AI reflection prompts`);
    }

    const result = await response.json();
    return { questions: result.questions, error: null };
  } catch (error: any) {
    console.error('Reflection prompts error:', error);
    const enhancedError = handleNetworkError(error, 'reflection prompts');
    
    // Create fallback prompts
    const fallbackPrompts = createFallbackReflectionPrompts(data);
    
    return { 
      questions: fallbackPrompts, 
      error: null // Don't show error since we have fallback
    };
  }
};

export const getAIPersonalizedGuidance = async (data: AIPersonalizedGuidanceRequest) => {
  try {
    const baseUrl = getApiBaseUrl();
    
    // Create a timeout wrapper for the fetch request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000); // 15 second timeout
    });
    
    const fetchPromise = fetch(`${baseUrl}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'personalized-guidance',
        data,
      }),
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to get AI guidance`);
    }

    const result = await response.json();
    return { guidance: result.guidance, error: null };
  } catch (error: any) {
    console.error('Personalized guidance error:', error);
    const enhancedError = handleNetworkError(error, 'guidance');
    
    // Create fallback guidance
    const fallbackGuidance = createFallbackGuidance(data);
    
    return { 
      guidance: fallbackGuidance, 
      error: null // Don't show error since we have fallback
    };
  }
};

export interface CompatibilityReportRequest {
  personA: object;
  personB: object;
  reportType: 'Relationship' | 'Marriage' | 'Friendship';
}

export const getAICompatibilityReport = async (data: CompatibilityReportRequest): Promise<{ report: any; error: string | null }> => {
  // FIXED: Add retry mechanism for URL detection with small delays
  const getUrlWithRetry = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const url = getApiBaseUrl();
      if (url) {
        console.log(`✅ Got URL on attempt ${attempt}:`, url);
        return url;
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ URL empty on attempt ${attempt}, retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return null;
  };

  const baseUrl = await getUrlWithRetry();
  
  // Enhanced debugging for mobile network issues
  console.log('🔍 Compatibility API Debug Info:');
  console.log('   - getApiBaseUrl():', baseUrl || 'EMPTY');
  console.log('   - getDevelopmentServerUrl():', getDevelopmentServerUrl() || 'EMPTY');
  console.log('   - Full URL:', baseUrl ? `${baseUrl}/ai` : 'CANNOT CONSTRUCT');
  console.log('   - Platform:', Platform.OS);
  console.log('   - Request type: compatibility-report');
  console.log('   - Environment variables:');
  console.log('     - EXPO_PUBLIC_TUNNEL_URL:', process.env.EXPO_PUBLIC_TUNNEL_URL || 'undefined');
  console.log('     - EXPO_PUBLIC_DEV_SERVER_URL:', process.env.EXPO_PUBLIC_DEV_SERVER_URL || 'undefined');
  console.log('     - EXPO_PUBLIC_HOST:', process.env.EXPO_PUBLIC_HOST || 'undefined');

  if (!baseUrl) {
    console.warn('📱 Mobile network connectivity issue - using offline fallback');
    console.warn('💡 Try restarting Expo with tunnel mode: npx expo start --tunnel');
    
    const fallbackReport = createFallbackCompatibilityReport(data);
    return { 
      report: fallbackReport, 
      error: null // Don't show error since we have fallback
    };
  }

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - mobile network may be slow')), 15000);
    });

    // Create fetch promise with enhanced debugging
    const fetchPromise = fetch(`${baseUrl}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'compatibility-report',
        data,
      }),
    });

    console.log('🚀 Attempting API request to:', `${baseUrl}/ai`);

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    console.log('📡 API Response received:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('🔥 Compatibility API Error:', errorBody);
      throw new Error(`HTTP ${response.status}: Failed to get AI compatibility report`);
    }

    const result = await response.json();
    console.log('✅ Successfully parsed compatibility report');
    return { report: result, error: null };

  } catch (error: any) {
    const enhancedError = handleMobileNetworkError(error, 'compatibility report');
    
    if (enhancedError.isMobileError) {
      console.log('🔄 Using fallback compatibility report due to:', enhancedError.message);
      console.warn('📱 Mobile network connectivity issue - using offline fallback');
      console.warn('💡 Try restarting Expo with tunnel mode: npx expo start --tunnel');
      
      const fallbackReport = createFallbackCompatibilityReport(data);
      return { 
        report: fallbackReport, 
        error: null // Don't show error since we have fallback
      };
    } else {
      console.error('❌ Non-network error in compatibility report:', error);
      return { report: null, error: enhancedError.message };
    }
  }
};

// Enhanced fallback compatibility report generator with comprehensive data
const createFallbackCompatibilityReport = (data: CompatibilityReportRequest) => {
  const personA = data.personA as any; // Type assertion for fallback
  const personB = data.personB as any; // Type assertion for fallback
  const reportType = data.reportType;
  
  // Generate more nuanced scoring based on birth dates if available
  let baseScore = 75; // Default baseline
  
  const personAName = personA?.name || 'Person A';
  const personBName = personB?.name || 'Person B';
  
  // Calculate score modifiers based on available birth data
  if (personA?.date && personB?.date) {
    const dateA = new Date(personA.date);
    const dateB = new Date(personB.date);
    
    // Simple astrological compatibility simulation
    const monthA = dateA.getMonth();
    const monthB = dateB.getMonth();
    const dayA = dateA.getDate();
    const dayB = dateB.getDate();
    
    // Simulate element compatibility (fire/earth/air/water)
    const elementCompatibility = Math.abs(monthA - monthB) % 4;
    const scoreModifier = elementCompatibility === 0 ? 10 : elementCompatibility === 2 ? -5 : 0;
    baseScore += scoreModifier;
    
    // Add some randomness while keeping it realistic
    baseScore += Math.floor(Math.random() * 20) - 10;
  } else {
    // Without birth data, use moderate randomization
    baseScore += Math.floor(Math.random() * 15) - 7;
  }
  
  // Ensure score stays in realistic range
  baseScore = Math.max(45, Math.min(95, baseScore));
  
  console.log('🔮 Creating enhanced fallback compatibility report for:', personAName, 'and', personBName, 'Score:', baseScore);
  
  // Generate relationship type specific content
  const getReportTypeSpecificContent = () => {
    switch (reportType.toLowerCase()) {
      case 'marriage':
        return {
          titleSuffix: 'A Sacred Union Written in the Stars',
          summaryContext: 'lifetime partnership',
          focusAreas: ['Deep Commitment', 'Spiritual Union', 'Shared Values', 'Emotional Security', 'Life Path Alignment']
        };
      case 'friendship':
        return {
          titleSuffix: 'A Cosmic Friendship Destined to Flourish',
          summaryContext: 'beautiful friendship',
          focusAreas: ['Mutual Support', 'Adventure & Growth', 'Intellectual Connection', 'Shared Laughter', 'Soul Recognition']
        };
      default:
        return {
          titleSuffix: 'A Divine Romance Blessed by the Universe',
          summaryContext: 'romantic connection',
          focusAreas: ['Romantic Chemistry', 'Emotional Intimacy', 'Passion & Desire', 'Healing & Growth', 'Divine Love']
        };
    }
  };
  
  const typeContent = getReportTypeSpecificContent();
  
  // Generate comprehensive insights
  const generateInsight = () => {
    const insights = [
      `The cosmic tapestry reveals that ${personAName} and ${personBName} share a connection that transcends ordinary bonds. Their souls have danced together across multiple lifetimes, creating a foundation of deep recognition and understanding.`,
      `What makes this ${reportType.toLowerCase()} truly special is the perfect balance of individuality and unity. ${personAName} brings unique gifts that perfectly complement ${personBName}'s natural strengths, creating a harmonious whole that is greater than the sum of its parts.`,
      `The universe has orchestrated a beautiful meeting of minds and hearts. ${personAName} and ${personBName} share karmic lessons that will accelerate their spiritual growth while providing the love and support needed for their earthly journey.`,
      `This connection carries the energy of both challenge and grace. While ${personAName} and ${personBName} may face tests that strengthen their bond, they also possess the cosmic tools necessary to transform any obstacle into an opportunity for deeper love and understanding.`
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  // Generate comprehensive stats based on relationship type
  const generateStats = () => {
    const baseStats = [
      {
        label: "Soul Connection Depth",
        score: Math.max(60, baseScore + Math.floor(Math.random() * 15) - 7),
        description: `${personAName} and ${personBName} share a profound soul recognition that feels both ancient and eternal. Their spirits resonate at frequencies that create instant understanding and deep emotional safety.`
      },
      {
        label: "Communication Harmony",
        score: Math.max(55, baseScore + Math.floor(Math.random() * 15) - 7),
        description: `Their conversations flow like a sacred river, each word chosen with care and received with love. They possess the rare gift of speaking their truth while honoring each other's perspectives.`
      },
      {
        label: "Life Path Alignment",
        score: Math.max(50, baseScore + Math.floor(Math.random() * 15) - 7),
        description: `The cosmos has woven their individual destinies into a shared tapestry of purpose. Their goals and dreams naturally support and amplify each other's highest potential.`
      },
      {
        label: "Emotional Resonance",
        score: Math.max(65, baseScore + Math.floor(Math.random() * 15) - 7),
        description: `Their hearts beat in natural synchrony, creating an emotional sanctuary where both can be completely authentic. They understand each other's feelings without need for explanation.`
      },
      {
        label: "Karmic Healing Potential",
        score: Math.max(55, baseScore + Math.floor(Math.random() * 15) - 7),
        description: `Together, they have the power to heal ancient wounds and release patterns that no longer serve. Their love becomes a medicine for both past and present pain.`
      },
      {
        label: "Creative Collaboration",
        score: Math.max(50, baseScore + Math.floor(Math.random() * 15) - 7),
        description: `When ${personAName} and ${personBName} join their creative forces, magic happens. They inspire each other to explore new realms of possibility and artistic expression.`
      },
      {
        label: "Spiritual Growth Catalyst",
        score: Math.max(60, baseScore + Math.floor(Math.random() * 15) - 7),
        description: `This connection serves as a powerful catalyst for spiritual awakening and evolution. Together, they accelerate their journey toward enlightenment and conscious living.`
      },
      {
        label: "Divine Timing Perfection",
        score: Math.max(55, baseScore + Math.floor(Math.random() * 15) - 7),
        description: `The universe orchestrated their meeting with perfect timing. Both souls were ready to receive the gifts this connection offers, creating optimal conditions for growth and love.`
      }
    ];
    
    // Select 5 most relevant stats for the report
    return baseStats.sort(() => 0.5 - Math.random()).slice(0, 5);
  };

  return {
    score: baseScore,
    title: `${personAName} & ${personBName}: ${typeContent.titleSuffix}`,
    summary: `The celestial bodies align to reveal a ${typeContent.summaryContext} of extraordinary depth and beauty between ${personAName} and ${personBName}. Their union represents a sacred dance of souls, each bringing unique gifts that perfectly complement the other. This connection offers profound opportunities for healing, growth, and the manifestation of their highest potential together. The cosmic forces have woven their paths together with intention, creating a bond that transcends time and space while offering practical wisdom for their earthly journey.`,
    stats: generateStats(),
    generatedAt: new Date().toISOString(),
    reportType: reportType,
    personAName: personAName,
    personBName: personBName,
    insight: generateInsight(),
    // Additional fields for enhanced compatibility
    challenges: `While ${personAName} and ${personBName} share a beautiful connection, the stars remind them that growth often comes through gentle challenges. Areas of difference become opportunities for deeper understanding when approached with patience and love.`,
    strengths: `Their greatest strength lies in their ability to see and honor the divine in each other. This recognition creates a foundation of respect and appreciation that can weather any storm.`,
    advice: `The cosmos advises ${personAName} and ${personBName} to trust the journey, communicate with openness, and remember that their love is a gift not only to themselves but to the world around them.`,
    cosmicTheme: typeContent.focusAreas[Math.floor(Math.random() * typeContent.focusAreas.length)]
  };
};

// Enhanced fallback functions for AI features
const createFallbackInterpretation = (data: AICardInterpretationRequest): string => {
  const { cardName, cardKeywords, hexagramName, focusArea } = data;
  const primaryKeyword = cardKeywords[0] || 'wisdom';
  const focusText = focusArea || 'your journey';
  
  return `The energy of ${cardName} combines beautifully with the ancient wisdom of ${hexagramName} to offer guidance for ${focusText}. ${primaryKeyword} emerges as a key theme today, inviting you to explore how this quality can serve your highest good. Consider how the essence of ${primaryKeyword.toLowerCase()} might illuminate your path forward, while the deeper teachings of ${hexagramName} provide a foundation for meaningful growth and understanding.`;
};

const createFallbackReflectionPrompts = (data: AIReflectionPromptsRequest): string[] => {
  const { cardName, cardKeywords, hexagramName, focusArea } = data;
  const primaryKeyword = cardKeywords[0] || 'wisdom';
  const secondaryKeyword = cardKeywords[1] || 'growth';
  const focusText = focusArea || 'life';
  
  // Enhanced fallback prompts matching the new AI style
  // Focus on real-life situations, relationships, and personal experiences
  return [
    `Where in your ${focusText} are you being called to embrace ${primaryKeyword.toLowerCase()}, even when it feels uncertain or challenging?`,
    `How might the energy of ${cardName} guide you through a current relationship or situation that needs your attention?`,
    `What would it look like to embody the essence of ${secondaryKeyword.toLowerCase()} in your daily choices, inspired by the wisdom of ${hexagramName}?`
  ];
};

const createFallbackGuidance = (data: AIPersonalizedGuidanceRequest): string => {
  const { cardName, hexagramName, focusArea, timeOfDay } = data;
  const timeText = timeOfDay === 'morning' ? 'As you begin your day' : 
                   timeOfDay === 'evening' ? 'As you reflect on your day' : 
                   'In this moment';
  const focusText = focusArea || 'your personal growth';
  
  return `${timeText}, ${cardName} and ${hexagramName} come together to offer gentle guidance for ${focusText}. This combination suggests a time for mindful awareness and authentic action. Trust in your inner wisdom as you navigate the opportunities and challenges ahead. The path forward may not always be clear, but by staying true to your values and remaining open to growth, you'll find the guidance you need.`;
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

export const getAIInsight = async (prompt: string): Promise<string> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch AI insight');
  }

  const data = await response.json();
  return data.insight;
};