export function parseDailyDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
  if (!match) throw new Error(`Invalid daily date: ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Invalid daily date range: ${value}`);
  }
  return { year, month, day };
}

export function isValidDailyDate(value) {
  try {
    parseDailyDate(value);
    return true;
  } catch {
    return false;
  }
}

export function formatDailyDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function currentDailyDate(date = new Date(), timeZone = 'America/Chicago') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

export function nextDailyDate(value) {
  const { year, month, day } = parseDailyDate(value);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return formatDailyDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
}

export function latestArchivedDate(ids) {
  const valid = ids.filter(isValidDailyDate).sort();
  return valid.at(-1) || null;
}
