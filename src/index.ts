import { WABeresClient } from './client';
import type { SDKConfig } from './types';

export { WABeresClient } from './client';
export * from './types';
export * from './errors';

export function createWABeresClient(config: SDKConfig) {
  return new WABeresClient(config);
}