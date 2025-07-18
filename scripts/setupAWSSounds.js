#!/usr/bin/env node

/**
 * AWS S3 Ambient Sounds Setup Helper
 * Helps configure remote sound hosting on AWS S3
 */

const fs = require('fs');
const path = require('path');

const AMBIENT_SOUNDS_FILE = path.join(__dirname, '..', 'utils', 'ambientSounds.ts');

console.log('🔧 AWS S3 AMBIENT SOUNDS SETUP');
console.log('===============================\n');

console.log('📋 STEP 1: Create S3 Bucket');
console.log('1. Go to AWS S3 Console: https://s3.console.aws.amazon.com/');
console.log('2. Create a new bucket (e.g., "your-app-ambient-sounds")');
console.log('3. Enable public read access for the bucket');
console.log('4. Configure CORS policy for mobile app access\n');

console.log('📄 CORS Configuration (add this to your S3 bucket):');
console.log(`[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]`);

console.log('\n📋 STEP 2: Upload Sound Files');
console.log('Upload these files to your S3 bucket:');

const soundFiles = [
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

soundFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

console.log('\n📋 STEP 3: Update Configuration');
console.log('After uploading, run this script with your bucket URL:');
console.log('node scripts/setupAWSSounds.js configure https://your-bucket-name.s3.amazonaws.com/');

// Check if configure command was provided
if (process.argv[2] === 'configure' && process.argv[3]) {
  const bucketUrl = process.argv[3];
  console.log(`\n🔧 Configuring ambient sounds to use: ${bucketUrl}`);
  
  try {
    // Read the current file
    let fileContent = fs.readFileSync(AMBIENT_SOUNDS_FILE, 'utf8');
    
    // Update the remoteBaseUrl
    const oldBaseUrl = /remoteBaseUrl: '[^']*'/;
    const newBaseUrl = `remoteBaseUrl: '${bucketUrl.endsWith('/') ? bucketUrl : bucketUrl + '/'}ambient-sounds/'`;
    
    if (oldBaseUrl.test(fileContent)) {
      fileContent = fileContent.replace(oldBaseUrl, newBaseUrl);
      
      // Enable remote files
      fileContent = fileContent.replace(
        /useRemoteFiles: false/g,
        'useRemoteFiles: true'
      );
      
      // Write back to file
      fs.writeFileSync(AMBIENT_SOUNDS_FILE, fileContent);
      
      console.log('✅ Configuration updated successfully!');
      console.log('✅ Remote sound loading enabled');
      console.log('\n📱 Test your sounds in the app:');
      console.log('Settings → Experience → Ambient Sounds');
      
    } else {
      console.error('❌ Could not find remoteBaseUrl in the file');
    }
    
  } catch (error) {
    console.error('❌ Error updating configuration:', error.message);
  }
} else {
  console.log('\n💡 ALTERNATIVE: Use Any CDN');
  console.log('You can also use:');
  console.log('• Cloudflare R2 (compatible with S3)');
  console.log('• DigitalOcean Spaces');
  console.log('• Google Cloud Storage'); 
  console.log('• Any public file hosting service\n');
  
  console.log('🎯 QUICK TEST: Use GitHub');
  console.log('For testing, you can even host files on GitHub:');
  console.log('1. Create a public repo');
  console.log('2. Upload sound files to a folder');
  console.log('3. Use raw.githubusercontent.com URLs');
  console.log('4. Run: node scripts/setupAWSSounds.js configure https://raw.githubusercontent.com/yourusername/yourrepo/main/');
} 