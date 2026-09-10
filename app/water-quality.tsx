import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { StatusBadge } from '../src/components/ui/StatusBadge';

import {
  subscribeToWaterHistory,
} from '../src/lib/waterHistory';

import {
  subscribeToRealtimeWaterReading,
  type RealtimeWaterReading,
} from '../src/lib/realtimeWaterReadings';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../src/theme';

type GraphParameter =
  | 'pH'
  | 'Turbidity'
  | 'Temperature';

type TimeFilter =
  | '1H'
  | '6H'
  | '12H'
  | '1D';

const graphParameters: GraphParameter[] = [
  'pH',
  'Turbidity',
  'Temperature',
];

const filters: TimeFilter[] = [
  '1H',
  '6H',
  '12H',
  '1D',
];

const parameterInfo = {
  pH: {
    unit: '',
    range: '6.5 – 8.5',
  },

  Turbidity: {
    unit: 'NTU',
    range: '0 – 5 NTU',
  },

  Temperature: {
    unit: '°C',
    range: '20 – 35 °C',
  },
};

export default function WaterQualityScreen() {
  const [currentReading, setCurrentReading] =
    useState<RealtimeWaterReading | null>(null);

  const [history, setHistory] = useState<
    RealtimeWaterReading[]
  >([]);

  const [selectedParameter, setSelectedParameter] =
    useState<GraphParameter>('pH');

  const [selectedFilter, setSelectedFilter] =
    useState<TimeFilter>('1H');

  /*
   * --------------------------------------------------
   * REALTIME + HISTORY LISTENERS
   * --------------------------------------------------
   *
   * currentReading:
   * waterSystem/sensors/metrics
   *
   * history:
   * waterSystem/sensors/history
   *
   * They are intentionally kept separate.
   */
  useEffect(() => {
    const unsubscribeRealtime =
      subscribeToRealtimeWaterReading(
        (reading) => {
          console.log(
            '🔥 Water Quality RTDB UPDATE:',
            JSON.stringify(reading),
          );

          if (!reading) {
            return;
          }

          setCurrentReading(reading);
        },
        (error) => {
          console.error(
            'Water Quality RTDB listener error:',
            error,
          );
        },
      );

    const unsubscribeHistory =
      subscribeToWaterHistory(
        (readings) => {
          console.log(
            '📈 WATER HISTORY:',
            readings.length,
          );

          setHistory(readings);
        },
        (error) => {
          console.error(
            'Water history listener error:',
            error,
          );
        },
      );

    return () => {
      unsubscribeRealtime?.();
      unsubscribeHistory?.();
    };
  }, []);

  /*
   * --------------------------------------------------
   * GRAPH DATA
   * --------------------------------------------------
   *
   * Merge saved history with the current live
   * metrics reading so the newest live value appears
   * immediately as the newest graph point.
   */
  const graphHistory =
    mergeCurrentReadingIntoHistory(
      history,
      currentReading,
    );

  const filteredHistory =
    getFilteredHistory(
      graphHistory,
      selectedFilter,
    );

  /*
   * Current live value.
   *
   * This ALWAYS comes from currentReading,
   * not from history.
   */
  const currentValue = currentReading
    ? getParameterValue(
        currentReading,
        selectedParameter,
      )
    : null;

  const selectedInfo =
    parameterInfo[selectedParameter];

  const selectedStatus =
    getParameterStatus(
      currentReading,
      selectedParameter,
    );

  const overallStatus =
    getOverallWaterStatus(currentReading);

  const selectedStatusTone =
    getStatusTone(selectedStatus);

  const overallStatusTone =
    getStatusTone(overallStatus);

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Water Quality
            </Text>

            <Text style={styles.subtitle}>
              Live sensor measurements
            </Text>
          </View>

          <View style={styles.headerRight}>

            {/* Overall water status */}
            <View style={styles.overallStatus}>
              <Text style={styles.overallStatusLabel}>
                Overall
              </Text>

              <StatusBadge
                label={overallStatus}
                tone={overallStatusTone}
              />
            </View>

            {/* Live indicator */}
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                Live
              </Text>
            </View>

          </View>
        </View>

        {/* Current readings */}
        <View style={styles.readingsCard}>
          <Text style={styles.cardTitle}>
            Current Readings
          </Text>

          <ReadingRow
            label="pH"
            value={
              currentReading
                ? currentReading.ph.toFixed(2)
                : '—'
            }
            unit=""
            status={getParameterStatus(
              currentReading,
              'pH',
            )}
          />

          <ReadingRow
            label="Turbidity"
            value={
              currentReading
                ? currentReading.turbidity.toFixed(2)
                : '—'
            }
            unit="NTU"
            status={getParameterStatus(
              currentReading,
              'Turbidity',
            )}
          />

          <ReadingRow
            label="Temperature"
            value={
              currentReading
                ? currentReading.temperature.toFixed(1)
                : '—'
            }
            unit="°C"
            status={getParameterStatus(
              currentReading,
              'Temperature',
            )}
            last
          />
        </View>

        {/* Overall status explanation */}
        <View
          style={[
            styles.overallCard,
            overallStatus === 'CRITICAL'
              ? styles.overallCardCritical
              : overallStatus === 'WARNING'
                ? styles.overallCardWarning
                : styles.overallCardNormal,
          ]}
        >
          <View style={styles.overallCardHeader}>
            <View style={styles.overallCardText}>
              <Text style={styles.overallCardTitle}>
                Overall Water Status
              </Text>

              <Text style={styles.overallCardSubtitle}>
                Based on pH, turbidity, and temperature
              </Text>
            </View>

            <StatusBadge
              label={overallStatus}
              tone={overallStatusTone}
            />
          </View>

          <Text style={styles.overallExplanation}>
            {getOverallStatusMessage(
              currentReading,
              overallStatus,
            )}
          </Text>
        </View>

        {/* Graph */}
        <View style={styles.graphSection}>
          <View style={styles.graphHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Real-Time Sensor Graph
              </Text>

              <Text style={styles.sectionSubtitle}>
                {selectedParameter}
              </Text>
            </View>

            <Text style={styles.updatedText}>
              {currentReading
                ? 'Updated just now'
                : 'Waiting for sensor data'}
            </Text>
          </View>

          {/* Parameter selector */}
          <View style={styles.parameterSelector}>
            {graphParameters.map(
              (parameter) => {
                const active =
                  parameter ===
                  selectedParameter;

                return (
                  <Pressable
                    key={parameter}
                    onPress={() =>
                      setSelectedParameter(
                        parameter,
                      )
                    }
                    style={[
                      styles.parameterButton,
                      active &&
                        styles.parameterButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.parameterButtonText,
                        active &&
                          styles.parameterButtonTextActive,
                      ]}
                    >
                      {parameter}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>

          {/* Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.currentValue}>
                <Text style={styles.chartValue}>
                  {currentValue !== null
                    ? formatParameterValue(
                        currentValue,
                        selectedParameter,
                      )
                    : '—'}
                </Text>

                {selectedInfo.unit ? (
                  <Text style={styles.chartUnit}>
                    {selectedInfo.unit}
                  </Text>
                ) : null}
              </View>

              <View style={styles.chartStatus}>
                <StatusBadge
                  label={selectedStatus}
                  tone={selectedStatusTone}
                />

                <Text style={styles.rangeText}>
                  Range {selectedInfo.range}
                </Text>
              </View>
            </View>

            {filteredHistory.length > 0 ? (
              <SimpleLineChart
                readings={filteredHistory}
                parameter={selectedParameter}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text
                  style={styles.emptyChartText}
                >
                  Waiting for sensor readings.
                </Text>

                <Text
                  style={styles.emptyChartHint}
                >
                  New RTDB readings will appear
                  here automatically.
                </Text>
              </View>
            )}

            {/* Time range */}
            <View style={styles.timeSelector}>
              {filters.map((filter) => {
                const active =
                  filter === selectedFilter;

                return (
                  <Pressable
                    key={filter}
                    onPress={() =>
                      setSelectedFilter(
                        filter,
                      )
                    }
                    style={[
                      styles.timeButton,
                      active &&
                        styles.timeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        active &&
                          styles.timeTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Selected parameter summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              {selectedParameter}
            </Text>

            <Text style={styles.summarySubtitle}>
              Current measurement
            </Text>

            <View style={styles.summaryValueRow}>
              <Text style={styles.summaryValue}>
                {currentValue !== null
                  ? formatParameterValue(
                      currentValue,
                      selectedParameter,
                    )
                  : '—'}
              </Text>

              {selectedInfo.unit ? (
                <Text style={styles.summaryUnit}>
                  {selectedInfo.unit}
                </Text>
              ) : null}

              <StatusBadge
                label={selectedStatus}
                tone={selectedStatusTone}
              />
            </View>

            <View style={styles.summaryBottom}>
              <Text
                style={styles.summaryRangeLabel}
              >
                Normal range
              </Text>

              <Text
                style={styles.summaryRangeValue}
              >
                {selectedInfo.range}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

/*
 * --------------------------------------------------
 * MERGE HISTORY + CURRENT LIVE READING
 * --------------------------------------------------
 *
 * History contains saved readings.
 *
 * currentReading contains the latest metrics value.
 *
 * We put the current reading at the end of the graph.
 *
 * If the current reading has the same sendTime as an
 * existing history record, replace that record instead
 * of creating a duplicate point.
 */
function mergeCurrentReadingIntoHistory(
  history: RealtimeWaterReading[],
  currentReading: RealtimeWaterReading | null,
): RealtimeWaterReading[] {
  if (!currentReading) {
    return history;
  }

  const next = [...history];

  /*
   * If sendTime is valid, check whether this exact
   * reading already exists in history.
   */
  if (currentReading.sendTime > 0) {
    const existingIndex = next.findIndex(
      (reading) =>
        reading.sendTime ===
        currentReading.sendTime,
    );

    if (existingIndex !== -1) {
      next[existingIndex] = currentReading;

      return next.sort(
        (a, b) =>
          a.sendTime - b.sendTime,
      );
    }
  }

  /*
   * If it is not already in history, add the live
   * reading as the newest point.
   */
  next.push(currentReading);

  return next.sort(
    (a, b) =>
      a.sendTime - b.sendTime,
  );
}

/*
 * --------------------------------------------------
 * FILTER GRAPH HISTORY
 * --------------------------------------------------
 *
 * Use the newest sensor timestamp as the reference
 * point instead of Date.now().
 *
 * This avoids problems when the hardware clock and
 * phone clock are slightly different.
 */
function getFilteredHistory(
  history: RealtimeWaterReading[],
  filter: TimeFilter,
): RealtimeWaterReading[] {
  if (history.length === 0) {
    return [];
  }

  const hours =
    filter === '1H'
      ? 1
      : filter === '6H'
        ? 6
        : filter === '12H'
          ? 12
          : 24;

  const timestampedReadings =
    history.filter(
      (reading) =>
        reading.sendTime > 0,
    );

  /*
   * If Firebase does not have usable timestamps,
   * fall back to the latest readings.
   */
  if (timestampedReadings.length === 0) {
    const maxPoints =
      hours === 1
        ? 20
        : hours === 6
          ? 40
          : hours === 12
            ? 60
            : 100;

    return history.slice(-maxPoints);
  }

  /*
   * Use the newest sensor timestamp as the
   * reference point for the selected time range.
   */
  const latestTimestamp =
    Math.max(
      ...timestampedReadings.map(
        (reading) =>
          reading.sendTime,
      ),
    );

  const cutoff =
    latestTimestamp -
    hours * 60 * 60 * 1000;

  const filtered =
    timestampedReadings.filter(
      (reading) =>
        reading.sendTime >= cutoff,
    );

  /*
   * If the filter produces nothing,
   * show the newest reading.
   */
  if (filtered.length === 0) {
    return timestampedReadings.slice(-1);
  }

  return filtered;
}

/*
 * --------------------------------------------------
 * GET PARAMETER VALUE
 * --------------------------------------------------
 */
function getParameterValue(
  reading: RealtimeWaterReading,
  parameter: GraphParameter,
): number {
  if (parameter === 'pH') {
    return reading.ph;
  }

  if (parameter === 'Turbidity') {
    return reading.turbidity;
  }

  return reading.temperature;
}

/*
 * --------------------------------------------------
 * FORMAT VALUE
 * --------------------------------------------------
 */
function formatParameterValue(
  value: number,
  parameter: GraphParameter,
): string {
  if (parameter === 'pH') {
    return value.toFixed(2);
  }

  return value.toFixed(1);
}

/*
 * --------------------------------------------------
 * OVERALL WATER STATUS
 * --------------------------------------------------
 *
 * CRITICAL has the highest priority.
 */
function getOverallWaterStatus(
  reading: RealtimeWaterReading | null,
): string {
  if (!reading) {
    return 'NORMAL';
  }

  const statuses = [
    getParameterStatus(reading, 'pH'),
    getParameterStatus(reading, 'Turbidity'),
    getParameterStatus(
      reading,
      'Temperature',
    ),
  ];

  if (statuses.includes('CRITICAL')) {
    return 'CRITICAL';
  }

  if (statuses.includes('WARNING')) {
    return 'WARNING';
  }

  return 'NORMAL';
}

/*
 * --------------------------------------------------
 * STATUS TONE
 * --------------------------------------------------
 */
function getStatusTone(
  status: string,
) {
  if (status === 'CRITICAL') {
    return 'danger';
  }

  if (status === 'WARNING') {
    return 'warning';
  }

  return 'safe';
}

/*
 * --------------------------------------------------
 * OVERALL STATUS MESSAGE
 * --------------------------------------------------
 */
function getOverallStatusMessage(
  reading: RealtimeWaterReading | null,
  status: string,
): string {
  if (!reading) {
    return 'Waiting for live sensor readings.';
  }

  if (status === 'CRITICAL') {
    return 'One or more water-quality parameters are at a critical level.';
  }

  if (status === 'WARNING') {
    return 'One or more water-quality parameters are outside the normal range.';
  }

  return 'All water-quality parameters are currently within the normal range.';
}

/*
 * --------------------------------------------------
 * INDIVIDUAL PARAMETER STATUS
 * --------------------------------------------------
 *
 * pH:
 * NORMAL   = 6.5 - 8.5
 * WARNING  = 6 - 6.5 OR 8.5 - 9
 * CRITICAL = below 6 OR above 9
 *
 * Turbidity:
 * NORMAL   = 0 - 5 NTU
 * WARNING  = above 5 to 10 NTU
 * CRITICAL = above 10 NTU
 *
 * Temperature:
 * NORMAL   = 20 - 35 °C
 * WARNING  = 15 - 20 OR 35 - 40 °C
 * CRITICAL = below 15 OR above 40 °C
 */
function getParameterStatus(
  reading: RealtimeWaterReading | null,
  parameter: GraphParameter,
): string {
  if (!reading) {
    return 'NORMAL';
  }

  const value = getParameterValue(
    reading,
    parameter,
  );

  if (parameter === 'pH') {
    if (value < 6 || value > 9) {
      return 'CRITICAL';
    }

    if (value < 6.5 || value > 8.5) {
      return 'WARNING';
    }

    return 'NORMAL';
  }

  if (parameter === 'Turbidity') {
    if (value > 10) {
      return 'CRITICAL';
    }

    if (value > 5) {
      return 'WARNING';
    }

    return 'NORMAL';
  }

  if (value < 15 || value > 40) {
    return 'CRITICAL';
  }

  if (value < 20 || value > 35) {
    return 'WARNING';
  }

  return 'NORMAL';
}

type ReadingRowProps = {
  label: string;
  value: string;
  unit: string;
  status: string;
  last?: boolean;
};

function ReadingRow({
  label,
  value,
  unit,
  status,
  last = false,
}: ReadingRowProps) {
  const dotColor =
    status === 'CRITICAL'
      ? colors.danger
      : status === 'WARNING'
        ? colors.warning
        : colors.safe;

  const statusColor =
    status === 'CRITICAL'
      ? colors.danger
      : status === 'WARNING'
        ? colors.warning
        : colors.safe;

  return (
    <View
      style={[
        styles.readingRow,
        !last && styles.readingRowBorder,
      ]}
    >
      <Text style={styles.readingLabel}>
        {label}
      </Text>

      <View style={styles.readingValueRow}>
        <Text style={styles.readingValue}>
          {value}
        </Text>

        {unit ? (
          <Text style={styles.readingUnit}>
            {unit}
          </Text>
        ) : null}

        <View style={styles.normalIndicator}>
          <View
            style={[
              styles.normalDot,
              {
                backgroundColor: dotColor,
              },
            ]}
          />

          <Text
            style={[
              styles.normalText,
              {
                color: statusColor,
              },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
}

/*
 * --------------------------------------------------
 * SIMPLE LINE CHART
 * --------------------------------------------------
 */
function SimpleLineChart({
  readings,
  parameter,
}: {
  readings: RealtimeWaterReading[];
  parameter: GraphParameter;
}) {
  const [chartWidth, setChartWidth] =
    useState(0);

  const values = readings.map(
    (reading) =>
      getParameterValue(
        reading,
        parameter,
      ),
  );

  if (values.length === 0) {
    return null;
  }

  /*
   * Single reading
   */
  if (values.length === 1) {
    return (
      <View style={styles.chart}>
        <View style={styles.gridLineTop} />
        <View style={styles.gridLineMiddle} />
        <View style={styles.gridLineBottom} />

        <View
          style={styles.chartLineArea}
          onLayout={(event) => {
            setChartWidth(
              event.nativeEvent.layout.width,
            );
          }}
        >
          {chartWidth > 0 ? (
            <View
              style={[
                styles.chartPoint,
                {
                  left:
                    chartWidth / 2,
                  top: 72,
                },
              ]}
            />
          ) : null}
        </View>

        <View style={styles.chartBottomLabels}>
          <Text style={styles.chartAxisText}>
            {formatChartTime(
              readings[0].sendTime,
            )}
          </Text>

          <Text style={styles.chartAxisText}>
            Now
          </Text>
        </View>
      </View>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;

  const chartHeight = 150;

  const points = values.map(
    (value, index) => {
      const x =
        (index /
          (values.length - 1)) *
        chartWidth;

      const y =
        chartHeight -
        ((value - min) / spread) *
          (chartHeight - 16);

      return {
        x,
        y,
      };
    },
  );

  const firstReading =
    readings[0];

  const lastReading =
    readings[readings.length - 1];

  return (
    <View style={styles.chart}>
      <View style={styles.gridLineTop} />
      <View style={styles.gridLineMiddle} />
      <View style={styles.gridLineBottom} />

      <View
        style={styles.chartLineArea}
        onLayout={(event) => {
          setChartWidth(
            event.nativeEvent.layout.width,
          );
        }}
      >
        {chartWidth > 0
          ? points
              .slice(1)
              .map((point, index) => {
                const previous =
                  points[index];

                const dx =
                  point.x -
                  previous.x;

                const dy =
                  point.y -
                  previous.y;

                const length =
                  Math.sqrt(
                    dx * dx +
                      dy * dy,
                  );

                const angle =
                  Math.atan2(
                    dy,
                    dx,
                  ) *
                  (180 / Math.PI);

                const left =
                  previous.x +
                  dx / 2 -
                  length / 2;

                const top =
                  previous.y +
                  dy / 2 -
                  1;

                return (
                  <View
                    key={`segment-${index}`}
                    style={[
                      styles.chartSegment,
                      {
                        left,
                        top,
                        width: length,
                        transform: [
                          {
                            rotate: `${angle}deg`,
                          },
                        ],
                      },
                    ]}
                  />
                );
              })
          : null}

        {chartWidth > 0
          ? points.map(
              (point, index) => (
                <View
                  key={`point-${index}`}
                  style={[
                    styles.chartPoint,
                    {
                      left: point.x,
                      top: point.y,
                    },
                  ]}
                />
              ),
            )
          : null}
      </View>

      <View style={styles.chartBottomLabels}>
        <Text style={styles.chartAxisText}>
          {formatChartTime(
            firstReading.sendTime,
          )}
        </Text>

        <Text style={styles.chartAxisText}>
          {formatChartTime(
            lastReading.sendTime,
          )}
        </Text>
      </View>
    </View>
  );
}

function formatChartTime(
  timestamp: number,
): string {
  if (!timestamp || timestamp <= 0) {
    return '—';
  }

  return new Date(timestamp).toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
    },
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
  },

  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },

  overallStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },

  overallStatusLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
  },

  liveIndicator: {
    alignItems: 'center',
    backgroundColor: colors.safeBackground,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  liveDot: {
    backgroundColor: colors.safe,
    borderRadius: 5,
    height: 8,
    width: 8,
  },

  liveText: {
    color: colors.safe,
    fontSize: typography.caption,
    fontWeight: '700',
  },

  readingsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth:
      StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
  },

  cardTitle: {
    color: colors.text,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    paddingBottom: spacing.md,
    paddingTop: spacing.lg,
  },

  readingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
  },

  readingRowBorder: {
    borderBottomColor: colors.border,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  readingLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },

  readingValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },

  readingValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },

  readingUnit: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },

  normalIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },

  normalDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },

  normalText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },

  overallCard: {
    borderRadius: radius.lg,
    borderWidth:
      StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.lg,
  },

  overallCardNormal: {
    backgroundColor: colors.safeBackground,
    borderColor: colors.safe,
  },

  overallCardWarning: {
    backgroundColor: colors.warningBackground,
    borderColor: colors.warning,
  },

  overallCardCritical: {
    backgroundColor: colors.dangerBackground,
    borderColor: colors.danger,
  },

  overallCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },

  overallCardText: {
    flex: 1,
    gap: spacing.xs,
  },

  overallCardTitle: {
    color: colors.text,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },

  overallCardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },

  overallExplanation: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },

  graphSection: {
    gap: spacing.md,
  },

  graphHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },

  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },

  updatedText: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },

  parameterSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  parameterButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth:
      StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  parameterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  parameterButtonText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },

  parameterButtonTextActive: {
    color: colors.surface,
  },

  chartCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth:
      StyleSheet.hairlineWidth,
    gap: spacing.lg,
    padding: spacing.lg,
  },

  chartHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  currentValue: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.xs,
  },

  chartValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },

  chartUnit: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
  },

  chartStatus: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },

  rangeText: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },

  chart: {
    height: 190,
    overflow: 'hidden',
    position: 'relative',
  },

  gridLineTop: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
    top: '15%',
  },

  gridLineMiddle: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
    top: '50%',
  },

  gridLineBottom: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
    top: '85%',
  },

  chartLineArea: {
    bottom: 24,
    height: 150,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 8,
  },

  chartSegment: {
    backgroundColor: colors.primary,
    height: 2,
    position: 'absolute',
  },

  chartPoint: {
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    borderRadius: 5,
    borderWidth: 1.5,
    height: 7,
    marginLeft: -3.5,
    marginTop: -3.5,
    position: 'absolute',
    width: 7,
  },

  chartBottomLabels: {
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    position: 'absolute',
    right: 0,
  },

  chartAxisText: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },

  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 190,
    paddingHorizontal: spacing.lg,
  },

  emptyChartText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyChartHint: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  timeSelector: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    flexDirection: 'row',
    padding: 3,
  },

  timeButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    paddingVertical: spacing.xs,
  },

  timeButtonActive: {
    backgroundColor: colors.surface,
  },

  timeText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },

  timeTextActive: {
    color: colors.primary,
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth:
      StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.lg,
  },

  summaryTitle: {
    color: colors.text,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },

  summarySubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },

  summaryValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },

  summaryValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },

  summaryUnit: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },

  summaryBottom: {
    borderTopColor: colors.border,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },

  summaryRangeLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },

  summaryRangeValue: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
});