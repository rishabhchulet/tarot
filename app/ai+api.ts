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
      timeout: 60000, // 60 second timeout
      maxRetries: 2, // Let our custom retry handle most retries
      httpAgent: undefined, // Use default agent
    });
  }
  
  return openaiClient;
}

// Retry mechanism for handling transient network errors
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 4, // Increased from 3 to 4
  delay: number = 3000 // INCREASED: Start with 3 seconds
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Enhanced error detection for connection issues
      const isRetryable = 
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNABORTED' ||
        error.code === 'ECONNREFUSED' ||
        error.cause?.code === 'ECONNRESET' || // Check nested error
        error.message?.includes('socket hang up') ||
        error.message?.includes('Connection error') ||
        error.message?.includes('Network request failed') ||
        error.message?.includes('fetch failed') ||
        error.name === 'FetchError' ||
        error.status === 429 || // Rate limit
        error.status === 500 || // Server error
        error.status === 502 || // Bad gateway
        error.status === 503 || // Service unavailable
        error.status === 504;   // Gateway timeout
      
      if (!isRetryable || attempt === maxRetries) {
        console.error(`Non-retryable error or max retries reached:`, {
          attempt,
          maxRetries,
          errorCode: error.code,
          errorMessage: error.message,
          causeCode: error.cause?.code,
          isRetryable
        });
        throw error;
      }
      
      // Enhanced exponential backoff with jitter - more generous delays for connection issues
      const baseDelay = error.code === 'ECONNRESET' ? delay * 2 : delay; // Double delay for connection resets
      const backoffDelay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 3000;
      console.log(`🔄 Attempt ${attempt}/${maxRetries} failed (${error.code || error.name}), retrying in ${Math.round(backoffDelay)}ms...`);
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

  // Extract and format birth data for better analysis
  const formatPersonData = (person: any) => {
    const birthDate = person.date ? new Date(person.date) : null;
    const birthTime = person.time ? new Date(person.time) : null;
    
    return {
      name: person.name || 'Unknown',
      birthDate: birthDate ? birthDate.toLocaleDateString() : 'Not provided',
      birthTime: birthTime ? birthTime.toLocaleTimeString() : 'Not provided',
      location: person.location || 'Not provided',
      coordinates: person.coordinates || null,
    };
  };

  const formattedPersonA = formatPersonData(personA);
  const formattedPersonB = formatPersonData(personB);

  const prompt = `
You are a highly skilled relationship astrologer with deep knowledge of synastry, composite charts, and relationship dynamics. Your voice is warm, insightful, and empowering, focusing on growth potential and understanding rather than judgment.

**Person A (${formattedPersonA.name}):**
- Birth Date: ${formattedPersonA.birthDate}
- Birth Time: ${formattedPersonA.birthTime}
- Birth Location: ${formattedPersonA.location}

**Person B (${formattedPersonB.name}):**
- Birth Date: ${formattedPersonB.birthDate}
- Birth Time: ${formattedPersonB.birthTime}
- Birth Location: ${formattedPersonB.location}

**Report Type:** ${reportType}

**Your Task:**
Create a comprehensive compatibility analysis that feels deeply personal and meaningful. Consider the following astrological factors:
- Sun sign compatibility and core personality dynamics
- Moon sign emotional compatibility and nurturing styles
- Venus and Mars dynamics for attraction and passion
- Communication styles and intellectual connection
- Long-term potential and growth areas
- Seasonal and elemental influences from birth timing

Provide your analysis as a JSON object with these exact fields:

1. **"score"**: Overall compatibility percentage (0-100). Be generous but realistic - most genuine connections score 65-85.

2. **"title"**: A poetic, evocative title that captures their unique dynamic (e.g., "Fire Meets Water: A Dance of Passion and Depth", "Twin Flames of Earth and Air", "The Cosmic Gardeners")

3. **"summary"**: A beautifully written 4-5 sentence summary that feels personally crafted for this couple. Include specific details about their birth timing, seasons, or astrological elements. Make it feel like destiny.

4. **"stats"**: An array of exactly 4 relationship aspects, each with:
   - "label": The aspect name (choose from: "Emotional Harmony", "Communication Flow", "Passion & Romance", "Long-term Potential", "Spiritual Connection", "Adventure Compatibility", "Home & Security", "Creative Synergy")
   - "score": Individual score (0-100) for this aspect
   - "description": 2-3 sentences explaining this dynamic with specific astrological insights

**Tone Guidelines:**
- Write as if you personally know this couple
- Include specific references to their birth data when meaningful
- Focus on growth, understanding, and potential
- Avoid generic statements - make everything feel personalized
- Use beautiful, flowing language that feels mystical yet grounded
- Always end on an uplifting, empowering note

**Important:** Return ONLY the JSON object, no additional text or formatting.
`;

  try {
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a master relationship astrologer who creates deeply personal, insightful compatibility analyses. You always respond with perfectly formatted JSON that feels personally crafted for each unique couple.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });
    });

    const report = JSON.parse(completion.choices[0]?.message?.content || '{}');

    // Validate and enhance the report
    if (!report.score || !report.title || !report.summary || !report.stats) {
      throw new Error('Invalid report structure received from AI');
    }

    // Ensure stats array has exactly 4 items
    if (!Array.isArray(report.stats) || report.stats.length !== 4) {
      throw new Error('Report must contain exactly 4 compatibility aspects');
    }

    // Add metadata for enhanced user experience
    const enhancedReport = {
      ...report,
      generatedAt: new Date().toISOString(),
      reportType: reportType,
      personAName: formattedPersonA.name,
      personBName: formattedPersonB.name,
      insight: generatePersonalizedInsight(formattedPersonA, formattedPersonB, report.score),
    };

    return Response.json(enhancedReport);
  } catch (error) {
    console.error('OpenAI Compatibility Error:', error);
    
    // Enhanced fallback report with personalized elements
    const fallbackReport = createEnhancedFallbackReport(formattedPersonA, formattedPersonB, reportType);
    return Response.json(fallbackReport);
  }
}

// Helper function to generate personalized insight
function generatePersonalizedInsight(personA: any, personB: any, score: number): string {
  const season = getSeasonFromDate(personA.birthDate);
  const compatibility = score >= 80 ? 'exceptional' : score >= 70 ? 'strong' : score >= 60 ? 'promising' : 'complex but meaningful';
  
  return `Born in ${season}, ${personA.name} brings a unique energy that ${compatibility === 'exceptional' ? 'harmonizes beautifully' : 'creates interesting dynamics'} with ${personB.name}'s essence. This ${compatibility} connection offers rich opportunities for mutual growth and understanding.`;
}

// Helper function to get season from birth date
function getSeasonFromDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// Enhanced fallback report with personalization
function createEnhancedFallbackReport(personA: any, personB: any, reportType: string) {
  const baseScore = Math.floor(Math.random() * 20) + 65; // 65-85 range
  
  return {
    score: baseScore,
    title: `${personA.name} & ${personB.name}: A Cosmic Connection`,
    summary: `The stars have woven an intricate pattern between ${personA.name} and ${personB.name}. Their connection transcends the ordinary, offering a beautiful balance of challenge and harmony. This ${reportType.toLowerCase()} holds the potential for deep understanding, mutual growth, and shared adventures. Together, they create a unique cosmic signature that speaks to both individual strength and collective potential.`,
    stats: [
      {
        label: "Emotional Harmony",
        score: baseScore + Math.floor(Math.random() * 10) - 5,
        description: `${personA.name} and ${personB.name} share a natural emotional rhythm that allows for deep understanding and mutual support. Their hearts speak a similar language, creating a foundation of trust and empathy.`
      },
      {
        label: "Communication Flow",
        score: baseScore + Math.floor(Math.random() * 10) - 5,
        description: `Their conversations flow with ease and depth, each bringing unique perspectives that enrich their shared understanding. They have the gift of truly hearing and being heard by one another.`
      },
      {
        label: "Creative Synergy",
        score: baseScore + Math.floor(Math.random() * 10) - 5,
        description: `Together, ${personA.name} and ${personB.name} inspire each other to explore new creative territories. Their combined energy sparks innovation and brings out hidden talents in both.`
      },
      {
        label: "Long-term Potential",
        score: baseScore + Math.floor(Math.random() * 10) - 5,
        description: `This connection has the cosmic ingredients for lasting significance. Their bond deepens with time, weathering challenges and celebrating growth together with grace and wisdom.`
      }
    ],
    generatedAt: new Date().toISOString(),
    reportType: reportType,
    personAName: personA.name,
    personBName: personB.name,
    insight: generatePersonalizedInsight(personA, personB, baseScore),
  };
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