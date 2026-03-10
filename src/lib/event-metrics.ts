import { promises as fs } from 'fs';
import path from 'path';
import { EventMetricsConfig } from '@/constants/eventMetrics';

interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

export interface MetricsBreakdownItem {
  label: string;
  count: number;
  percentage: number;
}

export interface EventMetricsData {
  title: string;
  totalRegistrations: number;
  uniqueOrganizations: number;
  industryBreakdown: MetricsBreakdownItem[];
  organizationTypeBreakdown: MetricsBreakdownItem[];
}

function parseCsv(content: string): ParsedCsv {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }

      currentRow.push(currentValue.trim());
      currentValue = '';

      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  const [headers = [], ...dataRows] = rows;
  return { headers, rows: dataRows };
}

function normalize(value?: string): string {
  return (value || '').trim();
}

function toBreakdownMap(values: string[]): Map<string, number> {
  const map = new Map<string, number>();

  values.forEach((value) => {
    const normalized = normalize(value);
    if (!normalized) return;
    map.set(normalized, (map.get(normalized) || 0) + 1);
  });

  return map;
}

function toBreakdownItems(map: Map<string, number>, total: number): MetricsBreakdownItem[] {
  return Array.from(map.entries())
    .map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function toOrganizationType(value: string): string | null {
  const normalized = value.toLowerCase();

  if (normalized.includes('military')) return 'Military';
  if (normalized.includes('government')) return 'Government';
  if (normalized.includes('small')) return 'Small Business';
  if (normalized.includes('medium')) return 'Medium Business';
  if (normalized.includes('large')) return 'Large Business';

  return null;
}

function toOrganizationTypeBreakdown(values: string[], total: number): MetricsBreakdownItem[] {
  const orderedLabels = ['Small Business', 'Medium Business', 'Large Business', 'Government', 'Military'];
  const map = new Map<string, number>(orderedLabels.map((label) => [label, 0]));

  values.forEach((value) => {
    const organizationType = toOrganizationType(normalize(value));
    if (!organizationType) return;
    map.set(organizationType, (map.get(organizationType) || 0) + 1);
  });

  return orderedLabels.map((label) => {
    const count = map.get(label) || 0;
    return {
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    };
  });
}

export async function getEventMetricsData(config: EventMetricsConfig): Promise<EventMetricsData | null> {
  const filePath = path.join(process.cwd(), 'public', config.csvPath);

  let csvContent = '';
  try {
    csvContent = await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }

  const parsed = parseCsv(csvContent);
  if (parsed.headers.length === 0) return null;

  const industryColumn = config.industryColumn || 'Industry';
  const businessSizeColumn = config.businessSizeColumn || 'Business Size';
  const registrationTypeColumn = config.registrationTypeColumn || 'Registration Type';
  const organizationColumn = config.organizationColumn || 'Company/Organization Name';

  const industryIndex = parsed.headers.indexOf(industryColumn);
  const businessSizeIndex = parsed.headers.indexOf(businessSizeColumn);
  const registrationTypeIndex = parsed.headers.indexOf(registrationTypeColumn);
  const organizationIndex = parsed.headers.indexOf(organizationColumn);

  if (industryIndex < 0 || businessSizeIndex < 0 || registrationTypeIndex < 0 || organizationIndex < 0) {
    return null;
  }

  const excludedTypes = new Set((config.excludedRegistrationTypes || []).map((value) => value.toLowerCase()));

  const filteredRows = parsed.rows.filter((row) => {
    const registrationType = normalize(row[registrationTypeIndex]).toLowerCase();
    if (!registrationType) return false;
    return !excludedTypes.has(registrationType);
  });

  const totalRegistrations = filteredRows.length;
  const organizations = new Set<string>();
  const industries: string[] = [];
  const businessSizes: string[] = [];

  filteredRows.forEach((row) => {
    const org = normalize(row[organizationIndex]);
    if (org) organizations.add(org);

    const industry = normalize(row[industryIndex]);
    if (industry) industries.push(industry);

    const businessSize = normalize(row[businessSizeIndex]);
    if (businessSize) businessSizes.push(businessSize);
  });

  return {
    title: config.title || 'Event Metrics',
    totalRegistrations,
    uniqueOrganizations: organizations.size,
    industryBreakdown: toBreakdownItems(toBreakdownMap(industries), totalRegistrations),
    organizationTypeBreakdown: toOrganizationTypeBreakdown(businessSizes, totalRegistrations),
  };
}
