/**
 * Dashboard Screen - Main view of civilization statistics and controls
 */

import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useSimulation } from '@/lib/simulation-context';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';

export default function DashboardScreen() {
  const { worldState, isPlaying, play, pause, setTimeScale, issueResearchCommand, statistics } = useSimulation();
  const colors = useColors();
  const [researchTopic, setResearchTopic] = useState('');
  const [showResearchInput, setShowResearchInput] = useState(false);

  if (!worldState || !statistics) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading simulation...</Text>
      </ScreenContainer>
    );
  }

  const handleIssueCommand = () => {
    if (researchTopic.trim()) {
      issueResearchCommand(researchTopic, `Research on ${researchTopic}`);
      setResearchTopic('');
      setShowResearchInput(false);
    }
  };

  const formatTime = (ticks: number) => {
    const days = Math.floor(ticks / 100);
    const hours = Math.floor((ticks % 100) / 4);
    return `Day ${days}, Hour ${hours}`;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-4xl font-bold text-foreground">AI Civilization</Text>
            <Text className="text-sm text-muted">{formatTime(worldState.time)}</Text>
          </View>

          {/* Simulation Controls */}
          <View className="bg-surface rounded-xl p-4 gap-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Simulation Control</Text>

            {/* Play/Pause */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={isPlaying ? pause : play}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: isPlaying ? colors.error : colors.success,
                    paddingVertical: 12,
                    borderRadius: 8,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-semibold text-white">
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </Pressable>
            </View>

            {/* Time Scale */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Speed</Text>
                <Text className="text-sm font-semibold text-foreground">{worldState.timeScale}x</Text>
              </View>
              <View className="flex-row gap-2">
                {[1, 10, 25, 50, 100].map((scale) => (
                  <Pressable
                    key={scale}
                    onPress={() => setTimeScale(scale)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                        borderRadius: 6,
                        backgroundColor:
                          worldState.timeScale === scale ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      className={cn(
                        'text-xs text-center font-semibold',
                        worldState.timeScale === scale ? 'text-white' : 'text-foreground'
                      )}
                    >
                      {scale}x
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Civilization Statistics */}
          <View className="bg-surface rounded-xl p-4 gap-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Civilization Stats</Text>

            <View className="gap-3">
              <StatRow label="Alive Agents" value={`${statistics.aliveAgents}/${statistics.totalAgents}`} />
              <StatRow label="Total Knowledge" value={statistics.totalKnowledge.toString()} />
              <StatRow label="Average IQ" value={statistics.averageIQ.toFixed(1)} />
              <StatRow label="Average Age" value={statistics.averageAge.toFixed(1)} />
            </View>

            <View className="h-px bg-border my-2" />

            <View className="gap-3">
              <StatRow label="Global Energy" value={statistics.globalEnergy.toFixed(0)} />
              <StatRow label="Global Food" value={statistics.globalFood.toFixed(0)} />
              <StatRow label="Global Currency" value={statistics.globalCurrency.toFixed(0)} />
            </View>
          </View>

          {/* Research Command */}
          <View className="bg-surface rounded-xl p-4 gap-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">God Mode - Research Command</Text>

            {!showResearchInput ? (
              <Pressable
                onPress={() => setShowResearchInput(true)}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    borderRadius: 8,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-semibold text-white">Issue Research Command</Text>
              </Pressable>
            ) : (
              <View className="gap-3">
                <TextInput
                  placeholder="Enter research topic..."
                  value={researchTopic}
                  onChangeText={setResearchTopic}
                  placeholderTextColor={colors.muted}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                    fontSize: 14,
                  }}
                />

                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleIssueCommand}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: colors.success,
                        paddingVertical: 10,
                        borderRadius: 8,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text className="text-center font-semibold text-white">Issue</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowResearchInput(false);
                      setResearchTopic('');
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: colors.muted,
                        paddingVertical: 10,
                        borderRadius: 8,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text className="text-center font-semibold text-white">Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Recent Events */}
          <View className="bg-surface rounded-xl p-4 gap-3 border border-border">
            <Text className="text-lg font-semibold text-foreground">Recent Events</Text>

            {worldState.events.slice(-5).reverse().map((event) => (
              <View key={event.id} className="pb-3 border-b border-border last:border-b-0">
                <View className="flex-row justify-between items-start gap-2">
                  <Text className="flex-1 text-sm font-medium text-foreground">
                    {event.description}
                  </Text>
                  <Text className="text-xs text-muted">Day {Math.floor(event.timestamp / 100)}</Text>
                </View>
              </View>
            ))}

            {worldState.events.length === 0 && (
              <Text className="text-sm text-muted text-center py-4">No events yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
