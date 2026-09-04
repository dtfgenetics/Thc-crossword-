import { currentIsoWeek, isValidIsoWeek, nextIsoWeek, parseIsoWeek } from './week.js';

export function weeksThroughCurrent(latest, now = new Date()) {
  const current = currentIsoWeek(now);
  if (!latest) return [current];
  if (!isValidIsoWeek(latest) || latest >= current) return [];

  const weeks = [];
  let week = nextIsoWeek(latest);
  while (week <= current) {
    weeks.push(week);
    week = nextIsoWeek(week);
  }
  return weeks;
}

export function themeForWeek(week, themes) {
  if (!isValidIsoWeek(week)) throw new Error(`Invalid ISO week: ${week}`);
  if (!Array.isArray(themes) || themes.length === 0) throw new Error('At least one crossword theme is required.');
  const { year, week: weekNumber } = parseIsoWeek(week);
  const index = ((year * 53) + weekNumber) % themes.length;
  return themes[index];
}
