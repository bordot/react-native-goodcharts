# Installation

## Requirements

`react-native-goodcharts` currently targets:

- React Native `>=0.76.0 <0.78.0`
- React `>=18.2.0 <19.0.0`
- `@shopify/react-native-skia >=1.5.0 <2.0.0`
- `react-native-reanimated >=3.16.0 <4.0.0`
- `react-native-gesture-handler >=2.20.0 <3.0.0`

Optional peer:

- `expo-haptics >=14.0.0 <15.0.0`

## Install the package

```bash
npm install react-native-goodcharts @shopify/react-native-skia react-native-reanimated react-native-gesture-handler
```

If your app uses Expo and you want version alignment from Expo's dependency map, install the native peers with Expo tooling:

```bash
npx expo install @shopify/react-native-skia react-native-reanimated react-native-gesture-handler
npm install react-native-goodcharts
```

## Expo note

Expo Go is not supported because Skia is a native dependency. Use an Expo dev build.

## App setup reminders

This package expects the standard setup for its native peers:

- `react-native-reanimated` Babel plugin must be enabled.
- `react-native-gesture-handler` should be initialized per its install instructions.
- Your app entry should use the normal Gesture Handler and Reanimated setup recommended by those packages.

## Optional provider

You can wrap your app with `ChartProvider` to set shared theme defaults:

```tsx
import { ChartProvider, darkTheme } from "react-native-goodcharts";

export function App() {
  return <ChartProvider theme={darkTheme}>{/* screens */}</ChartProvider>;
}
```

## Next steps

- [Quick start](./quick-start.md)
- [Themes](../guides/themes.md)
- [Composable API](../guides/composable-api.md)
