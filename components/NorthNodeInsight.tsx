import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Compass } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/utils/ai';

export function NorthNodeInsight() {
  const { user, placements } = useAuth();
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      if (placements?.northNode && user) {
        setIsLoading(true);
        try {
          const baseUrl = getApiBaseUrl();
          const response = await fetch(`${baseUrl}/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'north-node-insight',
              data: {
                northNodeSign: placements.northNode.sign,
                northNodeHouse: placements.northNode.house,
                userName: user.name,
              },
            }),
          });
          const result = await response.json();
          if (response.ok) {
            setInsight(result.insight);
          } else {
            setInsight("Could not load insight at this time. Please try again later.");
          }
        } catch (error) {
          console.error("Error fetching North Node insight:", error);
          setInsight("There was an issue connecting to our insight generator.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInsight();
  }, [placements, user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Compass size={20} color="#BEF264" />
        <Text style={styles.headerText}>Your Soul's Compass: The North Node</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color="#BEF264" style={{ marginVertical: 20 }}/>
      ) : (
        <Text style={styles.insightText}>{insight}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 24,
    padding: 20,
    backgroundColor: 'rgba(190, 242, 100, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(190, 242, 100, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#D9F99D',
    marginLeft: 10,
  },
  insightText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
  },
}); 