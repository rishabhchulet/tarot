# API Documentation

## Overview

The Tarot App uses a combination of Supabase for data persistence and custom Expo API routes for AI integration. This document covers all API endpoints, data structures, and integration patterns.

## Base URLs

- **Development**: `http://localhost:8081` (Expo dev server)
- **Production**: `https://your-domain.com`
- **Supabase**: `https://your-project.supabase.co`

---

## AI API Endpoints

### **POST /ai**

Universal AI endpoint that routes to different AI services based on request type.

#### **Request Format**
```typescript
{
  "type": string,     // Service type (see below)
  "data": object      // Service-specific data
}
```

#### **Response Format**
```typescript
{
  // Service-specific response data
  "timestamp": string  // ISO timestamp
}
```

#### **Error Response**
```typescript
{
  "error": string,     // Human-readable error message
  "code": string,      // Error code for programmatic handling
  "details"?: string   // Additional error details
}
```

#### **Supported Service Types**

##### 1. **Card Interpretation**
```typescript
// Request
{
  "type": "card-interpretation",
  "data": {
    "cardName": string,
    "cardKeywords": string[],
    "hexagramName": string,
    "hexagramNumber": number,
    "focusArea"?: string,
    "userContext"?: string
  }
}

// Response
{
  "interpretation": string,
  "timestamp": string
}
```

##### 2. **Reflection Prompts**
```typescript
// Request
{
  "type": "reflection-prompts",
  "data": {
    "cardName": string,
    "cardKeywords": string[],
    "hexagramName": string,
    "focusArea"?: string,
    "previousEntries"?: string[]
  }
}

// Response
{
  "questions": string[],  // Array of 3 reflection questions
  "timestamp": string
}
```

##### 3. **Structured Reflection**
```typescript
// Request
{
  "type": "structured-reflection",
  "data": {
    "prompt": string,
    "cardName": string,
    "hexagramName": string,
    "isReversed": boolean
  }
}

// Response
{
  "iChingReflection": string,
  "tarotReflection": string,
  "synthesis": string,
  "reflectionPrompt": string
}
```

##### 4. **Compatibility Report**
```typescript
// Request
{
  "type": "compatibility-report",
  "data": {
    "personA": {
      "name": string,
      "date": Date | string,
      "time"?: Date | string,
      "location": string,
      "coordinates"?: { latitude: number, longitude: number }
    },
    "personB": {
      "name": string,
      "date": Date | string,
      "time"?: Date | string,
      "location": string,
      "coordinates"?: { latitude: number, longitude: number }
    },
    "reportType": "Relationship" | "Marriage" | "Friendship"
  }
}

// Response
{
  "score": number,        // 0-100 compatibility score
  "title": string,        // Poetic title for the relationship
  "summary": string,      // 4-5 sentence overview
  "stats": [
    {
      "label": string,        // Aspect name
      "score": number,        // 0-100 score for this aspect
      "description": string   // 2-3 sentence explanation
    }
  ],
  "generatedAt": string,
  "reportType": string,
  "personAName": string,
  "personBName": string,
  "insight"?: string
}
```

##### 5. **Personalized Guidance**
```typescript
// Request
{
  "type": "personalized-guidance",
  "data": {
    "cardName": string,
    "hexagramName": string,
    "focusArea"?: string,
    "timeOfDay": "morning" | "afternoon" | "evening",
    "mood"?: string
  }
}

// Response
{
  "guidance": string,     // 50-80 word personalized message
  "timestamp": string
}
```

##### 6. **North Node Insight**
```typescript
// Request
{
  "type": "north-node-insight",
  "data": {
    "northNodeSign": string,
    "northNodeHouse": string,
    "userName": string
  }
}

// Response
{
  "insight": string,      // Personalized north node guidance
  "timestamp": string
}
```

---

## Debug Endpoints

### **GET /debug**

Returns comprehensive environment and system information for debugging.

#### **Response**
```typescript
{
  "timestamp": string,
  "environment": {
    "supabaseUrl": "Set" | "Missing",
    "supabaseAnonKey": "Set (length: X)" | "Missing",
    "openaiApiKey": "Set (length: X)" | "Missing",
    "openaiPublicKey": "Set (length: X)" | "Missing",
    "nodeEnv": string,
    "platform": "browser" | "server",
    "totalEnvVars": number,
    "apiKeyEnvVars": string[]
  },
  "request": {
    "url": string,
    "origin": string,
    "host": string,
    "userAgent": string
  },
  "openai": {
    "keyStatus": "Available" | "Missing",
    "keyPreview": string,
    "keySource": string
  },
  "system": {
    "memoryUsage": object | "N/A",
    "uptime": number | "N/A"
  },
  "diagnostics": {
    "canAccessProcess": boolean,
    "canAccessGlobalThis": boolean,
    "processEnvKeys": string[]
  }
}
```

### **GET /supabase-debug**

Returns Supabase-specific configuration information.

#### **Response**
```typescript
{
  "timestamp": string,
  "environment": {
    "supabaseUrl": "Set" | "Missing",
    "supabaseAnonKey": "Set (length: X)" | "Missing",
    "nodeEnv": string
  },
  "request": {
    "url": string,
    "origin": string,
    "host": string
  },
  "platform": "web"
}
```

---

## Data Structures

### **User Profile**
```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  archetype?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  latitude?: number;
  longitude?: number;
  onboardingStep?: string;
  focusArea?: 'inner_development' | 'relationships' | 'career_finance' | 'wellbeing';
}
```

### **Tarot Card**
```typescript
interface TarotCard {
  id: string;
  name: string;
  suite: string;
  number: number;
  keywords: string[];
  upright_meaning: string;
  reversed_meaning: string;
  description: string;
  archetype?: string;
}
```

### **I Ching Hexagram**
```typescript
interface IChingHexagram {
  number: number;
  name: string;
  chinese_name: string;
  trigrams: {
    upper: string;
    lower: string;
  };
  meaning: string;
  description: string;
  keywords: string[];
}
```

### **Journal Entry**
```typescript
interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  card_name: string;
  hexagram_name: string;
  is_reversed: boolean;
  reflection: string;
  interpretation?: string;
  mood?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### **Birth Profile**
```typescript
interface BirthProfile {
  name: string;
  date: Date | null;
  time: Date | null;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}
```

### **Archetype Data**
```typescript
interface ArchetypeData {
  id: string;
  name: string;
  icon: string;
  color: string;
  element: string;
  description: string;
  keywords: string[];
  focus_areas: string[];
}
```

---

## Database Schema (Supabase)

### **users**
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  archetype TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  onboarding_step TEXT,
  focus_area TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);
```

### **journal_entries**
```sql
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  card_name TEXT NOT NULL,
  hexagram_name TEXT NOT NULL,
  is_reversed BOOLEAN DEFAULT FALSE,
  reflection TEXT,
  interpretation TEXT,
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);
```

### **notification_templates**
```sql
CREATE TABLE notification_templates (
  id UUID DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  style TEXT DEFAULT 'mystical',
  priority INTEGER DEFAULT 50,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);
```

---

## Error Codes

### **AI Service Errors**
- `MISSING_API_KEY`: OpenAI API key not configured
- `CLIENT_INIT_ERROR`: Failed to initialize OpenAI client
- `INVALID_JSON`: Request body is not valid JSON
- `MISSING_FIELDS`: Required fields missing from request
- `INVALID_TYPE`: Unknown AI service type requested
- `NETWORK_ERROR`: Network connectivity issues
- `RATE_LIMIT`: OpenAI rate limit exceeded
- `INVALID_API_KEY`: OpenAI API key is invalid or expired
- `UNKNOWN_ERROR`: Unhandled server error

### **Authentication Errors**
- `AUTH_REQUIRED`: User must be authenticated
- `SESSION_EXPIRED`: User session has expired
- `INVALID_CREDENTIALS`: Email/password combination invalid
- `USER_NOT_FOUND`: User profile doesn't exist

### **Validation Errors**
- `INVALID_DATE`: Date format is incorrect
- `MISSING_LOCATION`: Birth location is required
- `INVALID_COORDINATES`: Latitude/longitude values invalid

---

## Rate Limiting

### **AI Endpoints**
- **Limit**: 60 requests per minute per user
- **Burst**: Up to 10 concurrent requests
- **Cooldown**: 1 second between requests

### **Supabase**
- **Queries**: 500 per minute per user
- **Auth**: 100 per minute per IP
- **Storage**: 200 uploads per minute

---

## Authentication

### **Supabase Auth**
All API requests to Supabase require authentication via JWT tokens:

```typescript
// Headers required for authenticated requests
{
  "Authorization": "Bearer <jwt_token>",
  "apikey": "<supabase_anon_key>"
}
```

### **Session Management**
- **Token Refresh**: Automatic via Supabase client
- **Storage**: Secure storage via Expo SecureStore
- **Expiry**: 1 hour (refreshed automatically)

---

## Response Formats

### **Success Response**
```typescript
{
  "data": any,           // Response data
  "timestamp": string,   // ISO timestamp
  "status": "success"
}
```

### **Error Response**
```typescript
{
  "error": string,       // Human-readable error
  "code": string,        // Error code
  "details"?: string,    // Additional details
  "timestamp": string,   // ISO timestamp
  "status": "error"
}
```

### **Loading State**
```typescript
{
  "loading": boolean,
  "progress"?: number,   // 0-100 completion percentage
  "message"?: string     // Status message
}
```

---

## Environment Variables

### **Required**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-proj-...
```

### **Optional**
```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...  # For web environments
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=...   # For location autocomplete
EXPO_PUBLIC_API_URL=...                 # Custom API base URL
NODE_ENV=development                     # Environment mode
```

---

## SDK Usage Examples

### **AI Integration**
```typescript
import { getStructuredReflection } from '@/utils/structuredAI';

const { reflection, error } = await getStructuredReflection(
  'The Fool',
  'Heaven',
  false
);

if (error) {
  console.error('AI Error:', error);
} else {
  console.log('Reflection:', reflection);
}
```

### **Database Operations**
```typescript
import { getJournalEntries, saveJournalEntry } from '@/utils/database';

// Fetch entries
const entries = await getJournalEntries();

// Save entry
await saveJournalEntry({
  date: new Date(),
  cardName: 'The Fool',
  hexagramName: 'Heaven',
  isReversed: false,
  reflection: 'Today I learned...'
});
```

### **Authentication**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, signIn, signOut, loading } = useAuth();

// Sign in
await signIn('email@example.com', 'password');

// Sign out
await signOut();
```

---

*Last Updated: July 15, 2025* 