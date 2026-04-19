/**
 * Quantum Simulation and LLM API Types
 */

export type QuantumState = 'superposition' | 'entangled' | 'collapsed';

export interface QuantumObject {
  id: string;
  type: 'qubit' | 'quantum_dot' | 'topological_insulator';
  state: QuantumState;
  energyLevel: number;
  position: { x: number; y: number };
}

export interface JoinSimRequest {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  agentId?: string; // Optional: join as existing agent
}

export interface ObservationData {
  worldTime: number;
  agentStatus: {
    energy: number;
    health: number;
    position: { x: number; y: number };
  };
  nearbyObjects: Array<{
    id: string;
    type: string;
    distance: number;
    description: string;
  }>;
  quantumReadings?: Array<{
    objectId: string;
    reading: string; // e.g., "High tunneling probability detected"
  }>;
  visualTensor?: number[][][]; // Optional visual representation
}

export interface ActionResponse {
  action: string; // Natural language action, e.g., "Ambil tabung reaksi kuantum"
  thought?: string; // LLM's internal reasoning
}

export interface RewardSignal {
  score: number;
  reason: string;
  verificationType: 'quantum_classical_match' | 'energy_efficiency' | 'discovery';
}
