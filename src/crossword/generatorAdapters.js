export const generatorAdapters = [
  {
    id: 'crossword-layout-generator',
    packageName: 'crossword-layout-generator',
    license: 'MIT',
    role: 'primary-public-layout-engine',
    runtime: 'node',
    enabled: true,
    notes: 'Used by scripts/generate-weekly-crossword.mjs when available. Results must pass project validation before scoring.'
  },
  {
    id: 'local-layout-engine',
    packageName: null,
    license: 'Project MIT',
    role: 'fallback-layout-engine',
    runtime: 'node',
    enabled: true,
    notes: 'Built into the project so generation still works if public dependency output is weak or unavailable.'
  },
  {
    id: 'gaoryrt-crossword-generator',
    packageName: 'crossword-generator',
    license: 'MIT',
    role: 'candidate-secondary-generator',
    runtime: 'node',
    enabled: false,
    notes: 'Potential future adapter. Must be isolated behind validation and compared against current generator output.'
  },
  {
    id: 'exolve',
    packageName: null,
    license: 'MIT',
    role: 'export-preview-player',
    runtime: 'browser',
    enabled: false,
    notes: 'Use our Exolve text export. Do not bundle unless we intentionally add an Exolve preview page.'
  },
  {
    id: 'ipuzzler',
    packageName: null,
    license: 'MIT',
    role: 'ipuz-preview-player',
    runtime: 'browser',
    enabled: false,
    notes: 'Possible future IPUZ renderer. Our IPUZ validator prepares the path for this.'
  }
];

export function enabledGeneratorAdapters() {
  return generatorAdapters.filter((adapter) => adapter.enabled);
}

export function adapterById(id) {
  return generatorAdapters.find((adapter) => adapter.id === id) || null;
}

export function assertPermissiveAdapter(adapter) {
  if (!adapter) throw new Error('Missing adapter.');
  if (!['MIT', 'BSD', 'Apache-2.0', 'Project MIT'].includes(adapter.license)) {
    throw new Error(`Adapter ${adapter.id} is not approved for runtime use: ${adapter.license}`);
  }
  return true;
}
