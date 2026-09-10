export type AIPrediction = 'safe' | 'warning' | 'anomaly';

export type AIDetection = {
  id: string;
  deviceId: string;
  detectedAt: string;

  prediction: AIPrediction;

  anomalyScore: number | null;
  confidence: number | null;

  detectedCondition: string | null;

  ph: number | null;
  turbidity: number | null;
  tds: number | null;
  temperature: number | null;
};