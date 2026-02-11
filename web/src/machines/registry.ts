/**
 * Machine Registry
 * 
 * Central registry for managing electrical machine types.
 * Provides plugin-style architecture for adding new machines.
 */

import type { IMachine, MachineType, MachineConfig, MachineParams } from '../types';

/**
 * Registry for managing electrical machine types
 * Singleton pattern for global access
 */
class MachineRegistry {
  private machines: Map<MachineType, MachineConfig> = new Map();

  /**
   * Register a new machine type
   */
  register<P extends MachineParams>(config: MachineConfig<P>): void {
    if (this.machines.has(config.type)) {
      console.warn(`Machine type "${config.type}" is already registered. Overwriting.`);
    }
    this.machines.set(config.type, config as unknown as MachineConfig);
  }

  /**
   * Get machine configuration by type
   */
  get(type: MachineType): MachineConfig | undefined {
    return this.machines.get(type);
  }

  /**
   * Get all registered machine configurations
   */
  getAll(): MachineConfig[] {
    return Array.from(this.machines.values());
  }

  /**
   * Check if a machine type is registered
   */
  has(type: MachineType): boolean {
    return this.machines.has(type);
  }

  /**
   * Create a new machine instance
   */
  create(type: MachineType, params?: Partial<MachineParams>): IMachine {
    const config = this.get(type);
    if (!config) {
      throw new Error(`Machine type "${type}" is not registered`);
    }

    // Merge default params with provided params
    const finalParams = { ...config.defaultParams, ...params } as MachineParams;
    return new config.constructor(finalParams);
  }

  /**
   * Get machine types by category
   */
  getByCategory(category: 'static' | 'rotating' | 'converter'): MachineConfig[] {
    return this.getAll().filter(config => {
      // Create temporary instance to get metadata
      const instance = new config.constructor(config.defaultParams);
      return instance.getMetadata().category === category;
    });
  }

  /**
   * Unregister a machine type (mainly for testing)
   */
  unregister(type: MachineType): boolean {
    return this.machines.delete(type);
  }

  /**
   * Clear all registered machines (mainly for testing)
   */
  clear(): void {
    this.machines.clear();
  }
}

/**
 * Global machine registry instance
 * Import this to register or access machines
 */
export const machineRegistry = new MachineRegistry();

/**
 * Convenience function to create a machine instance
 */
export function createMachine(
  type: MachineType,
  params?: Partial<MachineParams>
): IMachine {
  return machineRegistry.create(type, params);
}

/**
 * Get all available machine types
 */
export function getAvailableMachines(): MachineConfig[] {
  return machineRegistry.getAll();
}

/**
 * Check if a machine type is available
 */
export function isMachineAvailable(type: MachineType): boolean {
  return machineRegistry.has(type);
}
