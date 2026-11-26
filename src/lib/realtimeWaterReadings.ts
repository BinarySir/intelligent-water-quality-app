import {
  onValue,
  ref,
  type Unsubscribe,
} from 'firebase/database';

import { realtimeDb } from './firebase';

export type RealtimeWaterReading = {
  ph: number;
  turbidity: number;
  temperature: number;
  /** TDS in ppm; NaN means this record did not contain a TDS value. */
  tds: number;
  aiStatus: 'normal' | 'warning' | 'critical';
  pumpState: string;
  sendTime: number;
};

export function subscribeToRealtimeWaterReading(
  onUpdate: (reading: RealtimeWaterReading | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const metricsRef = ref(
    realtimeDb,
    'waterSystem/sensors/metrics',
  );

  return onValue(
    metricsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
        return;
      }

      const data = snapshot.val();
      const aiStatus = String(data.ai_status ?? '').toLowerCase();
      const normalizedAIStatus =
        aiStatus === 'critical'
          ? 'critical'
          : aiStatus === 'warning'
            ? 'warning'
            : 'normal';

      onUpdate({
        ph: Number(data.ph ?? 0),
        turbidity: Number(data.turbidity_ntu ?? 0),
        temperature: Number(data.temperature ?? 0),
        tds: data.tds == null ? Number.NaN : Number(data.tds),
        aiStatus: normalizedAIStatus,
        pumpState: String(data.pump_state ?? 'unknown'),
        sendTime: Number(data.sendTimeMs ?? data.sendTime ?? 0),
      });
    },
    (error) => {
      onError(error);
    },
  );
}
