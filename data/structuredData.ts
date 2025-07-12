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
    // The hexagram number field contains the full name like "26 – Taming the Power of the Great"
    const fullNameFromData = hexagram.number.toString().toLowerCase().trim();
    
    // Try exact match first (for full names like "26 – Taming the Power of the Great")
    if (fullNameFromData === normalizedName) {
      return true;
    }
    
    // Try matching just the name part after the dash (for names like "Taming the Power of the Great")
    const namePartFromData = fullNameFromData.split('–')[1]?.trim();
    if (namePartFromData && namePartFromData === normalizedName) {
      return true;
    }
    
    // Try partial matching for flexibility
    if (fullNameFromData.includes(normalizedName) || normalizedName.includes(fullNameFromData)) {
      return true;
    }
    
    return false;
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
  
  // Test the problematic hexagram lookup
  const testHexagram = getHexagramByName('26 – Taming the Power of the Great');
  console.log('🔍 Testing hexagram lookup:');
  console.log(`   - Searching for: "26 – Taming the Power of the Great"`);
  console.log(`   - Found: ${testHexagram ? 'YES' : 'NO'}`);
  if (testHexagram) {
    console.log(`   - Result: ${testHexagram.number} - ${testHexagram.name}`);
  }
  
  // Test alternative name format
  const testHexagram2 = getHexagramByName('Taming the Power of the Great');
  console.log(`   - Searching for: "Taming the Power of the Great"`);
  console.log(`   - Found: ${testHexagram2 ? 'YES' : 'NO'}`);
  if (testHexagram2) {
    console.log(`   - Result: ${testHexagram2.number} - ${testHexagram2.name}`);
  }
}; 