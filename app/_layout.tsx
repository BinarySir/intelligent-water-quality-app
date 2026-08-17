import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, typography } from '../src/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 64,
            paddingTop: 6,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: typography.caption,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
          }}
        />

        <Tabs.Screen
          name="water-quality"
          options={{
            title: 'Water Quality',
            tabBarLabel: 'Water Quality',
          }}
        />

        <Tabs.Screen
          name="ai-detection"
          options={{
            title: 'AI Detection',
            tabBarLabel: 'AI',
          }}
        />

        <Tabs.Screen
          name="purification"
          options={{
            title: 'Purification',
            tabBarLabel: 'Purification',
          }}
        />

        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarLabel: 'Alerts',
          }}
        />
      </Tabs>
    </>
  );
}