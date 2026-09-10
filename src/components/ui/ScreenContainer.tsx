import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../../theme';

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function ScreenContainer({
  children,
  contentStyle,
  scroll = false,
  style,
}: ScreenContainerProps) {
  if (scroll) {
    return (
      <SafeAreaView
        style={[styles.safeArea, style]}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, style]}
      edges={['top', 'left', 'right']}
    >
      <View
        style={[
          styles.content,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    flex: 1,
    padding: spacing.lg,
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});