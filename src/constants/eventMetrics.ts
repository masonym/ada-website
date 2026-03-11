export interface EventMetricsConfig {
  eventId: number;
  csvPath: string;
  title?: string;
  speakerCount?: number;
  matchmakingHosts?: number;
  oneOnOneAppointments?: number;
  industryColumn?: string;
  businessSizeColumn?: string;
  roleColumn?: string;
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
    roleColumn: 'Contact Title', // which column to use from the CSV for the role breakdown
    registrationTypeColumn: 'Registration Type', // which column to use from the CSV for the registration type breakdown
    organizationColumn: 'Company/Organization Name', // which column to use from the CSV for the organization breakdown
    excludedRegistrationTypes: ['Staff'], // registration types to exclude from the breakdown
  },
];

export function getEventMetricsConfig(eventId: number): EventMetricsConfig | undefined {
  return EVENT_METRICS_CONFIGS.find((config) => config.eventId === eventId);
}
