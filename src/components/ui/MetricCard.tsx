import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function MetricCard({ detail, label, value }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
value: {
  color: colors.text,
  fontSize: typography.metric,
  fontWeight: '700',
  letterSpacing: -0.5,
},
  detail: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
});
