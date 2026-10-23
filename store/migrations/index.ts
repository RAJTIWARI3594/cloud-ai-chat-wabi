import type { StoreMigration } from '$sdk';

export interface PersistedState extends Record<string, unknown> {
  threads: import('../../types').ChatThread[];
  activeThreadId: string | null;
}

export const STORE_SCHEMA_VERSION = 0;
export const STORE_MIGRATIONS: StoreMigration<PersistedState>[] = [];
