export type WaterStatus = 'safe' | 'warning' | 'anomaly';

export type SensorStatus = 'normal' | 'warning' | 'anomaly';

export type WaterReading = {
  id: string;
  deviceId: string;
  recordedAt: string;

  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;

  overallStatus: WaterStatus;
};