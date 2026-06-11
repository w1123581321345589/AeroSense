<div align="center">
  <img src="assets/images/icon.png" alt="AeroSense" width="120" height="120" style="border-radius: 20px" />
  <h1>AeroSense</h1>
  <p><strong>Aviation air quality monitoring for passengers and crew</strong></p>

  ![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
  ![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey?style=flat-square)
  ![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo)
  ![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react)
  ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
</div>

---

AeroSense connects to portable CO2 monitors via Bluetooth and gives you real-time air quality data tuned for life at 35,000 feet. Research shows CO2 levels above 2,500 ppm — common during boarding and taxi — measurably affect cognitive performance. AeroSense keeps you informed so you can act.

## Screenshots

> Run on a physical device via [Expo Go](https://expo.dev/go) to see the full experience.

| Dashboard | History | Airline Rankings |
|-----------|---------|-----------------|
| Live CO2 gauge with flight phase | Past sessions with quality scores | 30 airlines ranked by air quality |

## Features

**Real-time monitoring**
- Live CO2 readings with color-coded zones updated every few seconds
- Circular gauge with animated needle and ppm display
- Trend sparkline showing the last 20 readings at a glance

**Flight phase awareness**
- Tracks your full journey: Pre-flight → Boarding → Taxi → Takeoff → Cruise → Descent → Arrived
- Each phase has different alert thresholds based on real cabin conditions
- Phase context shown inline with every reading

**Evidence-based alerts**
- Notifications when CO2 crosses thresholds that affect cognitive performance
- Actionable recommendations (open vent, move seats, request increased circulation)
- Haptic feedback on alerts so you notice without looking at the screen

**Session history**
- Every flight automatically saved with a full timeline of readings
- Session summary with peak CO2, time in each zone, and an overall air quality score
- Export-ready data for researchers or frequent flyers tracking patterns

**Airline rankings**
- Database of 30 major airlines ranked by reported cabin air quality
- Searchable, with region filters and score breakdowns
- Based on aggregated passenger monitoring data

**Device support**
- Aranet4 (the most popular portable CO2 monitor)
- INKBIRD IAM-T1
- Demo mode with realistic simulated data for testing without hardware

## CO2 Zones

| Zone | Range | What it means |
|------|-------|---------------|
| 🟢 Good | < 800 ppm | Normal, fresh air |
| 🟡 Moderate | 800–1,400 ppm | Open your overhead vent |
| 🟠 Poor | 1,400–2,500 ppm | Increase ventilation, limit exertion |
| 🔴 Critical | > 2,500 ppm | Maximum ventilation, consider moving seats |

## Tech Stack

**Mobile (client/)**
- React Native + Expo SDK 54
- React Navigation 7 (native stack + bottom tabs)
- React Native Reanimated for animations
- TanStack Query for data fetching
- AsyncStorage for local persistence

**Server (server/)**
- Express.js with TypeScript
- Drizzle ORM + PostgreSQL
- Zod for schema validation

## Getting Started

```bash
npm install
npm run dev
```

Then open Expo Go on your phone and scan the QR code, or press `w` for the web version.

**Requirements:** Node.js 18+, Expo Go app on iOS or Android.

## Project Structure

```
├── client/
│   ├── screens/          # Dashboard, History, Devices, Settings, etc.
│   ├── lib/              # BLE, notifications, airlines, context
│   ├── components/       # Shared UI components
│   ├── navigation/       # Stack and tab navigators
│   └── constants/        # Theme, colors, spacing
├── server/
│   ├── index.ts          # Express entry point
│   └── lib/              # Server utilities and GitHub sync
└── shared/
    └── schema.ts         # Drizzle schema + Zod types
```

## BLE & Device Connectivity

The BLE layer (`client/lib/ble.ts`) runs in simulation mode inside Expo Go and on web, producing realistic readings that exercise all CO2 zones and alert thresholds. When built as a standalone app with the proper entitlements, it connects to real hardware using the device's CoreBluetooth / Android BLE stack.

## License

MIT
