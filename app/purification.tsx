import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { StatusBadge } from '../src/components/ui/StatusBadge';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../src/theme';
import {
  demoPurificationEvent,
  demoSystemStatus,
} from '../src/data/demoData';

export default function PurificationScreen() {
  const purificationOn =
    demoSystemStatus.purificationStatus === 'on';

  const pumpOn =
    demoSystemStatus.pumpStatus === 'on';

  const statusLabel = purificationOn ? 'ON' : 'OFF';
  const statusTone = purificationOn ? 'safe' : 'neutral';

  const startedAt = new Date(
    demoPurificationEvent.startedAt,
  ).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const duration =
    demoPurificationEvent.durationSeconds !== null
      ? formatDuration(demoPurificationEvent.durationSeconds)
      : '—';

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Purification</Text>

            <Text style={styles.subtitle}>
              Adaptive purification control
            </Text>
          </View>

          <View style={styles.systemIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.systemIndicatorText}>
              Online
            </Text>
          </View>
        </View>

        {/* Main purification status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>
              PURIFICATION STATUS
            </Text>

            <StatusBadge
              label={statusLabel}
              tone={statusTone}
            />
          </View>

          <Text style={styles.statusTitle}>
            {purificationOn ? 'Active' : 'Standby'}
          </Text>

          <Text style={styles.statusMessage}>
            {purificationOn
              ? 'The purification system is currently running.'
              : 'The purification system is currently on standby.'}
          </Text>
        </View>

        {/* Components */}
        <Text style={styles.sectionTitle}>
          Components
        </Text>

        <View style={styles.componentsCard}>
          <ComponentRow
            label="UV Sterilization"
            value={purificationOn ? 'ON' : 'OFF'}
            tone={purificationOn ? 'safe' : 'neutral'}
          />

          <ComponentRow
            label="Carbon Filter"
            value="ACTIVE"
            tone="safe"
          />

          <ComponentRow
            label="Pump"
            value={pumpOn ? 'ON' : 'OFF'}
            tone={pumpOn ? 'safe' : 'neutral'}
          />

          <ComponentRow
            label="Trigger"
            value={
              demoPurificationEvent.trigger === 'automatic'
                ? 'AUTOMATIC'
                : 'MANUAL'
            }
            tone="neutral"
          />
        </View>

        {/* Last event */}
        <Text style={styles.sectionTitle}>
          Last Purification Event
        </Text>

        <View style={styles.eventCard}>
          <EventRow
            label="Started"
            value={startedAt}
          />

          <EventRow
            label="Duration"
            value={duration}
          />

          <EventRow
            label="Reason"
            value={
              demoPurificationEvent.reason ?? 'No recent event'
            }
          />
        </View>

        {/* Manual control */}
        <View style={styles.manualSection}>
          <Text style={styles.sectionTitle}>
            Manual Control
          </Text>

          <Text style={styles.manualDescription}>
            Automatic purification remains controlled by the
            embedded system. Manual activation is intended for
            testing and maintenance.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.manualButton,
              pressed && styles.manualButtonPressed,
            ]}
            onPress={() => {
              // Temporary demo action.
              // Real command integration will be added later.
            }}
          >
            <Text style={styles.manualButtonText}>
              Start Purification
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

type ComponentRowProps = {
  label: string;
  value: string;
  tone: 'safe' | 'warning' | 'danger' | 'neutral';
};

function ComponentRow({
  label,
  value,
  tone,
}: ComponentRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>

      <StatusBadge
        label={value}
        tone={tone}
      />
    </View>
  );
}

type EventRowProps = {
  label: string;
  value: string;
};

function EventRow({
  label,
  value,
}: EventRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>

      <Text style={styles.eventValue}>{value}</Text>
    </View>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes} min ${seconds}s`;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },

  headerText: {
    flex: 1,
    gap: spacing.xs,
  },

  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
  },

  systemIndicator: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  onlineDot: {
    backgroundColor: colors.safe,
    borderRadius: 5,
    height: 8,
    width: 8,
  },

  systemIndicatorText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },

  statusCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.xl,
  },

  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  statusTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },

  statusMessage: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },

  componentsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
  },

  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    gap: spacing.md,
  },

  rowLabel: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: typography.body,
  },

  eventCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
  },

  eventValue: {
    color: colors.text,
    flexShrink: 1,
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'right',
  },

  manualSection: {
    gap: spacing.sm,
  },

  manualDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },

  manualButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },

  manualButtonPressed: {
    opacity: 0.85,
  },

  manualButtonText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '700',
  },
});