import {
  onValue,
  ref,
  type Unsubscribe,
} from 'firebase/database';

import { realtimeDb } from './firebase';

export type LiveSystemStatus = {
  databaseConnected: boolean;
  sensorStatus: 'normal' | 'warning' | 'fault';
  pumpState: string;
  aiStatus: 'normal' | 'warning' | 'critical';
  lastSeen: number;
};

/*
 * Determine the overall sensor condition from
 * the three water-quality parameters currently
 * used by the application:
 *
 * - pH
 * - Turbidity
 * - Temperature
 *
 * TDS is intentionally not included.
 */
function getSensorStatus(
  ph: number,
  turbidity: number,
  temperature: number,
): 'normal' | 'warning' | 'fault' {
  const phStatus =
    ph < 6 || ph > 9
      ? 'fault'
      : ph < 6.5 || ph > 8.5
        ? 'warning'
        : 'normal';

  const turbidityStatus =
    turbidity > 10
      ? 'fault'
      : turbidity > 5
        ? 'warning'
        : 'normal';

  const temperatureStatus =
    temperature < 15 || temperature > 40
      ? 'fault'
      : temperature < 20 || temperature > 35
        ? 'warning'
        : 'normal';

  /*
   * Fault takes priority over warning.
   */
  if (
    phStatus === 'fault' ||
    turbidityStatus === 'fault' ||
    temperatureStatus === 'fault'
  ) {
    return 'fault';
  }

  /*
   * Warning takes priority over normal.
   */
  if (
    phStatus === 'warning' ||
    turbidityStatus === 'warning' ||
    temperatureStatus === 'warning'
  ) {
    return 'warning';
  }

  return 'normal';
}

/*
 * Subscribe to the current system status.
 *
 * Current RTDB sources:
 *
 * waterSystem/sensors/metrics
 *     - ph
 *     - turbidity_ntu
 *     - temperature
 *     - pump_state
 *     - ai_status
 *     - sendTimeMs / sendTime
 *
 * .info/connected
 *     - Firebase connection state
 *
 * The old waterSystem/info / esp32Online
 * mechanism is intentionally no longer used.
 */
export function subscribeToSystemStatus(
  onUpdate: (
    status: LiveSystemStatus | null,
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const metricsRef = ref(
    realtimeDb,
    'waterSystem/sensors/metrics',
  );

  const connectionRef = ref(
    realtimeDb,
    '.info/connected',
  );

  let databaseConnected = false;

  let latestMetrics:
    | LiveSystemStatus
    | null = null;

  /*
   * Firebase connection listener.
   */
  const unsubscribeConnection = onValue(
    connectionRef,
    (snapshot) => {
      databaseConnected =
        snapshot.val() === true;

      /*
       * If we already have sensor data,
       * immediately update the system status
       * when the Firebase connection changes.
       */
      if (latestMetrics) {
        latestMetrics = {
          ...latestMetrics,
          databaseConnected,
        };

        onUpdate(latestMetrics);
      }
    },
    (error) => {
      onError(error);
    },
  );

  /*
   * Live sensor/system metrics listener.
   */
  const unsubscribeMetrics = onValue(
    metricsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        latestMetrics = null;
        onUpdate(null);
        return;
      }

      const data = snapshot.val();

      const ph = Number(
        data.ph ?? 0,
      );

      const turbidity = Number(
        data.turbidity_ntu ?? 0,
      );

      const temperature = Number(
        data.temperature ?? 0,
      );

      /*
       * AI status comes directly from RTDB.
       */
      const rawAIStatus = String(
        data.ai_status ?? 'normal',
      ).toLowerCase();

      const aiStatus =
        rawAIStatus === 'critical'
          ? 'critical'
          : rawAIStatus === 'warning'
            ? 'warning'
            : 'normal';

      /*
       * Build the current system status.
       */
      latestMetrics = {
        databaseConnected,

        sensorStatus:
          getSensorStatus(
            ph,
            turbidity,
            temperature,
          ),

        pumpState: String(
          data.pump_state ?? 'Unknown',
        ),

        aiStatus,

        lastSeen: Number(
          data.sendTimeMs ??
          data.sendTime ??
          0,
        ),
      };

      onUpdate(latestMetrics);
    },
    (error) => {
      onError(error);
    },
  );

  /*
   * Clean up both listeners.
   */
  return () => {
    unsubscribeConnection();
    unsubscribeMetrics();
  };
}