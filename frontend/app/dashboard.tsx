import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api, storage } from '../utils/api';

const CLUSTER_LABELS: Record<string, { de: string; icon: string }> = {
  words: { de: 'Lob & Anerkennung', icon: '\u{1F4AC}' },
  time: { de: 'Zweisamkeit', icon: '\u{1F570}' },
  gifts: { de: 'Geschenke', icon: '\u{1F381}' },
  service: { de: 'Hilfsbereitschaft', icon: '\u{1F91D}' },
  touch: { de: 'Körperliche Nähe', icon: '\u{1F497}' },
};

export default function DashboardScreen() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const uid = await storage.getUserId();
      const cid = await storage.getCoupleId();
      setUserId(uid);
      setCoupleId(cid);
      const q = await api.getQuizzes();
      setQuizzes(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleQuizStart = (quizId: string) => {
    router.push({ pathname: '/quiz', params: { quizId, userId: userId || '', coupleId: coupleId || '' } });
  };

  if (loading) {
    return (
      <View style={styles.loadContainer}>
        <ActivityIndicator size="large" color={COLORS.night.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.night.accent} />}
        >
          <View style={styles.header}>
            <Text style={styles.brand}>QuissMe</Text>
            <Text style={styles.greeting}>Willkommen zur Reise</Text>
          </View>

          <BlurView intensity={15} tint="dark" style={styles.statsCard}>
            <View style={styles.statsInner}>
              <Text style={styles.statsTitle}>Couple Dashboard</Text>
              <Text style={styles.statsSubtitle}>
                {coupleId ? 'Eure gemeinsame Reise hat begonnen' : 'Starte dein erstes Quiz'}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{quizzes.length}</Text>
                  <Text style={styles.statLabel}>Quizzes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>5</Text>
                  <Text style={styles.statLabel}>Cluster</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>50</Text>
                  <Text style={styles.statLabel}>Fragen</Text>
                </View>
              </View>
            </View>
          </BlurView>

          <Text style={styles.sectionTitle}>Die fünf Stimmen der Liebe</Text>
          <Text style={styles.sectionSubtitle}>Wähle ein Quiz und entdecke eure Liebessprache</Text>

          {quizzes.map((quiz) => {
            const cluster = quiz.hidden_cluster || '';
            const info = CLUSTER_LABELS[cluster] || { de: quiz.facet_label?.['de-DE'] || 'Quiz', icon: '\u2728' };
            return (
              <TouchableOpacity
                key={quiz.id}
                testID={`quiz-card-${quiz.id}`}
                style={styles.quizCard}
                onPress={() => handleQuizStart(quiz.id)}
                activeOpacity={0.8}
              >
                <BlurView intensity={12} tint="dark" style={styles.quizBlur}>
                  <View style={styles.quizInner}>
                    <Text style={styles.quizIcon}>{info.icon}</Text>
                    <View style={styles.quizInfo}>
                      <Text style={styles.quizTitle}>{info.de}</Text>
                      <Text style={styles.quizMeta}>{quiz.question_count || 10} Fragen</Text>
                    </View>
                    <Text style={styles.quizArrow}>{'\u203A'}</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            );
          })}

          {!coupleId && (
            <TouchableOpacity testID="invite-cta" style={styles.inviteCta} onPress={() => router.push('/invite')} activeOpacity={0.8}>
              <Text style={styles.inviteCtaText}>Partner:in einladen</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night.bg },
  loadContainer: { flex: 1, backgroundColor: COLORS.night.bg, justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  scrollContent: { padding: SPACING.l, paddingBottom: SPACING.xxl },
  header: { marginBottom: SPACING.l },
  brand: { fontSize: 22, fontWeight: '700', color: COLORS.night.textPrimary, fontStyle: 'italic' },
  greeting: { fontSize: 14, color: COLORS.night.textSecondary, marginTop: SPACING.xs },
  statsCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border, marginBottom: SPACING.xl },
  statsInner: { padding: SPACING.l },
  statsTitle: { fontSize: 20, fontWeight: '700', color: COLORS.night.textPrimary, marginBottom: SPACING.xs },
  statsSubtitle: { fontSize: 14, color: COLORS.night.textSecondary, marginBottom: SPACING.l },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: COLORS.dusk.gold },
  statLabel: { fontSize: 12, color: COLORS.night.textSecondary, marginTop: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.night.textPrimary, marginBottom: SPACING.xs },
  sectionSubtitle: { fontSize: 14, color: COLORS.night.textSecondary, marginBottom: SPACING.l },
  quizCard: { marginBottom: SPACING.m },
  quizBlur: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border },
  quizInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, paddingHorizontal: SPACING.l },
  quizIcon: { fontSize: 28, marginRight: SPACING.m },
  quizInfo: { flex: 1 },
  quizTitle: { fontSize: 16, fontWeight: '600', color: COLORS.night.textPrimary },
  quizMeta: { fontSize: 13, color: COLORS.night.textSecondary, marginTop: 2 },
  quizArrow: { fontSize: 28, color: COLORS.night.textSecondary },
  inviteCta: {
    backgroundColor: COLORS.night.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.l,
    shadowColor: COLORS.night.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  inviteCtaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});
