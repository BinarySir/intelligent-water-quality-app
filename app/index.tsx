import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  subscribeToRealtimeWaterReading,
  type RealtimeWaterReading,
} from '../src/lib/realtimeWaterReadings';

import {
  subscribeToLatestAlert,
  subscribeToRecentAlerts,
  type LiveAlert,
} from '../src/lib/alerts';

import {
  subscribeToSystemStatus,
  type LiveSystemStatus,
} from '../src/lib/systemStatus';

import {
  subscribeToLatestWaterReading,
  type LiveWaterReading,
} from '../src/lib/waterReadings';

import { ensureAnonymousUser } from '../src/lib/auth';

import { MetricCard } from '../src/components/ui/MetricCard';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { SectionHeader } from '../src/components/ui/SectionHeader';
import { StatusBadge } from '../src/components/ui/StatusBadge';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../src/theme';

import {
  demoSystemStatus,
  demoWaterReading,
} from '../src/data/demoData';

type ParameterStatus =
  | 'NORMAL'
  | 'WARNING'
  | 'CRITICAL';

type WaterStatus =
  | 'safe'
  | 'warning'
  | 'critical';

export default function OverviewScreen() {
  const [liveReading, setLiveReading] =
    useState<LiveWaterReading | null>(null);

  const [systemStatus, setSystemStatus] =
    useState<LiveSystemStatus | null>(null);

  const [latestAlert, setLatestAlert] =
    useState<LiveAlert | null>(null);

  const [recentAlerts, setRecentAlerts] =
    useState<LiveAlert[]>([]);

  const [alertsOpen, setAlertsOpen] =
    useState(false);

  const [realtimeReading, setRealtimeReading] =
    useState<RealtimeWaterReading | null>(null);

  /*
   * --------------------------------------------------
   * SENSOR HEALTH
   * --------------------------------------------------
   *
   * We now monitor 4 water-quality sensors:
   * - pH, turbidity, temperature, and TDS
   */
  function getSensorHealthLabel(
    ph: number,
    turbidity: number,
    temperature: number,
    tds: number,
  ): string {
    if (!Number.isFinite(tds)) return '3/4 DATA';

    const phStatus = getParameterStatus(
      ph,
      'pH',
    );

    const turbidityStatus =
      getParameterStatus(
        turbidity,
        'Turbidity',
      );

    const temperatureStatus =
      getParameterStatus(
        temperature,
        'Temperature',
      );

    const tdsStatus = getParameterStatus(tds, 'TDS');

    if (
      phStatus === 'CRITICAL' ||
      turbidityStatus === 'CRITICAL' ||
      temperatureStatus === 'CRITICAL' ||
      tdsStatus === 'CRITICAL'
    ) {
      return 'FAULT';
    }

    if (
      phStatus === 'WARNING' ||
      turbidityStatus === 'WARNING' ||
      temperatureStatus === 'WARNING' ||
      tdsStatus === 'WARNING'
    ) {
      return 'WARNING';
    }

    return '4/4 OK';
  }

  function getSensorHealthTone(
    ph: number,
    turbidity: number,
    temperature: number,
    tds: number,
  ) {
    if (!Number.isFinite(tds)) return 'neutral' as const;

    const phStatus = getParameterStatus(
      ph,
      'pH',
    );

    const turbidityStatus =
      getParameterStatus(
        turbidity,
        'Turbidity',
      );

    const temperatureStatus =
      getParameterStatus(
        temperature,
        'Temperature',
      );

    const tdsStatus = getParameterStatus(tds, 'TDS');

    if (
      phStatus === 'CRITICAL' ||
      turbidityStatus === 'CRITICAL' ||
      temperatureStatus === 'CRITICAL' ||
      tdsStatus === 'CRITICAL'
    ) {
      return 'danger' as const;
    }

    if (
      phStatus === 'WARNING' ||
      turbidityStatus === 'WARNING' ||
      temperatureStatus === 'WARNING' ||
      tdsStatus === 'WARNING'
    ) {
      return 'warning' as const;
    }

    return 'safe' as const;
  }

  /*
   * --------------------------------------------------
   * CURRENT READING
   * --------------------------------------------------
   *
   * Prefer the real-time RTDB reading.
   *
   * If RTDB has not produced a reading yet,
   * fall back to Firestore, then demo data.
   */
  const reading = realtimeReading
    ? {
        ph: realtimeReading.ph,
        turbidity: realtimeReading.turbidity,
        temperature: realtimeReading.temperature,
        overallStatus: 'safe' as const,
      }
    : liveReading ?? demoWaterReading;

  /*
   * --------------------------------------------------
   * FIREBASE LISTENERS
   * --------------------------------------------------
   */
  useEffect(() => {
    let unsubscribeWater:
      | (() => void)
      | undefined;

    let unsubscribeAlert:
      | (() => void)
      | undefined;

    let unsubscribeSystem:
      | (() => void)
      | undefined;

    let unsubscribeRecentAlerts:
      | (() => void)
      | undefined;

    async function startFirebaseListeners() {
      try {
        await ensureAnonymousUser();

        unsubscribeWater =
          subscribeToLatestWaterReading(
            (waterReading) => {
              setLiveReading(waterReading);
            },
            (error) => {
              console.error(
                'Firestore water-reading listener error:',
                error,
              );
            },
          );

        unsubscribeAlert =
          subscribeToLatestAlert(
            (alert) => {
              setLatestAlert(alert);
            },
            (error) => {
              console.error(
                'Latest alert listener error:',
                error,
              );
            },
          );

        unsubscribeRecentAlerts =
          subscribeToRecentAlerts(
            (alerts) => {
              setRecentAlerts(alerts);
            },
            (error) => {
              console.error(
                'Recent alerts listener error:',
                error,
              );
            },
          );

        unsubscribeSystem =
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
          'Failed to initialize Firebase connection:',
          error,
        );
      }
    }

    /*
     * Real-time RTDB water readings.
     */
    const unsubscribeRealtime =
      subscribeToRealtimeWaterReading(
        (reading) => {
          console.log(
            '🔥 RTDB UPDATE RECEIVED:',
            JSON.stringify(reading),
          );

          if (!reading) {
            return;
          }

          setRealtimeReading(reading);
        },
        (error) => {
          console.error(
            'RTDB listener error:',
            error,
          );
        },
      );

    startFirebaseListeners();

    return () => {
      unsubscribeWater?.();
      unsubscribeAlert?.();
      unsubscribeRecentAlerts?.();
      unsubscribeSystem?.();
      unsubscribeRealtime?.();
    };
  }, []);

  /*
   * --------------------------------------------------
   * INDIVIDUAL WATER PARAMETER STATUSES
   * --------------------------------------------------
   */
  const phStatus = getParameterStatus(
    reading.ph,
    'pH',
  );

  const turbidityStatus =
    getParameterStatus(
      reading.turbidity,
      'Turbidity',
    );

  const temperatureStatus =
    getParameterStatus(
      reading.temperature,
      'Temperature',
    );

  const tdsStatus = realtimeReading && Number.isFinite(realtimeReading.tds)
    ? getParameterStatus(realtimeReading.tds, 'TDS')
    : 'WAITING';

  /*
   * --------------------------------------------------
   * OVERALL WATER STATUS
   * --------------------------------------------------
   *
   * CRITICAL takes priority over WARNING.
   */
  const waterStatus =
    getOverallWaterStatus(
      phStatus,
      turbidityStatus,
      temperatureStatus,
      realtimeReading && Number.isFinite(realtimeReading.tds)
        ? tdsStatus as ParameterStatus
        : null,
    );

  /*
   * --------------------------------------------------
   * AI STATUS
   * --------------------------------------------------
   */
  const aiStatus =
    realtimeReading?.aiStatus ??
    liveReading?.aiStatus ??
    'normal';

  const aiLabel =
    aiStatus === 'critical'
      ? 'CRITICAL'
      : aiStatus === 'warning'
        ? 'WARNING'
        : 'NORMAL';

  const aiTone =
    aiStatus === 'critical'
      ? 'danger'
      : aiStatus === 'warning'
        ? 'warning'
        : 'safe';

  /*
   * --------------------------------------------------
   * SYSTEM STATUS
   * --------------------------------------------------
   *
   * Current RTDB data is used to determine whether
   * the live sensor system is connected.
   */
  const hasRealtimeData =
    realtimeReading !== null;

  const systemLabel = hasRealtimeData
    ? 'CONNECTED'
    : 'WAITING';

  const sensorLabel = hasRealtimeData
    ? getSensorHealthLabel(
        realtimeReading.ph,
        realtimeReading.turbidity,
        realtimeReading.temperature,
        realtimeReading.tds,
      )
    : 'WAITING';

  const wifiLabel = hasRealtimeData
    ? 'Connected'
    : 'Waiting';

  const systemConnectionTone =
    hasRealtimeData
      ? 'safe'
      : 'neutral';

  const sensorTone = hasRealtimeData
    ? getSensorHealthTone(
        realtimeReading.ph,
        realtimeReading.turbidity,
        realtimeReading.temperature,
        realtimeReading.tds,
      )
    : 'neutral';

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Overview
            </Text>

            <Text style={styles.subtitle}>
              Real-time water monitoring
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              pressed &&
                styles.notificationButtonPressed,
            ]}
            onPress={() => setAlertsOpen(true)}
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* Water status */}
        <View style={styles.waterStatusCard}>
          <View style={styles.waterStatusHeader}>
            <Text style={styles.sectionLabel}>
              WATER STATUS
            </Text>

            <StatusBadge
              label={getWaterStatusLabel(
                waterStatus,
              )}
              tone={getWaterStatusTone(
                waterStatus,
              )}
            />
          </View>

          <Text
            style={[
              styles.waterStatusTitle,
              {
                color:
                  waterStatus === 'critical'
                    ? colors.danger
                    : waterStatus === 'warning'
                      ? colors.warning
                      : colors.safe,
              },
            ]}
          >
            {getWaterStatusLabel(
              waterStatus,
            )}
          </Text>

          <Text style={styles.waterStatusMessage}>
            {waterStatus === 'critical'
              ? 'A critical water-quality condition has been detected.'
              : waterStatus === 'warning'
                ? 'One or more water-quality parameters require attention.'
                : 'All monitored parameters are within normal range.'}
          </Text>
        </View>

        {/* AI status */}
        <SectionHeader title="AI Status" />

        <View style={styles.aiCard}>
          <View style={styles.aiTextContent}>
            <Text style={styles.aiLabel}>
              AI ASSESSMENT
            </Text>

            <Text style={styles.aiDescription}>
              Current classification based on the latest
              water-quality measurements.
            </Text>
          </View>

          <StatusBadge
            label={aiLabel}
            tone={aiTone}
          />
        </View>

        {/* Current readings: 2 columns × 2 rows */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricHalf}>
            <MetricCard
              label="pH"
              value={reading.ph.toFixed(2)}
              detail={phStatus}
            />
          </View>

          <View style={styles.metricHalf}>
            <MetricCard
              label="Turbidity"
              value={`${reading.turbidity.toFixed(2)} NTU`}
              detail={turbidityStatus}
            />
          </View>

          <View style={styles.metricHalf}>
            <MetricCard
              label="TDS"
              value={realtimeReading && Number.isFinite(realtimeReading.tds)
                ? `${realtimeReading.tds.toFixed(1)} ppm`
                : '—'}
              detail={tdsStatus}
            />
          </View>

          <View style={styles.metricHalf}>
            <MetricCard
              label="Temperature"
              value={`${reading.temperature.toFixed(1)} °C`}
              detail={temperatureStatus}
            />
          </View>
        </View>

        {/* Latest alert */}
        <SectionHeader title="Latest Alert" />

        <View style={styles.alertCard}>
          <View
            style={[
              styles.alertDot,
              {
                backgroundColor:
                  !latestAlert ||
                  latestAlert.resolved
                    ? colors.safe
                    : latestAlert.severity ===
                        'critical'
                      ? colors.danger
                      : latestAlert.severity ===
                          'warning'
                        ? colors.warning
                        : colors.safe,
              },
            ]}
          />

          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {!latestAlert
                ? 'No alerts'
                : latestAlert.resolved
                  ? 'Alert resolved'
                  : latestAlert.title}
            </Text>

            <Text style={styles.alertMessage}>
              {!latestAlert
                ? 'The system has not reported any alerts.'
                : latestAlert.message}
            </Text>
          </View>
        </View>

        {/* System health */}
        <SectionHeader title="System Health" />

        <View style={styles.systemCard}>
          <SystemItem
            label="Firebase"
            value={systemLabel}
            tone={systemConnectionTone}
          />

          <SystemItem
            label="Sensors"
            value={sensorLabel}
            tone={sensorTone}
          />

          <SystemItem
            label="Connection"
            value={wifiLabel}
            tone={systemConnectionTone}
            last
          />
        </View>
      </View>

      {/* Alerts modal */}
      <Modal
        visible={alertsOpen}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setAlertsOpen(false)
        }
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() =>
            setAlertsOpen(false)
          }
        >
          <Pressable
            style={styles.alertPanel}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={styles.alertPanelHeader}
            >
              <Text
                style={styles.alertPanelTitle}
              >
                Alerts
              </Text>

              <Pressable
                onPress={() =>
                  setAlertsOpen(false)
                }
                hitSlop={10}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {recentAlerts.length === 0 ? (
              <Text
                style={styles.noAlertsText}
              >
                No alerts reported.
              </Text>
            ) : (
              <View
                style={styles.modalAlertsList}
              >
                {recentAlerts.map((alert) => (
                  <View
                    key={alert.id}
                    style={styles.modalAlert}
                  >
                    <View
                      style={[
                        styles.modalAlertDot,
                        {
                          backgroundColor:
                            alert.severity ===
                            'critical'
                              ? colors.danger
                              : alert.severity ===
                                  'warning'
                                ? colors.warning
                                : colors.safe,
                        },
                      ]}
                    />

                    <View
                      style={
                        styles.modalAlertContent
                      }
                    >
                      <Text
                        style={
                          styles.modalAlertTitle
                        }
                      >
                        {alert.title}
                      </Text>

                      <Text
                        style={
                          styles.modalAlertMessage
                        }
                      >
                        {alert.message}
                      </Text>

                      <View
                        style={
                          styles.modalAlertMeta
                        }
                      >
                        <Text
                          style={
                            styles.modalAlertTime
                          }
                        >
                          {new Date(
                            alert.createdAt,
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute:
                                '2-digit',
                            },
                          )}
                        </Text>

                        <StatusBadge
                          label={
                            alert.resolved
                              ? 'RESOLVED'
                              : alert.severity.toUpperCase()
                          }
                          tone={
                            alert.resolved
                              ? 'safe'
                              : alert.severity ===
                                  'critical'
                                ? 'danger'
                                : alert.severity ===
                                    'warning'
                                  ? 'warning'
                                  : 'safe'
                          }
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

/*
 * --------------------------------------------------
 * WATER QUALITY STATUS HELPERS
 * --------------------------------------------------
 */

function getParameterStatus(
  value: number,
  parameter:
    | 'pH'
    | 'Turbidity'
    | 'Temperature'
    | 'TDS',
): ParameterStatus {
  /*
   * pH
   *
   * NORMAL   = 6.5 - 8.5
   * WARNING  = 6 - 6.5 OR 8.5 - 9
   * CRITICAL = below 6 OR above 9
   */
  if (parameter === 'pH') {
    if (value < 6 || value > 9) {
      return 'CRITICAL';
    }

    if (value < 6.5 || value > 8.5) {
      return 'WARNING';
    }

    return 'NORMAL';
  }

  /*
   * Turbidity
   *
   * NORMAL   = 0 - 5 NTU
   * WARNING  = above 5 to 10 NTU
   * CRITICAL = above 10 NTU
   */
  if (parameter === 'Turbidity') {
    if (value > 10) {
      return 'CRITICAL';
    }

    if (value > 5) {
      return 'WARNING';
    }

    return 'NORMAL';
  }

  if (parameter === 'TDS') {
    if (!Number.isFinite(value)) return 'NORMAL';
    if (value > 1000) return 'CRITICAL';
    if (value > 500) return 'WARNING';
    return 'NORMAL';
  }

  /*
   * Temperature
   *
   * NORMAL   = 20 - 35 °C
   * WARNING  = 15 - 20 OR 35 - 40 °C
   * CRITICAL = below 15 OR above 40 °C
   */
  if (value < 15 || value > 40) {
    return 'CRITICAL';
  }

  if (value < 20 || value > 35) {
    return 'WARNING';
  }

  return 'NORMAL';
}

function getOverallWaterStatus(
  phStatus: ParameterStatus,
  turbidityStatus: ParameterStatus,
  temperatureStatus: ParameterStatus,
  tdsStatus: ParameterStatus | null,
): WaterStatus {
  const statuses: ParameterStatus[] = [
    phStatus,
    turbidityStatus,
    temperatureStatus,
  ];
  if (tdsStatus) statuses.push(tdsStatus);

  if (statuses.includes('CRITICAL')) {
    return 'critical';
  }

  if (statuses.includes('WARNING')) {
    return 'warning';
  }

  return 'safe';
}

function getWaterStatusLabel(
  status: WaterStatus,
): string {
  if (status === 'critical') {
    return 'CRITICAL';
  }

  if (status === 'warning') {
    return 'WARNING';
  }

  return 'SAFE';
}

function getWaterStatusTone(
  status: WaterStatus,
) {
  if (status === 'critical') {
    return 'danger' as const;
  }

  if (status === 'warning') {
    return 'warning' as const;
  }

  return 'safe' as const;
}

/*
 * --------------------------------------------------
 * SYSTEM ITEM
 * --------------------------------------------------
 */

type SystemItemProps = {
  label: string;
  value: string;
  tone:
    | 'safe'
    | 'warning'
    | 'danger'
    | 'neutral';
  last?: boolean;
};

function SystemItem({
  label,
  value,
  tone,
  last = false,
}: SystemItemProps) {
  const dotColor =
    tone === 'danger'
      ? colors.danger
      : tone === 'warning'
        ? colors.warning
        : tone === 'safe'
          ? colors.safe
          : colors.textMuted;

  return (
    <View
      style={[
        styles.systemItem,
        last && styles.systemItemLast,
      ]}
    >
      <Text style={styles.systemLabel}>
        {label}
      </Text>

      <View style={styles.systemValue}>
        <View
          style={[
            styles.systemDot,
            {
              backgroundColor: dotColor,
            },
          ]}
        />

        <Text style={styles.systemValueText}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/*
 * --------------------------------------------------
 * STYLES
 * --------------------------------------------------
 */

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  header: {
    alignItems: 'center',
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
    letterSpacing: -0.3,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
  },

  notificationButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },

  notificationButtonPressed: {
    opacity: 0.75,
  },

  waterStatusCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.xl,
  },

  waterStatusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  waterStatusTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  waterStatusMessage: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },

  aiCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  aiTextContent: {
    flex: 1,
    gap: spacing.xs,
  },

  aiLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  aiDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },

  /*
   * --------------------------------------------------
   * CURRENT READINGS GRID
   * --------------------------------------------------
   *
   * Two cards share the first row.
   * Temperature takes the entire second row.
   */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  metricHalf: {
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
  },

  metricFull: {
    flexBasis: '100%',
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

  alertDot: {
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

  systemCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
  },

  systemItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    gap: spacing.md,
  },

  systemItemLast: {
    borderBottomWidth: 0,
  },

  systemLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },

  systemValue: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },

  systemDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },

  systemValueText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },

  /*
   * --------------------------------------------------
   * ALERT MODAL
   * --------------------------------------------------
   */

  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    flex: 1,
    justifyContent: 'flex-end',
  },

  alertPanel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '75%',
    minHeight: 220,
    padding: spacing.xl,
  },

  alertPanelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  alertPanelTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },

  noAlertsText: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },

  modalAlertsList: {
    gap: spacing.lg,
  },

  modalAlert: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  modalAlertDot: {
    borderRadius: 5,
    height: 10,
    marginTop: 5,
    width: 10,
  },

  modalAlertContent: {
    flex: 1,
    gap: spacing.sm,
  },

  modalAlertTitle: {
    color: colors.text,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },

  modalAlertMessage: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },

  modalAlertMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },

  modalAlertTime: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
});


