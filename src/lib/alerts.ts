import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from './firebase';

export type LiveAlert = {
  id: string;
  alertType: string;
  severity: 'normal' | 'warning' | 'critical';
  title: string;
  message: string;
  createdAt: string;
  resolved: boolean;
};

function mapAlert(
  document: QueryDocumentSnapshot,
): LiveAlert {
  const data = document.data();

  const severity =
    data.severity === 'critical'
      ? 'critical'
      : data.severity === 'warning'
        ? 'warning'
        : 'normal';

  return {
    id: document.id,
    alertType: String(data.alert_type ?? ''),
    severity,
    title: String(data.title ?? ''),
    message: String(data.message ?? ''),
    createdAt:
      data.created_at?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
    resolved: Boolean(data.resolved),
  };
}

export function subscribeToLatestAlert(
  onUpdate: (alert: LiveAlert | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const alertsQuery = query(
    collection(db, 'alerts'),
    orderBy('created_at', 'desc'),
    limit(1),
  );

  return onSnapshot(
    alertsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(null);
        return;
      }

      onUpdate(mapAlert(snapshot.docs[0]));
    },
    (error) => {
      onError(error);
    },
  );
}

export function subscribeToRecentAlerts(
  onUpdate: (alerts: LiveAlert[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const alertsQuery = query(
    collection(db, 'alerts'),
    orderBy('created_at', 'desc'),
    limit(10),
  );

  return onSnapshot(
    alertsQuery,
    (snapshot) => {
      onUpdate(
        snapshot.docs.map((document) =>
          mapAlert(document),
        ),
      );
    },
    (error) => {
      onError(error);
    },
  );
}

export function getAlertPresentation(
  alertType: string,
  severity: LiveAlert['severity'],
) {
  if (alertType === 'high_turbidity') {
    return {
      title: 'High turbidity detected',
      message:
        'Turbidity is above the configured range.',
    };
  }

  if (alertType === 'low_ph') {
    return {
      title: 'Low pH detected',
      message:
        'The measured pH is below the configured range.',
    };
  }

  if (alertType === 'high_ph') {
    return {
      title: 'High pH detected',
      message:
        'The measured pH is above the configured range.',
    };
  }

  if (alertType === 'high_tds') {
    return {
      title: 'High TDS detected',
      message:
        'TDS is above the configured range.',
    };
  }

  if (alertType === 'high_temperature') {
    return {
      title: 'High temperature detected',
      message:
        'Water temperature is above the configured range.',
    };
  }

  if (alertType === 'sensor_fault') {
    return {
      title: 'Sensor fault detected',
      message:
        'One or more sensors require attention.',
    };
  }

  if (alertType === 'wifi_disconnected') {
    return {
      title: 'Wi-Fi connection lost',
      message:
        'The monitoring device is no longer connected to Wi-Fi.',
    };
  }

  if (alertType === 'esp32_offline') {
    return {
      title: 'ESP32 offline',
      message:
        'The monitoring device is currently unavailable.',
    };
  }

  if (alertType === 'water_quality_recovered') {
    return {
      title: 'Water quality restored',
      message:
        'Water-quality readings have returned to the expected range.',
    };
  }

  if (severity === 'critical') {
    return {
      title: 'Critical condition detected',
      message:
        'A critical condition has been reported by the monitoring system.',
    };
  }

  if (severity === 'warning') {
    return {
      title: 'Attention required',
      message:
        'The monitoring system has reported a condition that requires attention.',
    };
  }

  return {
    title: 'Water quality normal',
    message:
      'All monitored water-quality parameters are within the expected range.',
  };
}