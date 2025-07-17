import OpenAI from 'openai';
import { getPlanetaryPositions, getZodiacSign } from '@/utils/astrologyCalculations';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

// Enhanced OpenAI API key detection for Bolt.new environment
function getOpenAIApiKey(): string | null {
  // Try different possible environment variable sources
  const possibleKeys = [
    process.env.OPENAI_API_KEY,
    process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    // In Bolt.new or similar environments, sometimes keys are accessible differently
    (globalThis as any).OPENAI_API_KEY,
    (globalThis as any).process?.env?.OPENAI_API_KEY,
  ];

  console.log('🔍 Searching for OpenAI API key in environment...');
  
  for (let i = 0; i < possibleKeys.length; i++) {
    const key = possibleKeys[i];
    const keyName = ['OPENAI_API_KEY', 'EXPO_PUBLIC_OPENAI_API_KEY', 'globalThis.OPENAI_API_KEY', 'globalThis.process.env.OPENAI_API_KEY'][i];
    
    if (key && typeof key === 'string' && key.length > 10) {
      console.log(`✅ Found OpenAI API key from: ${keyName}`);
      return key;
    } else {
      console.log(`❌ ${keyName}: ${key ? 'Too short' : 'Not found'}`);
    }
  }

  // If still not found, check if it's in any global configuration
  try {
    const envVars = Object.keys(process.env || {});
    const apiKeyVars = envVars.filter(key => key.toLowerCase().includes('openai'));
    console.log('🔍 Available OpenAI-related environment variables:', apiKeyVars);
    console.log('🔍 Total environment variables:', envVars.length);
  } catch (e) {
    console.log('🔍 Could not list environment variables:', e);
  }

  console.log('❌ No valid OpenAI API key found in any environment source');
  return null;
}

function getOpenAIClient(): OpenAI {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required but not set');
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      timeout: 120000, // INCREASED: 120 second timeout for complex requests
      maxRetries: 0, // Disable OpenAI's built-in retry, use our custom retry
      httpAgent: undefined,
    });
  }
  
  return openaiClient;
}

// Enhanced retry mechanism for handling transient network errors
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3, // Optimized retry count
  delay: number = 2000 // Start with 2 seconds
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 AI operation attempt ${attempt}/${maxRetries}`);
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
        error.cause?.code === 'ECONNRESET' ||
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
        console.error(`❌ Final attempt failed or non-retryable error:`, {
          attempt,
          maxRetries,
          errorCode: error.code,
          errorMessage: error.message,
          causeCode: error.cause?.code,
          isRetryable
        });
        throw error;
      }
      
      // Enhanced exponential backoff with jitter
      const backoffDelay = delay * Math.pow(1.5, attempt - 1) + Math.random() * 1000;
      console.log(`🔄 Attempt ${attempt}/${maxRetries} failed (${error.code || error.name}), retrying in ${Math.round(backoffDelay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw lastError!;
}

export async function POST(request: Request) {
  try {
    // Enhanced environment variable checking
    const apiKey = getOpenAIApiKey();
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY environment variable is missing');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured. Please check your environment variables.',
          code: 'MISSING_API_KEY'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ OpenAI API key is available');
    
    // Test OpenAI client initialization
    let openai;
    try {
      openai = getOpenAIClient();
      console.log('✅ OpenAI client initialized successfully');
    } catch (clientError: any) {
      console.error('❌ Failed to initialize OpenAI client:', clientError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initialize AI service',
          details: clientError.message,
          code: 'CLIENT_INIT_ERROR'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          code: 'INVALID_JSON'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { type, data } = body;

    if (!type || !data) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: type and data',
          code: 'MISSING_FIELDS'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🎯 Processing AI request: ${type}`);

    // Route to appropriate handler
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
        return new Response(
          JSON.stringify({ 
            error: `Invalid request type: ${type}`,
            code: 'INVALID_TYPE'
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error: any) {
    console.error('❌ AI API Error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Enhanced error categorization
    let errorResponse = {
      error: 'Internal server error',
      code: 'UNKNOWN_ERROR',
      details: error.message
    };
    
    // Handle specific error types
    if (error.message?.includes('OPENAI_API_KEY')) {
      errorResponse = {
        error: 'OpenAI API key not configured',
        code: 'MISSING_API_KEY',
        details: 'Please set the OPENAI_API_KEY environment variable'
      };
    } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      errorResponse = {
        error: 'Network connection error',
        code: 'NETWORK_ERROR',
        details: 'Please check your internet connection and try again'
      };
    } else if (error.status === 429) {
      errorResponse = {
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT',
        details: 'Too many requests. Please wait a moment and try again'
      };
    } else if (error.status === 401) {
      errorResponse = {
        error: 'Invalid API key',
        code: 'INVALID_API_KEY',
        details: 'The OpenAI API key is invalid or expired'
      };
    }
    
    return new Response(
      JSON.stringify(errorResponse),
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
    console.log(`🎴 Processing structured reflection: ${cardName} + ${hexagramName} (${isReversed ? 'reversed' : 'upright'})`);
    
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini', // OPTIMIZED: Use faster gpt-4o-mini for structured responses
        messages: [
          {
            role: 'system',
            content: 'You are a calm, grounded reflection guide who provides structured 4-part insights combining Tarot and I Ching wisdom. Always respond with a valid JSON object containing exactly these fields: iChingReflection, tarotReflection, synthesis, reflectionPrompt. Keep responses concise but meaningful.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500, // OPTIMIZED: Reduced for faster response
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });
    });

    console.log('✅ AI response received, parsing...');
    
    let result;
    try {
      result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      throw new Error('AI returned invalid JSON response');
    }
    
    // Validate the response has all required fields
    const requiredFields = ['iChingReflection', 'tarotReflection', 'synthesis', 'reflectionPrompt'];
    const missingFields = requiredFields.filter(field => !result[field]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ AI response missing fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('✅ Structured reflection completed successfully');
    return Response.json(result);
  } catch (error) {
    console.error('❌ OpenAI Structured Reflection Error:', error);
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
    
    let northNodeSign = 'Not available';
    let southNodeSign = 'Not available';
    
    // Calculate North Node if we have complete birth data
    if (birthDate && birthTime && person.coordinates) {
      try {
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthTime.getHours();
        const minute = birthTime.getMinutes();
        
        const positions = getPlanetaryPositions(
          year, month, day, hour, minute,
          person.coordinates.latitude,
          person.coordinates.longitude
        );
        
        // Find North Node position (South Node is opposite)
        const northNodePosition = positions.find(p => p.name === 'North Node');
        if (northNodePosition) {
          northNodeSign = getZodiacSign(northNodePosition.longitude);
          // South Node is exactly opposite (180 degrees)
          const southNodeLongitude = (northNodePosition.longitude + 180) % 360;
          southNodeSign = getZodiacSign(southNodeLongitude);
        }
      } catch (error) {
        console.log('Could not calculate North Node for', person.name);
      }
    }
    
    return {
      name: person.name || 'Unknown',
      birthDate: birthDate ? birthDate.toLocaleDateString() : 'Not provided',
      birthTime: birthTime ? birthTime.toLocaleTimeString() : 'Not provided',
      location: person.location || 'Not provided',
      coordinates: person.coordinates || null,
      northNodeSign,
      southNodeSign,
    };
  };

  const formattedPersonA = formatPersonData(personA);
  const formattedPersonB = formatPersonData(personB);

  const prompt = `
You are a warm, wise relationship guide who understands how the stars influence love and connection. You speak directly to couples in a caring, down-to-earth way that feels like talking to a trusted friend who happens to know astrology.

**About ${formattedPersonA.name}:**
- Born: ${formattedPersonA.birthDate} at ${formattedPersonA.birthTime}
- Where: ${formattedPersonA.location}
- Life Path (North Node): ${formattedPersonA.northNodeSign}
- Past Gifts (South Node): ${formattedPersonA.southNodeSign}

**About ${formattedPersonB.name}:**
- Born: ${formattedPersonB.birthDate} at ${formattedPersonB.birthTime}
- Where: ${formattedPersonB.location}
- Life Path (North Node): ${formattedPersonB.northNodeSign}
- Past Gifts (South Node): ${formattedPersonB.southNodeSign}

**What you're exploring:** ${reportType} compatibility

**Create a personal compatibility reading that speaks directly to this couple. Consider how their energies blend:**
- How you naturally connect and what draws you together
- The way you handle emotions and support each other
- Your attraction, passion, and romantic chemistry
- How you communicate and understand each other
- What you're both growing toward in this lifetime
- The deeper soul connection and why you might have met
- Any karmic patterns or past-life bonds between you

Write your response as a JSON object with these fields:

1. **"score"**: How compatible you are overall (0-100). Most real connections fall between 65-85.

2. **"title"**: A beautiful title that captures your unique love story (like "When Fire Meets Water: Your Dance of Passion and Depth" or "Twin Souls on Parallel Paths")

3. **"summary"**: Write 4-5 sentences directly to this couple about their connection. Use "you" and "your" language. Make it feel personal, mentioning their birth timing or cosmic signatures. Help them understand why their connection feels special.

4. **"stats"**: Choose exactly 4 relationship areas from these options and explain each one:
   - "Emotional Harmony" - How your hearts connect
   - "Communication Flow" - How you understand each other
   - "Passion & Romance" - Your physical and romantic chemistry
   - "Long-term Potential" - Whether you're built to last
   - "Spiritual Connection" - Your deeper soul bond
   - "Adventure Compatibility" - How you explore life together
   - "Home & Security" - Creating safety and comfort together
   - "Creative Synergy" - How you inspire each other
   - "Karmic Connection" - Why your souls recognize each other
   - "Soul Growth Alignment" - How you help each other evolve
   - "Past Life Bonds" - Connections that transcend this lifetime
   - "Destiny Partnership" - Whether you're meant to be

For each area, give it a score (0-100) and write 2-3 sentences explaining what this means for your relationship. Use "you" language and make it personal.

**How to write this:**
- Talk directly to the couple ("you two," "your connection," "you might notice")
- Use warm, everyday language instead of complicated astrology terms
- Focus on what this means for their daily life and relationship
- Be encouraging and help them understand each other better
- Make it feel like personal guidance, not a generic report
- Include specific details from their birth information when it adds meaning

**Important:** Return ONLY the JSON object, no extra text.
`;

  try {
    console.log(`💕 Processing compatibility report: ${formattedPersonA.name} + ${formattedPersonB.name} (${reportType})`);
    
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini', // OPTIMIZED: Use faster gpt-4o-mini for consistent performance
        messages: [
          {
            role: 'system',
            content: 'You are a caring relationship guide who helps couples understand their connection through astrology. You speak directly to them in warm, friendly language like a wise friend. Always use "you" and "your" when talking about their relationship. Keep your language simple, personal, and encouraging. Always respond with valid JSON containing exactly these fields: score, title, summary, stats.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800, // OPTIMIZED: Reduced for faster response while maintaining quality
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });
    });

    console.log('✅ AI compatibility response received, parsing...');

    let report;
    try {
      report = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      throw new Error('AI returned invalid JSON response');
    }

    // Comprehensive validation (matching structured reflection pattern)
    const requiredFields = ['score', 'title', 'summary', 'stats'];
    const missingFields = requiredFields.filter(field => !report[field]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ AI response missing fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate score is a number
    if (typeof report.score !== 'number' || report.score < 0 || report.score > 100) {
      console.warn('⚠️ Invalid score value:', report.score);
      throw new Error('Score must be a number between 0-100');
    }

    // Ensure stats array has exactly 4 items with proper structure
    if (!Array.isArray(report.stats) || report.stats.length !== 4) {
      console.warn('⚠️ Invalid stats array length:', report.stats?.length);
      throw new Error('Report must contain exactly 4 compatibility aspects');
    }

    // Validate each stat has required fields
    for (let i = 0; i < report.stats.length; i++) {
      const stat = report.stats[i];
      if (!stat.label || !stat.description || typeof stat.score !== 'number') {
        console.warn(`⚠️ Invalid stat at index ${i}:`, stat);
        throw new Error(`Stat ${i + 1} missing required fields: label, score, description`);
      }
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

    console.log('✅ Compatibility report completed successfully');
    return Response.json(enhancedReport);
  } catch (error) {
    console.error('❌ OpenAI Compatibility Error:', error);
    
    // Enhanced fallback report with personalized elements
    const fallbackReport = createEnhancedFallbackReport(formattedPersonA, formattedPersonB, reportType);
    console.log('🔄 Using fallback compatibility report due to error');
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
    stats: (() => {
      // Create a mix of traditional and North Node-based compatibility aspects
      const allStats = [
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
        },
        {
          label: "Karmic Connection",
          score: baseScore + Math.floor(Math.random() * 10) - 5,
          description: `${personA.name} and ${personB.name} share deep karmic bonds that transcend this lifetime. Their connection feels destined, with lessons and growth opportunities woven into their relationship.`
        },
        {
          label: "Soul Growth Alignment",
          score: baseScore + Math.floor(Math.random() * 10) - 5,
          description: `Their individual paths of spiritual evolution beautifully complement each other. Together, they support each other's highest growth and soul purpose fulfillment.`
        },
        {
          label: "Destiny Partnership",
          score: baseScore + Math.floor(Math.random() * 10) - 5,
          description: `This connection carries the signature of destiny. ${personA.name} and ${personB.name} are meant to walk significant parts of their journey together, supporting each other's cosmic evolution.`
        }
      ];
      
      // Randomly select 4 stats, ensuring at least one North Node-based stat if possible
      const shuffled = allStats.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);
      
      // Ensure at least one karmic/North Node stat is included (50% chance)
      const hasKarmicStat = selected.some(stat => 
        ["Karmic Connection", "Soul Growth Alignment", "Destiny Partnership"].includes(stat.label)
      );
      
      if (!hasKarmicStat && Math.random() > 0.5) {
        // Replace the last stat with a karmic one
        const karmicStats = allStats.filter(stat => 
          ["Karmic Connection", "Soul Growth Alignment", "Destiny Partnership"].includes(stat.label)
        );
        selected[3] = karmicStats[Math.floor(Math.random() * karmicStats.length)];
      }
      
      return selected;
    })(),
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
    You're a warm, wise guide helping someone understand their life path through astrology. 
    ${userName} has their North Node in ${northNodeSign} in the ${northNodeHouse}.

    Write a personal, encouraging message directly to ${userName} about their soul's journey. Keep it 80-120 words and make it feel like you're talking to a close friend:

    1. Start by acknowledging their North Node placement in simple terms
    2. Explain what this means for their life path - what they're here to learn and grow into
    3. Give them something practical they can think about or try
    4. Use warm, everyday language - no complicated astrology terms
    5. Make it feel personal and encouraging

    Write directly to them using "you" and "your." Think of it like giving loving advice to help them understand themselves better.

    Example tone: "With your North Node in Taurus, you're here to learn the beauty of slowing down and trusting what feels truly stable in your life. Your soul is growing toward finding peace in simple, real things - whether that's a warm home, loyal relationships, or work that actually matters to you. What's one small way you could honor what feels most genuine and grounding in your life right now?"
  `;

  try {
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are a caring friend who understands astrology and helps people discover their life path. You speak directly to them in warm, simple language. Always use 'you' and 'your' and avoid complicated astrology terms. Make everything feel personal and encouraging."
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