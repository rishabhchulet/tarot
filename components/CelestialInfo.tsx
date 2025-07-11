import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';

// Function to calculate moon phase
const getMoonPhase = () => {
  const LUNAR_CYCLE = 29.530588853;
  const getJulianDate = (date = new Date()) => {
    const time = date.getTime();
    const tzoffset = date.getTimezoneOffset();
    return time / 86400000 - tzoffset / 1440 + 2440587.5;
  };
  const j = getJulianDate();
  const e = 360 * ((j - 2451550.1) / 365.25);
  const m = 360 * ((j - 2451550.1) / LUNAR_CYCLE);
  const p = (m - e + 180) % 360;

  if (p < 22.5) return { name: 'New Moon', phase: 0 };
  if (p < 67.5) return { name: 'Waxing Crescent', phase: 0.25 };
  if (p < 112.5) return { name: 'First Quarter', phase: 0.5 };
  if (p < 157.5) return { name: 'Waxing Gibbous', phase: 0.75 };
  if (p < 202.5) return { name: 'Full Moon', phase: 1 };
  if (p < 247.5) return { name: 'Waning Gibbous', phase: 0.75 };
  if (p < 292.5) return { name: 'Last Quarter', phase: 0.5 };
  if (p < 337.5) return { name: 'Waning Crescent', phase: 0.25 };
  return { name: 'New Moon', phase: 0 };
};

const MoonIcon = ({ phase, size = 24 }) => {
  const d = size;
  const r = size / 2;

  let path;
  if (phase === 0) { // New Moon
    path = `M ${r},0 A ${r},${r} 0 1,0 ${r},${d} A ${r},${r} 0 1,0 ${r},0 Z`;
  } else if (phase === 1) { // Full Moon
    return <Circle cx={r} cy={r} r={r} fill="#f9fafb" />;
  } else if (phase < 0.5) { // Waxing
    const x = r * (1 - phase * 2);
    path = `M ${r},0 A ${r},${r} 0 1,1 ${r},${d} A ${x},${r} 0 1,0 ${r},0 Z`;
  } else { // Waning
    const x = r * ((phase - 0.5) * 2);
    path = `M ${r},0 A ${r},${r} 0 1,0 ${r},${d} A ${x},${r} 0 1,1 ${r},0 Z`;
  }

  return (
    <Svg width={size} height={size}>
      <Circle cx={r} cy={r} r={r} fill="#4b5563" />
      <Path d={path} fill="#f9fafb" />
    </Svg>
  );
};

export function CelestialInfo() {
  const [moonPhase, setMoonPhase] = useState({ name: 'Calculating...', phase: 0 });

  useEffect(() => {
    setMoonPhase(getMoonPhase());
  }, []);

  return (
    <View style={styles.container}>
      <MoonIcon phase={moonPhase.phase} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Today's Moon</Text>
        <Text style={styles.phaseName}>{moonPhase.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textContainer: {
    marginLeft: 16,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#d1d5db',
  },
  phaseName: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 22,
    color: '#f9fafb',
    marginTop: -2,
  },
}); 