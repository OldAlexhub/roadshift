# RoadShift: Traffic Puzzle

**Package:** `com.oldalexhub.roadshift`
**Developer:** Old Alex Hub
**Platform:** Android
**Framework:** Bare React Native with TypeScript
**Version:** 1.0.0

---

## Description

RoadShift is a city traffic puzzle game where you manage a fleet of vehicles across a glowing nighttime city grid. Plan routes, assign riders, navigate road conditions, and earn stars for efficient service.

## Features

- 60 campaign levels across 6 city districts
- Four vehicle types: Compact Cab, City Van, Access Van, Shuttle
- Four rider types: Standard, Priority, Accessible, Group
- Road conditions: normal, fast, congested, rain-slowed, closed
- Deterministic route engine using Dijkstra's algorithm
- Animated live shift simulation
- Three-star scoring per level
- 14 local achievements
- AdMob banner, interstitial, and app-open ads
- Offline gameplay (internet used only for ads)
- No account, no backend, no cloud

## Gameplay

1. Study the level briefing to understand vehicles and riders available
2. On the Dispatch Board, tap a vehicle to select it
3. Tap rider pickup points on the city map to assign them
4. The route preview shows the planned path with road conditions
5. Press START SHIFT when all riders are assigned
6. Watch vehicles animate through the city completing pickups and dropoffs
7. View your score, stars, and achievements on the Results screen

## Districts

| District | Levels | New Mechanics |
|---|---|---|
| First Shift | 1-10 | Basics: select, assign, route, stars |
| Downtown Flow | 11-20 | Congestion, capacity, deadlines |
| Access Line | 21-30 | Accessible riders, Access Van matching |
| Rain Circuit | 31-40 | Rain delays, road closures, detours |
| Event Surge | 41-50 | Surges, shared destinations, fleet pressure |
| Midnight Grid | 51-60 | All mechanics combined, campaign finale |

## Offline Play

All 60 levels work without internet. Scores and progress are saved to device-local storage. Internet is only used for Google AdMob advertising.

## No Login Required

RoadShift requires no account, email, or sign-in of any kind. All progress is stored locally on the device.

## No Backend

Old Alex Hub does not operate a server or cloud backend for RoadShift. No gameplay data leaves your device.

## Local Data Storage

Stored locally using AsyncStorage:
- Level completion and best scores
- Star ratings
- Achievement status
- Settings (sound, haptics)
- Tutorial completion state
- Ad eligibility counters (for respectful ad frequency)

---

## Development Setup

### Requirements

- Node.js 22.x or later
- Android Studio with Android SDK (API 24+)
- Java 17 (bundled with Android Studio is fine)
- React Native CLI

### Install Dependencies

```bash
cd roadshift
npm install
```

### Run Debug Build on Android Emulator or Device

```bash
npx react-native start
# In a second terminal:
npx react-native run-android
```

### Ad Test IDs in Debug Builds

Debug builds automatically use Google AdMob test ad IDs defined in:
- `src/config/ads.ts` (JavaScript layer via `__DEV__` flag)
- `android/app/src/debug/res/values/strings.xml` (native AdMob App ID override)

### Production AdMob IDs in Release Builds

Release builds use:
- `android/app/src/main/res/values/strings.xml` for the native AdMob App ID
- `src/config/ads.ts` for JavaScript ad unit IDs (controlled by `__DEV__`)

---

## Release Build with release.py

`release.py` is the recommended way to build, sign, and package a release.

### Basic Usage

From the parent directory (`c:\Users\moham\Desktop`):

```bash
python release.py --check-env
python release.py --generate-key-only
python release.py
python release.py --skip-screenshots
python release.py --screenshots-only
python release.py --no-clean
```

### Environment Check

If the build fails with `ANDROID_HOME is not set` or `SDK location not found`, run:

```bash
python release.py --check-env
```

`release.py` automatically detects the Android SDK from Android Studio, writes `android/local.properties`, and sets `ANDROID_HOME` and `ANDROID_SDK_ROOT` for the build process. If automatic detection fails, confirm Android Studio and its SDK are installed in a standard location.

---

## Android Signing

### First-Time Keystore Generation

Run `python release.py --generate-key-only` or let the full build create one automatically.

Keystore: `android/keystore/roadshift-release.keystore`
Credentials: `android/keystore/keystore.properties`

**Important:** Back up the keystore file securely. Losing it permanently prevents updating the app on Google Play.

---

## Google Play Upload

After a successful build, the `.aab` file at `releases/builds/RoadShift-release.aab` is the Google Play upload artifact.

1. Open Google Play Console
2. Create a new app with package name `com.oldalexhub.roadshift`
3. Complete the store listing using content from `store_assets/`
4. Upload the AAB in the Production or Internal Testing track
5. Complete the Data Safety section using `store_assets/data-safety-notes.md`

### AdMob Console Setup

1. Verify the app is registered with App ID `ca-app-pub-7831002909037560~7106259586`
2. Confirm the three ad units are active (banner, interstitial, app-open)
3. Configure consent and privacy messaging for your target regions in the AdMob Consent & Privacy settings
4. Link the AdMob app to the Google Play app after it is created

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ANDROID_HOME is not set` | Run `python release.py --check-env` |
| `SDK location not found` | Run `python release.py --check-env`, confirm Android Studio SDK is installed |
| `java: command not found` | Android Studio must be installed; release.py checks its bundled JBR |
| `keytool not found` | Java is not correctly configured; re-run `--check-env` |
| Metro bundler port conflict | Run `npx react-native start --reset-cache` |
| Build fails after dependency update | Delete `android/.gradle` and retry |
| TypeScript errors | Run `npx tsc --noEmit` to see all errors |

---

## Screenshot Capture

Run `python release.py --screenshots-only` with the Android emulator open and the app running.
The script will prompt you to navigate to each screen and press Enter.
Screenshots are saved to `releases/screenshots/`.
