/**
 * Machines Module
 * 
 * Central module for machine registry and all machine configurations.
 * Import this module to initialize all available machines.
 */

export * from './registry';
export * from './transformer';

// Import configurations to register them
import { machineRegistry } from './registry';
import { TRANSFORMER_CONFIG } from './transformer';

/**
 * Initialize all machines
 * Call this once at app startup to register all available machines
 */
export function initializeMachines(): void {
  // Register transformer
  machineRegistry.register(TRANSFORMER_CONFIG);
  
  // Future machines will be registered here:
  // machineRegistry.register(INDUCTION_MOTOR_CONFIG);
  // machineRegistry.register(DC_MOTOR_CONFIG);
  
  console.log(`✅ Registered ${machineRegistry.getAll().length} machine type(s)`);
}

// Auto-initialize when module is imported
initializeMachines();
