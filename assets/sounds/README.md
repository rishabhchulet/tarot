# Ambient Sounds Configuration

This directory contains configuration for ambient sound files used throughout the app.

## 🌐 Remote Hosting (Recommended)

Instead of bundling 300MB+ of audio files with your app, host them remotely for better performance:

### Option 1: AWS S3 (Most Reliable)
```bash
# 1. Set up your S3 bucket and upload files
# 2. Configure the app to use your bucket
node scripts/setupAWSSounds.js configure https://your-bucket-name.s3.amazonaws.com/
```

### Option 2: GitHub (Free, Easy Testing)
```bash
# 1. Upload sound files to a public GitHub repo
# 2. Configure using raw.githubusercontent.com URLs
node scripts/setupAWSSounds.js configure https://raw.githubusercontent.com/yourusername/ambient-sounds/main/
```

### Option 3: Any CDN/File Host
```bash
# Works with any public file hosting service:
node scripts/setupAWSSounds.js configure https://your-cdn-domain.com/sounds/
```

## 📁 Required Files

The system expects these 10 audio files:

1. **cosmic-ambience.wav** - Ethereal space sounds
2. **gentle-rain.wav** - Tropical downpour
3. **forest-whispers.wav** - Amazon jungle ambience  
4. **ocean-waves.wav** - Hawaiian waves
5. **singing-bowls.wav** - Tibetan meditation
6. **celestial-chimes.wav** - Ambient shimmer
7. **mountain-wind.wav** - Bali jungle with river
8. **deep-space.wav** - Sci-fi ambient drone
9. **crystal-resonance.wav** - Mystic ambient
10. **earth-heartbeat.wav** - Colombian jungle

## 🔧 Configuration

Edit `utils/ambientSounds.ts` to customize:

```typescript
const SOUND_CONFIG = {
  useRemoteFiles: true, // false for local files
  remoteBaseUrl: 'https://your-domain.com/sounds/',
  enableCaching: false, // Optional performance improvement
};
```

## 🎵 Testing

The system works in simulation mode even without files:
- Go to **Settings → Experience → Ambient Sounds**
- Test volume controls and sound categories
- Real audio will play once files are hosted

## 📦 File Size Optimization

**Original files**: ~300MB total  
**With remote hosting**: ~0MB in app bundle  
**Benefits**: Faster app downloads, dynamic loading, easier updates 