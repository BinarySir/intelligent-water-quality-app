import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from './firebase';

export type LiveWaterReading = {
  id: string;
  deviceId: string;
  recordedAt: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  overallStatus: 'safe' | 'warning' | 'anomaly';
  aiStatus: 'normal' | 'warning' | 'critical';
};

export function subscribeToLatestWaterReading(
  onUpdate: (
    reading: LiveWaterReading | null,
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const readingsQuery = query(
    collection(db, 'water_readings'),
    orderBy('recorded_at', 'desc'),
    limit(1),
  );

  return onSnapshot(
    readingsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(null);
        return;
      }

      const document = snapshot.docs[0];
      const data = document.data();

      const overallStatus =
        data.overall_status === 'anomaly'
          ? 'anomaly'
          : data.overall_status === 'warning'
            ? 'warning'
            : 'safe';

      const aiStatus =
        data.ai_status === 'critical'
          ? 'critical'
          : data.ai_status === 'warning'
            ? 'warning'
            : 'normal';

      onUpdate({
        id: document.id,
        deviceId: String(data.device_id ?? ''),
        recordedAt:
          data.recorded_at?.toDate?.()?.toISOString() ??
          new Date().toISOString(),
        ph: Number(data.ph ?? 0),
        turbidity: Number(data.turbidity_ntu ?? 0),
        tds: Number(data.tds ?? 0),
        temperature: Number(data.temperature ?? 0),
        overallStatus,
        aiStatus,
      });
    },
    (error) => {
      onError(error);
    },
  );
}

export function subscribeToRecentWaterReadings(
  onUpdate: (readings: LiveWaterReading[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const readingsQuery = query(
    collection(db, 'water_readings'),
    orderBy('recorded_at', 'desc'),
    limit(200),
  );

  return onSnapshot(
    readingsQuery,
    (snapshot) => {
      const readings: LiveWaterReading[] =
        snapshot.docs.map((document) => {
          const data = document.data();

          const overallStatus =
            data.overall_status === 'anomaly'
              ? 'anomaly'
              : data.overall_status === 'warning'
                ? 'warning'
                : 'safe';

          const aiStatus =
            data.ai_status === 'critical'
              ? 'critical'
              : data.ai_status === 'warning'
                ? 'warning'
                : 'normal';

          return {
            id: document.id,
            deviceId: String(data.device_id ?? ''),
            recordedAt:
              data.recorded_at?.toDate?.()?.toISOString() ??
              new Date().toISOString(),
            ph: Number(data.ph ?? 0),
            turbidity: Number(data.turbidity_ntu ?? 0),
            tds: Number(data.tds ?? 0),
            temperature: Number(data.temperature ?? 0),
            overallStatus,
            aiStatus,
          };
        });

      onUpdate(readings);
    },
    (error) => {
      onError(error);
    },
  );
}