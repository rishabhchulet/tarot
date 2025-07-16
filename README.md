# Daily Inner Reflection - Tarot App

A mystical React Native/Expo application that combines ancient wisdom with modern technology, offering personalized tarot readings, I Ching insights, and AI-powered reflections for spiritual growth and self-discovery.

## ✨ Features

### 🔮 Core Functionality
- **Daily Card Draws**: Personalized tarot card selections with I Ching hexagram combinations
- **AI-Powered Reflections**: Intelligent interpretations using OpenAI GPT-4o-mini
- **Structured Insights**: 4-part reflection system (I Ching, Tarot, Synthesis, Prompts)
- **Journal Integration**: Track your spiritual journey with timestamped entries
- **Breathing Exercises**: Guided meditation and mindfulness practices

### 🌟 Mystical Features
- **Astrology Integration**: Birth chart analysis and archetype mapping
- **Compatibility Reports**: Relationship insights for couples and friendships
- **Personalized Guidance**: AI recommendations based on your focus areas
- **North Node Insights**: Karmic path and life purpose exploration
- **Archetype System**: 22 Major Arcana archetypes with unique icons and colors

### 📱 User Experience
- **Onboarding Flow**: Guided setup with name, birth data, and focus area selection
- **Beautiful UI**: Dark theme with gradients, animations, and mystical aesthetics
- **Cross-Platform**: Works on iOS, Android, and Web
- **Offline Capable**: Fallback content when AI services are unavailable
- **Responsive Design**: Optimized for all screen sizes

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI Integration**: OpenAI GPT-4o-mini
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet with LinearGradient
- **State Management**: React Context API
- **Authentication**: Supabase Auth with secure token storage

### **Project Structure**
```
tarot/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation screens
│   ├── auth/                # Authentication flow
│   ├── onboarding/          # User setup flow
│   ├── ai+api.ts           # AI service endpoints
│   └── compatibility.tsx    # Relationship insights
├── components/              # Reusable UI components
├── contexts/               # React Context providers
├── data/                   # Static data (cards, hexagrams)
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript definitions
├── utils/                  # Helper functions and services
└── assets/                 # Images and static resources
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- OpenAI API key
- Supabase account and project

### **Environment Setup**
1. Create `.env` file in project root:
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your_openai_api_key
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your_openai_api_key  # For Bolt.new/web environments

# Optional
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_key
```

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd tarot

# Install dependencies
npm install

# Start development server
npm start
# or for web only
npm run dev
```

### **Database Setup**
1. Create Supabase project at https://supabase.com
2. Run migrations in `supabase/migrations/` folder
3. Set up RLS (Row Level Security) policies
4. Configure authentication providers if needed

## 📖 Usage Guide

### **First Time Setup**
1. **Authentication**: Sign up with email/password
2. **Onboarding**: Complete the guided setup
   - Enter your name
   - Select primary focus area
   - Provide birth information (optional)
   - Learn about breathing exercises
3. **First Reading**: Draw your first card for personalized insights

### **Daily Practice**
1. **Morning Reflection**: Draw a daily card for guidance
2. **Journal Entry**: Record insights and thoughts
3. **Breathing**: Use guided exercises for mindfulness
4. **Evening Review**: Reflect on the day's lessons

### **Advanced Features**
- **Compatibility**: Generate relationship reports
- **Calendar**: Track your spiritual journey over time
- **Settings**: Customize notifications and preferences
- **Profile**: Update focus areas and birth information

## 🤖 AI Integration

### **OpenAI Services**
- **Model**: GPT-4o-mini (optimized for speed and cost)
- **Response Time**: 8-15 seconds average
- **Success Rate**: 95%+ with retry logic
- **Fallbacks**: Offline content when AI unavailable

### **AI Features**
1. **Card Interpretations**: Contextual meanings based on user focus
2. **Reflection Prompts**: Personalized questions for self-discovery
3. **Compatibility Reports**: Relationship analysis and insights
4. **Structured Reflections**: 4-part wisdom synthesis
5. **Personalized Guidance**: Daily recommendations

## 🔧 Development

### **Available Scripts**
```bash
npm start          # Start Expo development server
npm run dev        # Start with telemetry disabled
npm run build:web  # Build for web deployment
npm run lint       # Run ESLint checks
```

### **Key Development Notes**
- Uses Expo Router for file-based routing
- TypeScript for type safety
- Custom hooks for business logic
- Context providers for global state
- Comprehensive error handling and logging

### **Testing AI Features**
1. Check debug endpoint: `GET /debug`
2. Monitor console logs for AI operations
3. Test with different card/hexagram combinations
4. Verify fallback behavior when AI unavailable

## 🎨 Design System

### **Color Palette**
- **Primary**: Purple gradients (#8b5cf6, #6366f1)
- **Background**: Dark theme (#0a0a0a, #171717)
- **Text**: Light grays (#F9FAFB, #d1d5db)
- **Accents**: Gold (#FBBF24), Pink (#f87171)

### **Typography**
- **Primary Font**: Inter (Regular, Medium, SemiBold, Bold, ExtraBold)
- **Sizing**: 12px-32px range with responsive scaling
- **Line Height**: 1.4-1.6 for optimal readability

### **Components**
- Reusable UI components in `/components`
- Consistent styling with StyleSheet
- Cross-platform compatibility
- Accessibility considerations

## 🔐 Security & Privacy

### **Data Protection**
- Supabase RLS policies for data access control
- Secure token storage with Expo SecureStore
- Environment variables for sensitive keys
- No personal data stored in logs

### **Authentication**
- Email/password authentication via Supabase
- Session management with automatic refresh
- Secure logout and data cleanup
- Password reset functionality

## 🚀 Deployment

### **Web Deployment**
```bash
npm run build:web
# Deploy /dist folder to your hosting service
```

### **Mobile Deployment**
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🐛 Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### **Quick Fixes**
- **AI not working**: Check OpenAI API key in debug endpoint
- **App crashes**: Clear cache and restart
- **Build errors**: Delete node_modules and reinstall
- **Authentication issues**: Check Supabase configuration

## 📚 Additional Documentation

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Issue resolution guide
- [API.md](./API.md) - API endpoints and data structures
- [COMPONENTS.md](./COMPONENTS.md) - Component documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o-mini API
- **Supabase** for backend infrastructure
- **Expo** for development framework
- **Lucide** for beautiful icons
- **React Native community** for excellent ecosystem

---

*Built with ❤️ for spiritual growth and self-discovery*