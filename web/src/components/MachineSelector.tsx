/**
 * Machine Selector Component
 * 
 * Dropdown selector for switching between different machine types
 */

import type { MachineType, MachineMetadata } from '../types';
import { getAvailableMachines } from '../machines';

interface MachineSelectorProps {
  currentMachine: MachineType;
  onMachineChange: (machineType: MachineType) => void;
}

export function MachineSelector({ currentMachine, onMachineChange }: MachineSelectorProps) {
  const availableMachines = getAvailableMachines();

  // Get metadata for each machine
  const machineOptions = availableMachines.map(config => {
    const instance = new config.constructor(config.defaultParams);
    const metadata: MachineMetadata = instance.getMetadata();
    return {
      type: config.type,
      metadata,
    };
  });

  const currentMetadata = machineOptions.find(m => m.type === currentMachine)?.metadata;

  return (
    <div className="relative">
      <select
        value={currentMachine}
        onChange={(e) => onMachineChange(e.target.value as MachineType)}
        className="glass-dark px-4 py-2 pr-10 rounded-lg text-sm font-medium text-white
                   border border-slate-600/50 hover:border-primary-500/50 
                   focus:outline-none focus:ring-2 focus:ring-primary-500/50
                   cursor-pointer transition-all appearance-none bg-slate-800/80"
      >
        {machineOptions.map(({ type, metadata }) => (
          <option key={type} value={type}>
            {metadata.icon} {metadata.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Current machine description tooltip */}
      {currentMetadata && (
        <div className="absolute left-0 top-full mt-2 px-3 py-2 glass-dark rounded-lg text-xs text-gray-300
                        opacity-0 hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
          {currentMetadata.description}
        </div>
      )}
    </div>
  );
}
