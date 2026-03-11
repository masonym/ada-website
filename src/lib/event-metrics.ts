import { promises as fs } from 'fs';
import path from 'path';
import { EventMetricsConfig } from '@/constants/eventMetrics';
import { getCdnPath } from '@/utils/image';

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
  totalAttendees: number;
  totalRegistrations: number;
  uniqueOrganizations: number;
  speakerCount: number;
  matchmakingHosts: number;
  oneOnOneAppointments: number;
  industryBreakdown: MetricsBreakdownItem[];
  organizationTypeBreakdown: MetricsBreakdownItem[];
  roleBreakdown: MetricsBreakdownItem[];
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

  if (normalized.includes('military')) return 'Government Official & Military';
  if (normalized.includes('government')) return 'Government Official & Military';
  if (normalized.includes('small')) return 'Small Business & Innovative Startups';
  if (normalized.includes('medium')) return 'Medium Business';
  if (normalized.includes('large')) return 'Large Business';

  return null;
}

function toOrganizationTypeBreakdown(values: string[], total: number): MetricsBreakdownItem[] {
  const orderedLabels = [
    'Government Official & Military',
    'Small Business & Innovative Startups',
    'Medium Business',
    'Large Business',
  ];
  const map = new Map<string, number>(orderedLabels.map((label) => [label, 0]));

  values.forEach((value) => {
    const organizationType = toOrganizationType(normalize(value));
    if (!organizationType) return;
    map.set(organizationType, (map.get(organizationType) || 0) + 1);
  });

  const items = orderedLabels.map((label) => {
    const count = map.get(label) || 0;
    return {
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    };
  });

  const [governmentAndMilitary, ...otherTypes] = items;
  otherTypes.sort((a, b) => a.percentage - b.percentage || a.label.localeCompare(b.label));

  return [governmentAndMilitary, ...otherTypes];
}

function toRoleCategory(value: string): string {
  const normalized = value.toLowerCase();

  if (
    normalized.includes('officer') ||
    normalized.includes('military') ||
    normalized.includes('government') ||
    normalized.includes('agent')
  ) {
    return 'Government & Military Roles';
  }

  if (
    normalized.includes('ceo') ||
    normalized.includes('chief') ||
    normalized.includes('president') ||
    normalized.includes('founder') ||
    normalized.includes('partner') ||
    normalized.includes('principal') ||
    normalized.includes('chairman') ||
    normalized.includes('executive') ||
    normalized.includes('vp') ||
    normalized.includes('vice president') ||
    normalized.includes('cfo') ||
    normalized.includes('coo') ||
    normalized.includes('cto')
  ) {
    return 'Executive Leadership';
  }

  if (
    normalized.includes('business development') ||
    normalized.includes('capture') ||
    normalized.includes('sales') ||
    normalized.includes('account') ||
    normalized.includes('marketing') ||
    normalized.includes('client') ||
    normalized.includes('partnership') ||
    normalized.includes('growth')
  ) {
    return 'Business Development & Sales';
  }

  if (
    normalized.includes('engineer') ||
    normalized.includes('scientist') ||
    normalized.includes('architect') ||
    normalized.includes('developer') ||
    normalized.includes('technical') ||
    normalized.includes('analyst') ||
    normalized.includes('technology')
  ) {
    return 'Technical & Engineering';
  }

  if (
    normalized.includes('manager') ||
    normalized.includes('director') ||
    normalized.includes('lead') ||
    normalized.includes('operations') ||
    normalized.includes('program') ||
    normalized.includes('project') ||
    normalized.includes('coordinator') ||
    normalized.includes('specialist') ||
    normalized.includes('administrator') ||
    normalized.includes('admin')
  ) {
    return 'Program & Operations';
  }

  return 'Other Roles';
}

function toRoleBreakdown(values: string[], total: number): MetricsBreakdownItem[] {
  const map = new Map<string, number>();

  values.forEach((value) => {
    const normalized = normalize(value);
    if (!normalized) return;

    const roleCategory = toRoleCategory(normalized);
    map.set(roleCategory, (map.get(roleCategory) || 0) + 1);
  });

  return toBreakdownItems(map, total);
}

async function loadCsvFromCdn(csvPath: string): Promise<string | null> {
  const cdnPath = getCdnPath(csvPath);
  if (!cdnPath) return null;

  let csvUrl = cdnPath;
  if (!csvUrl.startsWith('http')) {
    const siteBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
    if (!siteBase) return null;
    const normalizedBase = siteBase.startsWith('http') ? siteBase : `https://${siteBase}`;
    csvUrl = new URL(csvUrl, normalizedBase).toString();
  }

  try {
    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function loadCsvFromLocal(csvPath: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), 'public', csvPath);

  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

export async function getEventMetricsData(config: EventMetricsConfig): Promise<EventMetricsData | null> {
  const csvContent = (await loadCsvFromCdn(config.csvPath)) || (await loadCsvFromLocal(config.csvPath));
  if (!csvContent) return null;

  const parsed = parseCsv(csvContent);
  if (parsed.headers.length === 0) return null;

  const industryColumn = config.industryColumn || 'Industry';
  const businessSizeColumn = config.businessSizeColumn || 'Business Size';
  const roleColumn = config.roleColumn || 'Contact Title';
  const registrationTypeColumn = config.registrationTypeColumn || 'Registration Type';
  const organizationColumn = config.organizationColumn || 'Company/Organization Name';

  const industryIndex = parsed.headers.indexOf(industryColumn);
  const businessSizeIndex = parsed.headers.indexOf(businessSizeColumn);
  const roleIndex = parsed.headers.indexOf(roleColumn);
  const registrationTypeIndex = parsed.headers.indexOf(registrationTypeColumn);
  const organizationIndex = parsed.headers.indexOf(organizationColumn);

  if (industryIndex < 0 || businessSizeIndex < 0 || roleIndex < 0 || registrationTypeIndex < 0 || organizationIndex < 0) {
    return null;
  }

  const excludedTypes = new Set((config.excludedRegistrationTypes || []).map((value) => value.toLowerCase()));

  const filteredRows = parsed.rows.filter((row) => {
    const registrationType = normalize(row[registrationTypeIndex]).toLowerCase();
    if (!registrationType) return false;
    return !excludedTypes.has(registrationType);
  });

  const totalRegistrations = filteredRows.length;
  const speakerCount = config.speakerCount || 0;
  const totalAttendees = totalRegistrations + speakerCount;
  const organizations = new Set<string>();
  const industries: string[] = [];
  const businessSizes: string[] = [];
  const roles: string[] = [];

  filteredRows.forEach((row) => {
    const org = normalize(row[organizationIndex]);
    if (org) organizations.add(org);

    const industry = normalize(row[industryIndex]);
    if (industry) industries.push(industry);

    const businessSize = normalize(row[businessSizeIndex]);
    if (businessSize) businessSizes.push(businessSize);

    const role = normalize(row[roleIndex]);
    if (role) roles.push(role);
  });

  return {
    title: config.title || 'Event Metrics',
    totalAttendees,
    totalRegistrations,
    uniqueOrganizations: organizations.size,
    speakerCount,
    matchmakingHosts: config.matchmakingHosts || 0,
    oneOnOneAppointments: config.oneOnOneAppointments || 0,
    industryBreakdown: toBreakdownItems(toBreakdownMap(industries), totalRegistrations),
    organizationTypeBreakdown: toOrganizationTypeBreakdown(businessSizes, totalRegistrations),
    roleBreakdown: toRoleBreakdown(roles, totalRegistrations),
  };
}
