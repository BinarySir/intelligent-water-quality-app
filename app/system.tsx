import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { StatusBadge } from '../src/components/ui/StatusBadge';

import {
  subscribeToSystemStatus,
  type LiveSystemStatus,
} from '../src/lib/systemStatus';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../src/theme';

export default function SystemScreen() {
  const [systemStatus, setSystemStatus] =
    useState<LiveSystemStatus | null>(null);

  /*
   * Subscribe to the live system status.
   */
  useEffect(() => {
    let unsubscribe:
      | (() => void)
      | undefined;

    async function startListener() {
      try {
        unsubscribe =
          subscribeToSystemStatus(
            (status) => {
              setSystemStatus(status);
            },
            (error) => {
              console.error(
                'System status listener error:',
                error,
              );
            },
          );
      } catch (error) {
        console.error(
          'Failed to initialize System RTDB listener:',
          error,
        );
      }
    }

    startListener();

    return () => {
      unsubscribe?.();
    };
  }, []);

  /*
   * DATABASE
   *
   * This represents the Firebase Realtime
   * Database connection.
   */
  const databaseConnected =
    systemStatus?.databaseConnected === true;

  /*
   * SENSOR STATUS
   */
  const sensorsOperational =
    systemStatus?.sensorStatus === 'normal';

  const sensorWarning =
    systemStatus?.sensorStatus === 'warning';

  const sensorFault =
    systemStatus?.sensorStatus === 'fault';

  /*
   * Overall system state.
   *
   * The system is considered operational when:
   *
   * 1. Firebase is connected
   * 2. All monitored sensors are normal
   */
  const systemOperational =
    databaseConnected &&
    sensorsOperational;

  const overallTitle = !systemStatus
    ? 'Checking'
    : systemOperational
      ? 'Operational'
      : 'Attention required';

  const overallMessage = !systemStatus
    ? 'Checking communication with the monitoring system.'
    : systemOperational
      ? 'The monitoring system is receiving live sensor data.'
      : 'One or more system components require attention.';

  /*
   * DATABASE CONNECTION LABEL
   */
  const connectionLabel = !systemStatus
    ? 'Checking'
    : databaseConnected
      ? 'Connected'
      : 'Disconnected';

  /*
   * SENSOR LABEL
   */
  const sensorLabel = !systemStatus
    ? 'Waiting'
    : sensorsOperational
      ? 'All sensors normal'
      : sensorWarning
        ? 'Sensor warning'
        : 'Sensor fault';

  /*
   * PUMP
   */
  const pumpIsOn =
    systemStatus?.pumpState
      ?.toLowerCase() === 'on';

  /*
   * AI STATUS
   */
  const aiLabel = systemStatus
    ? systemStatus.aiStatus === 'critical'
      ? 'Critical'
      : systemStatus.aiStatus === 'warning'
        ? 'Warning'
        : 'Normal'
    : 'Waiting';

  /*
   * LAST SENSOR UPDATE
   */
  const lastUpdate =
    systemStatus &&
    systemStatus.lastSeen > 0
      ? formatLastSeen(
          systemStatus.lastSeen,
        )
      : systemStatus
        ? 'Live data received'
        : 'Waiting';

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              System
            </Text>

            <Text style={styles.subtitle}>
              System health monitoring
            </Text>
          </View>

          <StatusBadge
            label={
              !systemStatus
                ? 'Checking'
                : databaseConnected
                  ? 'Connected'
                  : 'Offline'
            }
            tone={
              !systemStatus
                ? 'neutral'
                : databaseConnected
                  ? 'safe'
                  : 'danger'
            }
          />
        </View>

        {/* Overall system status */}
        <View style={styles.overallCard}>
          <Text style={styles.sectionLabel}>
            SYSTEM STATUS
          </Text>

          <Text
            style={[
              styles.overallTitle,
              {
                color: !systemStatus
                  ? colors.textSecondary
                  : systemOperational
                    ? colors.safe
                    : colors.danger,
              },
            ]}
          >
            {overallTitle}
          </Text>

          <Text style={styles.overallMessage}>
            {overallMessage}
          </Text>
        </View>

        {/* System health */}
        <Text style={styles.sectionTitle}>
          System Health
        </Text>

        <View style={styles.healthCard}>

          {/* Database */}
          <HealthRow
            label="Database"
            value={connectionLabel}
            tone={
              !systemStatus
                ? 'neutral'
                : databaseConnected
                  ? 'safe'
                  : 'danger'
            }
          />

          {/* Sensors */}
          <HealthRow
            label="Sensors"
            value={sensorLabel}
            tone={
              !systemStatus
                ? 'neutral'
                : sensorFault
                  ? 'danger'
                  : sensorWarning
                    ? 'warning'
                    : 'safe'
            }
          />

          {/* Pump */}
          <HealthRow
            label="Pump"
            value={
              !systemStatus
                ? 'Waiting'
                : pumpIsOn
                  ? 'ON'
                  : 'OFF'
            }
            tone={
              !systemStatus
                ? 'neutral'
                : pumpIsOn
                  ? 'safe'
                  : 'neutral'
            }
          />

          {/* AI */}
          <HealthRow
            label="AI Status"
            value={aiLabel}
            tone={
              !systemStatus
                ? 'neutral'
                : systemStatus.aiStatus ===
                    'critical'
                  ? 'danger'
                  : systemStatus.aiStatus ===
                      'warning'
                    ? 'warning'
                    : 'safe'
            }
          />

          {/* Last update */}
          <HealthRow
            label="Last Update"
            value={lastUpdate}
            tone={
              systemStatus
                ? 'safe'
                : 'neutral'
            }
            last
          />
        </View>

        {/* Connection */}
        <Text style={styles.sectionTitle}>
          Connection
        </Text>

        <View style={styles.connectionCard}>
          <Text style={styles.connectionTitle}>
            Device communication
          </Text>

          <Text style={styles.connectionMessage}>
            The mobile application receives live
            monitoring data from the connected water
            quality system through Firebase Realtime
            Database.
          </Text>

          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    !systemStatus
                      ? colors.textMuted
                      : databaseConnected
                        ? colors.safe
                        : colors.danger,
                },
              ]}
            />

            <Text
              style={styles.connectionStatusText}
            >
              {!systemStatus
                ? 'Checking system connection'
                : databaseConnected
                  ? 'Live database connection active'
                  : 'Database connection unavailable'}
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

/*
 * HEALTH ROW
 */

type HealthRowProps = {
  label: string;
  value: string;
  tone:
    | 'safe'
    | 'warning'
    | 'danger'
    | 'neutral';
  last?: boolean;
};

function HealthRow({
  label,
  value,
  tone,
  last = false,
}: HealthRowProps) {
  const toneColor =
    tone === 'safe'
      ? colors.safe
      : tone === 'warning'
        ? colors.warning
        : tone === 'danger'
          ? colors.danger
          : colors.textSecondary;

  return (
    <View
      style={[
        styles.healthRow,
        !last && styles.healthRowBorder,
      ]}
    >
      <Text style={styles.healthLabel}>
        {label}
      </Text>

      <View
        style={styles.healthValueContainer}
      >
        <View
          style={[
            styles.healthDot,
            {
              backgroundColor:
                tone === 'neutral'
                  ? colors.textMuted
                  : toneColor,
            },
          ]}
        />

        <Text
          style={[
            styles.healthValue,
            {
              color: toneColor,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/*
 * FORMAT LAST SENSOR UPDATE
 */

function formatLastSeen(
  timestamp: number,
): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Unavailable';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },

  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  sectionTitle: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },

  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textSecondary,
  },

  overallCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  overallTitle: {
    marginTop: spacing.sm,
    fontSize: 24,
    fontWeight: '700',
  },

  overallMessage: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  healthCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  healthRow: {
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  healthRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  healthLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },

  healthValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },

  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  healthValue: {
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'right',
  },

  connectionCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  connectionTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },

  connectionMessage: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  connectionStatus: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  connectionStatusText: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});
