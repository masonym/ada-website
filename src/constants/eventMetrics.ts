export interface EventMetricsConfig {
  eventId: number;
  csvPath: string;
  title?: string;
  speakerCount?: number;
  matchmakingHosts?: number;
  oneOnOneAppointments?: number;
  industryColumn?: string;
  businessSizeColumn?: string;
  registrationTypeColumn?: string;
  organizationColumn?: string;
  excludedRegistrationTypes?: string[];
}

export const EVENT_METRICS_CONFIGS: EventMetricsConfig[] = [
  {
    eventId: 5,
    csvPath: 'events/2026DTAPC/registration-information.csv',
    title: 'Event Metrics',
    speakerCount: 42,
    matchmakingHosts: 10,
    oneOnOneAppointments: 146,
    industryColumn: 'Industry',
    businessSizeColumn: 'Business Size',
    registrationTypeColumn: 'Registration Type',
    organizationColumn: 'Company/Organization Name',
    excludedRegistrationTypes: ['Staff'],
  },
];

export function getEventMetricsConfig(eventId: number): EventMetricsConfig | undefined {
  return EVENT_METRICS_CONFIGS.find((config) => config.eventId === eventId);
}
