// TypeScript interfaces based on your Excel column structure
export interface TarotCardData {
  cardNumber: string;
  name: string;
  languageModelSummary: string;
  exampleOutput: string; // For tone/style reference only
  spectrumInsight: string; // Optional reference
  empowered: string; // Used in upright reflection (randomized)
  neutral: string; // Used in both upright (randomized) and reversed
  distorted: string; // Used subtly when card is reversed
}

export interface IChingHexagramData {
  number: string | number;
  name: string;
  traditionalSymbols: string; // Include in I Ching reflection when helpful
  energeticTheme: string; // Anchor point for synthesis
  introspectivePrompt: string; // Inspiration for Reflection Prompt
  actionOrientedPrompt: string; // Secondary inspiration for Reflection Prompt
  interpretationParagraph: string; // Main source for I Ching reflection and synthesis
}

// The 4-part structured response from AI
export interface StructuredReflectionResponse {
  iChingReflection: string; // 1 sentence
  tarotReflection: string; // 1 sentence
  synthesis: string; // Short paragraph
  reflectionPrompt: string; // 1 sentence
}

// Import the JSON data
import tarotDataJson from './tarotData.json';
import iChingDataJson from './iChingData.json';

// Type the imported data
const tarotData: TarotCardData[] = tarotDataJson;
const iChingData: IChingHexagramData[] = iChingDataJson;

// Data access functions
export const getTarotCardByName = (name: string): TarotCardData | undefined => {
  const normalizedName = name.toLowerCase().trim();
  return tarotData.find(card => 
    card.name.toLowerCase().trim().includes(normalizedName)
  );
};

export const getHexagramByNumber = (number: number): IChingHexagramData | undefined => {
  return iChingData.find(hexagram => 
    parseInt(hexagram.number.toString()) === number
  );
};

export const getHexagramByName = (name: string): IChingHexagramData | undefined => {
  const normalizedName = name.toLowerCase().trim();

  return iChingData.find(hexagram => {
    // The simple name (e.g., "The Creative") is part of the "number" field in the JSON
    // Format is like "1 – The Creative"
    const nameFromData = hexagram.number.toString().toLowerCase().split('–')[1]?.trim();
    return nameFromData === normalizedName;
  });
};

export const getAllTarotCards = (): TarotCardData[] => {
  return tarotData;
};

export const getAllHexagrams = (): IChingHexagramData[] => {
  return iChingData;
};

// Utility function to get random tarot reflection based on card orientation
export const getTarotReflectionText = (card: TarotCardData, isReversed: boolean): string => {
  if (isReversed) {
    // For reversed: use Neutral with subtle influence from Distorted
    return card.neutral; // Could blend with distorted if needed
  } else {
    // For upright: randomly choose between Empowered or Neutral
    return Math.random() > 0.5 ? card.empowered : card.neutral;
  }
};

// Debug function to log available data
export const logDataSummary = () => {
  console.log('📊 Structured Data Summary:');
  console.log(`   - Tarot Cards: ${tarotData.length}`);
  console.log(`   - I Ching Hexagrams: ${iChingData.length}`);
  
  if (tarotData.length > 0) {
    console.log(`   - First Tarot Card: ${tarotData[0].name}`);
  }
  
  if (iChingData.length > 0) {
    console.log(`   - First Hexagram: ${iChingData[0].number}. ${iChingData[0].name}`);
  }
}; 