/**
 * Core Simulation Engine
 * Manages world state, agent updates, and event processing
 */

import type {
  Agent,
  WorldState,
  SimulationEvent,
  MemoryEntry,
  Knowledge,
  Location,
  Personality,
  ResearchCommand,
} from './types';

const PERSONALITY_COLORS = {
  brave: '#ef4444',
  cautious: '#3b82f6',
  collaborative: '#22c55e',
  competitive: '#f97316',
  genius: '#a855f7',
};

export class SimulationEngine {
  private worldState: WorldState;
  private isPaused = true;
  private locations: Map<string, Location> = new Map();
  private researchCommands: ResearchCommand[] = [];

  constructor(worldWidth = 1000, worldHeight = 1000) {
    this.worldState = {
      id: this.generateId(),
      time: 0,
      realTime: Date.now(),
      timeScale: 50,
      agents: [],
      knowledge: [],
      worldSize: { width: worldWidth, height: worldHeight },
      globalEnergy: 10000,
      globalFood: 5000,
      globalCurrency: 1000,
      events: [],
    };
  }

  /**
   * Initialize civilization with N agents
   */
  initializeCivilization(agentCount: number = 20): void {
    for (let i = 0; i < agentCount; i++) {
      const agent = this.createAgent(`Agent-${i + 1}`);
      this.worldState.agents.push(agent);
    }

    // Create initial locations
    this.createInitialLocations();

    // Log initialization event
    this.addEvent({
      type: 'agent_born',
      description: `Civilization initialized with ${agentCount} agents`,
      involvedAgents: this.worldState.agents.map((a) => a.id),
      impact: 1,
    });
  }

  /**
   * Create a single agent with random attributes
   */
  private createAgent(name: string): Agent {
    const personalities: Personality[] = ['brave', 'cautious', 'collaborative', 'competitive', 'genius'];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];

    return {
      id: this.generateId(),
      name,
      iq: Math.floor(Math.random() * 50) + 150, // 150-200
      personality,
      status: 'alive',
      position: {
        x: Math.random() * this.worldState.worldSize.width,
        y: Math.random() * this.worldState.worldSize.height,
      },
      energy: 80,
      health: 100,
      hunger: 30,
      memoryStream: [],
      knowledgeIds: [],
      assets: [
        {
          id: this.generateId(),
          type: 'currency',
          name: 'Starting Currency',
          value: 100,
          quantity: 1,
        },
      ],
      relationships: {},
      birthTime: this.worldState.time,
      age: 0,
      currentResearch: undefined,
      researchProgress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Create initial research locations
   */
  private createInitialLocations(): void {
    const locationTypes: Array<Location['type']> = ['research_lab', 'library', 'market', 'meeting_point'];

    for (let i = 0; i < 4; i++) {
      const location: Location = {
        id: this.generateId(),
        name: `${locationTypes[i].replace('_', ' ').toUpperCase()} ${i + 1}`,
        type: locationTypes[i],
        position: {
          x: Math.random() * this.worldState.worldSize.width,
          y: Math.random() * this.worldState.worldSize.height,
        },
        capacity: 10,
        currentOccupants: [],
        resources: {
          data: 100,
          tools: 50,
          food: 200,
        },
      };

      this.locations.set(location.id, location);
    }
  }

  /**
   * Update simulation by one tick
   */
  tick(): void {
    if (this.isPaused) return;

    // Update agent states
    for (const agent of this.worldState.agents) {
      if (agent.status !== 'alive') continue;

      this.updateAgent(agent);
    }

    // Process research commands
    this.processResearchCommands();

    // Check for agent interactions
    this.checkAgentInteractions();

    // Decay resources and energy
    this.decayResources();

    // Increment time
    this.worldState.time += 1;
    this.worldState.realTime = Date.now();
  }

  /**
   * Update individual agent state
   */
  private updateAgent(agent: Agent): void {
    // Decrease energy and hunger
    agent.energy = Math.max(0, agent.energy - 0.1);
    agent.hunger = Math.min(100, agent.hunger + 0.05);
    agent.health = Math.max(0, agent.health - 0.02);

    // Age agent
    agent.age = (this.worldState.time - agent.birthTime) / 100; // 1 age unit = 100 ticks

    // Check death conditions
    if (agent.energy <= 0 || agent.health <= 0 || agent.hunger >= 100) {
      this.killAgent(agent);
      return;
    }

    // Move agent randomly
    this.moveAgent(agent);

    // Update research progress if researching
    if (agent.currentResearch) {
      agent.researchProgress = Math.min(1, agent.researchProgress + 0.01);

      if (agent.researchProgress >= 1) {
        this.completeResearch(agent);
      }
    }

    // Add memory entry (periodic)
    if (this.worldState.time % 10 === 0) {
      this.addMemoryEntry(agent, {
        type: 'observation',
        content: `Status: Energy=${agent.energy.toFixed(1)}, Hunger=${agent.hunger.toFixed(1)}, Health=${agent.health.toFixed(1)}`,
        importance: 0.3,
        tags: ['status', 'daily'],
      });
    }
  }

  /**
   * Move agent randomly (simple AI)
   */
  private moveAgent(agent: Agent): void {
    const speed = 2;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * speed;

    agent.position.x = Math.max(0, Math.min(this.worldState.worldSize.width, agent.position.x + Math.cos(angle) * distance));
    agent.position.y = Math.max(0, Math.min(this.worldState.worldSize.height, agent.position.y + Math.sin(angle) * distance));
  }

  /**
   * Check for agent interactions (proximity-based)
   */
  private checkAgentInteractions(): void {
    const interactionDistance = 50;

    for (let i = 0; i < this.worldState.agents.length; i++) {
      for (let j = i + 1; j < this.worldState.agents.length; j++) {
        const a1 = this.worldState.agents[i];
        const a2 = this.worldState.agents[j];

        if (a1.status !== 'alive' || a2.status !== 'alive') continue;

        const distance = Math.hypot(a1.position.x - a2.position.x, a1.position.y - a2.position.y);

        if (distance < interactionDistance) {
          // Agents interact
          this.interactAgents(a1, a2);
        }
      }
    }
  }

  /**
   * Handle interaction between two agents
   */
  private interactAgents(agent1: Agent, agent2: Agent): void {
    // Update relationships
    agent1.relationships[agent2.id] = (agent1.relationships[agent2.id] || 0) + 0.01;
    agent2.relationships[agent1.id] = (agent2.relationships[agent1.id] || 0) + 0.01;

    // Add memory entries
    this.addMemoryEntry(agent1, {
      type: 'interaction',
      content: `Interacted with ${agent2.name}`,
      importance: 0.5,
      tags: ['social', 'interaction'],
      relatedAgents: [agent2.id],
    });

    this.addMemoryEntry(agent2, {
      type: 'interaction',
      content: `Interacted with ${agent1.name}`,
      importance: 0.5,
      tags: ['social', 'interaction'],
      relatedAgents: [agent1.id],
    });
  }

  /**
   * Process research commands from user
   */
  private processResearchCommands(): void {
    for (const command of this.researchCommands) {
      // Assign to agents with highest IQ
      const topAgents = this.worldState.agents
        .filter((a) => a.status === 'alive' && !a.currentResearch)
        .sort((a, b) => b.iq - a.iq)
        .slice(0, 5);

      for (const agent of topAgents) {
        agent.currentResearch = command.topic;
        agent.researchProgress = 0;

        this.addMemoryEntry(agent, {
          type: 'observation',
          content: `Received research command: ${command.topic}`,
          importance: 0.9,
          tags: ['research', 'command'],
        });
      }
    }

    this.researchCommands = [];
  }

  /**
   * Complete research and create knowledge
   */
  private completeResearch(agent: Agent): void {
    if (!agent.currentResearch) return;

    const knowledge: Knowledge = {
      id: this.generateId(),
      title: `Research: ${agent.currentResearch}`,
      description: `Research completed by ${agent.name}`,
      content: `Findings on ${agent.currentResearch} by ${agent.name} (IQ: ${agent.iq})`,
      creatorId: agent.id,
      createdAt: this.worldState.time,
      evidence: [],
      references: [],
      rating: Math.min(5, agent.iq / 40),
      contributors: [agent.id],
      category: agent.currentResearch,
    };

    this.worldState.knowledge.push(knowledge);
    agent.knowledgeIds.push(knowledge.id);
    agent.currentResearch = undefined;
    agent.researchProgress = 0;

    this.addEvent({
      type: 'knowledge_created',
      description: `${agent.name} completed research on ${knowledge.title}`,
      involvedAgents: [agent.id],
      impact: 0.7,
    });

    this.addMemoryEntry(agent, {
      type: 'reflection',
      content: `Completed research on ${knowledge.title}. Created new knowledge.`,
      importance: 1,
      tags: ['research', 'achievement'],
    });
  }

  /**
   * Kill agent and create legacy
   */
  private killAgent(agent: Agent): void {
    agent.status = 'dead';
    agent.deathTime = this.worldState.time;

    this.addEvent({
      type: 'agent_died',
      description: `${agent.name} died at age ${agent.age.toFixed(1)}`,
      involvedAgents: [agent.id],
      impact: 0.5,
    });

    // TODO: Implement legacy system
  }

  /**
   * Add memory entry to agent
   */
  private addMemoryEntry(agent: Agent, entry: Omit<MemoryEntry, 'id' | 'timestamp'>): void {
    const memoryEntry: MemoryEntry = {
      id: this.generateId(),
      timestamp: this.worldState.time,
      ...entry,
    };

    agent.memoryStream.push(memoryEntry);

    // Keep memory stream bounded (max 1000 entries)
    if (agent.memoryStream.length > 1000) {
      agent.memoryStream = agent.memoryStream.slice(-1000);
    }
  }

  /**
   * Add event to world
   */
  private addEvent(event: Omit<SimulationEvent, 'id' | 'timestamp'>): void {
    const simulationEvent: SimulationEvent = {
      id: this.generateId(),
      timestamp: this.worldState.time,
      ...event,
    };

    this.worldState.events.push(simulationEvent);

    // Keep events bounded (max 500)
    if (this.worldState.events.length > 500) {
      this.worldState.events = this.worldState.events.slice(-500);
    }
  }

  /**
   * Decay global resources
   */
  private decayResources(): void {
    this.worldState.globalEnergy = Math.max(0, this.worldState.globalEnergy - 1);
    this.worldState.globalFood = Math.max(0, this.worldState.globalFood - 0.5);
  }

  /**
   * Public API: Play simulation
   */
  play(): void {
    this.isPaused = false;
  }

  /**
   * Public API: Pause simulation
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Public API: Set time scale
   */
  setTimeScale(scale: number): void {
    this.worldState.timeScale = Math.max(1, Math.min(100, scale));
  }

  /**
   * Public API: Issue research command
   */
  issueResearchCommand(topic: string, description: string, priority = 0.8): void {
    this.researchCommands.push({
      id: this.generateId(),
      topic,
      description,
      priority,
      issuedBy: 'user',
      issuedAt: this.worldState.time,
    });
  }

  /**
   * Public API: Get world state
   */
  getWorldState(): WorldState {
    return this.worldState;
  }

  /**
   * Public API: Get agent by ID
   */
  getAgent(id: string): Agent | undefined {
    return this.worldState.agents.find((a) => a.id === id);
  }

  /**
   * Public API: Get all alive agents
   */
  getAliveAgents(): Agent[] {
    return this.worldState.agents.filter((a) => a.status === 'alive');
  }

  /**
   * Public API: Get knowledge
   */
  getKnowledge(): Knowledge[] {
    return this.worldState.knowledge;
  }

  /**
   * Public API: Get recent events
   */
  getRecentEvents(count = 10): SimulationEvent[] {
    return this.worldState.events.slice(-count);
  }

  /**
   * Public API: Get locations
   */
  getLocations(): Location[] {
    return Array.from(this.locations.values());
  }

  /**
   * Public API: Save state
   */
  saveState(): string {
    return JSON.stringify({
      worldState: this.worldState,
      locations: Array.from(this.locations.entries()),
      isPaused: this.isPaused,
    });
  }

  /**
   * Public API: Load state
   */
  loadState(stateJson: string): void {
    try {
      const data = JSON.parse(stateJson);
      this.worldState = data.worldState;
      this.locations = new Map(data.locations);
      this.isPaused = data.isPaused;
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }

  /**
   * Utility: Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Public API: Get statistics
   */
  getStatistics() {
    const aliveAgents = this.getAliveAgents();
    return {
      totalAgents: this.worldState.agents.length,
      aliveAgents: aliveAgents.length,
      deadAgents: this.worldState.agents.length - aliveAgents.length,
      totalKnowledge: this.worldState.knowledge.length,
      averageIQ: aliveAgents.length > 0 ? aliveAgents.reduce((sum, a) => sum + a.iq, 0) / aliveAgents.length : 0,
      averageAge: aliveAgents.length > 0 ? aliveAgents.reduce((sum, a) => sum + a.age, 0) / aliveAgents.length : 0,
      globalEnergy: this.worldState.globalEnergy,
      globalFood: this.worldState.globalFood,
      globalCurrency: this.worldState.globalCurrency,
      simulationTime: this.worldState.time,
    };
  }
}

export const PERSONALITY_COLORS_MAP = PERSONALITY_COLORS;
