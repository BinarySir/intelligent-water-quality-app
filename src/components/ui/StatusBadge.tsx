import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

type StatusTone = 'safe' | 'warning' | 'danger' | 'neutral';

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const toneStyles = {
  safe: { backgroundColor: colors.safeBackground, color: colors.safe },
  warning: { backgroundColor: colors.warningBackground, color: colors.warning },
  danger: { backgroundColor: colors.dangerBackground, color: colors.danger },
  neutral: { backgroundColor: colors.surfaceMuted, color: colors.textSecondary },
} as const;

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const selectedTone = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: selectedTone.backgroundColor }]}>
      <Text style={[styles.label, { color: selectedTone.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
