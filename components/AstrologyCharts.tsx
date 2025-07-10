import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { AstrologicalPlacements, getElementColor, getSignEmoji } from '@/utils/astrology';

const screenWidth = Dimensions.get('window').width;

interface AstrologyChartsProps {
  placements: AstrologicalPlacements;
}

export function AstrologyCharts({ placements }: AstrologyChartsProps) {
  const chartConfig = {
    backgroundColor: '#1a1a2e',
    backgroundGradientFrom: '#16213e',
    backgroundGradientTo: '#0f3460',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  // Prepare element distribution data
  const elementData = [
    {
      name: 'Fire',
      population: placements.chartData.elementDistribution.fire,
      color: '#FF6B6B',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    },
    {
      name: 'Earth',
      population: placements.chartData.elementDistribution.earth,
      color: '#4ECDC4',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    },
    {
      name: 'Air',
      population: placements.chartData.elementDistribution.air,
      color: '#45B7D1',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    },
    {
      name: 'Water',
      population: placements.chartData.elementDistribution.water,
      color: '#96CEB4',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  // Prepare modality distribution data
  const modalityData = [
    {
      name: 'Cardinal',
      population: placements.chartData.modalityDistribution.cardinal,
      color: '#FFD93D',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    },
    {
      name: 'Fixed',
      population: placements.chartData.modalityDistribution.fixed,
      color: '#6BCF7F',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    },
    {
      name: 'Mutable',
      population: placements.chartData.modalityDistribution.mutable,
      color: '#4D96FF',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  // Prepare house distribution data
  const houseData = {
    labels: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'],
    datasets: [
      {
        data: placements.chartData.houseDistribution,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Prepare aspect patterns data
  const aspectData = {
    labels: ['Conj.', 'Trine', 'Square', 'Opp.', 'Sextile'],
    datasets: [
      {
        data: [
          placements.chartData.aspectPatterns.conjunction,
          placements.chartData.aspectPatterns.trine,
          placements.chartData.aspectPatterns.square,
          placements.chartData.aspectPatterns.opposition,
          placements.chartData.aspectPatterns.sextile,
        ],
      },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Placements Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Your Cosmic Signature</Text>
        <View style={styles.placementsGrid}>
          <View style={styles.placementCard}>
            <Text style={styles.placementEmoji}>{getSignEmoji(placements.sun.sign)}</Text>
            <Text style={styles.placementLabel}>Sun</Text>
            <Text style={styles.placementSign}>{placements.sun.sign}</Text>
            <Text style={styles.placementHouse}>{placements.sun.house} House</Text>
          </View>
          
          <View style={styles.placementCard}>
            <Text style={styles.placementEmoji}>{getSignEmoji(placements.moon.sign)}</Text>
            <Text style={styles.placementLabel}>Moon</Text>
            <Text style={styles.placementSign}>{placements.moon.sign}</Text>
            <Text style={styles.placementHouse}>{placements.moon.house} House</Text>
          </View>
          
          <View style={styles.placementCard}>
            <Text style={styles.placementEmoji}>{getSignEmoji(placements.rising.sign)}</Text>
            <Text style={styles.placementLabel}>Rising</Text>
            <Text style={styles.placementSign}>{placements.rising.sign}</Text>
            <Text style={styles.placementHouse}>{placements.rising.house} House</Text>
          </View>
          
          <View style={styles.placementCard}>
            <Text style={styles.placementEmoji}>{getSignEmoji(placements.northNode.sign)}</Text>
            <Text style={styles.placementLabel}>North Node</Text>
            <Text style={styles.placementSign}>{placements.northNode.sign}</Text>
            <Text style={styles.placementHouse}>{placements.northNode.house} House</Text>
          </View>
        </View>
      </View>

      {/* Element Distribution Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Elemental Balance</Text>
        <Text style={styles.sectionDescription}>
          Your cosmic energy distribution across the four elements
        </Text>
        {elementData.length > 0 && (
          <PieChart
            data={elementData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
          />
        )}
      </View>

      {/* Modality Distribution Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Energy Patterns</Text>
        <Text style={styles.sectionDescription}>
          How you initiate, sustain, and adapt to change
        </Text>
        {modalityData.length > 0 && (
          <PieChart
            data={modalityData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
          />
        )}
      </View>

      {/* House Distribution Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Life Areas Focus</Text>
        <Text style={styles.sectionDescription}>
          Where your planetary energies are concentrated
        </Text>
        <BarChart
          data={houseData}
          width={screenWidth - 48}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars
        />
      </View>

      {/* Aspect Patterns Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌟 Planetary Relationships</Text>
        <Text style={styles.sectionDescription}>
          The geometric patterns between your planets
        </Text>
        <BarChart
          data={aspectData}
          width={screenWidth - 48}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars
        />
      </View>

      {/* Planetary Placements List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🪐 Planetary Positions</Text>
        <View style={styles.planetsList}>
          {Object.entries(placements.planets).map(([planet, placement]) => (
            <View key={planet} style={styles.planetRow}>
              <Text style={styles.planetEmoji}>{getSignEmoji(placement.sign)}</Text>
              <View style={styles.planetInfo}>
                <Text style={styles.planetName}>{planet}</Text>
                <Text style={styles.planetDetails}>
                  {placement.sign} • {placement.house} House • {placement.degree.toFixed(0)}°
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  placementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  placementCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  placementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  placementLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  placementSign: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    marginBottom: 2,
  },
  placementHouse: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  planetsList: {
    gap: 12,
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  planetEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  planetInfo: {
    flex: 1,
  },
  planetName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  planetDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});