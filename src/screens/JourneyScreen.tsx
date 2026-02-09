import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface JourneyEntry {
  id: string;
  date: string;
  cluster: string;
  type: 'drop' | 'buff' | 'milestone';
  titleDe: string;
  excerptDe: string;
}

const MOCK_JOURNEY: JourneyEntry[] = [
  {
    id: '1',
    date: '08.02.2026',
    cluster: 'passion',
    type: 'drop',
    titleDe: 'Leidenschaft entsteht leicht',
    excerptDe: 'Ihr findet Nähe schnell, ohne viel Erklärung. Manchmal abwechseln, wer den Start gibt.',
  },
  {
    id: '2',
    date: '08.02.2026',
    cluster: 'passion',
    type: 'buff',
    titleDe: '🔥 Leidenschafts-Boost aktiv',
    excerptDe: 'Eure Verbindung lodert hell. 7 Tage aktiv.',
  },
  {
    id: '3',
    date: '07.02.2026',
    cluster: 'stability',
    type: 'drop',
    titleDe: 'Stabilität als Basis',
    excerptDe: 'Ihr gebt euch Halt, ohne viel Drama. Manchmal auch Bewegung zulassen.',
  },
  {
    id: '4',
    date: '05.02.2026',
    cluster: 'future',
    type: 'milestone',
    titleDe: 'Zukunft entdeckt',
    excerptDe: 'Ihr schaut ähnlich nach vorn – das gibt Richtung.',
  },
];

export default function JourneyScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drop': return '💡';
      case 'buff': return '✨';
      case 'milestone': return '🎯';
      default: return '📍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'drop': return 'rgba(251, 191, 36, 0.3)';
      case 'buff': return 'rgba(139, 92, 246, 0.3)';
      case 'milestone': return 'rgba(34, 197, 94, 0.3)';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  const getClusterColor = (cluster: string) => {
    switch (cluster) {
      case 'passion': return '#ef4444';
      case 'stability': return '#3b82f6';
      case 'future': return '#8b5cf6';
      default: return '#8b8b93';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Eure Reise</Text>
        <Text style={styles.subtitle}>Gemeinsame Momente, die euch prägen</Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Quizzes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Buffs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Tage</Text>
        </View>
      </View>

      {/* Timeline */}
      <ScrollView style={styles.timeline} contentContainerStyle={styles.timelineContent}>
        <Text style={styles.sectionTitle}>Timeline</Text>

        {MOCK_JOURNEY.map((entry, index) => (
          <View key={entry.id} style={styles.timelineItem}>
            {/* Date Column */}
            <View style={styles.dateColumn}>
              <Text style={styles.dateText}>{entry.date.split('.')[0]}</Text>
              <Text style={styles.monthText}>{entry.date.split('.')[1]}.</Text>
            </View>

            {/* Timeline Line */}
            <View style={styles.timelineLine}>
              <View style={[styles.timelineDot, { backgroundColor: getClusterColor(entry.cluster) }]} />
              {index < MOCK_JOURNEY.length - 1 && <View style={styles.timelineConnector} />}
            </View>

            {/* Content Card */}
            <View style={styles.contentColumn}>
              <TouchableOpacity
                style={[styles.entryCard, { borderLeftColor: getClusterColor(entry.cluster) }]}
                onPress={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                activeOpacity={0.7}
              >
                <View style={styles.entryHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(entry.type) }]}>
                    <Text style={styles.typeIcon}>{getTypeIcon(entry.type)}</Text>
                  </View>
                  <View style={styles.entryMeta}>
                    <Text style={styles.clusterLabel}>{entry.cluster.toUpperCase()}</Text>
                    <Text style={styles.entryTitle}>{entry.titleDe}</Text>
                  </View>
                </View>

                {expandedId === entry.id && (
                  <View style={styles.entryExpanded}>
                    <Text style={styles.excerptText}>{entry.excerptDe}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f2f3f5',
    letterSpacing: -0.02,
  },
  subtitle: {
    fontSize: 14,
    color: '#8b8b93',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f2f3f5',
  },
  statLabel: {
    fontSize: 12,
    color: '#8b8b93',
    marginTop: 4,
  },
  timeline: {
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#8b8b93',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dateColumn: {
    width: 50,
    paddingTop: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f2f3f5',
  },
  monthText: {
    fontSize: 12,
    color: '#8b8b93',
  },
  timelineLine: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 4,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 16,
  },
  entryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderLeftWidth: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 16,
  },
  entryMeta: {
    flex: 1,
  },
  clusterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8b8b93',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f2f3f5',
  },
  entryExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  excerptText: {
    fontSize: 14,
    color: '#a7abb3',
    lineHeight: 20,
  },
});
