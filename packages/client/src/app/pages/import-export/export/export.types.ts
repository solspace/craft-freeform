import type { ImportOptions } from '../import/import.types';

export type ExportOptions = Omit<ImportOptions, 'strategy'>;
