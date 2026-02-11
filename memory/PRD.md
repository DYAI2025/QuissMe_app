# QuissMe v2 - Product Requirements Document

## Overview
QuissMe is a relationship discovery quiz game for couples. V2 introduces the Living Mirror Engine (LME) Dashboard as a shared "Garden World", a circular Quiz Wheel (Cluster-Kranz), a ClusterCycle state machine, and the Flow/Spark/Talk resonance system.

## Core Features

### 1. Splash / Intro Screen
- QuissMe branding, star particles (Night Mode), "Tippen zum Starten"

### 2. Astro Onboarding
- Birth data: Name, Date (YYYY-MM-DD), Time (HH:MM), Location
- BAFE API for zodiac calculation (fallback: local calculation)

### 3. Personal Astro Result
- Zodiac display, "Partner:in einladen" or "Solo erkunden"

### 4. Partner System
- 6-char invite code generation + Share API
- Join screen: code + birth data → creates couple
- AI-generated couple interpretation (Gemini 3 Flash)

### 5. Tab Navigation (4 Tabs)
- **Home** - Dashboard with Garden + Quiz Wheel
- **Entdecken** - Quiz library by sector (Leidenschaft/Stabilität/Zukunft)
- **Garten** - Shared garden visualization + stats
- **Profil** - User info, zodiac, logout

### 6. LME Dashboard (Garden + Wheel)
- Central garden island visualization
- Circular Quiz Wheel with 5 nodes (one per love language cluster)
- Node states with color-coded visual feedback
- Seeds counter (3/week) + garden stats

### 7. Quiz State Machine (ClusterCycle)
States: `available → activated → one_completed → ready_to_reveal → revealed`
- **Activation**: Max 3 per week per partner, max 3 unresolved
- **Async**: Each partner completes independently, no time pressure
- **Gating**: Reveal only when both partners complete
- **Quiz Flow**: 10 questions/quiz, 4 glassmorphic options, progress bar

### 8. Insight Drop (Warm/Dusk Mode)
- Flow/Spark/Talk zone classification (no percentages!)
- Tendencies: "stark ausgeprägt / im Einklang / im Aufbau" with warm sentences
- AI-generated insight text (Gemini 3 Flash)
- Buff (Meaning Moment): warm micro-action for the couple

### 9. Reward System
- 3 choices per revealed cycle: Plant, Land piece, Deco
- Items placed into shared garden
- Zone resonance colors reward items

### 10. Flow/Spark/Talk Resonance
- **Flow**: lilac/violet/blue - calm harmonic
- **Spark**: amber/orange/gold - dynamic energy
- **Talk**: mauve/teal/stone - bridging ground
- All neutral - no judgment, only resonance

## Design System
- **Night Mode**: #0F1B2D / #1A2740 - onboarding, quiz, dashboard
- **Warm/Dusk Mode**: #1C1232 / #2D1B4E / #D4A338 - results, insights, rewards
- **Glassmorphism**: BlurView, rgba borders, 24px radius
- **No Analytics Aesthetic**: No %, no scores, only tendencies

## Backend Architecture (FastAPI + MongoDB)
Collections: users, couples, quizzes, cluster_cycles
Key endpoints: /api/quiz/wheel, /api/quiz/activate, /api/quiz/submit, /api/quiz/reveal, /api/garden/*

## Integrations
- **Gemini 3 Flash** via Emergent LLM Key - insights + couple interpretation
- **BAFE Astro API** (with zodiac fallback)

## Test Results: Backend 22/22 ✅, Frontend ✅
