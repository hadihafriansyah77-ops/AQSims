import { ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

/**
 * Home Screen - Welcome and quick navigation
 */
export default function HomeScreen() {
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Hero Section */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">AI Civilization</Text>
            <Text className="text-base text-muted text-center">
              Simulate autonomous AI agents discovering knowledge
            </Text>
          </View>

          {/* Quick Start Card */}
          <View className="w-full bg-primary rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-white mb-2">Getting Started</Text>
            <Text className="text-sm text-white leading-relaxed mb-4">
              Watch AI agents explore, research, and collaborate in a simulated world.
            </Text>
            <Text className="text-xs text-white opacity-80">
              Tap Dashboard to begin the simulation
            </Text>
          </View>

          {/* Features */}
          <View className="gap-3">
            <FeatureCard
              title="Dashboard"
              description="Monitor civilization statistics and issue research commands"
              emoji="📊"
            />
            <FeatureCard
              title="World Map"
              description="Visualize agents and their interactions in 2D space"
              emoji="🗺️"
            />
            <FeatureCard
              title="Knowledge Base"
              description="Browse discoveries and research completed by agents"
              emoji="📚"
            />
          </View>

          {/* Info */}
          <View className="bg-surface rounded-xl p-4 gap-2 border border-border">
            <Text className="text-sm font-semibold text-foreground">About This App</Text>
            <Text className="text-xs text-muted leading-relaxed">
              This is a mobile simulation of an autonomous research civilization. Agents with IQ 150+ explore, collaborate, and generate knowledge through riset otonom.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function FeatureCard({ title, description, emoji }: { title: string; description: string; emoji: string }) {
  return (
    <View className="bg-surface rounded-xl p-4 border border-border flex-row gap-3">
      <Text className="text-2xl">{emoji}</Text>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted leading-relaxed">{description}</Text>
      </View>
    </View>
  );
}
