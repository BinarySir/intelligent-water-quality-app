export type PumpStatus =
  | 'on'
  | 'off'
  | 'fault';

export type SystemStatus = {
  deviceId: string;

  systemOnline: boolean;

  pumpStatus: PumpStatus;

  purificationStatus:
    | 'on'
    | 'off'
    | 'fault';

  updatedAt: string;
};