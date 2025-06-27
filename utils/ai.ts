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

export const getAICardInterpretation = async (data: AICardInterpretationRequest) => {
  try {
    const response = await fetch('/ai', {
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
    console.error('AI interpretation error:', error);
    return { 
      interpretation: null, 
      error: error.message || 'Failed to generate interpretation' 
    };
  }
};

export const getAIReflectionPrompts = async (data: AIReflectionPromptsRequest) => {
  try {
    const response = await fetch('/ai', {
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
    console.error('AI reflection prompts error:', error);
    return { 
      questions: [], 
      error: error.message || 'Failed to generate reflection prompts' 
    };
  }
};

export const getAIPersonalizedGuidance = async (data: AIPersonalizedGuidanceRequest) => {
  try {
    const response = await fetch('/ai', {
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
    console.error('AI guidance error:', error);
    return { 
      guidance: null, 
      error: error.message || 'Failed to generate guidance' 
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