import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS, CLUSTER_INFO, TENDENCY_LABELS } from '../utils/theme';
import { api } from '../utils/api';

const ZONE_DISPLAY: Record<string, { label: string; icon: string; color: string }> = {
  flow: { label: 'Flow', icon: '\u{1F30A}', color: COLORS.resonance.flow.primary },
  spark: { label: 'Spark', icon: '\u{1F525}', color: COLORS.resonance.spark.primary },
  talk: { label: 'Talk', icon: '\u{1F4AC}', color: COLORS.resonance.talk.primary },
};

export default function InsightDropScreen() {
  const router = useRouter();
  const { cycleId } = useLocalSearchParams<{ cycleId: string }>();
  const [cycle, setCycle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => { loadCycle(); }, []);

  const loadCycle = async () => {
    try {
      if (cycleId) {
        const data = await api.getCycle(cycleId);
        setCycle(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReveal = async () => {
    if (!cycleId) return;
    setRevealing(true);
    try {
      const revealed = await api.revealQuiz(cycleId);
      setCycle(revealed);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    } catch (e) { console.error(e); }
    finally { setRevealing(false); }
  };

  useEffect(() => {
    if (cycle?.state === 'revealed') {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [cycle?.state]);

  if (loading) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.warm.gold} /><Text style={styles.loadText}>Wird geladen...</Text></View>;

  const result = cycle?.result || {};
  const zone = cycle?.zone || 'flow';
  const zoneInfo = ZONE_DISPLAY[zone] || ZONE_DISPLAY.flow;
  const buff = cycle?.buff;
  const tendencies = result.tendencies || {};
  const insightText = result.insight_text || '';
  const isRevealed = cycle?.state === 'revealed';
  const isReadyToReveal = cycle?.state === 'ready_to_reveal';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn" activeOpacity={0.7}>
            <Text style={styles.backText}>{'\u2190'} Zurück</Text>
          </TouchableOpacity>

          <Text style={styles.brand}>QuissMe</Text>
          <Text style={styles.title}>Dein Insight Drop</Text>

          {isReadyToReveal && !isRevealed ? (
            <View style={styles.revealSection}>
              <BlurView intensity={20} tint="dark" style={styles.revealCard}>
                <View style={styles.revealInner}>
                  <Text style={styles.revealIcon}>{'\u2728'}</Text>
                  <Text style={styles.revealTitle}>Beide fertig!</Text>
                  <Text style={styles.revealSubtitle}>Euer gemeinsamer Insight wartet auf euch</Text>
                </View>
              </BlurView>
              <TouchableOpacity testID="reveal-button" style={styles.revealButton} onPress={handleReveal} disabled={revealing} activeOpacity={0.8}>
                {revealing ? <ActivityIndicator color="#1C1232" /> : <Text style={styles.revealButtonText}>Insight aufdecken</Text>}
              </TouchableOpacity>
            </View>
          ) : null}

          {isRevealed ? (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              {/* Zone Resonance */}
              <BlurView intensity={20} tint="dark" style={styles.zoneCard}>
                <View style={styles.zoneInner}>
                  <Text style={styles.zoneIcon}>{zoneInfo.icon}</Text>
                  <Text style={styles.zoneLabel}>Eure Resonanz</Text>
                  <Text style={[styles.zoneName, { color: zoneInfo.color }]}>{zoneInfo.label}</Text>
                  {result.zone_sentence ? <Text style={styles.zoneSentence}>{result.zone_sentence}</Text> : null}
                </View>
              </BlurView>

              {/* Insight Text */}
              {insightText ? (
                <BlurView intensity={12} tint="dark" style={styles.insightCard}>
                  <View style={styles.insightInner}>
                    <Text style={styles.insightText}>{insightText}</Text>
                  </View>
                </BlurView>
              ) : null}

              {/* Tendencies (no %) */}
              <Text style={styles.sectionTitle}>Eure Tendenzen</Text>
              {Object.entries(tendencies).map(([key, level]) => {
                const info = CLUSTER_INFO[key] || { de: key, icon: '\u2728' };
                const tendencyInfo = TENDENCY_LABELS[level as string] || { de: String(level), icon: '' };
                return (
                  <View key={key} style={styles.tendencyRow}>
                    <Text style={styles.tendencyIcon}>{info.icon}</Text>
                    <View style={styles.tendencyInfo}>
                      <Text style={styles.tendencyName}>{info.de}</Text>
                      <Text style={[styles.tendencyLevel, { color: COLORS.tendency[level as keyof typeof COLORS.tendency] || COLORS.night.textSub }]}>{tendencyInfo.icon} {tendencyInfo.de}</Text>
                    </View>
                  </View>
                );
              })}

              {/* Buff */}
              {buff ? (
                <BlurView intensity={15} tint="dark" style={styles.buffCard}>
                  <View style={styles.buffInner}>
                    <Text style={styles.buffLabel}>Euer Buff</Text>
                    <Text style={styles.buffName}>{buff.name}</Text>
                    <Text style={styles.buffLine}>{buff.line1}</Text>
                    <View style={styles.buffAction}>
                      <Text style={styles.buffActionText}>{buff.line2}</Text>
                    </View>
                  </View>
                </BlurView>
              ) : null}

              {/* Reward CTA */}
              {cycle?.reward_choices ? (
                <TouchableOpacity testID="reward-choice-button" style={styles.rewardButton} onPress={() => router.push({ pathname: '/reward-choice', params: { cycleId: cycle.id } })} activeOpacity={0.8}>
                  <Text style={styles.rewardButtonText}>Belohnung wählen</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity testID="back-dashboard" style={styles.dashboardBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.7}>
                <Text style={styles.dashboardBtnText}>Zum Dashboard</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null}

          {!isReadyToReveal && !isRevealed ? (
            <View style={styles.waitingSection}>
              <Text style={styles.waitingIcon}>{'\u23F3'}</Text>
              <Text style={styles.waitingTitle}>Warte auf Partner:in</Text>
              <Text style={styles.waitingText}>Sobald beide fertig sind, könnt ihr euren Insight aufdecken.</Text>
              <TouchableOpacity testID="back-to-dashboard" style={styles.dashboardBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.7}>
                <Text style={styles.dashboardBtnText}>Zum Dashboard</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1232' },
  loadContainer: { flex: 1, backgroundColor: '#1C1232', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: COLORS.warm.textSub, fontSize: 16, marginTop: SPACING.m },
  safeArea: { flex: 1 },
  scroll: { padding: SPACING.l, paddingBottom: SPACING.xxl },
  backBtn: { paddingVertical: SPACING.s, marginBottom: SPACING.s },
  backText: { color: COLORS.warm.textSub, fontSize: 16 },
  brand: { fontSize: 22, fontWeight: '700', color: COLORS.warm.text, fontStyle: 'italic', textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.warm.text, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl },
  revealSection: { alignItems: 'center' },
  revealCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,163,56,0.3)', width: '100%', marginBottom: SPACING.xl },
  revealInner: { padding: SPACING.xxl, alignItems: 'center' },
  revealIcon: { fontSize: 56, marginBottom: SPACING.m },
  revealTitle: { fontSize: 24, fontWeight: '700', color: COLORS.warm.text },
  revealSubtitle: { fontSize: 15, color: COLORS.warm.textSub, textAlign: 'center', marginTop: SPACING.s },
  revealButton: { backgroundColor: COLORS.warm.gold, borderRadius: 9999, paddingVertical: 16, paddingHorizontal: SPACING.xxl, width: '100%', alignItems: 'center' },
  revealButtonText: { color: '#1C1232', fontSize: 17, fontWeight: '700' },
  zoneCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,163,56,0.3)', marginBottom: SPACING.l },
  zoneInner: { padding: SPACING.xl, alignItems: 'center' },
  zoneIcon: { fontSize: 48, marginBottom: SPACING.m },
  zoneLabel: { fontSize: 13, color: COLORS.warm.textSub, textTransform: 'uppercase', letterSpacing: 1 },
  zoneName: { fontSize: 32, fontWeight: '800', marginTop: SPACING.xs },
  zoneSentence: { fontSize: 15, color: COLORS.warm.text, textAlign: 'center', marginTop: SPACING.m, lineHeight: 24, fontStyle: 'italic' },
  insightCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: SPACING.l },
  insightInner: { padding: SPACING.l },
  insightText: { fontSize: 16, color: COLORS.warm.text, lineHeight: 26, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.warm.text, marginBottom: SPACING.m },
  tendencyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: SPACING.m, marginBottom: SPACING.s },
  tendencyIcon: { fontSize: 22, marginRight: SPACING.m },
  tendencyInfo: { flex: 1 },
  tendencyName: { fontSize: 15, fontWeight: '600', color: COLORS.warm.text },
  tendencyLevel: { fontSize: 13, marginTop: 2 },
  buffCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,163,56,0.3)', marginTop: SPACING.l, marginBottom: SPACING.l },
  buffInner: { padding: SPACING.l, alignItems: 'center' },
  buffLabel: { fontSize: 12, color: COLORS.warm.gold, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  buffName: { fontSize: 20, fontWeight: '700', color: COLORS.warm.text, marginTop: SPACING.s, marginBottom: SPACING.m },
  buffLine: { fontSize: 15, color: COLORS.warm.text, textAlign: 'center', lineHeight: 24 },
  buffAction: { backgroundColor: 'rgba(212,163,56,0.15)', borderRadius: 16, padding: SPACING.m, marginTop: SPACING.m, width: '100%' },
  buffActionText: { fontSize: 14, color: COLORS.warm.gold, textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
  rewardButton: { backgroundColor: COLORS.warm.gold, borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.m },
  rewardButtonText: { color: '#1C1232', fontSize: 17, fontWeight: '700' },
  dashboardBtn: { alignItems: 'center', paddingVertical: SPACING.m, marginTop: SPACING.s },
  dashboardBtnText: { color: COLORS.warm.textSub, fontSize: 15 },
  waitingSection: { alignItems: 'center', padding: SPACING.xxl },
  waitingIcon: { fontSize: 48, marginBottom: SPACING.m },
  waitingTitle: { fontSize: 22, fontWeight: '700', color: COLORS.warm.text, marginBottom: SPACING.s },
  waitingText: { fontSize: 15, color: COLORS.warm.textSub, textAlign: 'center', lineHeight: 24 },
});
