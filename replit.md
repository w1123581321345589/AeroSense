# AeroSense - Replit Agent Guidelines

## Overview

AeroSense is a cross-platform mobile application built with React Native/Expo that connects to portable CO2 monitors via Bluetooth Low Energy (BLE). The app provides aviation-specific air quality intelligence, displaying real-time CO2 readings with flight-phase context, evidence-based alerts, and actionable recommendations for travelers.

**Core Purpose:** Help airline passengers and crew monitor cabin air quality during flights, with research showing that high CO2 levels (2500-4000 ppm) during boarding/taxi significantly impact cognitive performance.

**Business Model:** Freemium app with free tier showing basic readings; Premium ($4.99/month) unlocks flight intelligence, history export, and multi-device support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Client Architecture (React Native/Expo)

**Framework:** Expo SDK 54 with React Native 0.81, using the new architecture and React 19.

**Navigation:** React Navigation v7 with a hybrid structure:
- Native stack navigator for root-level screens (onboarding, modals)
- Bottom tab navigator for main app sections (Dashboard, History, Devices, Settings)
- Floating action button overlays tab bar for session management

**State Management:**
- React Context (`AppProvider`) for global app state including device connection, readings, sessions, and settings
- TanStack Query for server state management and API calls
- AsyncStorage for local persistence of user settings, sessions, and device info

**UI/Theming:**
- Custom theme system with light/dark mode support via `useTheme` hook
- Consistent spacing, typography, and color constants defined in `constants/theme.ts`
- CO2-specific color coding: Green (<800), Yellow (800-1400), Orange (1400-2500), Red (>2500 ppm)
- Reanimated for animations, blur effects for iOS-native feel

**Key Design Patterns:**
- Single-user utility app with local storage (no traditional authentication)
- Mock data generation for development/demo purposes
- Component-based architecture with reusable themed components

### Server Architecture (Express)

**Runtime:** Node.js with Express, using TSX for TypeScript execution.

**API Design:** RESTful endpoints prefixed with `/api`, though currently minimal server-side logic as the app is primarily client-focused with local storage.

**Data Layer:**
- Drizzle ORM configured for PostgreSQL
- Schema defined in `shared/schema.ts` with Zod validation via `drizzle-zod`
- Memory storage available as fallback (`MemStorage` class)

### Build System

**Development:**
- Expo development server with custom proxy configuration for Replit
- Separate processes for Expo (`expo:dev`) and Express server (`server:dev`)

**Production:**
- Expo static builds via custom build script
- Server bundled with esbuild to `server_dist/`

### Path Aliases

- `@/*` → `./client/*`
- `@shared/*` → `./shared/*`

## External Dependencies

### Core Mobile Dependencies
- **Expo SDK 54:** Platform abstraction, splash screen, haptics, system UI, image handling
- **React Navigation:** Navigation framework with native stack and bottom tabs
- **React Native Reanimated:** Animation library for fluid UI interactions
- **React Native Gesture Handler:** Touch gesture handling
- **React Native Safe Area Context:** Safe area insets for notches/islands
- **Expo Blur/Glass Effect:** Visual blur effects for modern UI

### Data & State
- **TanStack React Query:** Server state management and caching
- **AsyncStorage:** Local key-value persistence for React Native
- **Drizzle ORM:** Type-safe SQL ORM for PostgreSQL
- **Zod:** Schema validation and type inference

### Server
- **Express:** HTTP server framework
- **PostgreSQL (pg):** Database driver
- **http-proxy-middleware:** Request proxying for development
- **ws:** WebSocket support

### Recent Changes (December 2025)
- Fixed mock reading generation to produce values up to ~3400 ppm for critical alert testing
- Fixed session deletion to properly use `deleteSession` helper function
- Fixed `connectDevice` to reset `isScanning` state on connection
- Fixed TypeScript style array issue in `FlightPhasePill` component
- All hydration and phase updates now properly persist via `saveCurrentSession`

### Planned Integrations (from specifications)
- **CoreBluetooth/BLE:** Connection to CO2 monitors (Aranet4, INKBIRD IAM-T1, Qingping)
- **Background Tasks:** Background monitoring during flights
- **Critical Alerts:** Apple entitlement for important notifications