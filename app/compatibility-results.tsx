import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, AlertCircle, Heart, Sparkles, Star } from 'lucide-react-native';
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
  insight?: string; // Added for new structure
}

export default function CompatibilityResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedPersonA, setProcessedPersonA] = useState<BirthProfile | null>(null);
  const [processedPersonB, setProcessedPersonB] = useState<BirthProfile | null>(null);
  
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
        const processedA: BirthProfile = {
          ...personA,
          date: personA.date ? new Date(personA.date) : null,
          time: personA.time ? new Date(personA.time) : null,
        };

        const processedB: BirthProfile = {
          ...personB,
          date: personB.date ? new Date(personB.date) : null,
          time: personB.time ? new Date(personB.time) : null,
        };

        // Store processed data for use in render
        setProcessedPersonA(processedA);
        setProcessedPersonB(processedB);

        // Create a safer cache key from the parameters
        const getDateKey = (date: Date | null) => date ? date.getTime().toString() : 'null';
        const cacheKey = `${processedA.name}-${getDateKey(processedA.date)}-${processedB.name}-${getDateKey(processedB.date)}-${reportType}`;
        
        // Check if we already have this report cached
        if (reportCacheRef.current === cacheKey && cachedReportRef.current) {
          setReport(cachedReportRef.current);
          setLoading(false);
          return;
        }

        const { report: apiReport, error: apiError } = await getAICompatibilityReport({
          personA: processedA,
          personB: processedB,
          reportType,
        });

        if (apiError) {
          throw new Error(apiError);
        }
        
        // Basic validation of the report structure
        if (apiReport && typeof apiReport.score === 'number' && apiReport.stats) {
          const enhancedReport: ReportData = {
            ...apiReport,
            personAName: processedA.name || 'Person A',
            personBName: processedB.name || 'Person B',
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

  const formatBirthInfo = (person: BirthProfile | null) => {
    if (!person?.date) return 'N/A';
    const month = person.date.toLocaleString('default', { month: 'numeric' });
    const day = person.date.toLocaleString('default', { day: 'numeric' });
    return `${month}/${day}`;
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Your cosmic connection is incredibly strong and harmonious. You share a deep, soulful bond.';
    if (score >= 60) return 'Your compatibility is solid, with a strong foundation for a lasting relationship.';
    if (score >= 40) return 'Your relationship has potential, but challenges may arise. Communication is key.';
    return 'Your compatibility is low, and you may face significant challenges in your relationship.';
  };

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
          {/* Enhanced Names Header with Animation */}
          <View style={styles.namesHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.personName}>{report.personAName}</Text>
              <Text style={styles.nameSubtext}>Born {formatBirthInfo(processedPersonA)}</Text>
            </View>
            <View style={styles.heartContainer}>
              <Heart size={24} color="#f87171" fill="#f87171" />
              <Sparkles size={16} color="#fbbf24" style={styles.sparkle} />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.personName}>{report.personBName}</Text>
              <Text style={styles.nameSubtext}>Born {formatBirthInfo(processedPersonB)}</Text>
            </View>
          </View>
          
          {/* Enhanced Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <View style={styles.reportTypeContainer}>
              <Text style={styles.reportType}>{report.reportType} Compatibility</Text>
              <View style={styles.reportTypeBadge}>
                <Text style={styles.reportTypeBadgeText}>Cosmic Analysis</Text>
              </View>
            </View>
          </View>
          
          {/* Enhanced Score Display */}
          <View style={styles.scoreSection}>
            <ScoreGauge score={report.score} />
            <View style={styles.scoreInsight}>
              <Text style={styles.scoreLabel}>Compatibility Score</Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(report.score)}
              </Text>
            </View>
          </View>
          
          {/* Enhanced Summary with Personal Touch */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <Sparkles size={18} color="#fbbf24" />
              <Text style={styles.summaryTitle}>Your Cosmic Story</Text>
            </View>
            <Text style={styles.summaryText}>{report.summary}</Text>
            {report.insight && (
              <View style={styles.insightContainer}>
                <Text style={styles.insightText}>{report.insight}</Text>
              </View>
            )}
          </View>
          
          {/* Enhanced Stats with Better Design */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Relationship Dynamics</Text>
            <StatsList stats={report.stats} />
          </View>

          {/* Additional Insights Section */}
          <View style={styles.additionalInsights}>
            <Text style={styles.insightsTitle}>Cosmic Guidance</Text>
            <View style={styles.guidanceCards}>
              <View style={styles.guidanceCard}>
                <Heart size={20} color="#f87171" />
                <Text style={styles.guidanceCardTitle}>Growth Together</Text>
                <Text style={styles.guidanceCardText}>
                  Your connection offers unique opportunities for mutual evolution and understanding.
                </Text>
              </View>
              <View style={styles.guidanceCard}>
                <Star size={20} color="#fbbf24" />
                <Text style={styles.guidanceCardTitle}>Celebrate Differences</Text>
                <Text style={styles.guidanceCardText}>
                  Your distinct energies create a beautiful tapestry of shared experiences.
                </Text>
              </View>
            </View>
          </View>
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
  nameContainer: {
    alignItems: 'center',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sparkle: {
    marginLeft: -8,
  },
  personName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#c084fc',
  },
  nameSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  titleSection: {
    marginBottom: 24,
  },
  reportTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 4,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportType: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#a78bfa',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reportTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reportTypeBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#fbbf24',
    textTransform: 'uppercase',
  },
  scoreSection: {
    marginBottom: 24,
  },
  scoreInsight: {
    alignItems: 'center',
    marginTop: 12,
  },
  scoreLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  scoreDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryContainer: {
    marginVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  summaryTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#F9FAFB',
  },
  summaryText: {
    color: '#d1d5db',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
  insightContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightText: {
    color: '#e5e7eb',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 16,
  },
  additionalInsights: {
    marginTop: 24,
  },
  insightsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 16,
  },
  guidanceCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  guidanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    width: '45%', // Adjust as needed for spacing
  },
  guidanceCardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#F9FAFB',
    textAlign: 'center',
    marginTop: 12,
  },
  guidanceCardText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
}); 