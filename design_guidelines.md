# AeroSense iOS App: Compact Design Guidelines

## Architecture

### Authentication & Profile
- **No traditional login** - single-user utility app with local storage
- **Settings Screen** includes:
  - Avatar picker (3 presets: pilot, flight attendant, passenger silhouettes)
  - Display name (default: "Traveler")
  - Units (metric/imperial), alert sensitivity, haptic toggle
  - Premium upgrade ($4.99/month)

### Navigation
**4-Tab Structure + Floating Action:**
1. Dashboard (house) - Real-time monitoring
2. History (calendar) - Past sessions
3. Devices (antenna.radiowaves) - BLE management
4. Settings (gearshape) - Profile & preferences

**Floating Action Button:**
- "Start Flight Session" - centered above tab bar
- Only visible when device connected
- Initiates flight phase detection

## Screen Layouts

### Layout Principles
**All screens use consistent insets:**
- Top: `insets.top + Spacing.xl` (or `headerHeight + Spacing.xl` with header)
- Bottom: `insets.bottom + Spacing.xl` (+ `tabBarHeight` for tab screens)
- Horizontal: `Spacing.xl` (16pt)

### 1. Onboarding (First Launch)
**Device Scanning:**
- Transparent header, "Skip" button (right)
- Scrollable content: Welcome message, scanning animation, device list
- Device cards: Name, signal strength, "Connect" button
- Empty state: "Looking for devices..." with Bluetooth icon
- Auto-advances to Dashboard on pairing

### 2. Dashboard Tab
**Components (top to bottom):**
- Transparent header: Device name (left), bell icon (right)
- **Hero Gauge:** 72pt CO2 reading with color-coded zones (400-5000 ppm)
  - Green <800, Yellow 800-1400, Orange 1400-2500, Red >2500
- **Flight Phase Pill:** Horizontal indicator (Boarding/Taxi/Cruise/Descent)
- **Alert Cards:** Stacked with left accent bar, icon, message, dismiss
- **Metrics Grid:** 2×2 (Temperature, Humidity, Pressure, Battery)
- **Trend Chart:** 30-min sparkline
- **Hydration Reminder:** Progress ring with water icon

### 3. Pre-Flight Checklist (Modal)
- Header: "Cancel" (left), "Start Flight" (right, disabled until complete)
- Checklist: Device connected, notifications enabled, placement confirmed
- Optional: Airline, flight number, seat

### 4. Active Flight (Dashboard Overlay)
- Phase transition animations
- Time-in-phase counter
- "End Flight" button replaces bell icon
- Phase-specific recommendation cards

### 5. Flight Summary (Modal)
- Stats: Duration, avg/peak CO2, phase breakdown
- Full-session chart
- Export: PDF, HealthKit (Premium), CSV
- Share button

### 6. History Tab
- Search bar, filter icon (right)
- List rows: Date, route, peak CO2 badge, duration
- Tap → detailed Flight Summary
- Empty state: "No flights logged yet" + illustration
- Pull-to-refresh

### 7. Devices Tab
- "Add Device" button (right)
- Connected device card: Name, model, battery, "Disconnect"
- Premium multi-device list
- Troubleshooting link

### 8. Settings Tab
- Avatar (left), "Edit Profile" (right)
- Profile: Avatar picker, display name
- Preferences: Units, alert sensitivity slider, haptic toggle
- Premium upgrade card (free tier)
- Legal links

## Design System

### Colors
**Primary:**
- Sky Blue: `#007AFF`, Deep Navy: `#1C2A3A`

**CO2 Semantic:**
- Safe: `#34C759`, Caution: `#FFD60A`, Warning: `#FF9500`, Critical: `#FF3B30`

**UI (Light/Dark):**
- Background: `#FFFFFF` / `#000000`
- Card: `#F2F2F7` / `#1C1C1E`
- Divider: `#C6C6C8` / `#38383A`

### Typography (SF Pro)
- Hero Metric: Display 72pt Bold
- H1: Display 34pt Bold
- H2: Text 22pt Semibold
- H3: Text 17pt Semibold
- Body: Text 17pt Regular
- Caption: Text 13pt Regular

### Components

**Cards:**
- Corner radius: 12pt, Padding: 16pt
- Background: Adaptive card color
- **No shadows** except floating buttons (offset: 0,2 / opacity: 0.10 / radius: 2)

**Buttons:**
- Primary: Filled Sky Blue, 50pt height, full-width
- Secondary: Outline, 44pt height
- Destructive: Filled Red
- All: 12pt radius, haptic on press

**Alerts:**
- Full-width with 4pt left accent bar (color-coded)
- SF Symbol icon, title, description, "×" dismiss
- Critical: Vibration + sound

**Gauges:**
- Circular progress with animated transitions (0.5s ease-in-out)
- Color segments at thresholds

**Charts:**
- Swift Charts framework
- Line with gradient fill
- X-axis: 5-10min intervals, Y-axis: ppm scale

### Interaction States
- Pressed: 0.6 opacity + scale(0.95) + haptic
- Disabled: 0.3 opacity
- Loading: Pulsing animation (scanning), system progress (syncing)

### Transitions
- Navigation: iOS default push/modal
- Tabs: Crossfade
- Alerts: Slide from top
- Modals: Sheet with drag-dismiss

## Accessibility (Safety-Critical)

**Requirements:**
- Touch targets: Minimum 44×44pt
- Contrast: WCAG AA (4.5:1)
- Dynamic Type: Support up to Accessibility Extra Large
- VoiceOver labels:
  - Gauge: "Carbon dioxide level: [value] parts per million, [status]"
  - Phase: "Flight phase: [phase name]"
- Never use color alone (add icons + text)
- Haptic for critical alerts (works in silent mode)
- Reduce Motion: Disable animations, use crossfades

## Assets

**Generated:**
- Avatars: 3 circular silhouettes (pilot/attendant/passenger) - minimalist, white bg
- Empty states: Bluetooth+airplane, paper airplane, cloud+airplane
- App icon: Circular gauge with airplane, sky blue→navy gradient (1024×1024)

**SF Symbols:**
- Nav: house, calendar, antenna.radiowaves.left.and.right, gearshape
- Actions: plus.circle.fill, xmark, checkmark.circle, square.and.arrow.up
- Metrics: thermometer, drop, gauge, battery.100
- Alerts: bell.fill, exclamationmark.triangle.fill
- Phases: airplane.departure, airplane, airplane.arrival

## Platform Best Practices

- Safe Area insets for all iPhones (notch/Dynamic Island)
- 3D/Haptic Touch on device cards for quick actions
- Alert sheets for destructive actions
- Landscape support for charts (iPad compatible)

**Performance:**
- Gauge updates: Max 1Hz (BLE interval)
- Chart redraws: Throttle to 0.5s
- Cache flight summaries for instant History load

---

**Key Dos:**
- Use semantic colors consistently across all CO2 displays
- Always pair haptic with visual feedback for safety alerts
- Respect iOS native patterns (sheets, navigation, gestures)
- Test with VoiceOver and Dynamic Type enabled

**Key Don'ts:**
- No drop shadows except floating action button
- Never rely on color alone for critical information
- Don't update UI faster than sensor refresh rate
- Avoid custom animations when Reduce Motion enabled