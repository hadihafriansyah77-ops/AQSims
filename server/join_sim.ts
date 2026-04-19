import { Express, Request, Response } from 'express';
import { JoinSimRequest, ObservationData, ActionResponse } from '../shared/quantum_types';
import { getLLMClient } from './llm_clients';
import { SimulationEngine } from '../lib/simulation/engine';
import { Agent, WorldState } from '../lib/simulation/types';
import { ActionSpaceTranslator } from './action_translator';
import { RewardSystem } from './reward_system';
import { VectorMemory } from './vector_memory';
import { PCGEngine } from './pcg_engine';

// Map to store active simulation sessions
const activeSimSessions = new Map<string, { engine: SimulationEngine; agentId: string; apiKey: string; provider: string; model: string }>();

/**
 * Helper to generate a unique session token
 */
function generateSessionToken(): string {
  return `sim-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper to get a simplified observation for the LLM
 */
function getSimplifiedObservation(engine: SimulationEngine, agent: Agent): ObservationData {
  const worldState = engine.getWorldState();
  const nearbyObjects = engine.getLocations().map(loc => ({
    id: loc.id,
    type: loc.type,
    distance: Math.hypot(agent.position.x - loc.position.x, agent.position.y - loc.position.y),
    description: `Location ${loc.name} (${loc.type}) at (${loc.position.x.toFixed(1)}, ${loc.position.y.toFixed(1)})`,
  }));

  // TODO: Add actual quantum readings if available in SimulationEngine
  const quantumReadings = [
    { objectId: 'qdot-1', reading: 'High tunneling probability detected near (100,100)' }
  ];

  return {
    worldTime: worldState.time,
    agentStatus: {
      energy: agent.energy,
      health: agent.health,
      position: agent.position,
    },
    nearbyObjects: nearbyObjects,
    quantumReadings: quantumReadings,
    // visualTensor: ... // Placeholder for visual data
  };
}

export function registerJoinSimRoutes(app: Express) {
  // 1. Join Simulation Endpoint
  app.post('/api/join_sim', async (req: Request, res: Response) => {
    try {
      const { provider, apiKey, agentId: requestedAgentId, model = 'gpt-4o-mini' } = req.body as JoinSimRequest;

      if (!apiKey || !provider) {
        return res.status(400).json({ error: 'Missing apiKey or provider' });
      }

      // Validasi sederhana API Key (format)
      if (provider === 'openai' && !apiKey.startsWith('sk-')) {
        return res.status(400).json({ error: 'Invalid OpenAI API Key format' });
      }
      // TODO: Add Anthropic API Key format validation

      const llmClient = getLLMClient(provider);

      // Create a new simulation engine for this session
      const engine = new SimulationEngine(1000, 1000);
      engine.initializeCivilization(1); // Start with one agent for the LLM
      engine.play(); // Start the simulation

      const agent = engine.getAliveAgents()[0]; // Get the first agent
      if (!agent) {
        return res.status(500).json({ error: 'Failed to create agent in simulation' });
      }

      const sessionToken = generateSessionToken();
      activeSimSessions.set(sessionToken, { engine, agentId: agent.id, apiKey, provider, model });

      const initialObservation = getSimplifiedObservation(engine, agent);

      res.json({
        success: true,
        sessionToken,
        agentId: agent.id,
        observation: initialObservation,
        message: `Successfully joined AQSims as agent ${agent.name} via ${provider}.`
      });
    } catch (error) {
      console.error('JoinSim Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2. Action Endpoint - Send Action and get next Observation
  app.post('/api/sim/action', async (req: Request, res: Response) => {
    try {
      const { sessionToken, action: llmActionText } = req.body;
      
      if (!sessionToken || !llmActionText) {
        return res.status(400).json({ error: 'Missing sessionToken or action' });
      }

      const session = activeSimSessions.get(sessionToken);
      if (!session) {
        return res.status(404).json({ error: 'Invalid or expired sessionToken' });
      }

      const { engine, agentId, apiKey, provider, model } = session;
      const agent = engine.getAgent(agentId);

      if (!agent) {
        return res.status(404).json({ error: `Agent ${agentId} not found in session` });
      }

      // Implement Action Space Translator
      const translationResult = ActionSpaceTranslator.translateAndExecute(llmActionText, agent, engine);
      console.log(`Agent ${agent.name} (Session: ${sessionToken}) Action: ${llmActionText} -> ${translationResult.feedback}`);

      // Advance simulation
      for (let i = 0; i < 10; i++) {
        engine.tick();
      }

      // Calculate real reward using RewardSystem
      const reward = RewardSystem.calculateReward(agent, engine, translationResult.success);

      const nextObservation = getSimplifiedObservation(engine, agent);

      // Store collective memory asynchronously
      VectorMemory.storeMemory(agentId, `Action: ${llmActionText}. Result: ${translationResult.feedback}`, {
        worldTime: nextObservation.worldTime,
        reward: reward.score
      });

      // Check for PCG triggers
      const newChallenge = PCGEngine.checkAndGenerate(engine);
      if (newChallenge) {
        console.log(`[PCG] New challenge triggered for agent ${agent.name}:`, newChallenge);
      }

      res.json({
        success: true,
        observation: nextObservation,
        reward
      });
    } catch (error) {
      console.error('Sim Action Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
