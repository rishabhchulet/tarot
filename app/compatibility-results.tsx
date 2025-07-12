import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, AlertCircle, Heart, Sparkles } from 'lucide-react-native';
import { getAICompatibilityReport, CompatibilityReportRequest } from '@/utils/ai';
import { ScoreGauge } from '@/components/ScoreGauge';
import { StatsList, Stat } from '@/components/StatsList';
import { BirthProfile } from '@/components/BirthProfileInput';
import { PlanetaryLoadingAnimation } from '@/components/PlanetaryLoadingAnimation';

interface ReportData {
  score: number;
  title: string;
  summary: string;
  stats: Stat[];
  personAName: string;
  personBName: string;
  reportType: string;
}

export default function CompatibilityResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache the report to prevent reloading
  const reportCacheRef = useRef<string>('');
  const cachedReportRef = useRef<ReportData | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const personA = JSON.parse(params.personA as string) as BirthProfile;
        const personB = JSON.parse(params.personB as string) as BirthProfile;
        const reportType = params.reportType as CompatibilityReportRequest['reportType'];

        // Convert string dates back to Date objects if needed
        const processedPersonA: BirthProfile = {
          ...personA,
          date: personA.date ? new Date(personA.date) : null,
          time: personA.time ? new Date(personA.time) : null,
        };

        const processedPersonB: BirthProfile = {
          ...personB,
          date: personB.date ? new Date(personB.date) : null,
          time: personB.time ? new Date(personB.time) : null,
        };

        // Create a safer cache key from the parameters
        const getDateKey = (date: Date | null) => date ? date.getTime().toString() : 'null';
        const cacheKey = `${processedPersonA.name}-${getDateKey(processedPersonA.date)}-${processedPersonB.name}-${getDateKey(processedPersonB.date)}-${reportType}`;
        
        // Check if we already have this report cached
        if (reportCacheRef.current === cacheKey && cachedReportRef.current) {
          setReport(cachedReportRef.current);
          setLoading(false);
          return;
        }

        const { report: apiReport, error: apiError } = await getAICompatibilityReport({
          personA: processedPersonA,
          personB: processedPersonB,
          reportType,
        });

        if (apiError) {
          throw new Error(apiError);
        }
        
        // Basic validation of the report structure
        if (apiReport && typeof apiReport.score === 'number' && apiReport.stats) {
          const enhancedReport: ReportData = {
            ...apiReport,
            personAName: processedPersonA.name || 'Person A',
            personBName: processedPersonB.name || 'Person B',
            reportType,
          };
          
          // Cache the report
          reportCacheRef.current = cacheKey;
          cachedReportRef.current = enhancedReport;
          
          setReport(enhancedReport);
        } else {
          throw new Error("Received an invalid report format from the server.");
        }

      } catch (e: any) {
        console.error('Error fetching compatibility report:', e);
        setError(e.message || 'An unknown error occurred while generating the report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params]);

  const renderContent = () => {
    if (loading) {
      return (
        <PlanetaryLoadingAnimation 
          message="Consulting the stars for your connection..."
          submessage="Weaving cosmic insights for your souls"
          showFloatingStars={true}
        />
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#fda4af" />
            <Text style={styles.errorTitle}>Unable to Generate Report</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => router.back()} style={styles.retryButton}>
              <LinearGradient
                colors={['#374151', '#4b5563']}
                style={styles.retryButtonGradient}
              >
                <Text style={styles.retryButtonText}>Go Back & Try Again</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      );
    }

    if (report) {
      return (
        <>
          {/* Names Header */}
          <View style={styles.namesHeader}>
            <Text style={styles.personName}>{report.personAName}</Text>
            <Heart size={20} color="#f87171" />
            <Text style={styles.personName}>{report.personBName}</Text>
          </View>
          
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportType}>{report.reportType} Compatibility</Text>
          
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Enhanced Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} disabled={loading}>
          <ChevronLeft size={28} color="#F9FAFB" />
        </Pressable>
        <Text style={styles.title}>Compatibility Report</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: { 
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  spinner: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 24,
    color: '#c7d2fe',
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
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
    borderRadius: 12,
  },
  retryButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#f9fafb',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  namesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  personName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#c084fc',
  },
  reportTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 4,
  },
  reportType: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#a78bfa',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryContainer: {
    marginVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryText: {
    color: '#d1d5db',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  }
}); 