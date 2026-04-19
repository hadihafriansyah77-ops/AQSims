import { ChromaClient } from 'chromadb';

/**
 * Vector Memory - Collective Intelligence
 * Uses ChromaDB to store and retrieve collective experiences of AI agents.
 */

export class VectorMemory {
  private static client = new ChromaClient();
  private static collectionName = "aqsims_collective_memory";

  /**
   * Stores a memory entry into the vector database.
   */
  static async storeMemory(agentId: string, content: string, metadata: any = {}) {
    try {
      const collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
      });

      await collection.add({
        ids: [`mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`],
        metadatas: [{ ...metadata, agentId, timestamp: Date.now() }],
        documents: [content],
      });
      
      console.log(`Memory stored for agent ${agentId}: ${content.substring(0, 50)}...`);
    } catch (error) {
      console.error("VectorMemory store error:", error);
    }
  }

  /**
   * Retrieves relevant memories based on a query.
   */
  static async queryMemories(queryText: string, limit: number = 5) {
    try {
      const collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
      });

      const results = await collection.query({
        queryTexts: [queryText],
        nResults: limit,
      });

      return results.documents[0] || [];
    } catch (error) {
      console.error("VectorMemory query error:", error);
      return [];
    }
  }
}
