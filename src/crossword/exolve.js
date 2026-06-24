export function validateExolveText(text) {
  const value = String(text || '');
  const errors = [];
  const required = [
    'exolve-begin',
    'exolve-title:',
    'exolve-id:',
    'exolve-width:',
    'exolve-height:',
    'exolve-grid:',
    'exolve-across:',
    'exolve-down:',
    'exolve-end'
  ];

  for (const token of required) {
    if (!value.includes(token)) errors.push(`Missing ${token}`);
  }

  const width = readNumber(value, 'exolve-width:');
  const height = readNumber(value, 'exolve-height:');
  if (!width) errors.push('Invalid Exolve width.');
  if (!height) errors.push('Invalid Exolve height.');

  const grid = readBlock(value, 'exolve-grid:', 'exolve-across:').filter(Boolean);
  if (height && grid.length !== height) errors.push(`Exolve grid height mismatch: ${grid.length}/${height}.`);
  if (width) {
    for (const row of grid) {
      if (row.length !== width) errors.push(`Exolve grid width mismatch: ${row.length}/${width}.`);
    }
  }

  return errors;
}

export function parseExolveText(text) {
  const errors = validateExolveText(text);
  if (errors.length) throw new Error(errors.join('\n'));
  return {
    title: readLine(text, 'exolve-title:'),
    id: readLine(text, 'exolve-id:'),
    width: readNumber(text, 'exolve-width:'),
    height: readNumber(text, 'exolve-height:'),
    grid: readBlock(text, 'exolve-grid:', 'exolve-across:').filter(Boolean),
    across: readBlock(text, 'exolve-across:', 'exolve-down:').filter(Boolean),
    down: readBlock(text, 'exolve-down:', 'exolve-end').filter(Boolean)
  };
}

function readLine(text, prefix) {
  return String(text || '').split('\n').find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() || '';
}

function readNumber(text, prefix) {
  const value = Number(readLine(text, prefix));
  return Number.isFinite(value) ? value : 0;
}

function readBlock(text, start, end) {
  const value = String(text || '');
  const startIndex = value.indexOf(start);
  const endIndex = value.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) return [];
  return value.slice(startIndex + start.length, endIndex).split('\n').map((line) => line.trim());
}
