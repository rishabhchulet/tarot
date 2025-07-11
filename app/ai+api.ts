import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required but not set');
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  
  return openaiClient;
}

// Retry mechanism for handling transient network errors
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a retryable error (connection issues, timeouts, etc.)
      const isRetryable = 
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('socket hang up') ||
        error.message?.includes('Connection error') ||
        error.status === 429 || // Rate limit
        error.status === 500 || // Server error
        error.status === 502 || // Bad gateway
        error.status === 503 || // Service unavailable
        error.status === 504;   // Gateway timeout
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const backoffDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`Attempt ${attempt} failed, retrying in ${Math.round(backoffDelay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw lastError!;
}

export async function POST(request: Request) {
  try {
    // Check if OpenAI API key is available before processing
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const openai = getOpenAIClient();
    
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'card-interpretation':
        return await handleCardInterpretation(data, openai);
      case 'reflection-prompts':
        return await handleReflectionPrompts(data, openai);
      case 'personalized-guidance':
        return await handlePersonalizedGuidance(data, openai);
      case 'north-node-insight':
        return await handleNorthNodeInsight(data, openai);
      case 'compatibility-report':
        return await handleCompatibilityReport(data, openai);
      case 'structured-reflection':
        return await handleStructuredReflection(data, openai);
      default:
        return new Response('Invalid request type', { status: 400 });
    }
  } catch (error: any) {
    console.error('AI API Error:', error);
    
    // Handle missing API key specifically
    if (error.message?.includes('OPENAI_API_KEY')) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleCardInterpretation(data: {
  cardName: string;
  cardKeywords: string[];
  hexagramName: string;
  hexagramNumber: number;
  focusArea?: string;
  userContext?: string;
}, openai: OpenAI) {
  const { cardName, cardKeywords, hexagramName, hexagramNumber, focusArea, userContext } = data;

  const prompt = `You are a wise and compassionate inner guide specializing in tarot and I Ching interpretations. 

Today's inner combination:
- Tarot Card: ${cardName}
- Keywords: ${cardKeywords.join(', ')}
- I Ching Hexagram: ${hexagramName} (#${hexagramNumber})
${focusArea ? `- User's Focus Area: ${focusArea}` : ''}
${userContext ? `- Current Context: ${userContext}` : ''}

Create a personalized, insightful interpretation that:
1. Connects the tarot card and I Ching hexagram meaningfully
2. Relates to the user's focus area (if provided)
3. Offers practical inner guidance for today
4. Is warm, encouraging, and empowering
5. Avoids generic fortune-telling language

Keep the response between 150-250 words, written in a conversational, supportive tone.`;

  try {
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate inner guide who provides personalized, insightful interpretations of tarot and I Ching combinations. Your responses are warm, practical, and empowering.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });
    });

    const interpretation = completion.choices[0]?.message?.content || 'Unable to generate interpretation at this time.';

    return Response.json({
      interpretation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

async function handleReflectionPrompts(data: {
  cardName: string;
  cardKeywords: string[];
  hexagramName: string;
  focusArea?: string;
  previousEntries?: string[];
}, openai: OpenAI) {
  const { cardName, cardKeywords, hexagramName, focusArea, previousEntries } = data;

  const prompt = `You are a thoughtful inner mentor creating deeply personal reflection questions that connect to real life experiences.

Today's inner draw:
- Tarot Card: ${cardName}
- Keywords: ${cardKeywords.join(', ')}
- I Ching Hexagram: ${hexagramName}
${focusArea ? `- User's Focus Area: ${focusArea}` : ''}
${previousEntries?.length ? `- Recent reflection themes: ${previousEntries.slice(0, 3).join(', ')}` : ''}

Generate 3 deeply personal, life-focused reflection questions that:
1. Connect to today's card and hexagram combination
2. Ask about real life situations, relationships, choices, and personal experiences
3. Use language like "Where in your life..." "How are you being called..." "What in your current situation..."
4. Focus on personal growth, relationships, life decisions, and authentic living
5. Are specific to human experience, not abstract inner concepts
6. Follow this pattern: 2 main reflection questions + 1 "return to throughout the day" question

Examples of the style:
- "Where in your life are you being called to choose what sets your heart alight, even if it's uncertain?"
- "Can you let desire be a guide—not to possession, but to illumination?"
- "What am I truly devoted to—and does it reflect my truth?"

Format as a JSON array of exactly 3 strings. Make them personal, life-focused, and meaningful.`;

  try {
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an inner mentor who creates deeply personal, life-focused reflection questions. Always respond with valid JSON containing exactly 3 questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.8,
      });
    });

    const response = completion.choices[0]?.message?.content || '[]';
    
    try {
      const questions = JSON.parse(response);
      return Response.json({
        questions: Array.isArray(questions) && questions.length >= 3 ? questions.slice(0, 3) : [],
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      // Enhanced fallback if JSON parsing fails
      const primaryKeyword = cardKeywords[0] || 'wisdom';
      const focusAreaText = focusArea || 'life';
      
      return Response.json({
        questions: [
          `Where in your ${focusAreaText} are you being called to choose what sets your heart alight, even if it's uncertain?`,
          `Can you let ${primaryKeyword.toLowerCase()} be a guide—not to possession, but to illumination in your daily choices?`,
          `What am I truly devoted to—and does it reflect my authentic truth?`
        ],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

async function handleStructuredReflection(data: {
  prompt: string;
  cardName: string;
  hexagramName: string;
  isReversed: boolean;
}, openai: OpenAI) {
  const { prompt, cardName, hexagramName, isReversed } = data;

  try {
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a calm, grounded reflection guide who provides structured 4-part insights combining Tarot and I Ching wisdom. Always respond with a valid JSON object containing exactly these fields: iChingReflection, tarotReflection, synthesis, reflectionPrompt.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    // Validate the response has all required fields
    const requiredFields = ['iChingReflection', 'tarotReflection', 'synthesis', 'reflectionPrompt'];
    const missingFields = requiredFields.filter(field => !result[field]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ AI response missing fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return Response.json(result);
  } catch (error) {
    console.error('OpenAI Structured Reflection Error:', error);
    throw error;
  }
}

async function handleCompatibilityReport(data: {
  personA: object;
  personB: object;
  reportType: string;
}, openai: OpenAI) {
  const { personA, personB, reportType } = data;

  const prompt = `
You are a highly skilled relationship astrologer with a warm, modern, and insightful voice. Your task is to analyze the compatibility between two individuals based on their birth information for a specific type of relationship.

**Person A:**
${JSON.stringify(personA, null, 2)}

**Person B:**
${JSON.stringify(personB, null, 2)}

**Report Type:** ${reportType}

**Your Task:**
Provide a compatibility analysis in a structured JSON format. The response must be a valid JSON object with the following fields:
- "score": A number between 0 and 100 representing the overall compatibility score.
- "title": A short, beautiful, and catchy title for the compatibility reading (e.g., "A Dance of Fire and Water").
- "summary": A concise, encouraging, and beautifully written paragraph (3-4 sentences) summarizing the core dynamic of the relationship.
- "stats": An array of 3-4 objects, where each object represents a key aspect of the relationship (e.g., Communication, Emotional Connection, Long-term Potential). Each object must have the following fields:
  - "label": The name of the aspect (e.g., "Communication Style").
  - "score": A number between 0 and 100 for that specific aspect.
  - "description": A 1-2 sentence explanation of the dynamic for that aspect.

**Important Instructions:**
- Do NOT include any introductory or concluding text outside of the main JSON object.
- Ensure the final output is a single, valid JSON object and nothing else.
- The tone should be positive and empowering, even when discussing challenges. Focus on potential for growth.
`;

  try {
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a relationship astrologer who provides insightful compatibility analyses. You always respond with a valid JSON object matching the specified format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });
    });

    const report = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return Response.json(report);
  } catch (error) {
    console.error('OpenAI Compatibility Error:', error);
    throw error;
  }
}

async function handleNorthNodeInsight(data: {
  northNodeSign: string;
  northNodeHouse: string;
  userName: string;
}, openai: OpenAI) {
  const { northNodeSign, northNodeHouse, userName } = data;

  const prompt = `
    You are an expert astrologer who specializes in providing soulful, encouraging, and practical guidance based on the North Node.
    The user, ${userName}, has their North Node in ${northNodeSign} in the ${northNodeHouse}.

    Please generate a concise (80-120 words) and empowering reflection for ${userName}. The reflection should:
    1.  Start by directly addressing the user's North Node placement.
    2.  Explain the core life lesson or soul journey associated with this placement in a simple, beautiful way.
    3.  Offer a piece of actionable wisdom or a question for contemplation.
    4.  Maintain a warm, personal, and inspiring tone.
    5.  Do NOT use generic astrological jargon. Frame it as a personal path of growth.

    Example style: "With your North Node in Taurus, your soul's journey in this lifetime is towards embracing stability and finding peace in the simple, profound security of the material world. It's about learning to trust your own values. What is one small step you can take today to build something real and lasting for yourself?"
  `;

  try {
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are a wise, soulful astrologer providing empowering insights about a user's North Node. Your tone is personal, warm, and encouraging."
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 250,
        temperature: 0.75,
      });
    });

    const insight = completion.choices[0]?.message?.content || 'Unable to generate insight at this time.';

    return Response.json({
      insight,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('OpenAI API Error in North Node Insight:', error);
    throw error;
  }
}

async function handlePersonalizedGuidance(data: {
  cardName: string;
  hexagramName: string;
  focusArea?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  mood?: string;
}, openai: OpenAI) {
  const { cardName, hexagramName, focusArea, timeOfDay, mood } = data;

  const prompt = `You are a gentle inner companion offering personalized daily guidance.

Current moment:
- Tarot Card: ${cardName}
- I Ching Hexagram: ${hexagramName}
- Focus Area: ${focusArea || 'general inner growth'}
- Time: ${timeOfDay}
${mood ? `- Current mood/energy: ${mood}` : ''}

Provide a brief, personalized inner message (50-80 words) that:
1. Acknowledges their current energy and time of day
2. Offers gentle guidance based on the card and hexagram
3. Includes a simple, actionable suggestion for their ${focusArea || 'inner practice'}
4. Is encouraging and supportive

Write in a warm, friend-like tone as if you're checking in on them personally.`;

  try {
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a caring inner friend who offers gentle, personalized guidance. Your messages are brief, warm, and actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
    });

    const guidance = completion.choices[0]?.message?.content || 'Take a moment to breathe and connect with your inner wisdom today.';

    return Response.json({
      guidance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}