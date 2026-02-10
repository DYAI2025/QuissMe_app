# QuissMe - Product Requirements Document

## Overview
QuissMe is a relationship discovery quiz game app for couples. It combines astrology-based onboarding with interactive love language quizzes, providing couples with insights into their connection patterns.

## Core Features (MVP)

### 1. Splash / Intro Screen
- QuissMe branding with animated star particles (Night Mode)
- "Tippen zum Starten" CTA → navigates to onboarding

### 2. Astro Onboarding (Person A)
- Birth data input: Name, Geburtsdatum (YYYY-MM-DD), Geburtszeit (HH:MM), Geburtsort
- API call to BAFE astrology API for zodiac calculation
- Fallback zodiac calculation if BAFE API unavailable
- Generates invite code for partner pairing

### 3. Personal Astro Result
- Displays zodiac sign (Sternzeichen), moon sign, Chinese zodiac
- Options: "Partner:in einladen" or "Solo erkunden"

### 4. Partner Invitation
- 6-character alphanumeric invite code generation
- Share functionality via native Share API
- Navigation to Waiting Room

### 5. Partner Join (Person B)
- Enter invite code + same birth data input
- Creates couple pairing in database
- Triggers Gemini AI interpretation of couple compatibility

### 6. Waiting Room
- Animated waiting state for partner synchronization
- Pulsing circle + loading dots animation

### 7. Couple Match / Mini-Interpretation (Dusk Mode)
- AI-generated positive couple interpretation (Gemini 3 Flash)
- Synchronicity score display (72-95%)
- Warm/sunset color theme for reward feeling

### 8. Couple Dashboard (LME)
- Overview stats: Quiz count, Cluster count, Question count
- 5 Love Language quiz cards:
  - Lob & Anerkennung (Words of Affirmation)
  - Zweisamkeit (Quality Time)
  - Geschenke (Receiving Gifts)
  - Hilfsbereitschaft (Acts of Service)
  - Körperliche Nähe (Physical Touch)
- Pull-to-refresh functionality

### 9. Quiz Flow
- 1 question per screen, 4 glassmorphic option cards
- Progress bar with fraction counter
- Back navigation support
- Auto-advance on option selection (400ms delay)
- 10 questions per quiz

### 10. Quiz Result / Insight Drop (Dusk Mode)
- Primary love language cluster display
- Primary type identification (if applicable)
- Normalized score bars (0-100%) for all 5 clusters
- Zone token insights (strength, growth, micro-step)
- Share result functionality
- "Nächstes Quiz" CTA

## Technical Architecture

### Backend (FastAPI + MongoDB)
- **API Prefix**: /api
- **Database**: MongoDB with collections: users, couples, quizzes, quiz_results
- **External APIs**: BAFE Astrology API (with fallback), Gemini 3 Flash (via emergentintegrations)
- **Quiz Data**: Seeded from JSON files on startup (5 love language quizzes × 10 questions)

### Frontend (Expo Router + React Native)
- **Navigation**: Stack-based with expo-router
- **Design System**: Dual mood (Night/Dusk), Glassmorphism UI, 8pt grid
- **State**: AsyncStorage for user/couple IDs

## Design System
- **Night Mode**: Navy (#0F1B2D), Indigo (#1E2D4A) - for onboarding, quiz
- **Dusk Mode**: Purple (#2D1B4E), Gold (#D4A338) - for results, rewards
- **Glass**: rgba(255,255,255,0.1) with BlurView, 24px border-radius
- **Buttons**: Pill-shaped, primary accent (#7351B7)

## Integration Notes
- BAFE API returns 401 currently → zodiac fallback always active
- Gemini 3 Flash generates German couple interpretation text
- Emergent LLM Key: sk-emergent-726537eD25e0666F59

## Future Enhancements
- Real Google Maps picker for birth location with coordinates
- Real-time WebSocket for waiting room synchronization
- Premium tier: 3+ quizzes per 7-day period
- Trading Cards (9:16) shareable result images
- Growth Path with daily buffs and challenges
- Multi-quiz couple results aggregation
