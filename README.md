# AeroSense - Aviation Air Quality Monitor

A cross-platform mobile application built with React Native/Expo that connects to portable CO2 monitors via Bluetooth Low Energy (BLE). The app provides aviation-specific air quality intelligence for airline passengers and crew.

## Features

- **Real-time CO2 Monitoring**: Live readings with color-coded zones (Green <800, Yellow 800-1400, Orange 1400-2500, Red >2500 ppm)
- **Flight Phase Tracking**: Context-aware monitoring through all flight phases (Pre-flight, Boarding, Taxi, Takeoff, Climb, Cruise, Descent, Landing, Arrived)
- **Evidence-based Alerts**: Actionable recommendations based on CO2 levels and research on cognitive performance
- **Hydration Tracking**: Monitor water intake during flights
- **Session History**: View past flight sessions with air quality summaries
- **Device Management**: Connect to BLE CO2 monitors (Aranet4, INKBIRD IAM-T1)
- **Dark/Light Theme**: Automatic theme switching with iOS liquid glass design

## Tech Stack

### Frontend
- **React Native** with **Expo SDK 54**
- **React Navigation 7** (Native Stack + Bottom Tabs)
- **React Native Reanimated** for animations
- **TanStack Query** for data fetching
- **AsyncStorage** for local persistence

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Zod** for validation

## Project Structure

```
├── client/                 # React Native/Expo app
│   ├── App.tsx            # App entry point
│   ├── components/        # Reusable UI components
│   ├── constants/         # Theme and configuration
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Context, storage, types
│   ├── navigation/        # Navigation configuration
│   └── screens/           # App screens
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   └── lib/              # Server utilities
├── shared/               # Shared types and schemas
└── scripts/              # Build scripts
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app (for mobile testing)

### Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open Expo Go on your mobile device and scan the QR code, or press `w` to open in web browser.

## CO2 Alert Thresholds

| Level | CO2 (ppm) | Status | Action |
|-------|-----------|--------|--------|
| Good | <800 | Green | Normal cabin air |
| Moderate | 800-1400 | Yellow | Consider opening air vent |
| Poor | 1400-2500 | Orange | Open vent, increase circulation |
| Critical | >2500 | Red | Maximum ventilation needed |

## Supported Devices

- **Aranet4** - Popular portable CO2 monitor
- **INKBIRD IAM-T1** - Budget-friendly option
- **Demo Mode** - Simulated data for testing

## License

MIT License

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
