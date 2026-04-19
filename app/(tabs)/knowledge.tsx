/**
 * Knowledge Base Screen - View and search civilization knowledge
 */

import { View, Text, ScrollView, Pressable, TextInput, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useSimulation } from '@/lib/simulation-context';
import { useState, useMemo } from 'react';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export default function KnowledgeScreen() {
  const { worldState } = useSimulation();
  const colors = useColors();
  const [searchText, setSearchText] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(null);

  if (!worldState) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading knowledge base...</Text>
      </ScreenContainer>
    );
  }

  const filteredKnowledge = useMemo(() => {
    return worldState.knowledge.filter(
      (k) =>
        k.title.toLowerCase().includes(searchText.toLowerCase()) ||
        k.description.toLowerCase().includes(searchText.toLowerCase()) ||
        k.category.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [worldState.knowledge, searchText]);

  const selectedKnowledge = selectedKnowledgeId
    ? worldState.knowledge.find((k) => k.id === selectedKnowledgeId)
    : null;

  const creator = selectedKnowledge
    ? worldState.agents.find((a) => a.id === selectedKnowledge.creatorId)
    : null;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Knowledge Base</Text>
            <Text className="text-sm text-muted">
              {worldState.knowledge.length} discoveries
            </Text>
          </View>

          {/* Search */}
          <View className="bg-surface rounded-xl p-3 border border-border">
            <TextInput
              placeholder="Search knowledge..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={colors.muted}
              style={{
                color: colors.foreground,
                fontSize: 14,
              }}
            />
          </View>

          {/* Knowledge List */}
          {!selectedKnowledge ? (
            <View className="gap-3">
              {filteredKnowledge.length > 0 ? (
                filteredKnowledge.map((knowledge) => {
                  const creator = worldState.agents.find((a) => a.id === knowledge.creatorId);
                  return (
                    <Pressable
                      key={knowledge.id}
                      onPress={() => setSelectedKnowledgeId(knowledge.id)}
                      style={({ pressed }) => [
                        {
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View className="gap-2">
                        <View className="flex-row justify-between items-start gap-2">
                          <Text className="flex-1 text-sm font-semibold text-foreground">
                            {knowledge.title}
                          </Text>
                          <View
                            style={{
                              backgroundColor: colors.warning,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 4,
                            }}
                          >
                            <Text className="text-xs font-semibold text-white">
                              {knowledge.rating.toFixed(1)}★
                            </Text>
                          </View>
                        </View>

                        <Text className="text-xs text-muted">{knowledge.description}</Text>

                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-muted">
                            By {creator?.name || 'Unknown'}
                          </Text>
                          <Text className="text-xs text-muted">
                            {knowledge.contributors.length} contributors
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-sm text-muted">No knowledge found</Text>
                </View>
              )}
            </View>
          ) : (
            // Knowledge Detail View
            <View className="gap-4">
              <Pressable
                onPress={() => setSelectedKnowledgeId(null)}
                style={({ pressed }) => [
                  {
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: colors.muted,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text className="text-center font-semibold text-white">← Back to List</Text>
              </Pressable>

              <View className="bg-surface rounded-xl p-4 gap-4 border border-border">
                {/* Title and Rating */}
                <View className="gap-2">
                  <View className="flex-row justify-between items-start gap-2">
                    <Text className="flex-1 text-xl font-bold text-foreground">
                      {selectedKnowledge.title}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.warning,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text className="text-sm font-bold text-white">
                        {selectedKnowledge.rating.toFixed(1)}★
                      </Text>
                    </View>
                  </View>

                  <Text className="text-sm text-muted">{selectedKnowledge.description}</Text>
                </View>

                <View className="h-px bg-border" />

                {/* Metadata */}
                <View className="gap-3">
                  <MetaRow
                    label="Creator"
                    value={creator?.name || 'Unknown'}
                  />
                  <MetaRow
                    label="Created"
                    value={`Day ${Math.floor(selectedKnowledge.createdAt / 100)}`}
                  />
                  <MetaRow
                    label="Category"
                    value={selectedKnowledge.category}
                  />
                  <MetaRow
                    label="Contributors"
                    value={selectedKnowledge.contributors.length.toString()}
                  />
                </View>

                <View className="h-px bg-border" />

                {/* Content */}
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Content</Text>
                  <Text className="text-sm text-foreground leading-relaxed">
                    {selectedKnowledge.content}
                  </Text>
                </View>

                {/* Evidence */}
                {selectedKnowledge.evidence.length > 0 && (
                  <>
                    <View className="h-px bg-border" />
                    <View className="gap-2">
                      <Text className="text-sm font-semibold text-foreground">Evidence</Text>
                      {selectedKnowledge.evidence.map((evidence, idx) => (
                        <Text key={idx} className="text-xs text-muted">
                          • {evidence}
                        </Text>
                      ))}
                    </View>
                  </>
                )}

                {/* References */}
                {selectedKnowledge.references.length > 0 && (
                  <>
                    <View className="h-px bg-border" />
                    <View className="gap-2">
                      <Text className="text-sm font-semibold text-foreground">References</Text>
                      {selectedKnowledge.references.map((ref, idx) => (
                        <Text key={idx} className="text-xs text-muted">
                          [{idx + 1}] {ref}
                        </Text>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
