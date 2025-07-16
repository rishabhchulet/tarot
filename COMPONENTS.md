# Component Documentation

## Overview

This document covers all reusable components in the Tarot App, their props, usage patterns, and examples. Components are organized by category for easy navigation.

---

## Core Components

### **AIInterpretation**

Displays AI-generated card interpretations with loading states and fallbacks.

#### **Props**
```typescript
interface AIInterpretationProps {
  card: TarotCard;
  hexagram: IChingHexagram;
  userContext?: string;
}
```

#### **Usage**
```tsx
<AIInterpretation
  card={selectedCard}
  hexagram={selectedHexagram}
  userContext="Morning reflection"
/>
```

#### **Features**
- Automatic retry logic for AI failures
- Graceful fallbacks when AI unavailable
- Loading animation with mystical styling
- Error handling with user-friendly messages

---

### **AIReflectionPrompts**

Generates and displays personalized reflection questions.

#### **Props**
```typescript
interface AIReflectionPromptsProps {
  card: TarotCard;
  hexagram: IChingHexagram;
  onPromptSelect: (prompt: string) => void;
}
```

#### **Usage**
```tsx
<AIReflectionPrompts
  card={selectedCard}
  hexagram={selectedHexagram}
  onPromptSelect={(prompt) => setSelectedPrompt(prompt)}
/>
```

#### **Features**
- Generates 3 personalized reflection questions
- Regeneration capability
- Context-aware based on user's focus area
- Considers previous journal entries

---

### **StructuredReflection**

Displays comprehensive 4-part AI reflections (I Ching, Tarot, Synthesis, Prompt).

#### **Props**
```typescript
interface StructuredReflectionProps {
  cardName: string;
  hexagramName: string;
  isReversed?: boolean;
  onReflectionGenerated?: (prompt: string) => void;
}
```

#### **Usage**
```tsx
<StructuredReflection
  cardName="The Fool"
  hexagramName="Heaven"
  isReversed={false}
  onReflectionGenerated={(prompt) => handlePrompt(prompt)}
/>
```

#### **Features**
- Animated text reveal with staggered timing
- Fallback content when AI unavailable
- Error boundaries for graceful degradation
- Minimum loading time for better UX

---

## UI Components

### **LoadingState**

Displays loading animations with mystical theming.

#### **Props**
```typescript
interface LoadingStateProps {
  message?: string;
  submessage?: string;
  showSpinner?: boolean;
}
```

#### **Usage**
```tsx
<LoadingState
  message="Connecting to your inner wisdom..."
  submessage="Establishing secure connection..."
  showSpinner={true}
/>
```

#### **Features**
- Customizable messages
- Gradient backgrounds
- Smooth animations
- Responsive design

---

### **ErrorBoundary**

Catches JavaScript errors and displays fallback UI.

#### **Props**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}
```

#### **Usage**
```tsx
<ErrorBoundary fallback={CustomErrorComponent}>
  <App />
</ErrorBoundary>
```

#### **Features**
- Graceful error recovery
- Detailed error logging
- Beautiful fallback UI
- Development vs production modes

---

### **ConnectionStatus**

Displays network connection status with retry capabilities.

#### **Props**
```typescript
interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error?: string;
  onRetry?: () => void;
}
```

#### **Usage**
```tsx
<ConnectionStatus
  status={connectionStatus}
  error={errorMessage}
  onRetry={handleRetry}
/>
```

#### **Features**
- Visual status indicators
- Automatic retry functionality
- Error message display
- Smooth state transitions

---

## Form Components

### **BirthProfileInput**

Complex form for collecting birth information with location autocomplete.

#### **Props**
```typescript
interface BirthProfileInputProps {
  title: string;
  profile: BirthProfile;
  onProfileChange: (profile: BirthProfile) => void;
}
```

#### **Usage**
```tsx
<BirthProfileInput
  title="Your Profile"
  profile={personProfile}
  onProfileChange={setPersonProfile}
/>
```

#### **Features**
- Date and time pickers
- Location autocomplete with Google Places
- Coordinate detection
- Real-time validation
- Responsive layout

---

### **PlatformAwareDateTimePicker**

Cross-platform date/time picker with web fallbacks.

#### **Props**
```typescript
interface PlatformAwareDateTimePickerProps {
  mode: 'date' | 'time';
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder: string;
  disabled?: boolean;
}
```

#### **Usage**
```tsx
<PlatformAwareDateTimePicker
  mode="date"
  value={birthDate}
  onChange={setBirthDate}
  placeholder="Select your birth date"
  disabled={loading}
/>
```

#### **Features**
- Native pickers on mobile
- Web-compatible fallbacks
- Proper styling across platforms
- Accessibility support

---

### **LocationInput**

Location input with Google Places autocomplete and coordinate detection.

#### **Props**
```typescript
interface LocationInputProps {
  value: string;
  onLocationChange: (location: string, coordinates?: Coordinates) => void;
  placeholder: string;
  disabled?: boolean;
}
```

#### **Usage**
```tsx
<LocationInput
  value={location}
  onLocationChange={(loc, coords) => {
    setLocation(loc);
    setCoordinates(coords);
  }}
  placeholder="Birth Location (City, Country)"
  disabled={loading}
/>
```

#### **Features**
- Google Places API integration
- Coordinate extraction
- Debounced search
- Error handling

---

## Specialized Components

### **MagicalCardDraw**

Animated card drawing interface with mystical effects.

#### **Props**
```typescript
interface MagicalCardDrawProps {
  onCardDrawn: (card: TarotCard, hexagram: IChingHexagram) => void;
  isReversed?: boolean;
}
```

#### **Usage**
```tsx
<MagicalCardDraw
  onCardDrawn={(card, hexagram) => {
    setSelectedCard(card);
    setSelectedHexagram(hexagram);
  }}
  isReversed={Math.random() > 0.5}
/>
```

#### **Features**
- Smooth card flip animations
- Magical particle effects
- Sound effects (if enabled)
- Responsive card sizing

---

### **TarotCardFlow**

Complete card display with interpretation and reflection flow.

#### **Props**
```typescript
interface TarotCardFlowProps {
  card: TarotCard;
  hexagram: IChingHexagram;
  isReversed: boolean;
  onReflectionComplete?: (reflection: string) => void;
}
```

#### **Usage**
```tsx
<TarotCardFlow
  card={selectedCard}
  hexagram={selectedHexagram}
  isReversed={isReversed}
  onReflectionComplete={handleReflectionComplete}
/>
```

#### **Features**
- Full card display with proper aspect ratio
- Expandable details section
- AI interpretation integration
- Reflection prompt generation

---

### **ScoreGauge**

Animated compatibility score display with visual indicators.

#### **Props**
```typescript
interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
  showLabel?: boolean;
}
```

#### **Usage**
```tsx
<ScoreGauge
  score={85}
  size={120}
  showLabel={true}
/>
```

#### **Features**
- Smooth score animation
- Color coding based on score
- Customizable size
- Accessibility labels

---

### **StatsList**

Displays compatibility statistics with progress bars.

#### **Props**
```typescript
interface StatsListProps {
  stats: Stat[];
}

interface Stat {
  label: string;
  score: number;
  description: string;
}
```

#### **Usage**
```tsx
<StatsList
  stats={[
    {
      label: "Emotional Harmony",
      score: 85,
      description: "Deep emotional connection and understanding"
    }
  ]}
/>
```

#### **Features**
- Animated progress bars
- Expandable descriptions
- Color-coded scores
- Responsive layout

---

## Navigation Components

### **TrialBanner**

Displays trial status and upgrade prompts.

#### **Props**
```typescript
interface TrialBannerProps {
  trialDaysLeft: number;
  onUpgrade: () => void;
  onDismiss?: () => void;
}
```

#### **Usage**
```tsx
<TrialBanner
  trialDaysLeft={7}
  onUpgrade={handleUpgrade}
  onDismiss={handleDismiss}
/>
```

#### **Features**
- Countdown display
- Gradient styling
- Dismissible option
- Call-to-action buttons

---

## Input Components

### **VoiceRecorder**

Voice recording component for journal entries.

#### **Props**
```typescript
interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string) => void;
  maxDuration?: number; // seconds
  disabled?: boolean;
}
```

#### **Usage**
```tsx
<VoiceRecorder
  onRecordingComplete={(uri) => setAudioUri(uri)}
  maxDuration={300} // 5 minutes
  disabled={loading}
/>
```

#### **Features**
- Real-time recording visualization
- Duration limits
- Audio quality settings
- Permission handling

---

### **NoteEntry**

Rich text editor for journal notes.

#### **Props**
```typescript
interface NoteEntryProps {
  value: string;
  onValueChange: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
}
```

#### **Usage**
```tsx
<NoteEntry
  value={notes}
  onValueChange={setNotes}
  placeholder="Share your thoughts..."
  maxLength={2000}
/>
```

#### **Features**
- Auto-growing text area
- Character count display
- Rich formatting options
- Auto-save functionality

---

## Animation Components

### **PlanetaryLoadingAnimation**

Celestial-themed loading animation with orbiting elements.

#### **Props**
```typescript
interface PlanetaryLoadingAnimationProps {
  message?: string;
  submessage?: string;
  showFloatingStars?: boolean;
}
```

#### **Usage**
```tsx
<PlanetaryLoadingAnimation
  message="Consulting the stars..."
  submessage="Weaving cosmic insights"
  showFloatingStars={true}
/>
```

#### **Features**
- Smooth orbital animations
- Floating star particles
- Gradient backgrounds
- Responsive sizing

---

## Testing Components

### **SupabaseTest**

Development component for testing database connections.

#### **Props**
```typescript
interface SupabaseTestProps {
  showDebugInfo?: boolean;
}
```

#### **Usage**
```tsx
<SupabaseTest showDebugInfo={__DEV__} />
```

#### **Features**
- Connection status testing
- Database access verification
- Debug information display
- Environment validation

---

### **SignOutTestButton**

Development button for testing authentication flows.

#### **Props**
```typescript
interface SignOutTestButtonProps {
  onSignOut: () => void;
}
```

#### **Usage**
```tsx
<SignOutTestButton onSignOut={handleSignOut} />
```

#### **Features**
- Quick sign-out functionality
- Development-only visibility
- Confirmation dialogs
- Loading states

---

## Styling Patterns

### **Common Style Patterns**

#### **Container Styles**
```typescript
const containerStyles = {
  flex: 1,
  backgroundColor: '#0a0a0a',
  paddingHorizontal: 20,
};
```

#### **Text Styles**
```typescript
const textStyles = {
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#F9FAFB',
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#94a3b8',
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
};
```

#### **Button Styles**
```typescript
const buttonStyles = {
  primary: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
};
```

### **Responsive Design**

All components use responsive design patterns:

```typescript
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const responsiveStyles = {
  container: {
    width: screenWidth > 768 ? '60%' : '100%',
    maxWidth: 400,
  },
  fontSize: screenWidth > 768 ? 18 : 16,
};
```

### **Accessibility**

Components include proper accessibility support:

```tsx
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Draw a card for today's reflection"
  accessibilityHint="Tap to select a random tarot card"
>
  <Text>Draw Card</Text>
</Pressable>
```

---

## Usage Guidelines

### **Performance Optimization**

1. **Lazy Loading**: Use React.lazy for large components
2. **Memoization**: Wrap expensive components with React.memo
3. **State Management**: Keep state as local as possible
4. **Image Optimization**: Use optimized image formats and sizes

### **Error Handling**

1. **Error Boundaries**: Wrap components in ErrorBoundary
2. **Fallback UI**: Provide meaningful fallback content
3. **Loading States**: Show appropriate loading indicators
4. **User Feedback**: Display clear error messages

### **Testing**

1. **Unit Tests**: Test component logic and prop handling
2. **Integration Tests**: Test component interactions
3. **Accessibility Tests**: Verify screen reader compatibility
4. **Visual Tests**: Ensure consistent styling across platforms

---

*Last Updated: July 15, 2025* 