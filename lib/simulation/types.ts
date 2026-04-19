/**
 * Core types for AI Civilization Simulator
 */

// Agent Personality Types
export type Personality = 'brave' | 'cautious' | 'collaborative' | 'competitive' | 'genius';

// Agent Status
export type AgentStatus = 'alive' | 'dead' | 'hibernating';

// Memory Entry
export interface MemoryEntry {
  id: string;
  timestamp: number;
  type: 'observation' | 'interaction' | 'reflection' | 'action' | 'communication';
  content: string;
  importance: number; // 0-1
  tags: string[];
  relatedAgents?: string[];
}

// Agent Knowledge
export interface Knowledge {
  id: string;
  title: string;
  description: string;
  content: string;
  creatorId: string;
  createdAt: number;
  evidence: string[];
  references: string[];
  rating: number; // 0-5
  contributors: string[];
  category: string;
}

// Agent Asset
export interface Asset {
  id: string;
  type: 'research_tool' | 'data' | 'currency' | 'land' | 'building';
  name: string;
  value: number;
  quantity: number;
}

// Agent Core Data
export interface Agent {
  id: string;
  name: string;
  iq: number; // Minimum 150
  personality: Personality;
  status: AgentStatus;
  
  // Position in 2D world
  position: {
    x: number;
    y: number;
  };
  
  // Attributes
  energy: number; // 0-100
  health: number; // 0-100
  hunger: number; // 0-100
  
  // Internal systems
  memoryStream: MemoryEntry[];
  knowledgeIds: string[];
  assets: Asset[];
  
  // Social
  relationships: Record<string, number>; // agentId -> relationship strength (-1 to 1)
  
  // Lifecycle
  birthTime: number;
  deathTime?: number;
  age: number;
  
  // Research
  currentResearch?: string;
  researchProgress: number; // 0-1
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// World State
export interface WorldState {
  id: string;
  time: number; // Simulation time in ticks
  realTime: number; // Real time when state was created
  timeScale: number; // Simulation speed multiplier (default 50x)
  
  agents: Agent[];
  knowledge: Knowledge[];
  
  // World parameters
  worldSize: {
    width: number;
    height: number;
  };
  
  // Global resources
  globalEnergy: number;
  globalFood: number;
  globalCurrency: number;
  
  // Events
  events: SimulationEvent[];
}

// Simulation Event
export interface SimulationEvent {
  id: string;
  timestamp: number;
  type: 'agent_born' | 'agent_died' | 'knowledge_created' | 'conflict' | 'discovery' | 'disaster' | 'collaboration';
  description: string;
  involvedAgents: string[];
  impact: number; // 0-1
}

// Research Command
export interface ResearchCommand {
  id: string;
  topic: string;
  description: string;
  priority: number; // 0-1
  issuedBy: string; // User ID or 'system'
  issuedAt: number;
  targetAgents?: string[];
}

// God Mode Action
export interface GodModeAction {
  type: 'modify_agent' | 'modify_world' | 'inject_event' | 'inject_knowledge' | 'command_research';
  payload: any;
  executedAt: number;
}

// Reflection (Agent's high-level insights)
export interface Reflection {
  id: string;
  agentId: string;
  timestamp: number;
  insights: string[];
  goals: string[];
  hypotheses: string[];
}

// Planning (Agent's action plan)
export interface Plan {
  id: string;
  agentId: string;
  timestamp: number;
  shortTermGoals: string[];
  longTermGoals: string[];
  actions: Action[];
}

// Action (What an agent will do)
export interface Action {
  id: string;
  type: 'move' | 'research' | 'communicate' | 'trade' | 'rest' | 'collaborate';
  target?: string; // agentId or locationId
  duration: number; // ticks
  priority: number; // 0-1
}

// Location (Research facility, home, market, etc.)
export interface Location {
  id: string;
  name: string;
  type: 'home' | 'research_lab' | 'market' | 'library' | 'meeting_point';
  position: {
    x: number;
    y: number;
  };
  owner?: string; // agentId
  capacity: number;
  currentOccupants: string[];
  resources: Record<string, number>;
}

// Legacy (Inheritance when agent dies)
export interface Legacy {
  id: string;
  fromAgentId: string;
  toAgentId?: string; // undefined if distributed
  knowledge: string[];
  assets: Asset[];
  createdAt: number;
}
