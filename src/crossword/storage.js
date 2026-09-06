export function loadStoredLetters(storage, storageKey) {
  try {
    const raw = storage?.getItem?.(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveStoredLetters(storage, storageKey, letters) {
  try {
    storage?.setItem?.(storageKey, JSON.stringify(letters));
    return true;
  } catch {
    return false;
  }
}
