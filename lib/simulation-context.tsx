/**
 * Simulation Context Provider
 * Manages simulation state and provides it to all components
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { SimulationEngine } from './simulation/engine';
import type { WorldState, Agent, Knowledge, SimulationEvent } from './simulation/types';

interface SimulationContextType {
  engine: SimulationEngine | null;
  worldState: WorldState | null;
  isPlaying: boolean;
  timeScale: number;
  statistics: any;
  
  // Actions
  play: () => void;
  pause: () => void;
  setTimeScale: (scale: number) => void;
  issueResearchCommand: (topic: string, description: string) => void;
  saveState: () => string;
  loadState: (stateJson: string) => void;
  reset: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeScale, setTimeScaleState] = useState(50);
  const [statistics, setStatistics] = useState<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize engine
  useEffect(() => {
    const engine = new SimulationEngine(1000, 1000);
    engine.initializeCivilization(20);
    engineRef.current = engine;
    setWorldState(engine.getWorldState());
    setStatistics(engine.getStatistics());
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (!engineRef.current) return;

    const runTick = () => {
      if (engineRef.current) {
        // Run multiple ticks per frame based on timeScale
        const ticksPerFrame = Math.max(1, Math.floor(timeScale / 50));
        for (let i = 0; i < ticksPerFrame; i++) {
          engineRef.current.tick();
        }

        // Update state
        setWorldState({ ...engineRef.current.getWorldState() });
        setStatistics(engineRef.current.getStatistics());
      }

      // Continue loop if playing
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(runTick);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(runTick);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, timeScale]);

  const play = () => {
    if (engineRef.current) {
      engineRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      setIsPlaying(false);
    }
  };

  const setTimeScale = (scale: number) => {
    if (engineRef.current) {
      engineRef.current.setTimeScale(scale);
      setTimeScaleState(scale);
    }
  };

  const issueResearchCommand = (topic: string, description: string) => {
    if (engineRef.current) {
      engineRef.current.issueResearchCommand(topic, description);
    }
  };

  const saveState = () => {
    if (engineRef.current) {
      return engineRef.current.saveState();
    }
    return '';
  };

  const loadState = (stateJson: string) => {
    if (engineRef.current) {
      engineRef.current.loadState(stateJson);
      setWorldState(engineRef.current.getWorldState());
      setStatistics(engineRef.current.getStatistics());
    }
  };

  const reset = () => {
    const engine = new SimulationEngine(1000, 1000);
    engine.initializeCivilization(20);
    engineRef.current = engine;
    setWorldState(engine.getWorldState());
    setStatistics(engine.getStatistics());
    setIsPlaying(false);
  };

  const value: SimulationContextType = {
    engine: engineRef.current,
    worldState,
    isPlaying,
    timeScale,
    statistics,
    play,
    pause,
    setTimeScale,
    issueResearchCommand,
    saveState,
    loadState,
    reset,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
}
