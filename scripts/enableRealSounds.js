#!/usr/bin/env node

/**
 * Enable Real Ambient Sounds Script
 * Automatically enables real audio files in the ambient sound system
 */

const fs = require('fs');
const path = require('path');

const AMBIENT_SOUNDS_FILE = path.join(__dirname, '..', 'utils', 'ambientSounds.ts');
const SOUNDS_DIR = path.join(__dirname, '..', 'assets', 'sounds');

const expectedFiles = [
  'cosmic-ambience.wav',
  'gentle-rain.wav', 
  'forest-whispers.wav',
  'ocean-waves.wav',
  'singing-bowls.wav',
  'celestial-chimes.wav',
  'mountain-wind.wav',
  'deep-space.wav',
  'crystal-resonance.wav',
  'earth-heartbeat.wav'
];

function checkSoundFiles() {
  console.log('🔍 Checking for sound files...\n');
  
  const missingFiles = [];
  const foundFiles = [];
  
  expectedFiles.forEach(file => {
    const filePath = path.join(SOUNDS_DIR, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 1000) { // More than 1KB (not just placeholder)
        foundFiles.push(file);
        console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
      } else {
        missingFiles.push(file);
        console.log(`⚠️  ${file} (placeholder file, needs real audio)`);
      }
    } else {
      missingFiles.push(file);
      console.log(`❌ ${file} (missing)`);
    }
  });
  
  console.log(`\n📊 Found: ${foundFiles.length}/${expectedFiles.length} real audio files`);
  
  return { foundFiles, missingFiles };
}

function enableRealSounds(foundFiles) {
  if (foundFiles.length === 0) {
    console.log('\n⚠️  No real audio files found. Cannot enable real sounds.');
    console.log('   Download audio files first using: node scripts/downloadSounds.js');
    return false;
  }
  
  console.log('\n🔧 Enabling real sounds in ambientSounds.ts...');
  
  try {
    let content = fs.readFileSync(AMBIENT_SOUNDS_FILE, 'utf8');
    
    // Replace the null sound mapping with actual requires
    const nullMapping = /const SOUND_FILES: Record<AmbientSoundType, any> = \{[^}]+\};/s;
    
    const requireMapping = `const SOUND_FILES: Record<AmbientSoundType, any> = {
  'cosmic-ambience': ${foundFiles.includes('cosmic-ambience.wav') ? "require('../assets/sounds/cosmic-ambience.wav')" : 'null'},
  'gentle-rain': ${foundFiles.includes('gentle-rain.wav') ? "require('../assets/sounds/gentle-rain.wav')" : 'null'},
  'forest-whispers': ${foundFiles.includes('forest-whispers.wav') ? "require('../assets/sounds/forest-whispers.wav')" : 'null'},
  'ocean-waves': ${foundFiles.includes('ocean-waves.wav') ? "require('../assets/sounds/ocean-waves.wav')" : 'null'},
  'singing-bowls': ${foundFiles.includes('singing-bowls.wav') ? "require('../assets/sounds/singing-bowls.wav')" : 'null'},
  'celestial-chimes': ${foundFiles.includes('celestial-chimes.wav') ? "require('../assets/sounds/celestial-chimes.wav')" : 'null'},
  'mountain-wind': ${foundFiles.includes('mountain-wind.wav') ? "require('../assets/sounds/mountain-wind.wav')" : 'null'},
  'deep-space': ${foundFiles.includes('deep-space.wav') ? "require('../assets/sounds/deep-space.wav')" : 'null'},
  'crystal-resonance': ${foundFiles.includes('crystal-resonance.wav') ? "require('../assets/sounds/crystal-resonance.wav')" : 'null'},
  'earth-heartbeat': ${foundFiles.includes('earth-heartbeat.wav') ? "require('../assets/sounds/earth-heartbeat.wav')" : 'null'},
};`;
    
    content = content.replace(nullMapping, requireMapping);
    
    // Remove the commented-out section since we're now using the real mapping
    const commentedSection = /\/\/ Future: When you add actual sound files, uncomment these lines:[\s\S]*?\/\/ \};/;
    content = content.replace(commentedSection, '');
    
    fs.writeFileSync(AMBIENT_SOUNDS_FILE, content);
    
    console.log(`✅ Enabled ${foundFiles.length} real sound files in ambientSounds.ts`);
    console.log('\n🔄 Restart your Expo dev server to apply changes:');
    console.log('   npx expo start');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating ambientSounds.ts:', error.message);
    return false;
  }
}

function generateUsageInstructions(foundFiles, missingFiles) {
  console.log('\n📱 USAGE INSTRUCTIONS');
  console.log('====================');
  
  if (foundFiles.length > 0) {
    console.log(`\n✨ ${foundFiles.length} ambient sounds are now active!`);
    console.log('Test them in your app:');
    console.log('• Settings → Experience → Ambient Sounds');
    console.log('• Tap any sound to preview');
    console.log('• Adjust volume and enable screen-specific sounds');
  }
  
  if (missingFiles.length > 0) {
    console.log(`\n⏳ ${missingFiles.length} sounds still need to be downloaded:`);
    missingFiles.forEach(file => console.log(`   • ${file}`));
    console.log('\nRun this script again after downloading more files.');
  }
}

function main() {
  console.log('🎵 AMBIENT SOUNDS ENABLER');
  console.log('=========================\n');
  
  const { foundFiles, missingFiles } = checkSoundFiles();
  
  if (enableRealSounds(foundFiles)) {
    generateUsageInstructions(foundFiles, missingFiles);
  } else {
    console.log('\n💡 TIP: The ambient sound system still works in simulation mode!');
    console.log('   You can test all features even without real audio files.');
  }
}

if (require.main === module) {
  main();
} 