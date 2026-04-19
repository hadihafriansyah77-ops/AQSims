import { SimulationEngine } from '../lib/simulation/engine';

/**
 * Procedural Content Generation (PCG) Engine
 * Automatically generates new challenges and objects in the simulation.
 */

export class PCGEngine {
  /**
   * Generates a new quantum challenge based on current simulation difficulty.
   */
  static generateChallenge(engine: SimulationEngine, difficulty: number = 1) {
    const worldState = engine.getWorldState();
    const worldSize = worldState.worldSize;

    // Generate a new "Quantum Anomaly" location
    const anomalyX = Math.random() * worldSize.width;
    const anomalyY = Math.random() * worldSize.height;

    // In a real implementation, we would add this to the engine's location list
    // Since the engine doesn't have a public 'addLocation' yet, we simulate the effect
    console.log(`[PCG] Generated new level ${difficulty} challenge: Quantum Anomaly at (${anomalyX.toFixed(1)}, ${anomalyY.toFixed(1)})`);
    
    // We can inject a global event to signal the new challenge
    // Note: SimulationEngine.addEvent is private, but we can assume the engine will handle it
    // For now, we return the challenge data
    return {
      type: 'quantum_anomaly',
      difficulty,
      position: { x: anomalyX, y: anomalyY },
      rewardMultiplier: 1 + (difficulty * 0.5)
    };
  }

  /**
   * Evaluates if a new challenge should be generated.
   */
  static checkAndGenerate(engine: SimulationEngine) {
    const stats = engine.getStatistics();
    
    // If agents have created more than 5 pieces of knowledge, generate a harder challenge
    if (stats.totalKnowledge > 5) {
      const difficulty = Math.floor(stats.totalKnowledge / 5) + 1;
      return this.generateChallenge(engine, difficulty);
    }
    
    return null;
  }
}
