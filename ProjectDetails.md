# Intelligent Water Quality — Project Details

## 1. Project Summary

**Intelligent Water Quality** is a mobile application designed to make water-quality measurements easier to monitor and understand.

The application connects to a Firebase-backed data system and presents sensor readings through a mobile dashboard, historical graph, and status indicators.

It focuses on providing a practical view of water conditions from an Android phone, bringing important measurements together rather than requiring users to inspect raw sensor data.

## 2. Project Objectives

The project is designed to:

- Display current water-quality measurements in one mobile interface.
- Support monitoring of pH, total dissolved solids (TDS), turbidity, and temperature.
- Make recent and historical readings easier to review.
- Communicate system or water-quality status through clear indicators.
- Retrieve sensor information from Firebase to support live updates.
- Provide a mobile foundation that can be extended as the monitoring system grows.

## 3. Main Application Features

### Live Dashboard

The dashboard presents the latest available sensor measurements in a format designed to make readings easy to scan and compare.

### Water-Quality Measurements

The application includes the following measurements:

- **pH:** Indicates the acidity or alkalinity of the water.
- **TDS:** Total dissolved solids, representing the amount of dissolved substances measured by the sensor.
- **Turbidity:** Indicates the cloudiness of water, commonly associated with suspended particles.
- **Temperature:** Displays the measured water temperature.

These measurements should be interpreted according to sensor specifications, calibration, and applicable water-quality standards.

### History Graph

The history view presents recorded measurements over time. This helps users observe changes and trends rather than relying only on the latest reading.

### Status Indicators

Status indicators communicate the system's reported condition. The app can display the status received from the data source, including normal, warning, or critical states where supported by the current implementation.

### Firebase Connectivity

The application uses Firebase services for authentication and cloud data access. Realtime Database subscriptions allow the interface to receive updates when sensor data changes.

## 4. Technology and Architecture

### Mobile Client

- React Native
- Expo
- Expo Router
- TypeScript / JavaScript

### Backend and Data Services

- Firebase Authentication
- Firebase Realtime Database
- Cloud Firestore

### Data Flow

The application's data flow can be summarized as follows:

1. Water-quality sensors or the connected monitoring system produce measurements.
2. The monitoring system publishes measurements to Firebase.
3. The mobile app subscribes to the configured Realtime Database locations.
4. The app maps the received values into its reading model.
5. The dashboard, status indicators, and history interface display the available data.

The mobile app is a client interface. Sensor acquisition and measurement accuracy depend on the connected hardware, firmware, and calibration.

## 5. Realtime Database Locations

The current application reads realtime metrics from:

```text
waterSystem/sensors/metrics
```

Historical readings are read from:

```text
waterSystem/sensors/history
```

The application's reading model includes fields for:

- `ph`
- `tds`
- `turbidity`
- `temperature`
- `aiStatus`
- `pumpState`
- `sendTime`

The Firebase field names may differ from the normalized names used inside the app. The data service maps database fields into the application's reading model.

## 6. Development Environment

The project has been developed with:

- Expo SDK 58
- React 19.3
- React Native 0.88.1
- Node.js 24.21.0
- npm
- Expo Router

Dependency versions should remain aligned with the Expo SDK used by the project. Use Expo's package installer when adding or updating Expo-managed native modules.

## 7. Configuration and Security

Firebase configuration is provided through environment variables, including the `EXPO_PUBLIC_FIREBASE_` variables used by the app.

For local development, configure these values in a local `.env` file. For production or cloud builds, configure the required values in the build environment.

Important security considerations:

- Do not commit `.env` files.
- Do not commit Firebase service-account private keys or Firebase Admin credentials.
- `EXPO_PUBLIC_` variables are bundled into the client application and are not secret.
- Protect data through Firebase Authentication and appropriately configured database security rules.
- Do not use open read/write database rules as a production workaround.

## 8. Testing and Build Verification

The project has been verified to install and run on an Android device, and the core dashboard and data views have been tested.

Recommended checks before each release:

1. Run `npx expo-doctor`.
2. Confirm dependency versions match the installed Expo SDK.
3. Verify Firebase configuration is available to the build.
4. Install and launch the generated APK on a physical Android device.
5. Confirm authentication behaves as expected.
6. Confirm live sensor readings update.
7. Confirm history data and graphs render.
8. Check status indicators and related system state.
9. Test behavior when the device temporarily loses network connectivity.

## 9. Future Development

Possible future improvements include:

- More detailed trend analysis.
- Configurable alert thresholds.
- Better handling of missing or stale sensor readings.
- Exporting historical readings for reporting.
- Additional sensor support.
- Improved offline experience.

These are potential extensions, not claims about features already implemented.

## 10. Project Note

Intelligent Water Quality is intended to support convenient observation of water-quality measurements.

The application does not independently certify that water is safe to drink. Sensor readings should be interpreted using proper calibration, validated measurement methods, and relevant health or environmental standards.