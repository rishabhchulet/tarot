import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Dimensions,
  Modal,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Sparkles } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useAnimatedProps
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ArchetypeDetailModalProps {
  visible: boolean;
  archetype: {
    id: string;
    name: string;
    icon: any;
    colors: string[];
    description: string;
    detailedDescription: string;
    strengths: string[];
    challenges: string[];
    guidance: string;
    keywords: string[];
  } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ArchetypeDetailModal({ 
  visible, 
  archetype, 
  onClose, 
  onConfirm 
}: ArchetypeDetailModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Debug logging
  React.useEffect(() => {
    console.log('🎭 Modal visibility changed:', visible, archetype?.name);
  }, [visible, archetype]);

  React.useEffect(() => {
    if (visible) {
      // iOS prefers spring animations, Android prefers timing
      if (Platform.OS === 'ios') {
        scale.value = withTiming(1, { duration: 300 });
        opacity.value = withTiming(1, { duration: 250 });
      } else {
        scale.value = withTiming(1, { duration: 250 });
        opacity.value = withTiming(1, { duration: 200 });
      }
    } else {
      scale.value = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.5,
  }));

  if (!archetype) return null;

  const IconComponent = archetype.icon;

  if (!visible) return null;

  // For Android, use a simpler approach without Modal component
  if (Platform.OS === 'android') {
    return (
      <View style={styles.androidModalContainer}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        
        <Animated.View style={[styles.modalContent, animatedModalStyle]}>
          <LinearGradient
            colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
            style={styles.modalGradient}
          >
            {/* Close Button */}
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#94A3B8" />
            </Pressable>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header with Icon */}
              <View style={styles.header}>
                <LinearGradient
                  colors={archetype.colors}
                  style={styles.iconContainer}
                >
                  <IconComponent size={40} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
                
                <Text style={styles.archetypeName}>{archetype.name}</Text>
                <Text style={styles.shortDescription}>{archetype.description}</Text>
              </View>

              {/* Keywords */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨ Keywords</Text>
                <View style={styles.keywordsContainer}>
                  {archetype.keywords.map((keyword, index) => (
                    <View key={index} style={styles.keywordTag}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Detailed Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌟 Your Journey</Text>
                <Text style={styles.detailedText}>{archetype.detailedDescription}</Text>
              </View>

              {/* Strengths */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💪 Your Strengths</Text>
                {archetype.strengths.map((strength, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.listText}>{strength}</Text>
                  </View>
                ))}
              </View>

              {/* Challenges */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Growth Areas</Text>
                {archetype.challenges.map((challenge, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.listText}>{challenge}</Text>
                  </View>
                ))}
              </View>

              {/* Guidance */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧭 Your Guidance</Text>
                <Text style={styles.guidanceText}>{archetype.guidance}</Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Pressable style={styles.backButton} onPress={onClose}>
                <Text style={styles.backButtonText}>Choose Different</Text>
              </Pressable>
              
              <Pressable onPress={onConfirm}>
                <LinearGradient
                  colors={archetype.colors}
                  style={styles.confirmButton}
                >
                  <Check size={20} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.confirmButtonText}>This Is Me</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  }

  // For iOS, use the Modal component
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        
        <Animated.View style={[styles.modalContent, animatedModalStyle]}>
          <LinearGradient
            colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
            style={styles.modalGradient}
          >
            {/* Close Button */}
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#94A3B8" />
            </Pressable>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header with Icon */}
              <View style={styles.header}>
                <LinearGradient
                  colors={archetype.colors}
                  style={styles.iconContainer}
                >
                  <IconComponent size={40} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
                
                <Text style={styles.archetypeName}>{archetype.name}</Text>
                <Text style={styles.shortDescription}>{archetype.description}</Text>
              </View>

              {/* Keywords */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨ Keywords</Text>
                <View style={styles.keywordsContainer}>
                  {archetype.keywords.map((keyword, index) => (
                    <View key={index} style={styles.keywordTag}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Detailed Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌟 Your Journey</Text>
                <Text style={styles.detailedText}>{archetype.detailedDescription}</Text>
              </View>

              {/* Strengths */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💪 Your Strengths</Text>
                {archetype.strengths.map((strength, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.listText}>{strength}</Text>
                  </View>
                ))}
              </View>

              {/* Challenges */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Growth Areas</Text>
                {archetype.challenges.map((challenge, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.listText}>{challenge}</Text>
                  </View>
                ))}
              </View>

              {/* Guidance */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧭 Your Guidance</Text>
                <Text style={styles.guidanceText}>{archetype.guidance}</Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Pressable style={styles.backButton} onPress={onClose}>
                <Text style={styles.backButtonText}>Choose Different</Text>
              </Pressable>
              
              <Pressable onPress={onConfirm}>
                <LinearGradient
                  colors={archetype.colors}
                  style={styles.confirmButton}
                >
                  <Check size={20} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.confirmButtonText}>This Is Me</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: Platform.OS === 'ios' ? 50 : 20,
  },
  androidModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    zIndex: 9999,
    elevation: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  modalContent: {
    width: width - 40,
    maxHeight: Platform.OS === 'ios' ? height * 0.82 : height * 0.85,
    borderRadius: Platform.OS === 'ios' ? 24 : 20,
    overflow: 'hidden',
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  modalGradient: {
    flex: 1,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  archetypeName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  keywordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#A855F7',
  },
  detailedText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 22,
  },
  guidanceText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F3F4F6',
    lineHeight: 24,
    fontStyle: 'italic',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    paddingHorizontal: 20,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Platform.OS === 'ios' ? '#8B5CF6' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 8 : undefined,
    elevation: Platform.OS === 'android' ? 8 : undefined,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
}); 