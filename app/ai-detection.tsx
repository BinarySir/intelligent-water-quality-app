import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { colors, typography } from '../src/theme';

export default function AIDetectionScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>AI Detection</Text>
      <Text style={styles.subtitle}>Coming next.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: 8,
  },
});