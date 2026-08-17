import { StyleSheet, Text, View } from 'react-native';

import { MetricCard } from '../src/components/ui/MetricCard';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { SectionHeader } from '../src/components/ui/SectionHeader';
import { StatusBadge } from '../src/components/ui/StatusBadge';
import { colors, radius, spacing, typography } from '../src/theme';

const demoData = {
  waterStatus: 'SAFE',
  waterMessage: 'All monitored parameters are within normal range.',
  systemStatus: 'ONLINE',
  purificationStatus: 'OFF',
  pumpStatus: 'ON',
  lastUpdated: 'Just now',
  pH: '7.12',
  turbidity: '1.92 NTU',
  tds: '256 ppm',
  temperature: '25.8 °C',
};

export default function DashboardScreen() {
  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Water Quality</Text>
            <Text style={styles.subtitle}>Intelligent Monitoring System</Text>
          </View>

          <View style={styles.connection}>
            <View style={styles.onlineDot} />
            <Text style={styles.connectionText}>Online</Text>
          </View>
        </View>

        {/* Main Water Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusTopRow}>
            <Text style={styles.statusLabel}>WATER STATUS</Text>
            <StatusBadge label={demoData.waterStatus} tone="safe" />
          </View>

          <Text style={styles.statusTitle}>{demoData.waterStatus}</Text>

          <Text style={styles.statusMessage}>
            {demoData.waterMessage}
          </Text>
        </View>

        {/* System status */}
        <SectionHeader title="System Status" />

        <View style={styles.statusGrid}>
          <StatusItem
            label="System"
            value={demoData.systemStatus}
            tone="safe"
          />

          <StatusItem
            label="Purification"
            value={demoData.purificationStatus}
            tone="neutral"
          />

          <StatusItem
            label="Pump"
            value={demoData.pumpStatus}
            tone="safe"
          />
        </View>

        {/* Water Overview */}
        <SectionHeader
          title="Water Overview"
          subtitle={`Updated ${demoData.lastUpdated}`}
        />

        <View style={styles.metricsGrid}>
          <View style={styles.metricColumn}>
            <MetricCard
              label="pH"
              value={demoData.pH}
              detail="Normal"
            />

            <MetricCard
              label="TDS"
              value={demoData.tds}
              detail="Normal"
            />
          </View>

          <View style={styles.metricColumn}>
            <MetricCard
              label="Turbidity"
              value={demoData.turbidity}
              detail="Normal"
            />

            <MetricCard
              label="Temperature"
              value={demoData.temperature}
              detail="Normal"
            />
          </View>
        </View>

        {/* Recent Alert */}
        <SectionHeader title="Recent Alert" />

        <View style={styles.alertCard}>
          <View style={styles.alertIndicator} />

          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>No active alerts</Text>

            <Text style={styles.alertMessage}>
              Water quality is currently within normal range.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Last system update: {demoData.lastUpdated}
        </Text>
      </View>
    </ScreenContainer>
  );
}

type StatusItemProps = {
  label: string;
  value: string;
  tone: 'safe' | 'warning' | 'danger' | 'neutral';
};

function StatusItem({ label, value, tone }: StatusItemProps) {
  return (
    <View style={styles.statusItem}>
      <Text style={styles.statusItemLabel}>{label}</Text>

      <StatusBadge label={value} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  headerText: {
    flex: 1,
    gap: spacing.xs,
  },

  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },

  connection: {
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

  connectionText: {
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

  statusTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  statusTitle: {
    color: colors.safe,
    fontSize: 28,
    fontWeight: '800',
  },

  statusMessage: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },

  statusGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  statusItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: spacing.sm,
    minHeight: 76,
    padding: spacing.md,
  },

  statusItemLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },

  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  metricColumn: {
    flex: 1,
    gap: spacing.sm,
  },

  alertCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },

  alertIndicator: {
    backgroundColor: colors.safe,
    borderRadius: 5,
    height: 10,
    width: 10,
  },

  alertContent: {
    flex: 1,
    gap: spacing.xs,
  },

  alertTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },

  alertMessage: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },

  footerText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textAlign: 'center',
  },
});