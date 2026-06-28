export function parseIsoWeek(value) {
  const match = /^(\d{4})-W(\d{2})$/.exec(String(value || '').trim());
  if (!match) throw new Error(`Invalid ISO week: ${value}`);
  const year = Number(match[1]);
  const week = Number(match[2]);
  const maxWeek = weeksInIsoYear(year);
  if (week < 1 || week > maxWeek) throw new Error(`Invalid ISO week range: ${value}`);
  return { year, week };
}

export function isValidIsoWeek(value) {
  try {
    parseIsoWeek(value);
    return true;
  } catch {
    return false;
  }
}

export function formatIsoWeek(year, week) {
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function weeksInIsoYear(year) {
  const dec28 = new Date(Date.UTC(year, 11, 28));
  return getIsoWeek(dec28).week;
}

export function nextIsoWeek(value) {
  const { year, week } = parseIsoWeek(value);
  const maxWeek = weeksInIsoYear(year);
  if (week < maxWeek) return formatIsoWeek(year, week + 1);
  return formatIsoWeek(year + 1, 1);
}

export function getIsoWeek(date = new Date()) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return { year: utc.getUTCFullYear(), week };
}

export function currentIsoWeek(date = new Date()) {
  const { year, week } = getIsoWeek(date);
  return formatIsoWeek(year, week);
}

export function latestArchivedWeek(ids) {
  const valid = ids.filter(isValidIsoWeek).sort();
  return valid.at(-1) || null;
}
