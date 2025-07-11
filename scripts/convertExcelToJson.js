const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// File paths
const TAROT_EXCEL_PATH = path.join(__dirname, '../assets/images/Tarot Data Sheet Updated.xlsx');
const ICHING_EXCEL_PATH = path.join(__dirname, '../assets/images/Danielle I ching.xlsx');
const OUTPUT_DIR = path.join(__dirname, '../data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function convertTarotData() {
  try {
    console.log('📖 Reading Tarot Excel file...');
    const workbook = XLSX.readFile(TAROT_EXCEL_PATH);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length < 2) {
      throw new Error('Tarot Excel file appears to be empty or malformed');
    }
    
    const headers = rawData[0];
    console.log('📋 Tarot headers found:', headers);
    
    // Process each row (skip header)
    const tarotCards = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue; // Skip empty rows
      
      const card = {
        cardNumber: row[0] || '',
        name: row[1] || '',
        languageModelSummary: row[2] || '',
        exampleOutput: row[3] || '',
        spectrumInsight: row[4] || '',
        empowered: row[5] || '',
        neutral: row[6] || '',
        distorted: row[7] || ''
      };
      
      // Only add cards with a name
      if (card.name && card.name.trim()) {
        tarotCards.push(card);
      }
    }
    
    console.log(`✅ Processed ${tarotCards.length} Tarot cards`);
    
    // Write to JSON file
    const outputPath = path.join(OUTPUT_DIR, 'tarotData.json');
    fs.writeFileSync(outputPath, JSON.stringify(tarotCards, null, 2));
    console.log(`💾 Tarot data saved to: ${outputPath}`);
    
    return tarotCards;
  } catch (error) {
    console.error('❌ Error converting Tarot data:', error);
    throw error;
  }
}

function convertIChingData() {
  try {
    console.log('📖 Reading I Ching Excel file...');
    const workbook = XLSX.readFile(ICHING_EXCEL_PATH);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length < 2) {
      throw new Error('I Ching Excel file appears to be empty or malformed');
    }
    
    const headers = rawData[0];
    console.log('📋 I Ching headers found:', headers);
    
    // Process each row (skip header)
    const hexagrams = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue; // Skip empty rows
      
      const hexagram = {
        number: row[0] || '',
        name: row[1] || '',
        traditionalSymbols: row[2] || '',
        energeticTheme: row[3] || '',
        introspectivePrompt: row[4] || '',
        actionOrientedPrompt: row[5] || '',
        interpretationParagraph: row[6] || ''
      };
      
      // Only add hexagrams with a name and number
      if (hexagram.name && hexagram.name.trim() && hexagram.number) {
        hexagrams.push(hexagram);
      }
    }
    
    console.log(`✅ Processed ${hexagrams.length} I Ching hexagrams`);
    
    // Write to JSON file
    const outputPath = path.join(OUTPUT_DIR, 'iChingData.json');
    fs.writeFileSync(outputPath, JSON.stringify(hexagrams, null, 2));
    console.log(`💾 I Ching data saved to: ${outputPath}`);
    
    return hexagrams;
  } catch (error) {
    console.error('❌ Error converting I Ching data:', error);
    throw error;
  }
}

// Main conversion function
function convertAllData() {
  console.log('🚀 Starting Excel to JSON conversion...\n');
  
  try {
    const tarotData = convertTarotData();
    console.log('');
    const iChingData = convertIChingData();
    
    console.log('\n🎉 Conversion completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Tarot Cards: ${tarotData.length}`);
    console.log(`   - I Ching Hexagrams: ${iChingData.length}`);
    
    return { tarotData, iChingData };
  } catch (error) {
    console.error('\n💥 Conversion failed:', error.message);
    process.exit(1);
  }
}

// Run the conversion if this script is executed directly
if (require.main === module) {
  convertAllData();
}

module.exports = { convertAllData, convertTarotData, convertIChingData }; 