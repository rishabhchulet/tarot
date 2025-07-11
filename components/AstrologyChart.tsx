import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import { useAuth } from '@/contexts/AuthContext';
import { ZODIAC_DATA } from '@/utils/astrology';

// We need to get the content of astrochart.js as a string to inject it.
// This is a placeholder. In a real scenario, we might use a build script
// or a library like `react-native-fs` if the file is bundled.
// For now, let's assume we can get it as a string.
// I will read the file and paste its content here later.
const astrochartLib = require('@/lib/astrochart/astrochart.js');

const mapPlacementsToAstroData = (placements) => {
  if (!placements) {
    return null;
  }

  const planets = {};
  const allPlacements = {
    Sun: placements.sun,
    Moon: placements.moon,
    Mercury: placements.planets.Mercury,
    Venus: placements.planets.Venus,
    Mars: placements.planets.Mars,
    Jupiter: placements.planets.Jupiter,
    Saturn: placements.planets.Saturn,
    Uranus: placements.planets.Uranus,
    Neptune: placements.planets.Neptune,
    Pluto: placements.planets.Pluto,
    Chiron: placements.planets.Chiron,
    Lilith: placements.planets.Lilith,
    NNode: placements.northNode,
  };

  for (const [name, placement] of Object.entries(allPlacements)) {
    if (placement) {
      const signDegree = ZODIAC_DATA[placement.sign]?.degree || 0;
      const absoluteDegree = signDegree + placement.degree;
      // Retrograde is not available in the simplified data, so we'll assume direct motion.
      planets[name] = [absoluteDegree];
    }
  }

  // Generate mock cusps based on Rising sign (Equal House system)
  const cusps = [];
  if (placements.rising) {
    const risingSignDegree = ZODIAC_DATA[placements.rising.sign]?.degree || 0;
    let ascendantDegree = risingSignDegree + placements.rising.degree;
    for (let i = 0; i < 12; i++) {
      cusps.push((ascendantDegree + i * 30) % 360);
    }
  } else {
    // Fallback if rising sign is not available
    for (let i = 0; i < 12; i++) {
      cusps.push(i * 30);
    }
  }
  
  return {
    planets,
    cusps,
  };
};

export function AstrologyChart() {
  const { placements } = useAuth();
  const [svgString, setSvgString] = useState(null);
  const webviewRef = useRef(null);

  const astroData = mapPlacementsToAstroData(placements);

  if (!astroData) {
    return null;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html { margin: 0; padding: 0; overflow: hidden; }
        #chart { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="chart"></div>
      <script>
        // Injected astrochart.js content will be here.
      </script>
      <script>
        try {
          const data = ${JSON.stringify(astroData)};
          const chart = new window.astrochart.Chart('chart', 400, 400);
          chart.radix(data);
          const svg = document.getElementById('chart').innerHTML;
          window.ReactNativeWebView.postMessage(svg);
        } catch (e) {
          window.ReactNativeWebView.postMessage('Error: ' + e.message);
        }
      </script>
    </body>
    </html>
  `;
  
  // This is a hack for now. The library needs to be injected.
  const finalHtml = htmlContent.replace('<script>\\n        // Injected astrochart.js content will be here.\\n      </script>', `<script>${astrochartLib}</script>`);


  const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message.startsWith('Error:')) {
      console.error('Error from WebView:', message);
    } else {
      setSvgString(message);
    }
  };

  return (
    <View style={styles.container}>
      {svgString ? (
        <SvgXml xml={svgString} width="100%" height="100%" />
      ) : (
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: finalHtml }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}); 