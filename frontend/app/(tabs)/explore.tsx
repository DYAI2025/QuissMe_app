import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, CLUSTER_INFO } from '../../utils/theme';
import { api, storage } from '../../utils/api';

const SECTORS = [
  { key: 'passion', label: 'Leidenschaft', color: COLORS.sector.passion, icon: '\u{1F525}', desc: 'Begehren, Nähe, Anziehung' },
  { key: 'stability', label: 'Stabilität', color: COLORS.sector.stability, icon: '\u{1F343}', desc: 'Sicherheit, Alltag, Reparatur' },
  { key: 'future', label: 'Zukunft', color: COLORS.sector.future, icon: '\u2728', desc: 'Visionen, Geschenke, Träume' },
];

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

  if (loading) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.warm.gold} /></View>;

  return (
    <LinearGradient colors={['#151028', '#1A1335', '#0F1B2D']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.brand}>Entdecken</Text>
          <Text style={styles.subtitle}>Alle Quiz-Cluster im Überblick</Text>

          {SECTORS.map(sector => {
            const sectorQuizzes = quizzes.filter(q => q.sector === sector.key);
            return (
              <View key={sector.key} style={styles.sectorGroup}>
                <View style={styles.sectorHeader}>
                  <View style={[styles.sectorLine, { backgroundColor: sector.color }]} />
                  <View>
                    <Text style={[styles.sectorTitle, { color: sector.color }]}>{sector.icon} {sector.label}</Text>
                    <Text style={styles.sectorDesc}>{sector.desc}</Text>
                  </View>
                  <Text style={styles.sectorCount}>{sectorQuizzes.length}</Text>
                </View>

                {sectorQuizzes.map(q => {
                  const info = CLUSTER_INFO[q.hidden_cluster] || { de: q.facet_label?.['de-DE'] || 'Quiz', icon: '\u2728' };
                  const facetName = q.facet_label?.['de-DE'] || info.de;
                  const questionCount = q.question_count || 1;
                  const category = q.category === 'love_languages' ? 'Liebessprache' :
                    q.category === 'reibung_reparatur' ? 'Reibung & Reparatur' : 'Paar-Dynamik';
                  return (
                    <TouchableOpacity
                      key={q.id}
                      testID={`explore-quiz-${q.id}`}
                      style={styles.quizCard}
                      activeOpacity={0.8}
                      onPress={async () => {
                        const uid = await storage.getUserId();
                        const cid = await storage.getCoupleId();
                        router.push({ pathname: '/quiz', params: { quizId: q.id, userId: uid || '', coupleId: cid || 'solo' } });
                      }}
                    >
                      <BlurView intensity={10} tint="dark" style={styles.quizBlur}>
                        <View style={styles.quizInner}>
                          <View style={[styles.quizDot, { backgroundColor: sector.color }]} />
                          <View style={styles.quizInfo}>
                            <Text style={styles.quizTitle}>{facetName}</Text>
                            <Text style={styles.quizMeta}>{category} · {questionCount} {questionCount === 1 ? 'Frage' : 'Fragen'}</Text>
                          </View>
                          <Text style={styles.quizArrow}>{'\u203A'}</Text>
                        </View>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadContainer: { flex: 1, backgroundColor: '#151028', justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  scroll: { padding: SPACING.l, paddingBottom: 100 },
  brand: { fontSize: 24, fontWeight: '700', color: COLORS.warm.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: COLORS.night.textSub, marginBottom: SPACING.xl },
  sectorGroup: { marginBottom: SPACING.xl },
  sectorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.m, gap: SPACING.m },
  sectorLine: { width: 3, height: 36, borderRadius: 2 },
  sectorTitle: { fontSize: 17, fontWeight: '700' },
  sectorDesc: { fontSize: 12, color: COLORS.night.textSub, marginTop: 2 },
  sectorCount: { marginLeft: 'auto', fontSize: 13, color: COLORS.night.textSub, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  quizCard: { marginBottom: SPACING.s },
  quizBlur: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border },
  quizInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, paddingHorizontal: SPACING.l },
  quizDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.m },
  quizInfo: { flex: 1 },
  quizTitle: { fontSize: 15, fontWeight: '600', color: COLORS.night.text },
  quizMeta: { fontSize: 12, color: COLORS.night.textSub, marginTop: 2 },
  quizArrow: { fontSize: 24, color: COLORS.night.textSub },
});
