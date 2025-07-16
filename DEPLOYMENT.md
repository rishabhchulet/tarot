# Deployment Guide

## Overview

This guide covers deploying the Daily Inner Reflection Tarot App to various platforms including web hosting, mobile app stores, and setting up CI/CD pipelines.

---

## Prerequisites

### **Required Tools**
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g @expo/eas-cli`)
- Git for version control

### **Required Accounts**
- **Expo Account**: For EAS Build and deployment
- **Apple Developer Account**: For iOS App Store deployment ($99/year)
- **Google Play Console**: For Android Play Store deployment ($25 one-time)
- **Supabase Account**: For backend services
- **OpenAI Account**: For AI integration
- **Hosting Provider**: Vercel, Netlify, or similar for web deployment

---

## Environment Configuration

### **Environment Variables**

#### **Production Environment (.env.production)**
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your_production_openai_key
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your_production_openai_key

# Optional Services
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_key

# App Configuration
NODE_ENV=production
EXPO_PUBLIC_APP_VERSION=1.0.0
```

#### **Staging Environment (.env.staging)**
```env
# Same structure as production but with staging keys
EXPO_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
OPENAI_API_KEY=sk-proj-your_staging_openai_key
# ... other staging keys
```

---

## Web Deployment

### **Building for Web**

#### **1. Install Dependencies**
```bash
npm install
```

#### **2. Build Web Bundle**
```bash
# Production build
npm run build:web

# The build output will be in the 'dist' folder
```

#### **3. Test Local Build**
```bash
# Serve locally to test
npx serve dist -p 3000
```

### **Deployment Platforms**

#### **Vercel Deployment**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure vercel.json**
```json
{
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist",
  "framework": "expo",
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "@supabase_url",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "OPENAI_API_KEY": "@openai_api_key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

3. **Deploy**
```bash
# First time deployment
vercel

# Subsequent deployments
vercel --prod
```

#### **Netlify Deployment**

1. **Create netlify.toml**
```toml
[build]
  command = "npm run build:web"
  publish = "dist"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy via Git**
- Connect your repository to Netlify
- Set environment variables in Netlify dashboard
- Auto-deploys on git push

#### **Custom Server Deployment**

For deploying to your own server:

1. **Build the app**
```bash
npm run build:web
```

2. **Upload dist folder to server**
```bash
# Example with rsync
rsync -avz dist/ user@yourserver.com:/var/www/tarot-app/
```

3. **Configure web server (nginx example)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/tarot-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Mobile Deployment

### **EAS Build Setup**

#### **1. Initialize EAS**
```bash
eas login
eas build:configure
```

#### **2. Configure eas.json**
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### **3. Configure app.json for builds**
```json
{
  "expo": {
    "name": "Daily Inner Reflection",
    "slug": "daily-inner-reflection",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0a"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.dailyinner.reflection",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/icon.png",
        "backgroundColor": "#6B46C1"
      },
      "package": "com.dailyinner.reflection",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### **iOS Deployment**

#### **1. Build for iOS**
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

#### **2. TestFlight Deployment**
```bash
# Submit to App Store Connect
eas submit --platform ios --profile production
```

#### **3. App Store Release**
1. Open App Store Connect
2. Create new app version
3. Upload build from TestFlight
4. Fill in app metadata:
   - Description
   - Keywords
   - Screenshots
   - App Store Icon
5. Submit for review

### **Android Deployment**

#### **1. Build for Android**
```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

#### **2. Google Play Console**
```bash
# Submit to Google Play
eas submit --platform android --profile production
```

#### **3. Play Store Release**
1. Open Google Play Console
2. Create new release
3. Upload AAB file
4. Fill in store listing:
   - Title and description
   - Screenshots
   - App icon
   - Content rating
5. Review and publish

---

## Database Deployment

### **Supabase Setup**

#### **1. Production Database**
1. Create new Supabase project for production
2. Run database migrations:
```sql
-- Run all migration files in order
-- From supabase/migrations/ folder
```

3. Set up Row Level Security (RLS) policies
4. Configure authentication providers
5. Set up storage buckets if needed

#### **2. Environment Configuration**
```bash
# Set production environment variables
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### **Database Migration Strategy**

#### **Development to Production**
```bash
# Export development schema
supabase db dump --schema-only > schema.sql

# Import to production (be careful!)
psql -h your-prod-host -U postgres -d postgres < schema.sql
```

#### **Backup Strategy**
```bash
# Daily automated backups
supabase db dump --data-only > backup-$(date +%Y%m%d).sql

# Store in secure location (S3, etc.)
```

---

## CI/CD Pipeline

### **GitHub Actions Workflow**

#### **.github/workflows/deploy.yml**
```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint

  build-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web
        run: npm run build:web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS
        run: eas build --platform ios --non-interactive --profile production
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build Android
        run: eas build --platform android --non-interactive --profile production
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### **Required Secrets**

Set these in your repository settings:

```bash
# Expo/EAS
EXPO_TOKEN=your_expo_access_token

# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_organization_id
VERCEL_PROJECT_ID=your_project_id

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# OpenAI
OPENAI_API_KEY=sk-proj-your_api_key

# Google Places (if using)
GOOGLE_PLACES_API_KEY=your_google_api_key
```

---

## Monitoring & Analytics

### **Error Tracking**

#### **Sentry Integration**
```bash
npm install @sentry/react-native
```

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});
```

### **Performance Monitoring**

#### **Basic Analytics**
```typescript
// utils/analytics.ts
export const trackEvent = (eventName: string, properties?: object) => {
  if (process.env.NODE_ENV === 'production') {
    // Your analytics service (Mixpanel, Amplitude, etc.)
    console.log('Track:', eventName, properties);
  }
};
```

### **Health Monitoring**

#### **API Health Checks**
```typescript
// app/health+api.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      ai: await checkOpenAI(),
    }
  };
  
  return Response.json(health);
}
```

---

## Security Considerations

### **Environment Security**
- Never commit API keys to version control
- Use secure environment variable storage
- Rotate keys regularly
- Use different keys for staging/production

### **API Security**
- Implement rate limiting
- Use HTTPS only
- Validate all inputs
- Implement proper authentication

### **Mobile Security**
- Enable app transport security
- Use certificate pinning for critical APIs
- Implement app integrity checks
- Use secure storage for sensitive data

---

## Performance Optimization

### **Web Performance**
```javascript
// Bundle analysis
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js
```

### **Mobile Performance**
- Use Hermes JavaScript engine (Android)
- Optimize images and assets
- Implement lazy loading
- Monitor memory usage

### **API Performance**
- Implement caching strategies
- Use CDN for static assets
- Optimize database queries
- Monitor response times

---

## Rollback Strategy

### **Web Rollback**
```bash
# Vercel rollback to previous deployment
vercel rollback
```

### **Mobile Rollback**
- iOS: Use App Store Connect to revert to previous version
- Android: Use Google Play Console to halt rollout or revert

### **Database Rollback**
```bash
# Restore from backup
psql -h your-host -U postgres -d postgres < backup-20250715.sql
```

---

## Troubleshooting

### **Common Build Issues**

#### **Memory Issues**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build:web
```

#### **Dependency Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### **Deployment Issues**

#### **Environment Variables Not Loading**
- Verify variables are set in deployment platform
- Check variable names match exactly
- Ensure EXPO_PUBLIC_ prefix for client-side variables

#### **Build Failures**
- Check build logs for specific errors
- Verify all dependencies are correctly installed
- Test build locally first

---

## Maintenance

### **Regular Tasks**
- Monitor error rates and performance
- Update dependencies monthly
- Backup database regularly
- Review and rotate API keys
- Monitor usage and costs

### **Version Updates**
1. Update version in app.json
2. Update build numbers for mobile
3. Create git tag for release
4. Update changelog
5. Deploy to staging first
6. Test thoroughly
7. Deploy to production

---

*Last Updated: July 15, 2025* 