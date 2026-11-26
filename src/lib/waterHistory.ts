import {
  onValue,
  ref,
  type Unsubscribe,
} from 'firebase/database';

import { realtimeDb } from './firebase';
import type { RealtimeWaterReading } from './realtimeWaterReadings';

export function subscribeToWaterHistory(
  onUpdate: (readings: RealtimeWaterReading[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const historyRef = ref(
    realtimeDb,
    'waterSystem/sensors/history',
  );

  return onValue(
    historyRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate([]);
        return;
      }

      const readings: RealtimeWaterReading[] = [];

      snapshot.forEach((child) => {
        const data = child.val();
        if (!data) return;

        const rawAIStatus = String(data.ai_status ?? 'normal').toLowerCase();
        const aiStatus =
          rawAIStatus === 'critical'
            ? 'critical'
            : rawAIStatus === 'warning'
              ? 'warning'
              : 'normal';

        readings.push({
          ph: Number(data.ph ?? 0),
          turbidity: Number(data.turbidity_ntu ?? 0),
          temperature: Number(data.temperature ?? 0),
          tds: data.tds == null ? Number.NaN : Number(data.tds),
          aiStatus,
          pumpState: String(data.pump_state ?? 'Unknown'),
          sendTime: Number(data.sendTimeMs ?? data.sendTime ?? 0),
        });
      });

      // Oldest → newest, matching the existing graph behavior.
      readings.sort((a, b) => a.sendTime - b.sendTime);
      onUpdate(readings);
    },
    (error) => {
      onError(error);
    },
  );
}
