# Mobile APK Build Guide

This project uses **Capacitor** to build Android APK files from the Vue.js web application.

## Prerequisites

Before building the APK, ensure you have:

1. **Android Studio** installed and configured
   - Download from: https://developer.android.com/studio
   - Install the Android SDK (API level 33+ recommended)
   - Set `ANDROID_HOME` environment variable

2. **Java JDK 17** or newer
   - Required for Gradle builds

3. **Node.js** (v18+) and npm

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run mobile:sync` | Build web app and sync with Android project |
| `npm run mobile:open-android` | Open project in Android Studio |
| `npm run mobile:build-apk` | Build debug APK |
| `npm run mobile:build-release` | Build release APK (requires signing) |

## Quick Start

### 1. Build Debug APK

```bash
# Build and sync the web app to Android
npm run mobile:sync

# Build the debug APK
npm run mobile:build-apk
```

The debug APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 2. Open in Android Studio

For advanced configuration or running on emulator:

```bash
npm run mobile:open-android
```

This opens Android Studio where you can:
- Run on connected device or emulator
- Configure build settings
- Sign the release APK

## Building a Release APK

### Step 1: Generate a Keystore

```bash
keytool -genkey -v -keystore fish-app-release.keystore -alias fish-app -keyalg RSA -keysize 2048 -validity 10000
```

### Step 2: Configure Signing (Option A - Local Properties)

Create `android/local.properties` with:

```properties
storeFile=../fish-app-release.keystore
storePassword=your_store_password
keyAlias=fish-app
keyPassword=your_key_password
```

### Step 2: Configure Signing (Option B - Gradle Config)

Edit `android/app/build.gradle` and add signing config:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('../fish-app-release.keystore')
            storePassword 'your_store_password'
            keyAlias 'fish-app'
            keyPassword 'your_key_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 3: Build Release APK

```bash
npm run mobile:build-release
```

The signed release APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Project Structure

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── assets/public/    # Web app files (built from dist/)
│   │   │   ├── java/             # Android native code
│   │   │   ├── res/              # Android resources (icons, splash)
│   │   │   └── AndroidManifest.xml
│   └── build.gradle
├── gradle/
└── build.gradle
```

## Customization

### App Icon

Replace the icon files in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

Use Android Studio's Image Asset Studio for easy icon generation.

### Splash Screen

Configure in `capacitor.config.ts`:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#3B82F6',
    showSpinner: false,
  },
}
```

### App Name & ID

Edit `capacitor.config.ts`:

```typescript
appId: 'com.yourcompany.appname',
appName: 'Your App Name',
```

After changes, run:
```bash
npm run mobile:sync
```

## Troubleshooting

### Gradle Build Fails

1. Ensure Android SDK is properly installed
2. Run `cd android && ./gradlew clean`
3. Update Gradle in Android Studio if prompted

### App Crashes on Launch

1. Check that `dist/` folder exists (run `npm run build`)
2. Run `npx cap sync android` to sync assets
3. Check logcat in Android Studio for errors

### Changes Not Showing in APK

Always run sync before building:
```bash
npm run mobile:sync
```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Publishing to Google Play](https://capacitorjs.com/docs/android/deploying-to-google-play)
