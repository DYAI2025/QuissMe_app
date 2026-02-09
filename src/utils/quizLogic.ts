// QuissMe Quiz Logic v1
// Zone Calculation, State Management, Cluster Completion, Drop & Buff Generation

import { MOSAIC_QUIZZES, Quiz, Zone } from '../data/mosaicQuizzes';
import { DUO_TRAITS, TraitLevel, CLUSTER_BUFFS, Buff } from '../data/traits';

// ============================================================================
// TYPES
// ============================================================================

export interface QuizAnswer {
  quizId: string;
  selectedOptionIndex: number;
  partnerType: 'A' | 'B';
  timestamp: number;
}

export interface QuizResult {
  quizId: string;
  cluster: 'passion' | 'stability' | 'future';
  zone: Zone;
  tokens: {
    insightStrength: string;
    insightGrowth: string;
    microStep: string;
  };
}

export interface ClusterResult {
  cluster: 'passion' | 'stability' | 'future';
  quizzes: QuizResult[];
  primaryZone: Zone;
  scores: {
    flow: number;
    spark: number;
    talk: number;
  };
}

export interface DuoDrop {
  id: string;
  cluster: string;
  primaryZone: Zone;
  insightStrength: string;
  insightGrowth: string;
  microStep: string;
  generatedAt: number;
  profileArchetype?: string;
}

export interface ActiveBuff {
  buffId: string;
  cluster: string;
  activatedAt: number;
  expiresAt: number;
  affectedTraits: string[];
}

// ============================================================================
// ZONE CALCULATION
// ============================================================================

// Zone determination based on partner answer similarity/complementarity
export function calculateZone(
  quizId: string,
  answerA: QuizAnswer,
  answerB: QuizAnswer
): Zone {
  const quiz = MOSAIC_QUIZZES.find(q => q.id === quizId);
  if (!quiz) return 'talk';

  const quizZoneTokens = quiz.zoneTokens;

  // Calculate similarity (0-1)
  const similarity = calculateSimilarity(answerA, answerB);

  // Check for "talk pairs" - predefined pairs that always trigger talk zone
  const quizZoneLogic = quiz.zoneLogic;
  const pairKey = `${answerA.selectedOptionIndex}_${answerB.selectedOptionIndex}`;
  const reversePairKey = `${answerB.selectedOptionIndex}_${answerA.selectedOptionIndex}`;

  if (quizZoneLogic.talk_pairs.includes(pairKey) || 
      quizZoneLogic.talk_pairs.includes(reversePairKey)) {
    return 'talk';
  }

  // Determine zone based on similarity
  if (similarity >= 0.7) {
    return 'flow';
  } else if (similarity <= 0.3) {
    return 'talk';
  } else {
    // Between 0.3 and 0.7 = Spark zone
    return 'spark';
  }
}

function calculateSimilarity(a: QuizAnswer, b: QuizAnswer): number {
  // For MVP: use simple difference
  // In production: use option semantic similarity or embedding distance
  const maxDiff = 4; // Assuming 0-4 options
  const diff = Math.abs(a.selectedOptionIndex - b.selectedOptionIndex);
  return 1 - (diff / maxDiff);
}

// ============================================================================
// QUIZ STATE MANAGEMENT
// ============================================================================

export class QuizStateManager {
  private completedQuizzes: Map<string, QuizAnswer[]> = new Map();
  private clusterProgress: Map<string, { A: number; B: number }> = new Map();

  constructor() {
    // Initialize progress for all clusters
    ['passion', 'stability', 'future'].forEach(cluster => {
      this.clusterProgress.set(cluster, { A: 0, B: 0 });
    });
  }

  submitAnswer(answer: QuizAnswer): QuizResult | null {
    const existing = this.completedQuizzes.get(answer.quizId) || [];
    existing.push(answer);
    this.completedQuizzes.set(answer.quizId, existing);

    // Update cluster progress
    const quiz = MOSAIC_QUIZZES.find(q => q.id === answer.quizId);
    if (quiz) {
      const progress = this.clusterProgress.get(quiz.hiddenCluster)!;
      if (answer.partnerType === 'A') {
        progress.A++;
      } else {
        progress.B++;
      }
      this.clusterProgress.set(quiz.hiddenCluster, progress);
    }

    // If both partners answered, calculate result
    if (existing.length >= 2) {
      const answerA = existing.find(a => a.partnerType === 'A')!;
      const answerB = existing.find(a => a.partnerType === 'B')!;
      return this.calculateQuizResult(answerA, answerB);
    }

    return null;
  }

  private calculateQuizResult(answerA: QuizAnswer, answerB: QuizAnswer): QuizResult {
    const quiz = MOSAIC_QUIZZES.find(q => q.id === answerA.quizId)!;
    const zone = calculateZone(answerA.quizId, answerA, answerB);
    const tokens = quiz.zoneTokens[zone];

    return {
      quizId: answerA.quizId,
      cluster: quiz.hiddenCluster,
      zone,
      tokens: {
        insightStrength: tokens.insightStrength,
        insightGrowth: tokens.insightGrowth,
        microStep: tokens.microStep,
      }
    };
  }

  getClusterProgress(cluster: string): { A: number; B: number } {
    return this.clusterProgress.get(cluster) || { A: 0, B: 0 };
  }

  isClusterComplete(cluster: string): boolean {
    const progress = this.clusterProgress.get(cluster);
    if (!progress) return false;
    return progress.A >= 5 && progress.B >= 5; // 5 quizzes per cluster
  }

  getCompletedQuizzes(): string[] {
    return Array.from(this.completedQuizzes.keys());
  }
}

// ============================================================================
// CLUSTER RESULT AGGREGATION
// ============================================================================

export function aggregateClusterResults(results: QuizResult[]): ClusterResult {
  if (results.length === 0) {
    throw new Error('No results to aggregate');
  }

  // Get cluster from first result
  const cluster = results[0].cluster;

  // Count zones
  const scores = { flow: 0, spark: 0, talk: 0 };
  results.forEach(r => {
    scores[r.zone]++;
  });

  // Determine primary zone (highest score)
  const primaryZone = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)[0][0] as Zone;

  return {
    cluster,
    quizzes: results,
    primaryZone,
    scores
  };
}

// ============================================================================
// DROP GENERATION
// ============================================================================

export function generateDrop(clusterResult: ClusterResult): DuoDrop {
  // Aggregate tokens from all quiz results
  const aggregatedTokens = aggregateTokens(clusterResult.quizzes);

  // Determine profile archetype based on cluster scores
  const archetype = determineArchetype(clusterResult);

  return {
    id: `drop_${clusterResult.cluster}_${Date.now()}`,
    cluster: clusterResult.cluster,
    primaryZone: clusterResult.primaryZone,
    insightStrength: aggregatedTokens.insightStrength,
    insightGrowth: aggregatedTokens.insightGrowth,
    microStep: aggregatedTokens.microStep,
    generatedAt: Date.now(),
    profileArchetype: archetype
  };
}

function aggregateTokens(quizzes: QuizResult[]): {
  insightStrength: string;
  insightGrowth: string;
  microStep: string;
} {
  // For MVP: use first quiz's tokens
  // In production: use AI to synthesize based on all tokens
  const primaryQuiz = quizzes[0];
  
  return {
    insightStrength: primaryQuiz.tokens.insightStrength,
    insightGrowth: primaryQuiz.tokens.insightGrowth,
    microStep: primaryQuiz.tokens.microStep,
  };
}

function determineArchetype(clusterResult: ClusterResult): string {
  const { cluster, scores } = clusterResult;

  // Determine archetype based on highest score
  if (cluster === 'passion') {
    if (scores.flow >= 3) return 'flame_duo';
    if (scores.spark >= 3) return 'flame_duo';
    return 'mosaic_duo';
  } else if (cluster === 'stability') {
    if (scores.flow >= 3) return 'harbor_duo';
    if (scores.spark >= 3) return 'harbor_duo';
    return 'mosaic_duo';
  } else { // future
    if (scores.flow >= 3) return 'horizon_duo';
    if (scores.spark >= 3) return 'horizon_duo';
    return 'mosaic_duo';
  }
}

// ============================================================================
// BUFF SYSTEM
// ============================================================================

export function unlockBuff(clusterResult: ClusterResult): ActiveBuff | null {
  const clusterKey = clusterResult.cluster;
  const buffInfo = CLUSTER_BUFFS.find(b => b.id === clusterKey);
  
  if (!buffInfo) return null;

  const now = Date.now();
  const durationMs = buffInfo.durationDays * 24 * 60 * 60 * 1000;

  return {
    buffId: `${clusterKey}_${now}`,
    cluster: clusterKey,
    activatedAt: now,
    expiresAt: now + durationMs,
    affectedTraits: buffInfo.affectedTraits
  };
}

export function isBuffActive(buff: ActiveBuff): boolean {
  return Date.now() < buff.expiresAt;
}

export function getRemainingBuffDays(buff: ActiveBuff): number {
  const remaining = buff.expiresAt - Date.now();
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

// ============================================================================
// TRAIT UPDATE LOGIC
// ============================================================================

export function calculateTraitUpdates(
  clusterResult: ClusterResult,
  activeBuffs: ActiveBuff[]
): Map<string, TraitLevel> {
  const updates = new Map<string, TraitLevel>();
  const cluster = clusterResult.cluster;

  // Map cluster to affected traits
  const clusterTraitMap: Record<string, string[]> = {
    passion: ['closeness', 'play', 'appreciation'],
    stability: ['repair', 'ritual', 'boundaries'],
    future: ['alignment', 'fairness', 'clarity']
  };

  const affectedTraits = clusterTraitMap[cluster] || [];

  // Calculate new levels based on zone
  affectedTraits.forEach(traitKey => {
    const currentLevel: TraitLevel = 'medium'; // Get from current state in production
    
    // Update based on primary zone
    let newLevel: TraitLevel;
    
    switch (clusterResult.primaryZone) {
      case 'flow':
        newLevel = 'high';
        break;
      case 'spark':
        newLevel = 'high';
        break;
      case 'talk':
        newLevel = 'building';
        break;
      default:
        newLevel = currentLevel;
    }

    updates.set(traitKey, newLevel);
  });

  // Apply buff modifiers
  activeBuffs.forEach(buff => {
    buff.affectedTraits.forEach(traitKey => {
      const current = updates.get(traitKey) || 'medium';
      // Buffs provide temporary boost
      if (current === 'high') {
        updates.set(traitKey, 'high');
      } else if (current === 'medium') {
        updates.set(traitKey, 'medium');
      }
    });
  });

  return updates;
}

// ============================================================================
// SHARED INSIGHT GENERATION (FOR KI)
// ============================================================================

export interface KIInsightRequest {
  cluster: string;
  zoneScores: { flow: number; spark: number; talk: number };
  quizResults: QuizResult[];
  coupleHistory: DuoDrop[];
  activeBuffs: ActiveBuff[];
  locale: 'de' | 'en';
}

export function prepareKIContext(request: KIInsightRequest): object {
  return {
    system_prompt: "Du bist QuissMe, ein Beziehungs-Ritual für Paare. Generiere eine warme, spielerische Deutung.",
    task: "Schreibe einen kurzen Insight-Drop (2-3 Sätze) basierend auf den Quiz-Ergebnissen.",
    constraints: [
      "Nur Möglichkeitsform ('kann', 'oft', 'manchmal')",
      "Immer systemisch ('zwischen euch', 'in eurer Dynamik')",
      "Keine Diagnosen oder Labels",
      "Keine Angstsignale oder Druck"
    ],
    input: {
      cluster: request.cluster,
      zones: request.zoneScores,
      history_count: request.coupleHistory.length,
      active_buffs: request.activeBuffs.map(b => b.cluster),
      locale: request.locale
    },
    quiz_summary: request.quizResults.map(r => ({
      id: r.quizId,
      zone: r.zone,
      insight: r.tokens.insightStrength
    })),
    output_format: {
      style: "warm, playful, encouraging",
      length: "2-3 sentences",
      language: request.locale === 'de' ? "German" : "English"
    }
  };
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

export function getQuizById(id: string): Quiz | undefined {
  return MOSAIC_QUIZZES.find(q => q.id === id);
}

export function getQuizzesByCluster(cluster: 'passion' | 'stability' | 'future'): Quiz[] {
  return MOSAIC_QUIZZES.filter(q => q.hiddenCluster === cluster);
}

export function getBuffByCluster(cluster: string): Buff | undefined {
  return CLUSTER_BUFFS.find(b => b.id === cluster);
}
