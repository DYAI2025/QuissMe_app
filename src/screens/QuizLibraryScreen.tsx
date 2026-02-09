import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MOSAIC_QUIZZES, CLUSTER_INFO, getQuizzesByCluster } from '../data/mosaicQuizzes';

const { width } = Dimensions.get('window');

export default function QuizLibraryScreen() {
  const navigation = useNavigation();
  const [selectedCluster, setSelectedCluster] = useState<'passion' | 'stability' | 'future' | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  const currentQuizzes = selectedCluster ? getQuizzesByCluster(selectedCluster) : [];
  const clusterInfo = selectedCluster ? CLUSTER_INFO[selectedCluster] : null;

  const getProgress = (cluster: 'passion' | 'stability' | 'future') => {
    const clusterQuizzes = getQuizzesByCluster(cluster);
    const completed = completedQuizzes.filter(id => clusterQuizzes.some(q => q.id === id));
    return `${completed.length}/${clusterQuizzes.length}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quiz Bibliothek</Text>
        <View style={styles.spacer} />
      </View>

      {/* Cluster Selector */}
      {!selectedCluster ? (
        <ScrollView style={styles.clusterGrid} contentContainerStyle={styles.clusterGridContent}>
          <Text style={styles.sectionTitle}>Wähle einen Cluster</Text>
          
          {/* Mosaic Cluster */}
          <TouchableOpacity 
            style={[styles.clusterCard, styles.mosaicCard]}
            onPress={() => setSelectedCluster('passion')}
          >
            <View style={styles.clusterHeader}>
              <Text style={styles.clusterEmoji}>🔥</Text>
              <Text style={styles.clusterName}>Das Mosaik</Text>
            </View>
            <Text style={styles.clusterTeaser}>15 Fragen • Drei Kräfte • Ein Muster</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '33%' }]} />
              </View>
              <Text style={styles.progressText}>Passion: {getProgress('passion')}</Text>
            </View>
          </TouchableOpacity>

          {/* Individual Clusters */}
          <View style={styles.clusterRow}>
            <TouchableOpacity 
              style={[styles.smallClusterCard, styles.passionCard]}
              onPress={() => setSelectedCluster('passion')}
            >
              <Text style={styles.smallEmoji}>🔥</Text>
              <Text style={styles.smallName}>Leidenschaft</Text>
              <Text style={styles.smallCount}>5 Fragen</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallClusterCard, styles.stabilityCard]}
              onPress={() => setSelectedCluster('stability')}
            >
              <Text style={styles.smallEmoji}>🪨</Text>
              <Text style={styles.smallName}>Stabilität</Text>
              <Text style={styles.smallCount}>5 Fragen</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallClusterCard, styles.futureCard]}
              onPress={() => setSelectedCluster('future')}
            >
              <Text style={styles.smallEmoji}>🔮</Text>
              <Text style={styles.smallName}>Zukunft</Text>
              <Text style={styles.smallCount}>5 Fragen</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // Quiz List for Selected Cluster
        <View style={styles.quizList}>
          <TouchableOpacity 
            style={styles.backToClusters}
            onPress={() => setSelectedCluster(null)}
          >
            <Text style={styles.backLink}>← Alle Cluster</Text>
          </TouchableOpacity>

          <View style={[styles.clusterHeaderFull, { backgroundColor: getClusterColor(selectedCluster) }]}>
            <Text style={styles.clusterEmojiLarge}>{clusterInfo?.narrator === 'ember' ? '🔥' : clusterInfo?.narrator === 'stone' ? '🪨' : '🔮'}</Text>
            <Text style={styles.clusterTitleFull}>{CLUSTER_INFO[selectedCluster].nameDe}</Text>
            <Text style={styles.clusterSubtitle}>15 Fragen in diesem Cluster</Text>
          </View>

          <ScrollView style={styles.quizScroll} contentContainerStyle={styles.quizScrollContent}>
            {currentQuizzes.map((quiz, index) => (
              <TouchableOpacity 
                key={quiz.id}
                style={[styles.quizCard, completedQuizzes.includes(quiz.id) && styles.quizCardCompleted]}
                onPress={() => navigation.navigate('BlindModeScreen' as never)}
              >
                <View style={styles.quizNumber}>
                  <Text style={styles.quizNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizFacet}>{quiz.facetLabelDe}</Text>
                  <Text style={styles.quizNarrator}>mit {quiz.narratorId === 'ember' ? 'Ember' : quiz.narratorId === 'stone' ? 'Stone' : 'Oracle'}</Text>
                </View>
                <View style={[styles.quizZone, { backgroundColor: getZoneColor(quiz.zoneTokens.flow.zone) }]}>
                  <Text style={styles.quizZoneText}>
                    {quiz.zoneTokens.flow.zone === 'flow' ? '🌊' : quiz.zoneTokens.flow.zone === 'spark' ? '✨' : '💬'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function getClusterColor(cluster: string) {
  switch (cluster) {
    case 'passion': return 'rgba(239, 68, 68, 0.2)';
    case 'stability': return 'rgba(59, 130, 246, 0.2)';
    case 'future': return 'rgba(139, 92, 246, 0.2)';
    default: return 'rgba(255,255,255,0.1)';
  }
}

function getZoneColor(zone: string) {
  switch (zone) {
    case 'flow': return 'rgba(34, 197, 94, 0.3)';
    case 'spark': return 'rgba(251, 191, 36, 0.3)';
    case 'talk': return 'rgba(96, 165, 250, 0.3)';
    default: return 'rgba(255,255,255,0.1)';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: '#f2f3f5',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f2f3f5',
    letterSpacing: -0.02,
  },
  spacer: {
    width: 40,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#8b8b93',
    marginBottom: 16,
    textAlign: 'center',
  },
  clusterGrid: {
    flex: 1,
  },
  clusterGridContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mosaicCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  clusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clusterEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  clusterName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f2f3f5',
  },
  clusterTeaser: {
    fontSize: 14,
    color: '#a7abb3',
    marginBottom: 16,
  },
  progressRow: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8b8b93',
  },
  clusterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallClusterCard: {
    width: (width - 52) / 3,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  passionCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  stabilityCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  futureCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  smallEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  smallName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f2f3f5',
    textAlign: 'center',
  },
  smallCount: {
    fontSize: 11,
    color: '#8b8b93',
    marginTop: 4,
  },
  quizList: {
    flex: 1,
  },
  backToClusters: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  backLink: {
    fontSize: 14,
    color: '#8b5cf6',
  },
  clusterHeaderFull: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  clusterEmojiLarge: {
    fontSize: 48,
    marginBottom: 8,
  },
  clusterTitleFull: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f2f3f5',
  },
  clusterSubtitle: {
    fontSize: 14,
    color: '#a7abb3',
    marginTop: 4,
  },
  quizScroll: {
    flex: 1,
  },
  quizScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quizCardCompleted: {
    opacity: 0.6,
  },
  quizNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quizNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f2f3f5',
  },
  quizInfo: {
    flex: 1,
  },
  quizFacet: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f2f3f5',
  },
  quizNarrator: {
    fontSize: 12,
    color: '#8b8b93',
    marginTop: 2,
  },
  quizZone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizZoneText: {
    fontSize: 18,
  },
});
