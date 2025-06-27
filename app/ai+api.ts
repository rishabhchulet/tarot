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

  const prompt = `You are a wise and compassionate spiritual guide specializing in tarot and I Ching interpretations. 

Today's spiritual combination:
- Tarot Card: ${cardName}
- Keywords: ${cardKeywords.join(', ')}
- I Ching Hexagram: ${hexagramName} (#${hexagramNumber})
${focusArea ? `- User's Focus Area: ${focusArea}` : ''}
${userContext ? `- Current Context: ${userContext}` : ''}

Create a personalized, insightful interpretation that:
1. Connects the tarot card and I Ching hexagram meaningfully
2. Relates to the user's focus area (if provided)
3. Offers practical spiritual guidance for today
4. Is warm, encouraging, and empowering
5. Avoids generic fortune-telling language

Keep the response between 150-250 words, written in a conversational, supportive tone.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate spiritual guide who provides personalized, insightful interpretations of tarot and I Ching combinations. Your responses are warm, practical, and empowering.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
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

  const prompt = `You are a thoughtful spiritual mentor creating deeply personal reflection questions that connect to real life experiences.

Today's spiritual draw:
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
5. Are specific to human experience, not abstract spiritual concepts
6. Follow this pattern: 2 main reflection questions + 1 "return to throughout the day" question

Examples of the style:
- "Where in your life are you being called to choose what sets your heart alight, even if it's uncertain?"
- "Can you let desire be a guide—not to possession, but to illumination?"
- "What am I truly devoted to—and does it reflect my truth?"

Format as a JSON array of exactly 3 strings. Make them personal, life-focused, and meaningful.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a spiritual mentor who creates deeply personal, life-focused reflection questions. Always respond with valid JSON containing exactly 3 questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
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

async function handlePersonalizedGuidance(data: {
  cardName: string;
  hexagramName: string;
  focusArea?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  mood?: string;
}, openai: OpenAI) {
  const { cardName, hexagramName, focusArea, timeOfDay, mood } = data;

  const prompt = `You are a gentle spiritual companion offering personalized daily guidance.

Current moment:
- Tarot Card: ${cardName}
- I Ching Hexagram: ${hexagramName}
- Focus Area: ${focusArea || 'general spiritual growth'}
- Time: ${timeOfDay}
${mood ? `- Current mood/energy: ${mood}` : ''}

Provide a brief, personalized spiritual message (50-80 words) that:
1. Acknowledges their current energy and time of day
2. Offers gentle guidance based on the card and hexagram
3. Includes a simple, actionable suggestion for their ${focusArea || 'spiritual practice'}
4. Is encouraging and supportive

Write in a warm, friend-like tone as if you're checking in on them personally.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a caring spiritual friend who offers gentle, personalized guidance. Your messages are brief, warm, and actionable.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
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