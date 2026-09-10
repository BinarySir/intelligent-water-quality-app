import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

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
            borderTopWidth: 1,

            // Let the native tab bar handle the bottom safe area.
            height: Platform.OS === 'ios' ? 84 : 68,

            paddingTop: 6,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          },

          tabBarLabelStyle: {
            fontSize: typography.caption,
            fontWeight: '600',
          },

          tabBarItemStyle: {
            paddingVertical: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Overview',
            tabBarLabel: 'Overview',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={
                  focused
                    ? 'home'
                    : 'home-outline'
                }
                size={21}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="water-quality"
          options={{
            title: 'Water Quality',
            tabBarLabel: 'Water Quality',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={
                  focused
                    ? 'water'
                    : 'water-outline'
                }
                size={21}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="system"
          options={{
            title: 'System',
            tabBarLabel: 'System',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={
                  focused
                    ? 'settings'
                    : 'settings-outline'
                }
                size={21}
                color={color}
              />
            ),
          }}
        />

        {/* Hidden screens */}
        <Tabs.Screen
          name="ai-detection"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="purification"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="alerts"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}