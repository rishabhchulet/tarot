import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { 
  Path, 
  Ellipse, 
  Circle, 
  LinearGradient as SvgLinearGradient, 
  Defs, 
  Stop 
} from 'react-native-svg';

interface CustomEyeIconProps {
  size?: number;
  color?: string;
}

export function CustomEyeIcon({ size = 70, color = "#FFFFFF" }: CustomEyeIconProps) {
  const svgSize = size;
  const scaleFactor = size / 70; // Scale relative to default size
  
  return (
    <View style={[styles.container, { width: svgSize, height: svgSize }]}>
      <Svg width={svgSize} height={svgSize} viewBox="0 0 70 70">
        <Defs>
          {/* Iris gradient - mystical purple/blue */}
          <SvgLinearGradient id="irisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
            <Stop offset="50%" stopColor="#A855F7" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7C3AED" stopOpacity="1" />
          </SvgLinearGradient>
          
          {/* Pupil gradient */}
          <SvgLinearGradient id="pupilGradient" x1="30%" y1="30%" x2="70%" y2="70%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1F2937" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Eye shape (almond) - main eye outline */}
        <Path
          d="M 8 35 Q 35 15, 62 35 Q 35 55, 8 35 Z"
          fill={color}
          stroke={color}
          strokeWidth="1"
          opacity="0.9"
        />
        
        {/* Inner eye (slight shadow) */}
        <Path
          d="M 12 35 Q 35 18, 58 35 Q 35 52, 12 35 Z"
          fill="#F3F4F6"
          opacity="0.8"
        />
        
        {/* Iris - larger and more prominent */}
        <Circle
          cx="35"
          cy="35"
          r="12"
          fill="url(#irisGradient)"
        />
        
        {/* Pupil */}
        <Circle
          cx="35"
          cy="35"
          r="6"
          fill="url(#pupilGradient)"
        />
        
        {/* Light reflection - makes it look alive */}
        <Circle
          cx="32"
          cy="32"
          r="2"
          fill={color}
          opacity="0.85"
        />
        
        {/* Small highlight dot */}
        <Circle
          cx="37"
          cy="33"
          r="0.8"
          fill={color}
          opacity="0.6"
        />
        
        {/* Upper eyelid detail */}
        <Path
          d="M 15 28 Q 35 22, 55 28"
          stroke={color}
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />
        
        {/* Lower eyelid detail */}
        <Path
          d="M 18 42 Q 35 46, 52 42"
          stroke={color}
          strokeWidth="0.6"
          fill="none"
          opacity="0.3"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 