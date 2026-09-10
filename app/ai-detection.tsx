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
  demoAIDetection,
  demoAIDetectionHistory,
} from '../src/data/demoData';

export default function AIDetectionScreen() {
  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Detection</Text>

            <Text style={styles.subtitle}>
              Intelligent water quality assessment
            </Text>
          </View>

          <View style={styles.aiIndicator}>
            <View style={styles.aiDot} />
            <Text style={styles.aiIndicatorText}>Active</Text>
          </View>
        </View>

        {/* AI Assessment */}
        <View style={styles.assessmentCard}>
          <Text style={styles.sectionLabel}>
            AI ASSESSMENT
          </Text>

          <View style={styles.assessmentStatus}>
            <View style={styles.statusMark}>
              <Text style={styles.statusMarkText}>✓</Text>
            </View>

            <View style={styles.statusContent}>
              <Text style={styles.prediction}>
                {demoAIDetection.prediction.toUpperCase()}
              </Text>

              <Text style={styles.predictionMessage}>
                {demoAIDetection.prediction === 'safe'
                  ? 'All monitored parameters are within normal conditions.'
                  : demoAIDetection.prediction === 'warning'
                    ? 'One or more parameters require attention.'
                    : 'An abnormal water quality condition has been detected.'}
              </Text>
            </View>
          </View>

          <View style={styles.assessmentDetails}>
            <DetailRow
              label="Anomaly Score"
              value={
                demoAIDetection.anomalyScore !== null
                  ? demoAIDetection.anomalyScore.toFixed(2)
                  : '—'
              }
            />

            <DetailRow
              label="Confidence"
              value={
                demoAIDetection.confidence !== null
                  ? `${Math.round(demoAIDetection.confidence * 100)}%`
                  : '—'
              }
            />

            <DetailRow
              label="Detected Condition"
              value={demoAIDetection.detectedCondition ?? 'None'}
            />

            <DetailRow
              label="Last Detection"
              value={new Date(demoAIDetection.detectedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          </View>
        </View>

        {/* Detection history */}
        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.historyTitle}>
              Detection History
            </Text>

            <Text style={styles.historySubtitle}>
              Today
            </Text>
          </View>
        </View>

        <View style={styles.historyList}>
          {demoAIDetectionHistory.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.historyItem,
                pressed && styles.historyItemPressed,
              ]}
            >
              <View
                style={[
                  styles.historyDot,
                  {
                    backgroundColor:
                      item.prediction === 'anomaly'
                        ? colors.danger
                        : item.prediction === 'warning'
                          ? colors.warning
                          : colors.safe,
                  },
                ]}
              />

              <View style={styles.historyContent}>
                <View style={styles.historyTopRow}>
                  <Text style={styles.historyTime}>
                    {new Date(item.detectedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>

                  <StatusBadge
                    label={item.prediction.toUpperCase()}
                    tone={
                      item.prediction === 'anomaly'
                        ? 'danger'
                        : item.prediction === 'warning'
                          ? 'warning'
                          : 'safe'
                    }
                  />
                </View>

                <Text style={styles.historyMessage}>
                  {item.detectedCondition ?? 'All parameters normal'}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Current system interpretation */}
        <View style={styles.interpretationCard}>
          <Text style={styles.interpretationTitle}>
            Current interpretation
          </Text>

          <Text style={styles.interpretationText}>
            The AI model currently classifies the water
            condition as safe based on the latest sensor
            measurements.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
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

  aiIndicator: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  aiDot: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    height: 8,
    width: 8,
  },

  aiIndicatorText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
  },

  assessmentCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.lg,
    padding: spacing.xl,
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  assessmentStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },

  statusMark: {
    alignItems: 'center',
    backgroundColor: colors.safeBackground,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },

  statusMarkText: {
    color: colors.safe,
    fontSize: 24,
    fontWeight: '800',
  },

  statusContent: {
    flex: 1,
    gap: spacing.xs,
  },

  prediction: {
    color: colors.safe,
    fontSize: 28,
    fontWeight: '800',
  },

  predictionMessage: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },

  assessmentDetails: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },

  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 26,
  },

  detailLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },

  detailValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
    maxWidth: '48%',
    textAlign: 'right',
  },

  historyHeader: {
    gap: spacing.xs,
  },

  historyTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },

  historySubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },

  historyList: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  historyItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  historyItemPressed: {
    opacity: 0.85,
  },

  historyDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },

  historyContent: {
    flex: 1,
    gap: spacing.xs,
  },

  historyTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  historyTime: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },

  historyMessage: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },

  arrow: {
    color: colors.textMuted,
    fontSize: 24,
    lineHeight: 24,
  },

  interpretationCard: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.lg,
  },

  interpretationTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
  },

  interpretationText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
});