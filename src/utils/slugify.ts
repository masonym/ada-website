export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    // Replace accented chars
    .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
    // Replace non-alphanumeric with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Collapse multiple hyphens
    .replace(/-{2,}/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}
