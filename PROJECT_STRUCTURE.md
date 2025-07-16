# Project Structure Guide

## Overview

This document provides a comprehensive breakdown of the Daily Inner Reflection Tarot App's project structure, explaining the purpose of each directory and key files.

---

## Root Directory Structure

```
tarot/
├── app/                      # Expo Router pages and API routes
├── assets/                   # Static assets (images, fonts, etc.)
├── components/               # Reusable UI components
├── contexts/                 # React Context providers
├── data/                     # Static data files and configurations
├── hooks/                    # Custom React hooks
├── supabase/                 # Database migrations and schemas
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions and services
├── app.json                  # Expo configuration
├── babel.config.js          # Babel transpiler configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

---

## Detailed Directory Breakdown

### **`/app` - Expo Router Pages**

The app directory uses Expo Router's file-based routing system.

```
app/
├── (tabs)/                   # Tab navigation group
│   ├── _layout.tsx          # Tab bar configuration
│   ├── index.tsx            # Home/Today screen
│   ├── calendar.tsx         # Calendar view
│   ├── journal.tsx          # Journal entries
│   ├── settings.tsx         # App settings
│   └── today.tsx            # Today's reflection
├── auth/                     # Authentication flow
│   ├── _layout.tsx          # Auth layout wrapper
│   ├── index.tsx            # Auth landing page
│   ├── signin.tsx           # Sign in form
│   ├── signup.tsx           # Sign up form
│   └── forgot-password.tsx  # Password reset
├── onboarding/              # New user setup
│   ├── _layout.tsx          # Onboarding layout
│   ├── welcome.tsx          # Welcome screen
│   ├── name.tsx             # Name input
│   ├── astrology.tsx        # Birth data collection
│   ├── intention.tsx        # Focus area selection
│   ├── breath.tsx           # Breathing tutorial
│   ├── tutorial.tsx         # App tutorial
│   └── confirmation.tsx     # Setup completion
├── _layout.tsx              # Root layout with providers
├── index.tsx                # App entry point
├── ai+api.ts               # AI service API routes
├── debug+api.ts            # Debug information endpoint
├── supabase-debug+api.ts   # Supabase debug endpoint
├── breathing.tsx           # Breathing exercise screen
├── daily-question.tsx      # Daily question display
├── draw.tsx                # Card drawing interface
├── profile.tsx             # User profile editing
├── compatibility.tsx       # Relationship compatibility
└── +not-found.tsx         # 404 error page
```

#### **Key Files:**

- **`_layout.tsx`**: Root layout with auth context and font loading
- **`ai+api.ts`**: Universal AI endpoint for all AI services
- **`index.tsx`**: App entry point with routing logic

### **`/components` - Reusable UI Components**

```
components/
├── AIInterpretation.tsx      # AI-generated card interpretations
├── AIReflectionPrompts.tsx   # Personalized reflection questions
├── ConnectionStatus.tsx      # Network status indicator
├── DynamicReflectionQuestions.tsx # Context-aware questions
├── ErrorBoundary.tsx         # Error catching and recovery
├── LoadingState.tsx          # Loading animations
├── MagicalCardDraw.tsx       # Animated card drawing
├── NoteEntry.tsx             # Rich text note editor
├── ReflectionPrompt.tsx      # Individual reflection prompt
├── SignOutTestButton.tsx     # Development sign-out button
├── SupabaseTest.tsx          # Database connection testing
├── TarotCardFlow.tsx         # Complete card display flow
├── TrialBanner.tsx           # Trial status banner
└── VoiceRecorder.tsx         # Audio recording component
```

#### **Component Categories:**

- **AI Components**: Handle AI service integration
- **UI Components**: General interface elements
- **Form Components**: Input and data collection
- **Testing Components**: Development and debugging tools

### **`/contexts` - State Management**

```
contexts/
└── AuthContext.tsx           # Authentication state management
```

#### **AuthContext Features:**
- User session management
- Profile data caching
- Connection status tracking
- Automatic token refresh
- Error handling and recovery

### **`/data` - Static Data Files**

```
data/
├── tarotCards.ts             # Complete tarot deck data
├── iChing.ts                 # I Ching hexagrams
├── structuredData.ts         # Combined tarot/I Ching data
└── archetypes.ts             # User archetype definitions
```

#### **Data Structure:**
- **Tarot Cards**: 78 cards with meanings, keywords, descriptions
- **I Ching**: 64 hexagrams with interpretations
- **Archetypes**: Major Arcana archetypes with icons and colors
- **Structured Data**: Optimized data for AI processing

### **`/hooks` - Custom React Hooks**

```
hooks/
└── useFrameworkReady.ts      # Framework initialization hook
```

#### **Hook Purposes:**
- Framework readiness detection
- Font loading management
- Initialization sequencing

### **`/supabase` - Database Schema**

```
supabase/
└── migrations/               # Database migration files
    ├── 20250626125645_small_frost.sql      # Initial schema
    ├── 20250626172735_tender_bonus.sql     # User profiles
    ├── 20250626181630_silver_boat.sql      # Journal entries
    ├── 20250630193025_lingering_disk.sql   # Notifications
    └── ...                                 # Additional migrations
```

#### **Database Tables:**
- **users**: User profiles and preferences
- **journal_entries**: Daily reflections and notes
- **notification_templates**: Push notification content
- **user_settings**: App configuration per user

### **`/types` - TypeScript Definitions**

```
types/
├── env.d.ts                  # Environment variable types
└── images.d.ts               # Image asset types
```

#### **Type Categories:**
- **Environment**: Process.env variable definitions
- **Assets**: Static asset type declarations
- **API**: Request/response interfaces
- **Data**: Business logic type definitions

### **`/utils` - Utility Functions**

```
utils/
├── ai.ts                     # AI service integration
├── audio.ts                  # Audio recording utilities
├── auth.ts                   # Authentication helpers
├── database.ts               # Database operations
├── diagnostics.ts            # System diagnostics
├── notifications.ts          # Push notification setup
├── structuredAI.ts          # Structured AI reflections
└── supabase.ts              # Supabase client configuration
```

#### **Utility Categories:**

**AI Services (`ai.ts`, `structuredAI.ts`)**
- OpenAI API integration
- Request/response handling
- Error handling and retries
- Fallback content generation

**Authentication (`auth.ts`)**
- User sign in/up/out
- Session management
- Profile operations
- Password reset

**Database (`database.ts`)**
- Journal entry CRUD operations
- User data queries
- Caching strategies
- Error handling

**Infrastructure (`supabase.ts`, `diagnostics.ts`)**
- Database client setup
- Connection monitoring
- Performance tracking
- Health checks

### **`/assets` - Static Resources**

```
assets/
└── images/
    ├── icon.png              # App icon
    ├── favicon.png           # Web favicon
    ├── back of the deck.jpeg # Card back image
    └── ...                   # Additional images
```

#### **Asset Types:**
- **Icons**: App icons for different platforms
- **Images**: Tarot card imagery and backgrounds
- **Fonts**: Custom typography (loaded via Expo Google Fonts)

---

## Architecture Patterns

### **File-Based Routing (Expo Router)**

The app uses Expo Router's file-based routing system:

```typescript
// app/(tabs)/index.tsx becomes route: /(tabs)/
// app/auth/signin.tsx becomes route: /auth/signin
// app/profile.tsx becomes route: /profile
```

**Benefits:**
- Automatic route generation
- Type-safe navigation
- Code splitting by route
- Nested layouts support

### **Component Organization**

Components are organized by functionality rather than type:

```typescript
// AI-related components
AIInterpretation.tsx
AIReflectionPrompts.tsx
StructuredReflection.tsx

// UI components
LoadingState.tsx
ErrorBoundary.tsx
ConnectionStatus.tsx

// Form components
BirthProfileInput.tsx
LocationInput.tsx
PlatformAwareDateTimePicker.tsx
```

### **Service Layer Pattern**

Utilities are organized as service layers:

```typescript
// utils/ai.ts - AI service layer
export const getAICardInterpretation = async (data) => { ... }
export const getAIReflectionPrompts = async (data) => { ... }

// utils/database.ts - Database service layer
export const getJournalEntries = async () => { ... }
export const saveJournalEntry = async (entry) => { ... }

// utils/auth.ts - Authentication service layer
export const signIn = async (email, password) => { ... }
export const getCurrentUser = async () => { ... }
```

### **Context Pattern**

State management uses React Context for global state:

```typescript
// contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ... state management logic
  
  return (
    <AuthContext.Provider value={{ user, session, loading, ... }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## Configuration Files

### **`app.json` - Expo Configuration**

```json
{
  "expo": {
    "name": "Daily Inner Reflection",
    "slug": "daily-inner-reflection",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.dailyinner.reflection"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/icon.png",
        "backgroundColor": "#6B46C1"
      },
      "package": "com.dailyinner.reflection"
    },
    "web": {
      "bundler": "metro",
      "output": "server",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-notifications",
      "expo-secure-store"
    ]
  }
}
```

### **`tsconfig.json` - TypeScript Configuration**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### **`package.json` - Dependencies and Scripts**

```json
{
  "scripts": {
    "start": "npx expo start",
    "dev": "EXPO_NO_TELEMETRY=1 npx expo start",
    "build:web": "npx expo export --platform web",
    "lint": "npx expo lint"
  },
  "dependencies": {
    "expo": "^53.0.0",
    "react": "19.0.0",
    "react-native": "0.79.1",
    "expo-router": "~5.0.2",
    "@supabase/supabase-js": "^2.39.0",
    "openai": "^4.67.3"
  }
}
```

---

## Development Patterns

### **Import Organization**

```typescript
// External libraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Internal utilities
import { useAuth } from '@/contexts/AuthContext';
import { getJournalEntries } from '@/utils/database';

// Components
import { LoadingState } from '@/components/LoadingState';
```

### **Error Handling Pattern**

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  setError(null);
  
  const result = await apiCall();
  // Handle success
  
} catch (err: any) {
  console.error('Operation failed:', err);
  setError(err.message || 'Unknown error occurred');
} finally {
  setLoading(false);
}
```

### **Styling Pattern**

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#F9FAFB',
    textAlign: 'center',
  },
  // ... more styles
});
```

---

## Testing Structure

### **Test Organization**

```
__tests__/
├── components/               # Component unit tests
├── utils/                    # Utility function tests
├── hooks/                    # Custom hook tests
└── integration/              # Integration tests
```

### **Test Patterns**

```typescript
// Component testing
import { render, fireEvent } from '@testing-library/react-native';
import { LoadingState } from '@/components/LoadingState';

describe('LoadingState', () => {
  it('displays loading message', () => {
    const { getByText } = render(
      <LoadingState message="Loading..." />
    );
    expect(getByText('Loading...')).toBeTruthy();
  });
});
```

---

## Security Considerations

### **Environment Variables**
- All sensitive keys in environment variables
- Client-side variables prefixed with `EXPO_PUBLIC_`
- No secrets committed to version control

### **API Security**
- All API routes validate requests
- Authentication required for protected endpoints
- Rate limiting implemented
- Input sanitization

### **Data Protection**
- User data stored securely in Supabase
- Row Level Security (RLS) policies
- Secure token storage with Expo SecureStore
- Data encryption in transit and at rest

---

## Performance Considerations

### **Bundle Optimization**
- Code splitting by route (automatic with Expo Router)
- Lazy loading of heavy components
- Image optimization and compression
- Font subset loading

### **Runtime Performance**
- React.memo for expensive components
- useMemo and useCallback for expensive computations
- Efficient state management
- Background processing for non-critical tasks

---

*Last Updated: July 15, 2025* 