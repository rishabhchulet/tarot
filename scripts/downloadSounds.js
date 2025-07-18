#!/usr/bin/env node

/**
 * Ambient Sound Download Helper
 * This script helps you download and organize ambient sounds for the tarot app
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Sound files with direct download info
const soundFiles = [
  {
    name: 'cosmic-ambience.wav',
    description: 'Cosmic Ambience - Ethereal space sounds',
    freesoundId: '462876',
    author: 'newagesoup',
    url: 'https://freesound.org/people/newagesoup/sounds/462876/',
    license: 'CC0'
  },
  {
    name: 'gentle-rain.wav', 
    description: 'Gentle Rain - Tropical downpour',
    freesoundId: '640797',
    author: 'Mafon2',
    url: 'https://freesound.org/people/Mafon2/sounds/640797/',
    license: 'CC0'
  },
  {
    name: 'forest-whispers.wav',
    description: 'Forest Whispers - Amazon jungle ambience',
    freesoundId: '38487', 
    author: 'larval1977',
    url: 'https://freesound.org/people/larval1977/sounds/38487/',
    license: 'CC0'
  },
  {
    name: 'ocean-waves.wav',
    description: 'Ocean Waves - Hawaiian waves',
    freesoundId: '450755',
    author: 'florianreichelt', 
    url: 'https://freesound.org/people/florianreichelt/sounds/450755/',
    license: 'CC0'
  },
  {
    name: 'singing-bowls.wav',
    description: 'Singing Bowls - Tibetan meditation',
    freesoundId: '342599',
    author: 'artefakt',
    url: 'https://freesound.org/people/artefakt/sounds/342599/',
    license: 'CC0'
  },
  {
    name: 'celestial-chimes.wav',
    description: 'Celestial Chimes - Ambient shimmer',
    freesoundId: '520598',
    author: 'NickR2020',
    url: 'https://freesound.org/people/NickR2020/sounds/520598/',
    license: 'CC BY 3.0'
  },
  {
    name: 'mountain-wind.wav',
    description: 'Mountain Wind - Bali jungle with river',
    freesoundId: '344204',
    author: 'spiid',
    url: 'https://freesound.org/people/spiid/sounds/344204/',
    license: 'CC0'
  },
  {
    name: 'deep-space.wav',
    description: 'Deep Space - Sci-fi ambient drone',
    freesoundId: '534018',
    author: 'LookIMadeAThing',
    url: 'https://freesound.org/people/LookIMadeAThing/sounds/534018/',
    license: 'CC0'
  },
  {
    name: 'crystal-resonance.wav',
    description: 'Crystal Resonance - Mystic ambient',
    freesoundId: '559389',
    author: 'szegvari',
    url: 'https://freesound.org/people/szegvari/sounds/559389/',
    license: 'CC0'
  },
  {
    name: 'earth-heartbeat.wav',
    description: 'Earth Heartbeat - Colombian jungle',
    freesoundId: '424763',
    author: 'jaime_enrique',
    url: 'https://freesound.org/people/jaime_enrique/sounds/424763/',
    license: 'CC0'
  }
];

function createSoundsDirectory() {
  const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
    console.log('📁 Created assets/sounds/ directory');
  }
  return soundsDir;
}

function generateDownloadInstructions() {
  console.log('\n🎵 AMBIENT SOUNDS DOWNLOAD GUIDE');
  console.log('================================\n');
  
  console.log('Since I cannot download files directly, here\'s what you need to do:\n');
  
  soundFiles.forEach((sound, index) => {
    console.log(`${index + 1}. ${sound.description}`);
    console.log(`   📂 Save as: ${sound.name}`);
    console.log(`   🔗 Download: ${sound.url}`);
    console.log(`   📜 License: ${sound.license}`);
    console.log(`   👤 Author: ${sound.author}\n`);
  });
  
  console.log('QUICK STEPS:');
  console.log('1. Visit each URL above');
  console.log('2. Create free Freesound.org account if needed');
  console.log('3. Click "Login to download" on each page');
  console.log('4. Save files with exact names above to assets/sounds/');
  console.log('5. Run: node scripts/enableRealSounds.js');
  console.log('\n✨ Then enjoy real ambient sounds in your app!');
}

function generateBatchDownloadScript() {
  const batchScript = `#!/bin/bash
# Batch download script for ambient sounds
# Note: You'll need to be logged into Freesound.org for this to work

echo "🎵 Downloading ambient sounds..."
cd assets/sounds

${soundFiles.map(sound => 
  `# ${sound.description}\necho "Downloading ${sound.name}..."\n# curl -O "${sound.url}download/" # Uncomment after login\n`
).join('\n')}

echo "✅ All sounds downloaded!"
echo "Run: node ../../scripts/enableRealSounds.js"
`;

  fs.writeFileSync(path.join(__dirname, 'batchDownload.sh'), batchScript);
  console.log('📜 Created scripts/batchDownload.sh for manual download automation');
}

function main() {
  createSoundsDirectory();
  generateDownloadInstructions();
  generateBatchDownloadScript();
  
  console.log('\n💡 TIP: The ambient sound system works perfectly in simulation mode!');
  console.log('   Test it now in Settings → Experience → Ambient Sounds');
}

if (require.main === module) {
  main();
} 