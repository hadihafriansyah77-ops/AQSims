import { Agent, SimulationEngine } from '../lib/simulation/engine';
import { RewardSignal } from '../shared/quantum_types';

/**
 * Reward System - Objective Function
 * Automatically evaluates AI actions based on quantum-classical verification.
 */

export class RewardSystem {
  /**
   * Evaluates the current state of an agent and returns a reward signal.
   */
  static calculateReward(agent: Agent, engine: SimulationEngine, lastActionSuccess: boolean): RewardSignal {
    let score = 0;
    let reason = "Standard simulation tick.";
    let verificationType: RewardSignal['verificationType'] = 'energy_efficiency';

    // 1. Action Success Reward
    if (lastActionSuccess) {
      score += 10;
      reason = "Action executed successfully.";
    }

    // 2. Quantum-Classical Verification
    // If agent is near a research lab and energy is high, reward for potential quantum breakthrough
    const locations = engine.getLocations();
    const isNearLab = locations.some(loc => 
      loc.type === 'research_lab' && 
      Math.hypot(agent.position.x - loc.position.x, agent.position.y - loc.position.y) < 50
    );

    if (isNearLab && agent.currentResearch) {
      score += 50;
      reason = "Quantum-Classical Verification successful: Agent is conducting research in an optimal environment.";
      verificationType = 'quantum_classical_match';
    }

    // 3. Discovery Reward
    const recentEvents = engine.getRecentEvents(5);
    const discoveryEvent = recentEvents.find(e => e.type === 'discovery' && e.involvedAgents.includes(agent.id));
    if (discoveryEvent) {
      score += 100;
      reason = `Scientific discovery achieved: ${discoveryEvent.description}`;
      verificationType = 'discovery';
    }

    // 4. Survival/Efficiency Penalty
    if (agent.energy < 20) {
      score -= 5;
      reason += " Penalty: Low energy levels.";
    }

    return {
      score,
      reason,
      verificationType
    };
  }
}
