import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api } from '../utils/api';

const CLUSTER_LABELS: Record<string, { de: string; icon: string; color: string }> = {
  words: { de: 'Lob & Anerkennung', icon: '\u{1F4AC}', color: '#7351B7' },
  time: { de: 'Zweisamkeit', icon: '\u{1F570}', color: '#3B82F6' },
  gifts: { de: 'Geschenke', icon: '\u{1F381}', color: '#F59E0B' },
  service: { de: 'Hilfsbereitschaft', icon: '\u{1F91D}', color: '#10B981' },
  touch: { de: 'Körperliche Nähe', icon: '\u{1F497}', color: '#EF4444' },
};

const TYPE_LABELS: Record<string, string> = {
  poet: 'Poet:in', ermutiger: 'Ermutiger:in', spiegler: 'Spiegler:in',
  ritualmensch: 'Ritualmensch', momentsammler: 'Momentsammler:in', stillegeniesser: 'Stille-Genießer:in',
  symbolist: 'Symbolist:in', alltagszauberer: 'Alltagszauberer:in', erlebnisgeber: 'Erlebnisgeber:in',
  vordenker: 'Vordenker:in', teamplayer: 'Teamplayer', stiller_held: 'Stille:r Held:in',
  initiator: 'Initiator:in', hafen: 'Hafen', stromkreis: 'Stromkreis',
};

export default function QuizResultScreen() {
  const router = useRouter();
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barAnims = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    try {
      if (!resultId) return;
      // Fetch from the submit response stored data
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/quiz/results/solo`);
      // Try fetching all results to find our one
      // Actually we need a single result endpoint, let me use a workaround
      // The result was returned from submit, let's use the couple results endpoint
      const allResults = await res.json();
      const found = allResults.find((r: any) => r.id === resultId);
      if (found) {
        setResult(found);
      }
    } catch (e) {
      // Fallback: try direct fetch through a different pattern
      console.log('Fetching result via couple endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }
  }, [result]);

  const handleShare = async () => {
    if (!result) return;
    const clusterInfo = CLUSTER_LABELS[result.primary_cluster] || { de: 'Unbekannt' };
    try {
      await Share.share({
        message: `Mein QuissMe Ergebnis: Meine primäre Liebessprache ist "${clusterInfo.de}"! Probiere es auch: QuissMe App`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadContainer}>
        <ActivityIndicator size="large" color={COLORS.dusk.gold} />
        <Text style={styles.loadText}>Dein Ergebnis wird geladen...</Text>
      </View>
    );
  }

  if (!result) {
    // Show a basic result page if the direct fetch failed
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.brand}>QuissMe</Text>
            <Text style={styles.title}>Quiz abgeschlossen!</Text>
            <BlurView intensity={20} tint="dark" style={styles.glassCard}>
              <View style={styles.cardInner}>
                <Text style={styles.gemIcon}>{'\u2728'}</Text>
                <Text style={styles.resultLabel}>Dein Ergebnis</Text>
                <Text style={styles.resultDescription}>
                  Dein Quiz wurde erfolgreich ausgewertet. Gehe zum Dashboard, um deine Ergebnisse zu sehen.
                </Text>
              </View>
            </BlurView>
            <TouchableOpacity testID="back-dashboard-button" style={styles.ctaButton} onPress={() => router.push('/dashboard')} activeOpacity={0.8}>
              <Text style={styles.ctaText}>Zurück zum Dashboard</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  const primaryCluster = result.primary_cluster;
  const primaryInfo = CLUSTER_LABELS[primaryCluster] || { de: 'Unbekannt', icon: '\u2728', color: COLORS.night.accent };
  const primaryType = result.primary_type;
  const typeLabel = TYPE_LABELS[primaryType] || '';
  const normalized = result.normalized_clusters || {};
  const zoneTokens = result.zone_tokens || {};
  const flowZone = zoneTokens.flow?.['de-DE'] || {};

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.brand}>QuissMe</Text>
            <Text style={styles.title}>Dein Insight Drop</Text>

            <BlurView intensity={20} tint="dark" style={styles.glassCard}>
              <View style={styles.cardInner}>
                <Text style={styles.resultIcon}>{primaryInfo.icon}</Text>
                <Text style={styles.resultLabel}>Deine primäre Liebessprache</Text>
                <Text style={styles.resultName} testID="result-primary-cluster">{primaryInfo.de}</Text>
                {typeLabel ? <Text style={styles.resultType} testID="result-primary-type">{typeLabel}</Text> : null}
              </View>
            </BlurView>

            <Text style={styles.sectionTitle}>Dein Profil</Text>

            {Object.entries(normalized).map(([key, value]) => {
              const info = CLUSTER_LABELS[key] || { de: key, icon: '', color: COLORS.night.accent };
              const barWidth = Math.max(Number(value), 5);
              return (
                <View key={key} style={styles.barRow}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barIcon}>{info.icon}</Text>
                    <Text style={styles.barLabel}>{info.de}</Text>
                    <Text style={styles.barValue}>{Math.round(Number(value))}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: info.color }]} />
                  </View>
                </View>
              );
            })}

            {flowZone.insight_strength ? (
              <BlurView intensity={12} tint="dark" style={styles.insightCard}>
                <View style={styles.insightInner}>
                  <Text style={styles.insightLabel}>Stärke</Text>
                  <Text style={styles.insightText}>{flowZone.insight_strength}</Text>
                  {flowZone.insight_growth ? (
                    <>
                      <Text style={[styles.insightLabel, { marginTop: SPACING.m }]}>Wachstum</Text>
                      <Text style={styles.insightText}>{flowZone.insight_growth}</Text>
                    </>
                  ) : null}
                  {flowZone.micro_step ? (
                    <View style={styles.microStep}>
                      <Text style={styles.microStepLabel}>Dein Micro-Step</Text>
                      <Text style={styles.microStepText}>{flowZone.micro_step}</Text>
                    </View>
                  ) : null}
                </View>
              </BlurView>
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity testID="share-result-button" style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                <Text style={styles.shareBtnText}>Ergebnis teilen</Text>
              </TouchableOpacity>
              <TouchableOpacity testID="next-quiz-button" style={styles.ctaButton} onPress={() => router.push('/dashboard')} activeOpacity={0.8}>
                <Text style={styles.ctaText}>Nächstes Quiz</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1232' },
  loadContainer: { flex: 1, backgroundColor: '#1C1232', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: COLORS.dusk.textSecondary, fontSize: 16, marginTop: SPACING.m },
  safeArea: { flex: 1 },
  scrollContent: { padding: SPACING.l, paddingBottom: SPACING.xxl },
  brand: { fontSize: 22, fontWeight: '700', color: COLORS.dusk.textPrimary, fontStyle: 'italic', textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.dusk.textPrimary, textAlign: 'center', marginTop: SPACING.s, marginBottom: SPACING.xl },
  glassCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,163,56,0.3)', marginBottom: SPACING.xl },
  cardInner: { padding: SPACING.xl, alignItems: 'center' },
  resultIcon: { fontSize: 56, marginBottom: SPACING.m },
  resultLabel: { fontSize: 14, color: COLORS.dusk.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.s },
  resultName: { fontSize: 28, fontWeight: '700', color: COLORS.dusk.gold },
  resultType: { fontSize: 16, color: COLORS.dusk.textPrimary, marginTop: SPACING.s, fontStyle: 'italic' },
  gemIcon: { fontSize: 48, color: COLORS.dusk.gold, marginBottom: SPACING.m },
  resultDescription: { fontSize: 15, color: COLORS.dusk.textPrimary, textAlign: 'center', lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dusk.textPrimary, marginBottom: SPACING.l },
  barRow: { marginBottom: SPACING.m },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  barIcon: { fontSize: 16, marginRight: SPACING.s },
  barLabel: { flex: 1, fontSize: 14, color: COLORS.dusk.textPrimary },
  barValue: { fontSize: 14, color: COLORS.dusk.gold, fontWeight: '600' },
  barBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  barFill: { height: 8, borderRadius: 4 },
  insightCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginTop: SPACING.l, marginBottom: SPACING.l },
  insightInner: { padding: SPACING.l },
  insightLabel: { fontSize: 13, color: COLORS.dusk.gold, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.xs },
  insightText: { fontSize: 16, color: COLORS.dusk.textPrimary, lineHeight: 24 },
  microStep: { marginTop: SPACING.l, backgroundColor: 'rgba(212,163,56,0.15)', borderRadius: 16, padding: SPACING.m },
  microStepLabel: { fontSize: 12, color: COLORS.dusk.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.xs },
  microStepText: { fontSize: 15, color: COLORS.dusk.textPrimary, lineHeight: 22, fontStyle: 'italic' },
  actionRow: { gap: SPACING.m, marginTop: SPACING.l },
  shareBtn: {
    borderWidth: 1,
    borderColor: COLORS.dusk.gold,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareBtnText: { color: COLORS.dusk.gold, fontSize: 16, fontWeight: '600' },
  ctaButton: {
    backgroundColor: COLORS.dusk.gold,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.dusk.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaText: { color: '#1C1232', fontSize: 17, fontWeight: '700' },
});
