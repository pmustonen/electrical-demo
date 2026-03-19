/**
 * BESS Machine Module
 */

import { machineRegistry } from '../registry';
import { BESS_CONFIG } from './config';

// Auto-register on import
machineRegistry.register(BESS_CONFIG as any);

export { BESS_CONFIG };
export * from './config';
