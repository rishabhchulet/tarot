import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { router } from 'expo-router';
import { ArrowLeft, Save, User, Mail, Heart, Settings, Target, DollarSign, Activity, Check } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/utils/auth';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withDelay,
  interpolate
} from 'react-native-reanimated';

const FOCUS_AREAS = [
  { id: 'inner', title: 'Inner Development', icon: Heart, color: designTokens.colors.accent.rose, description: 'Self-awareness and spiritual growth' },
  { id: 'relationships', title: 'Relationships', icon: User, color: designTokens.colors.accent.purple, description: 'Love, family, and connections' },
  { id: 'money', title: 'Money & Resources', icon: DollarSign, color: designTokens.colors.accent.gold, description: 'Financial stability and abundance' },
  { id: 'health', title: 'Physical & Mental Health', icon: Activity, color: designTokens.colors.accent.brightBlue, description: 'Wellness and vitality' },
];

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [selectedFocusArea, setSelectedFocusArea] = useState(user?.focusArea || '');
  const [loading, setLoading] = useState(false);

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const backgroundGlow = useSharedValue(0);
  const saveButtonScale = useSharedValue(1);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setSelectedFocusArea(user.focusArea || '');
    }
    startProfileAnimations();
  }, [user]);

  const startProfileAnimations = () => {
    // Background glow
    backgroundGlow.value = withTiming(1, { duration: 2000 });
    
    // Staggered entrance animations
    setTimeout(() => {
      animationHelpers.fadeIn(headerOpacity, 800);
      headerTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 200);

    setTimeout(() => {
      animationHelpers.fadeIn(contentOpacity, 800);
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 600);
  };

  const handleSave = async () => {
    await HapticManager.triggerSelection();
    
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    saveButtonScale.value = withSpring(0.95, designTokens.animations.spring.gentle);

    try {
      console.log('💾 Updating profile...');
      const { error } = await updateUserProfile({
        name: name.trim(),
        focusArea: selectedFocusArea,
      });

      if (error) {
        console.error('❌ Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      } else {
        console.log('✅ Profile updated successfully');
        await refreshUser();
        Alert.alert(
          'Success',
          'Your profile has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            }
          ]
        );
      }
    } catch (error) {
      console.error('💥 Unexpected error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      saveButtonScale.value = withSpring(1, designTokens.animations.spring.gentle);
    }
  };

  const handleFocusAreaSelect = async (areaId: string) => {
    await HapticManager.triggerSelection();
    setSelectedFocusArea(areaId);
  };

  const handleBack = async () => {
    await HapticManager.triggerSelection();
    router.back();
  };

  const getFocusAreaTitle = (id: string) => {
    const area = FOCUS_AREAS.find(area => area.id === id);
    return area ? area.title : 'Not selected';
  };

  const getFocusAreaDescription = (id: string) => {
    const area = FOCUS_AREAS.find(area => area.id === id);
    return area ? area.description : 'Please select a focus area';
  };

  // Enhanced animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.5]),
  }));

  const saveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={12} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />

        {/* Enhanced Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <FloatingAction style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={20} color={designTokens.colors.text.primary} strokeWidth={1.5} />
          </FloatingAction>
          
          <View style={styles.titleContainer}>
            <Settings size={24} color={designTokens.colors.accent.purple} strokeWidth={1.5} />
            <Text style={styles.title}>Profile</Text>
          </View>
          
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Enhanced Content */}
        <Animated.View style={[styles.contentContainer, contentStyle]}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.form}>
              {/* Enhanced Name Input */}
              <GlassCard style={styles.inputContainer} intensity="medium">
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={designTokens.colors.text.muted} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={designTokens.colors.text.muted}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </GlassCard>

              {/* Enhanced Email Input */}
              <GlassCard style={styles.inputContainer} intensity="light">
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                  <Mail size={18} color={designTokens.colors.text.muted} />
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={email}
                    editable={false}
                    placeholder="Email address"
                    placeholderTextColor={designTokens.colors.text.muted}
                  />
                </View>
                <Text style={styles.helperText}>Email cannot be changed</Text>
              </GlassCard>

              {/* Enhanced Focus Area Selection */}
              <GlassCard style={styles.inputContainer} intensity="medium">
                <View style={styles.focusAreaHeader}>
                  <Target size={20} color={designTokens.colors.accent.gold} />
                  <Text style={styles.label}>Focus Area</Text>
                </View>
                
                <GlassCard style={styles.currentSelectionCard} intensity="light">
                  <Text style={styles.currentSelectionTitle}>
                    {getFocusAreaTitle(selectedFocusArea)}
                  </Text>
                  <Text style={styles.currentSelectionDescription}>
                    {getFocusAreaDescription(selectedFocusArea)}
                  </Text>
                </GlassCard>
                
                <Text style={styles.sectionDescription}>
                  Choose your primary focus to personalize your daily guidance
                </Text>
                
                <View style={styles.focusOptions}>
                  {FOCUS_AREAS.map((area) => {
                    const IconComponent = area.icon;
                    const isSelected = selectedFocusArea === area.id;
                    
                    return (
                      <Pressable
                        key={area.id}
                        onPress={() => handleFocusAreaSelect(area.id)}
                      >
                        <GlassCard 
                          style={[
                            styles.focusOption, 
                            isSelected && styles.focusOptionSelected
                          ]} 
                          intensity={isSelected ? "medium" : "light"}
                        >
                          <View style={styles.focusOptionLeft}>
                            <FloatingAction 
                              style={[
                                styles.focusIconContainer, 
                                { borderColor: area.color },
                                isSelected && { backgroundColor: area.color + '20' }
                              ]}
                            >
                              <IconComponent 
                                size={18} 
                                color={isSelected ? area.color : designTokens.colors.text.muted} 
                                strokeWidth={1.5}
                              />
                            </FloatingAction>
                            <View style={styles.focusOptionText}>
                              <Text style={[
                                styles.focusOptionTitle, 
                                isSelected && { color: area.color }
                              ]}>
                                {area.title}
                              </Text>
                              <Text style={styles.focusOptionDescription}>
                                {area.description}
                              </Text>
                            </View>
                          </View>
                          
                          {isSelected && (
                            <FloatingAction style={styles.checkIcon}>
                              <Check size={16} color={area.color} strokeWidth={2} />
                            </FloatingAction>
                          )}
                        </GlassCard>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>

              {/* Enhanced Save Button */}
              <Animated.View style={saveButtonStyle}>
                <Pressable
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? designTokens.colors.gradients.cosmic : designTokens.colors.gradients.mystical}
                    style={styles.saveButtonGradient}
                  >
                    <Save size={20} color={designTokens.colors.text.primary} strokeWidth={1.5} />
                    <Text style={styles.saveButtonText}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  backgroundGlow: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    right: '20%',
    height: '35%',
    borderRadius: 150,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.3,
  },

  // Enhanced Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.lg,
  },

  backButton: {
    padding: designTokens.spacing.sm,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  title: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
  },

  placeholder: {
    width: 40,
  },

  // Enhanced Content
  contentContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xxxl,
  },

  form: {
    gap: designTokens.spacing.lg,
  },

  // Enhanced Input Fields
  inputContainer: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
  },

  label: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
  },

  inputWrapperDisabled: {
    backgroundColor: designTokens.colors.glass.background,
    opacity: 0.6,
  },

  input: {
    flex: 1,
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.primary,
    padding: 0,
  },

  inputDisabled: {
    color: designTokens.colors.text.muted,
  },

  helperText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    marginTop: designTokens.spacing.sm,
    fontStyle: 'italic',
  },

  // Enhanced Focus Area
  focusAreaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.md,
  },

  currentSelectionCard: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },

  currentSelectionTitle: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.accent.gold,
    marginBottom: designTokens.spacing.xs,
  },

  currentSelectionDescription: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.secondary,
  },

  sectionDescription: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    marginBottom: designTokens.spacing.lg,
    textAlign: 'center',
  },

  focusOptions: {
    gap: designTokens.spacing.md,
  },

  focusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.md,
  },

  focusOptionSelected: {
    borderWidth: 1,
    borderColor: designTokens.colors.accent.gold,
  },

  focusOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  focusIconContainer: {
    padding: designTokens.spacing.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    borderRadius: designTokens.borderRadius.md,
    marginRight: designTokens.spacing.md,
  },

  focusOptionText: {
    flex: 1,
  },

  focusOptionTitle: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },

  focusOptionDescription: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.secondary,
  },

  checkIcon: {
    padding: designTokens.spacing.xs,
  },

  // Enhanced Save Button
  saveButton: {
    borderRadius: designTokens.borderRadius.xl,
    overflow: 'hidden',
    marginTop: designTokens.spacing.lg,
    shadowColor: designTokens.colors.accent.brightBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.xl,
    gap: designTokens.spacing.sm,
  },

  saveButtonText: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },
});