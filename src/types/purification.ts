export type PurificationStatus =
  | 'on'
  | 'off'
  | 'fault';

export type PurificationTrigger =
  | 'automatic'
  | 'manual';

export type PurificationEvent = {
  id: string;
  deviceId: string;

  startedAt: string;
  endedAt: string | null;

  status: PurificationStatus;
  trigger: PurificationTrigger;

  reason: string | null;

  durationSeconds: number | null;
};