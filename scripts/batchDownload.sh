#!/bin/bash
# Batch download script for ambient sounds
# Note: You'll need to be logged into Freesound.org for this to work

echo "🎵 Downloading ambient sounds..."
cd assets/sounds

# Cosmic Ambience - Ethereal space sounds
echo "Downloading cosmic-ambience.wav..."
# curl -O "https://freesound.org/people/newagesoup/sounds/462876/download/" # Uncomment after login

# Gentle Rain - Tropical downpour
echo "Downloading gentle-rain.wav..."
# curl -O "https://freesound.org/people/Mafon2/sounds/640797/download/" # Uncomment after login

# Forest Whispers - Amazon jungle ambience
echo "Downloading forest-whispers.wav..."
# curl -O "https://freesound.org/people/larval1977/sounds/38487/download/" # Uncomment after login

# Ocean Waves - Hawaiian waves
echo "Downloading ocean-waves.wav..."
# curl -O "https://freesound.org/people/florianreichelt/sounds/450755/download/" # Uncomment after login

# Singing Bowls - Tibetan meditation
echo "Downloading singing-bowls.wav..."
# curl -O "https://freesound.org/people/artefakt/sounds/342599/download/" # Uncomment after login

# Celestial Chimes - Ambient shimmer
echo "Downloading celestial-chimes.wav..."
# curl -O "https://freesound.org/people/NickR2020/sounds/520598/download/" # Uncomment after login

# Mountain Wind - Bali jungle with river
echo "Downloading mountain-wind.wav..."
# curl -O "https://freesound.org/people/spiid/sounds/344204/download/" # Uncomment after login

# Deep Space - Sci-fi ambient drone
echo "Downloading deep-space.wav..."
# curl -O "https://freesound.org/people/LookIMadeAThing/sounds/534018/download/" # Uncomment after login

# Crystal Resonance - Mystic ambient
echo "Downloading crystal-resonance.wav..."
# curl -O "https://freesound.org/people/szegvari/sounds/559389/download/" # Uncomment after login

# Earth Heartbeat - Colombian jungle
echo "Downloading earth-heartbeat.wav..."
# curl -O "https://freesound.org/people/jaime_enrique/sounds/424763/download/" # Uncomment after login


echo "✅ All sounds downloaded!"
echo "Run: node ../../scripts/enableRealSounds.js"
