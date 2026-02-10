import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS, CLUSTER_INFO, STATE_VISUALS } from '../../utils/theme';
import { api, storage } from '../../utils/api';

export default function ExploreTab() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setQuizzes(await api.getQuizzes()); } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.night.accent} /></View>;

  const sectors = [
    { key: 'passion', label: 'Leidenschaft', color: COLORS.sector.passion, icon: '\u{1F525}' },
    { key: 'stability', label: 'Stabilität', color: COLORS.sector.stability, icon: '\u{1F343}' },
    { key: 'future', label: 'Zukunft', color: COLORS.sector.future, icon: '\u2728' },
  ];

  const clusterToSector: Record<string, string> = { words: 'passion', touch: 'passion', time: 'stability', service: 'stability', gifts: 'future' };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.brand}>Entdecken</Text>
          <Text style={styles.subtitle}>Die fünf Stimmen der Liebe</Text>

          {sectors.map(sector => (
            <View key={sector.key} style={styles.sectorGroup}>
              <View style={styles.sectorHeader}>
                <View style={[styles.sectorDot, { backgroundColor: sector.color }]} />
                <Text style={styles.sectorLabel}>{sector.icon} {sector.label}</Text>
              </View>
              {quizzes.filter(q => clusterToSector[q.hidden_cluster] === sector.key).map(q => {
                const info = CLUSTER_INFO[q.hidden_cluster] || { de: 'Quiz', icon: '\u2728' };
                return (
                  <TouchableOpacity key={q.id} testID={`explore-quiz-${q.id}`} style={styles.quizCard} activeOpacity={0.8}
                    onPress={async () => {
                      const uid = await storage.getUserId();
                      const cid = await storage.getCoupleId();
                      router.push({ pathname: '/quiz', params: { quizId: q.id, userId: uid || '', coupleId: cid || 'solo' } });
                    }}>
                    <BlurView intensity={12} tint="dark" style={styles.quizBlur}>
                      <View style={styles.quizInner}>
                        <Text style={styles.quizIcon}>{info.icon}</Text>
                        <View style={styles.quizInfo}>
                          <Text style={styles.quizTitle}>{info.de}</Text>
                          <Text style={styles.quizMeta}>{q.question_count || 10} Fragen</Text>
                        </View>
                        <Text style={styles.quizArrow}>{'\u203A'}</Text>
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night.bg },
  loadContainer: { flex: 1, backgroundColor: COLORS.night.bg, justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  scroll: { padding: SPACING.l, paddingBottom: 100 },
  brand: { fontSize: 24, fontWeight: '700', color: COLORS.night.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: COLORS.night.textSub, marginBottom: SPACING.xl },
  sectorGroup: { marginBottom: SPACING.xl },
  sectorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.m },
  sectorDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.s },
  sectorLabel: { fontSize: 16, fontWeight: '600', color: COLORS.night.text },
  quizCard: { marginBottom: SPACING.s },
  quizBlur: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border },
  quizInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, paddingHorizontal: SPACING.l },
  quizIcon: { fontSize: 24, marginRight: SPACING.m },
  quizInfo: { flex: 1 },
  quizTitle: { fontSize: 15, fontWeight: '600', color: COLORS.night.text },
  quizMeta: { fontSize: 12, color: COLORS.night.textSub, marginTop: 2 },
  quizArrow: { fontSize: 24, color: COLORS.night.textSub },
});
