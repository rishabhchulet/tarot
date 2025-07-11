import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { getAICompatibilityReport, CompatibilityReportRequest } from '@/utils/ai';
import { ScoreGauge } from '@/components/ScoreGauge';
import { StatsList, Stat } from '@/components/StatsList';
import { BirthProfile } from '@/components/BirthProfileInput';

interface ReportData {
  score: number;
  title: string;
  summary: string;
  stats: Stat[];
}

export default function CompatibilityResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const personA = JSON.parse(params.personA as string) as BirthProfile;
        const personB = JSON.parse(params.personB as string) as BirthProfile;
        const reportType = params.reportType as CompatibilityReportRequest['reportType'];

        const { report: apiReport, error: apiError } = await getAICompatibilityReport({
          personA,
          personB,
          reportType,
        });

        if (apiError) {
          throw new Error(apiError);
        }
        
        // Basic validation of the report structure
        if (apiReport && typeof apiReport.score === 'number' && apiReport.stats) {
            setReport(apiReport);
        } else {
            throw new Error("Received an invalid report format from the server.");
        }

      } catch (e: any) {
        setError(e.message || 'An unknown error occurred while generating the report.');
        console.error('Error fetching compatibility report:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#c7d2fe" />
          <Text style={styles.loadingText}>Consulting the stars for your connection...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <AlertCircle size={48} color="#fda4af" />
          <Text style={styles.errorTitle}>Unable to Generate Report</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => router.back()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Go Back & Try Again</Text>
          </Pressable>
        </View>
      );
    }

    if (report) {
      return (
        <>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <ScoreGauge score={report.score} />
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{report.summary}</Text>
          </View>
          <StatsList stats={report.stats} />
        </>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1e293b', '#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} disabled={loading}>
          <ChevronLeft size={28} color="#f8fafc" />
        </Pressable>
        <Text style={styles.title}>Compatibility Report</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: { padding: 4 },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#c7d2fe',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
  errorTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: '#fecaca',
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
  },
  errorText: {
    color: '#e5e7eb',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
      backgroundColor: '#374151',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 999,
  },
  retryButtonText: {
      color: '#f9fafb',
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
  },
  reportTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#e0e7ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  summaryContainer: {
    marginVertical: 24,
  },
  summaryText: {
    color: '#d1d5db',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  }
}); 