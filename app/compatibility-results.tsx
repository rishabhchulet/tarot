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
  const hasInitialized = useRef(false);

  // Extract stable values from params to avoid infinite loop
  const personAParam = params.personA as string;
  const personBParam = params.personB as string;
  const reportTypeParam = params.reportType as string;

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchReport = async () => {
      try {
        const personA = JSON.parse(personAParam) as BirthProfile;
        const personB = JSON.parse(personBParam) as BirthProfile;
        const reportType = reportTypeParam as CompatibilityReportRequest['reportType'];

        // Convert string dates back to Date objects if needed - with robust error handling
        const processedA: BirthProfile = {
          ...personA,
          date: personA.date ? (personA.date instanceof Date ? personA.date : new Date(personA.date)) : null,
          time: personA.time ? (personA.time instanceof Date ? personA.time : new Date(personA.time)) : null,
        };

        const processedB: BirthProfile = {
          ...personB,
          date: personB.date ? (personB.date instanceof Date ? personB.date : new Date(personB.date)) : null,
          time: personB.time ? (personB.time instanceof Date ? personB.time : new Date(personB.time)) : null,
        };

        // Store processed data for use in render
        setProcessedPersonA(processedA);
        setProcessedPersonB(processedB);

        // Create a safer cache key from the parameters
        const getDateKey = (date: Date | null) => {
          if (!date) return 'null';
          try {
            // Ensure it's a valid Date object and not Invalid Date
            const time = date instanceof Date && !isNaN(date.getTime()) ? date.getTime() : null;
            return time ? time.toString() : 'null';
          } catch (error) {
            console.warn('Error getting date key:', error);
            return 'null';
          }
        };
        
        const cacheKey = `${processedA.name || 'A'}-${getDateKey(processedA.date)}-${processedB.name || 'B'}-${getDateKey(processedB.date)}-${reportType}`;
        
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
  }, [personAParam, personBParam, reportTypeParam]); // Use stable string values instead of params object

  const formatBirthInfo = (person: BirthProfile | null) => {
    if (!person?.date) return 'N/A';
    
    try {
      // Ensure we have a valid Date object
      const date = person.date instanceof Date ? person.date : new Date(person.date);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      const month = date.toLocaleString('default', { month: 'numeric' });
      const day = date.toLocaleString('default', { day: 'numeric' });
      return `${month}/${day}`;
    } catch (error) {
      console.warn('Error formatting birth info:', error);
      return 'N/A';
    }
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
          {/* Enhanced Header */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#f8fafc" />
            </Pressable>
            <Text style={styles.headerTitle}>Compatibility Report</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Enhanced Names Header with Animation */}
          <View style={styles.namesHeader}>
            <View style={styles.nameContainer}>
              <Text 
                style={styles.personName}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {report.personAName}
              </Text>
              <Text style={styles.nameSubtext}>Born {formatBirthInfo(processedPersonA)}</Text>
            </View>
            <View style={styles.heartContainer}>
              <Heart size={28} color="#f87171" fill="#f87171" />
              <Sparkles size={18} color="#fbbf24" style={styles.sparkleIcon} />
            </View>
            <View style={styles.nameContainer}>
              <Text 
                style={styles.personName}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {report.personBName}
              </Text>
              <Text style={styles.nameSubtext}>Born {formatBirthInfo(processedPersonB)}</Text>
            </View>
          </View>
          
          {/* Enhanced Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <View style={styles.reportTypeContainer}>
              <View style={styles.reportTypeBadge}>
                <Star size={14} color="#a78bfa" />
                <Text style={styles.reportType}>{report.reportType} Compatibility</Text>
              </View>
              <View style={styles.cosmicBadge}>
                <Text style={styles.cosmicBadgeText}>Cosmic Analysis</Text>
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
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(2, 8, 23, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 16,
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
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
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
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
    marginTop: 120, // Account for fixed header
  },
  nameContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: '35%',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  sparkle: {
    marginLeft: -8,
  },
  personName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#c084fc',
    textAlign: 'center',
    marginBottom: 4,
  },
  nameSubtext: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
  titleSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  reportTitle: {
    fontFamily: 'Inter-Black',
    fontSize: 28,
    color: '#F9FAFB',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportTypeBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#fbbf24',
    textTransform: 'uppercase',
  },
  cosmicBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cosmicBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#a78bfa',
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
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 4,
  },
  scoreDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 24,
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
    fontSize: 18,
    lineHeight: 28,
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
    fontSize: 17,
    lineHeight: 24,
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
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#F9FAFB',
  },
  headerSpacer: {
    width: 40,
  },
  sparkleIcon: {
    marginLeft: -4,
  },
}); 