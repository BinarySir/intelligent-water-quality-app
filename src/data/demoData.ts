import type { AIDetection } from '../types/ai';
import type { PurificationEvent } from '../types/purification';
import type { SystemStatus } from '../types/system';
import type { WaterReading } from '../types/water';

export const demoWaterReading: WaterReading = {
  id: 'reading-001',
  deviceId: 'ESP32-01',
  recordedAt: new Date().toISOString(),

  ph: 7.12,
  turbidity: 1.92,
  tds: 256,
  temperature: 25.8,

  overallStatus: 'safe',
};

export const demoAIDetection: AIDetection = {
  id: 'ai-001',
  deviceId: 'ESP32-01',
  detectedAt: new Date().toISOString(),

  prediction: 'safe',

  anomalyScore: 0.13,
  confidence: 0.94,

  detectedCondition: null,

  ph: 7.12,
  turbidity: 1.92,
  tds: 256,
  temperature: 25.8,
};

export const demoPurificationEvent: PurificationEvent = {
  id: 'purification-001',
  deviceId: 'ESP32-01',

  startedAt: new Date().toISOString(),
  endedAt: null,

  status: 'off',
  trigger: 'automatic',

  reason: null,

  durationSeconds: null,
};

export const demoSystemStatus: SystemStatus = {
  deviceId: 'ESP32-01',

  systemOnline: true,

  pumpStatus: 'on',

  purificationStatus: 'off',

  updatedAt: new Date().toISOString(),
};

export const demoAIDetectionHistory: AIDetection[] = [
  {
    id: 'ai-history-001',
    deviceId: 'ESP32-01',
    detectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    prediction: 'safe',
    anomalyScore: 0.13,
    confidence: 0.94,
    detectedCondition: null,
    ph: 7.12,
    turbidity: 1.92,
    tds: 256,
    temperature: 25.8,
  },
  {
    id: 'ai-history-002',
    deviceId: 'ESP32-01',
    detectedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    prediction: 'anomaly',
    anomalyScore: 0.91,
    confidence: 0.97,
    detectedCondition: 'High turbidity',
    ph: 5.72,
    turbidity: 9.4,
    tds: 615,
    temperature: 26.3,
  },
  {
    id: 'ai-history-003',
    deviceId: 'ESP32-01',
    detectedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    prediction: 'safe',
    anomalyScore: 0.16,
    confidence: 0.92,
    detectedCondition: null,
    ph: 7.08,
    turbidity: 2.1,
    tds: 270,
    temperature: 25.9,
  },
];