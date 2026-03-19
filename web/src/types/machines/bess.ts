/**
 * BESS (Battery Energy Storage System) Type Definitions
 * 
 * Grid-forming inverter with independent P and Q control
 */

import type { MachineParams, MachineValues } from '../machine';

/**
 * BESS Parameters
 */
export interface BessParams extends MachineParams {
  /** Grid voltage (V line-to-line) */
  voltage: number;
  
  /** Grid frequency (Hz) */
  frequency: number;
  
  /** Inverter rated power (kW) */
  powerRated: number;
  
  /** Battery energy capacity (kWh) */
  energyCapacity: number;
  
  /** Active power setpoint (kW, negative = charging) */
  powerSetpoint: number;
  
  /** Reactive power setpoint (kvar, negative = capacitive/supply vars) */
  reactiveSetpoint: number;
  
  /** Initial state of charge (%) */
  socInitial: number;
  
  /** Inverter efficiency (%) */
  efficiency: number;
  
  /** P-Q priority mode: 'active' prioritizes P, 'reactive' prioritizes Q */
  priorityMode: 'active' | 'reactive';
}

/**
 * BESS Calculated Values
 */
export interface BessValues extends MachineValues {
  /** State of charge (%) */
  stateOfCharge: number;
  
  /** Grid current (A RMS) */
  currentGrid: number;
  
  /** Operating mode */
  operatingMode: string;
  
  /** P-Q utilization (% of rated capability) */
  utilizationPQ: number;
  
  /** Requested power before limiting (kW) */
  powerRequested: number;
  
  /** Requested reactive power before limiting (kvar) */
  reactiveRequested: number;
}
