# Intelligent Water Quality

A mobile application for monitoring water quality in real time, built with **React Native**, **Expo**, and **Firebase**.

Intelligent Water Quality brings important water-quality measurements together in a clear mobile dashboard. It helps users view sensor readings, follow changes over time, and understand the current system status from an Android device.

## Overview

Water quality can change over time. Having measurements available in one place makes it easier to observe conditions and respond when readings need attention.

This project provides a mobile interface for water-quality monitoring, connecting sensor data to a Firebase backend and presenting the information through a live dashboard and historical views.

## Features

- **Live dashboard** for current sensor readings.
- **pH monitoring** to view acidity or alkalinity measurements.
- **TDS monitoring** to display total dissolved solids.
- **Turbidity monitoring** to view water clarity measurements.
- **Temperature monitoring** for water temperature.
- **History graph** to review sensor readings over time.
- **Status indicators** to communicate the current system condition.
- **Firebase integration** for authentication and cloud data access.

## Technology Stack

| Area | Technology |
|---|---|
| Mobile application | React Native |
| App framework | Expo |
| Navigation | Expo Router |
| Authentication | Firebase Authentication |
| Realtime sensor data | Firebase Realtime Database |
| Cloud data | Cloud Firestore |
| Language | TypeScript / JavaScript |

## Getting Started

### Requirements

- Node.js and npm
- Expo Go compatible with the project's Expo SDK, or an Android development build
- A Firebase project configured for the application

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd intelligent-water-quality-app
```

### 2. Install dependencies

```bash
npm install
```

Keep the project's `package-lock.json` committed so installations use a consistent dependency tree.

### 3. Configure Firebase

Create a local `.env` file in the project root and add the required Firebase environment variables:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_DATABASE_URL=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
```

Fill in the values from your own Firebase project configuration.

**Do not commit your `.env` file or share its contents publicly.**

Variables prefixed with `EXPO_PUBLIC_` are bundled into the mobile application. They are configuration values, not private server secrets. Never include Firebase Admin credentials or service-account private keys in a mobile app.

### 4. Start the application

```bash
npx expo start
```

Follow the Expo CLI instructions to open the application on a compatible device.

### 5. Check the project

```bash
npx expo-doctor
```

## Firebase Data

The application currently reads realtime sensor measurements from:

```text
waterSystem/sensors/metrics
```

Historical readings are read from:

```text
waterSystem/sensors/history
```

The data service maps Firebase fields into the application's reading model, including pH, TDS, turbidity, temperature, status, pump state, and timestamps.

Firebase Authentication and database security rules should be configured appropriately for your application. Avoid making production databases publicly readable or writable simply to get the app working.

## Android Build

Before creating a production Android build:

1. Confirm that the required Firebase environment variables are available to the build environment.
2. Confirm that the Android application identifier is correct.
3. Run `npx expo-doctor`.
4. Test the app on a physical Android device.
5. Verify that realtime readings and history load correctly in the installed build.

## Security and Configuration

- Keep `.env` out of Git.
- Do not commit private credentials or service-account files.
- Configure environment variables locally and in your build provider separately.
- Review Firebase Authentication and database security rules before publishing.
- Remember that `EXPO_PUBLIC_` variables are visible in the client application.

## Project Status

The application has been successfully installed and tested on an Android device. The core monitoring functionality is working, including the dashboard, sensor readings, and historical data views.

## Contributing

Contributions, bug reports, and suggestions are welcome.

Before submitting changes, please test the affected screens and avoid changing existing sensor or Firebase behavior without validating it end to end.

## License

No license has been added yet. Until a license is included in this repository, all rights remain with the project owner and reuse should be considered unlicensed.

---

Built to make water-quality monitoring more accessible, understandable, and convenient.