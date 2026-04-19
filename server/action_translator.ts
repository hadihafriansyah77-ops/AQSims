import { Agent, SimulationEngine } from '../lib/simulation/engine';

/**
 * Action Space Translator (Code-as-Policies)
 * Translates natural language actions into motor/simulated commands.
 */

export class ActionSpaceTranslator {
  /**
   * Translates a natural language action into simulation commands.
   * Uses a "Code-as-Policies" approach by mapping text to engine function calls.
   */
  static translateAndExecute(actionText: string, agent: Agent, engine: SimulationEngine): { success: boolean; feedback: string } {
    const action = actionText.toLowerCase();

    // 1. Movement Actions
    if (action.includes('pergi ke') || action.includes('jalan ke') || action.includes('move to')) {
      const targetMatch = action.match(/(?:ke|to) ([\w\s]+)/);
      if (targetMatch) {
        const targetName = targetMatch[1].trim();
        const locations = engine.getLocations();
        const targetLocation = locations.find(loc => loc.name.toLowerCase().includes(targetName));
        
        if (targetLocation) {
          agent.position = { ...targetLocation.position };
          return { success: true, feedback: `Berhasil bergerak ke ${targetLocation.name}.` };
        }
      }
      // Random movement if target not found but move requested
      const speed = 10;
      const angle = Math.random() * Math.PI * 2;
      agent.position.x += Math.cos(angle) * speed;
      agent.position.y += Math.sin(angle) * speed;
      return { success: true, feedback: 'Bergerak ke arah acak.' };
    }

    // 2. Research/Quantum Interaction Actions
    if (action.includes('ambil') || action.includes('take') || action.includes('interact')) {
      if (action.includes('tabung reaksi') || action.includes('qubit') || action.includes('quantum')) {
        // Simulating quantum interaction
        agent.energy -= 5; // Interaction costs energy
        return { success: true, feedback: 'Berhasil berinteraksi dengan objek kuantum. Terjadi fenomena tunneling!' };
      }
    }

    // 3. Research Actions
    if (action.includes('riset') || action.includes('research') || action.includes('pelajari')) {
      const topicMatch = action.match(/(?:riset|research|pelajari) ([\w\s]+)/);
      const topic = topicMatch ? topicMatch[1].trim() : 'quantum phenomenon';
      engine.issueResearchCommand(topic, `LLM-driven research on ${topic}`);
      return { success: true, feedback: `Memulai riset tentang ${topic}.` };
    }

    // 4. Resting
    if (action.includes('istirahat') || action.includes('rest') || action.includes('tidur')) {
      agent.energy = Math.min(100, agent.energy + 20);
      return { success: true, feedback: 'Berhasil beristirahat dan memulihkan energi.' };
    }

    // Default: Small random movement if action not recognized
    return { success: false, feedback: 'Aksi tidak dikenali, agen tetap diam.' };
  }
}
