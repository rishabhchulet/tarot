import React from 'react';
import { View } from 'react-native';
import { Svg, Circle, G, Path, Polygon } from 'react-native-svg';

interface MandalaIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function MandalaIcon({ size = 80, color = "#FFFFFF", strokeWidth = 1.5 }: MandalaIconProps) {
  const center = size / 2;
  const radius1 = size * 0.4;
  const radius2 = size * 0.3;
  const radius3 = size * 0.2;
  const radius4 = size * 0.1;

  // Generate points for sacred geometry patterns
  const generateStarPoints = (numPoints: number, outerRadius: number, innerRadius: number) => {
    const points = [];
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / numPoints;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // Generate lotus petal paths
  const generateLotusPath = (petalCount: number, radius: number) => {
    const paths = [];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 2 * Math.PI) / petalCount;
      const x1 = center + radius * 0.3 * Math.cos(angle);
      const y1 = center + radius * 0.3 * Math.sin(angle);
      const x2 = center + radius * Math.cos(angle);
      const y2 = center + radius * Math.sin(angle);
      const x3 = center + radius * 0.3 * Math.cos(angle + Math.PI / petalCount);
      const y3 = center + radius * 0.3 * Math.sin(angle + Math.PI / petalCount);
      
      paths.push(
        `M ${x1} ${y1} Q ${x2} ${y2} ${x3} ${y3} Q ${center} ${center} ${x1} ${y1}`
      );
    }
    return paths;
  };

  const lotusPath = generateLotusPath(8, radius1);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer Ring with Sacred Geometry */}
        <Circle
          cx={center}
          cy={center}
          r={radius1}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.6}
        />
        
        {/* Eight-pointed Star (outer) */}
        <Polygon
          points={generateStarPoints(8, radius1 * 0.9, radius1 * 0.7)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.8}
        />

        {/* Lotus Petals */}
        {lotusPath.map((path, index) => (
          <Path
            key={`lotus-${index}`}
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 0.8}
            opacity={0.7}
          />
        ))}

        {/* Six-pointed Star (middle) */}
        <Polygon
          points={generateStarPoints(6, radius2 * 1.2, radius2 * 0.8)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.9}
        />

        {/* Middle Ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius2}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.8}
        />

        {/* Four-pointed Star (inner) */}
        <Polygon
          points={generateStarPoints(4, radius3 * 1.3, radius3 * 0.7)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={1}
        />

        {/* Inner Ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius3}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.9}
        />

        {/* Sacred Center Dot */}
        <Circle
          cx={center}
          cy={center}
          r={radius4}
          fill={color}
          opacity={1}
        />

        {/* Additional geometric elements for complexity */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * Math.PI) / 6;
          const x1 = center + radius3 * 0.5 * Math.cos(angle);
          const y1 = center + radius3 * 0.5 * Math.sin(angle);
          const x2 = center + radius2 * 0.9 * Math.cos(angle);
          const y2 = center + radius2 * 0.9 * Math.sin(angle);
          
          return (
            <Path
              key={`ray-${i}`}
              d={`M ${x1} ${y1} L ${x2} ${y2}`}
              stroke={color}
              strokeWidth={strokeWidth * 0.6}
              opacity={0.5}
            />
          );
        })}
      </Svg>
    </View>
  );
} 