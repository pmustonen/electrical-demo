/**
 * Machines Module
 * 
 * Central module for machine registry and all machine configurations.
 * Import this module to initialize all available machines.
 */

export * from './registry';
export * from './transformer';
export * from './induction-motor';
export * from './synchronous-motor';
export * from './bess';

// Import configurations to register them
import { machineRegistry } from './registry';
import { TRANSFORMER_CONFIG } from './transformer';
import { MOTOR_CONFIG } from './induction-motor';
import { SYNC_MOTOR_CONFIG } from './synchronous-motor';
import { BESS_CONFIG } from './bess';

/**
 * Initialize all machines
 * Call this once at app startup to register all available machines
 */
export function initializeMachines(): void {
  // Register transformer
  machineRegistry.register(TRANSFORMER_CONFIG);
  
  // Register induction motor
  machineRegistry.register(MOTOR_CONFIG);
  
  // Register synchronous motor
  machineRegistry.register(SYNC_MOTOR_CONFIG);
  
  // Register BESS
  machineRegistry.register(BESS_CONFIG);
  
  console.log(`✅ Registered ${machineRegistry.getAll().length} machine type(s)`);
}

// Auto-initialize when module is imported
initializeMachines();
