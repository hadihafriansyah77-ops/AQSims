/**
 * World Map Screen - 2D visualization of the civilization world
 */

import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useSimulation } from '@/lib/simulation-context';
import { useState } from 'react';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

const PERSONALITY_COLORS = {
  brave: '#ef4444',
  cautious: '#3b82f6',
  collaborative: '#22c55e',
  competitive: '#f97316',
  genius: '#a855f7',
};

export default function WorldMapScreen() {
  const { worldState } = useSimulation();
  const colors = useColors();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!worldState) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading world map...</Text>
      </ScreenContainer>
    );
  }

  const aliveAgents = worldState.agents.filter((a) => a.status === 'alive');
  const selectedAgent = selectedAgentId ? worldState.agents.find((a) => a.id === selectedAgentId) : null;

  const canvasWidth = 300;
  const canvasHeight = 300;
  const scaleX = canvasWidth / worldState.worldSize.width;
  const scaleY = canvasHeight / worldState.worldSize.height;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">World Map</Text>
            <Text className="text-sm text-muted">
              {aliveAgents.length} agents alive in {worldState.worldSize.width}x{worldState.worldSize.height} world
            </Text>
          </View>

          {/* Canvas */}
          <View
            className="bg-surface rounded-xl p-4 border border-border"
            style={{
              width: canvasWidth + 32,
              height: canvasHeight + 32,
            }}
          >
            <View
              style={{
                width: canvasWidth,
                height: canvasHeight,
                backgroundColor: colors.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Render agents */}
              {aliveAgents.map((agent) => {
                const x = agent.position.x * scaleX;
                const y = agent.position.y * scaleY;
                const agentColor = PERSONALITY_COLORS[agent.personality] || colors.primary;
                const isSelected = agent.id === selectedAgentId;

                return (
                  <Pressable
                    key={agent.id}
                    onPress={() => setSelectedAgentId(agent.id)}
                    style={{
                      position: 'absolute',
                      left: x - 6,
                      top: y - 6,
                      width: isSelected ? 16 : 12,
                      height: isSelected ? 16 : 12,
                      borderRadius: 100,
                      backgroundColor: agentColor,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: colors.primary,
                    }}
                  />
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View className="bg-surface rounded-xl p-4 gap-3 border border-border">
            <Text className="text-sm font-semibold text-foreground">Personality Colors</Text>
            <View className="gap-2">
              {Object.entries(PERSONALITY_COLORS).map(([personality, color]) => (
                <View key={personality} className="flex-row items-center gap-2">
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: color,
                    }}
                  />
                  <Text className="text-sm text-foreground capitalize">{personality}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Zoom Controls */}
          <View className="bg-surface rounded-xl p-4 gap-3 border border-border">
            <Text className="text-sm font-semibold text-foreground">Zoom</Text>
            <View className="flex-row gap-2">
              {[0.5, 1, 1.5, 2].map((zoom) => (
                <Pressable
                  key={zoom}
                  onPress={() => setZoomLevel(zoom)}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 6,
                      backgroundColor: zoomLevel === zoom ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    className={cn(
                      'text-xs text-center font-semibold',
                      zoomLevel === zoom ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {zoom}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Selected Agent Info */}
          {selectedAgent && (
            <View className="bg-surface rounded-xl p-4 gap-3 border border-border">
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: PERSONALITY_COLORS[selectedAgent.personality],
                  }}
                />
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">{selectedAgent.name}</Text>
                  <Text className="text-xs text-muted capitalize">{selectedAgent.personality}</Text>
                </View>
              </View>

              <View className="h-px bg-border" />

              <View className="gap-2">
                <InfoRow label="IQ" value={selectedAgent.iq.toString()} />
                <InfoRow label="Energy" value={selectedAgent.energy.toFixed(1)} />
                <InfoRow label="Health" value={selectedAgent.health.toFixed(1)} />
                <InfoRow label="Hunger" value={selectedAgent.hunger.toFixed(1)} />
                <InfoRow label="Age" value={selectedAgent.age.toFixed(1)} />
              </View>

              {selectedAgent.currentResearch && (
                <>
                  <View className="h-px bg-border" />
                  <View className="gap-2">
                    <Text className="text-sm text-muted">Currently Researching</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {selectedAgent.currentResearch}
                    </Text>
                    <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <View
                        style={{
                          width: `${selectedAgent.researchProgress * 100}%`,
                          height: '100%',
                          backgroundColor: colors.success,
                        }}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Agent List */}
          <View className="bg-surface rounded-xl p-4 gap-3 border border-border">
            <Text className="text-sm font-semibold text-foreground">Agents ({aliveAgents.length})</Text>

            <View className="gap-2 max-h-64">
              {aliveAgents.slice(0, 10).map((agent) => (
                <Pressable
                  key={agent.id}
                  onPress={() => setSelectedAgentId(agent.id)}
                  style={({ pressed }) => [
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 6,
                      backgroundColor:
                        agent.id === selectedAgentId ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-row items-center gap-2 flex-1">
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: PERSONALITY_COLORS[agent.personality],
                        }}
                      />
                      <Text
                        className={cn(
                          'text-sm font-medium',
                          agent.id === selectedAgentId ? 'text-white' : 'text-foreground'
                        )}
                      >
                        {agent.name}
                      </Text>
                    </View>
                    <Text
                      className={cn(
                        'text-xs',
                        agent.id === selectedAgentId ? 'text-white' : 'text-muted'
                      )}
                    >
                      IQ {agent.iq}
                    </Text>
                  </View>
                </Pressable>
              ))}

              {aliveAgents.length > 10 && (
                <Text className="text-xs text-muted text-center py-2">
                  +{aliveAgents.length - 10} more agents
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="text-xs font-semibold text-foreground">{value}</Text>
    </View>
  );
}
