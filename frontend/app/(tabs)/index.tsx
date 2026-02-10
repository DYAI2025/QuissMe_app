import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS, CLUSTER_INFO, STATE_VISUALS } from '../../utils/theme';
import { api, storage } from '../../utils/api';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width - 64;
const CENTER_SIZE = WHEEL_SIZE * 0.38;
const NODE_SIZE = 56;

export default function DashboardHome() {
  const router = useRouter();
  const [wheel, setWheel] = useState<any>(null);
  const [garden, setGarden] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');
  const [coupleId, setCoupleId] = useState('');

  const loadData = useCallback(async () => {
    try {
      const uid = await storage.getUserId();
      const cid = await storage.getCoupleId();
      setUserId(uid || '');
      setCoupleId(cid || '');
      if (uid && cid) {
        const [w, g] = await Promise.all([
          api.getQuizWheel(cid, uid),
          api.getGarden(cid),
        ]);
        setWheel(w);
        setGarden(g?.garden);
      } else if (uid) {
        const quizzes = await api.getQuizzes();
        setWheel({ nodes: quizzes.map((q: any) => ({ quiz_id: q.id, cluster: q.hidden_cluster, state: 'available', sector: 'passion', question_count: q.question_count || 10 })), seeds_remaining: 3, slots_remaining: 3, can_activate: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleNodePress = async (node: any) => {
    if (node.state === 'ready_to_reveal' && node.cycle_id) {
      router.push({ pathname: '/insight-drop', params: { cycleId: node.cycle_id } });
    } else if (node.state === 'available' && wheel?.can_activate && coupleId) {
      try {
        const cycle = await api.activateQuiz({ user_id: userId, couple_id: coupleId, quiz_id: node.quiz_id });
        router.push({ pathname: '/quiz', params: { quizId: node.quiz_id, cycleId: cycle.id, userId, coupleId } });
      } catch (e: any) {
        console.error(e);
      }
    } else if (node.state === 'available' && !coupleId) {
      router.push({ pathname: '/quiz', params: { quizId: node.quiz_id, userId, coupleId: 'solo' } });
    } else if (node.state === 'activated_by_me' || node.state === 'activated_by_partner') {
      if (node.cycle_id) {
        router.push({ pathname: '/quiz', params: { quizId: node.quiz_id, cycleId: node.cycle_id, userId, coupleId } });
      }
    } else if (node.state === 'completed_by_partner_waiting' && node.cycle_id) {
      router.push({ pathname: '/quiz', params: { quizId: node.quiz_id, cycleId: node.cycle_id, userId, coupleId } });
    }
  };

  const nodes = wheel?.nodes || [];
  const gardenItems = garden?.items || [];
  const gardenLevel = garden?.level || 1;

  // Position nodes in a circle
  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const ringRadius = (WHEEL_SIZE - NODE_SIZE) / 2 - 4;
    return {
      left: WHEEL_SIZE / 2 + ringRadius * Math.cos(angle) - NODE_SIZE / 2,
      top: WHEEL_SIZE / 2 + ringRadius * Math.sin(angle) - NODE_SIZE / 2,
    };
  };

  if (loading) {
    return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.night.accent} /></View>;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.night.accent} />}
        >
          <Text style={styles.brand}>QuissMe</Text>

          {/* Seeds / Slots Status */}
          {coupleId ? (
            <View style={styles.statusRow}>
              <View style={styles.statusChip}>
                <Text style={styles.statusIcon}>{'\u{1F331}'}</Text>
                <Text style={styles.statusText}>{wheel?.seeds_remaining || 0} Samen</Text>
              </View>
              <View style={styles.statusChip}>
                <Text style={styles.statusIcon}>{'\u{1F33F}'}</Text>
                <Text style={styles.statusText}>{gardenItems.length} Pflanzen</Text>
              </View>
              <View style={styles.statusChip}>
                <Text style={styles.statusIcon}>{'\u2728'}</Text>
                <Text style={styles.statusText}>Lvl {gardenLevel}</Text>
              </View>
            </View>
          ) : null}

          {/* Wheel + Garden Center */}
          <View style={styles.wheelContainer} testID="quiz-wheel">
            {/* Ring background */}
            <View style={[styles.wheelRing, { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2 }]} />

            {/* Center Garden */}
            <View style={[styles.gardenCenter, { width: CENTER_SIZE, height: CENTER_SIZE, borderRadius: CENTER_SIZE / 2 }]}>
              <BlurView intensity={15} tint="dark" style={styles.gardenBlur}>
                <View style={styles.gardenContent}>
                  <Text style={styles.gardenEmoji}>{'\u{1F3DD}'}</Text>
                  <Text style={styles.gardenLabel}>Euer Garten</Text>
                  <Text style={styles.gardenCount}>{gardenItems.length} Stücke</Text>
                </View>
              </BlurView>
            </View>

            {/* Quiz Nodes */}
            {nodes.map((node: any, i: number) => {
              const pos = getNodePosition(i, nodes.length);
              const vis = STATE_VISUALS[node.state] || STATE_VISUALS.available;
              const info = CLUSTER_INFO[node.cluster] || { de: 'Quiz', icon: '\u2728', sector: 'passion' };
              const sectorColor = COLORS.sector[node.sector as keyof typeof COLORS.sector] || COLORS.night.accent;
              const isActive = node.state !== 'available' && node.state !== 'revealed';
              const isRevealable = node.state === 'ready_to_reveal';

              return (
                <TouchableOpacity
                  key={node.quiz_id}
                  testID={`wheel-node-${node.quiz_id}`}
                  style={[
                    styles.wheelNode,
                    {
                      left: pos.left,
                      top: pos.top,
                      backgroundColor: isRevealable ? COLORS.warm.gold : (isActive ? vis.color : node.state === 'available' ? COLORS.night.surface : '#1A2740'),
                      borderColor: isRevealable ? COLORS.warm.gold : sectorColor,
                    },
                  ]}
                  onPress={() => handleNodePress(node)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.nodeIcon}>{vis.badge || info.icon}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Wheel Legend */}
          <View style={styles.legendContainer}>
            {nodes.filter((n: any) => n.state !== 'available').length > 0 ? (
              nodes.filter((n: any) => n.state !== 'available').map((node: any) => {
                const vis = STATE_VISUALS[node.state] || STATE_VISUALS.available;
                const info = CLUSTER_INFO[node.cluster] || { de: 'Quiz', icon: '\u2728' };
                return (
                  <TouchableOpacity key={node.quiz_id + '_legend'} style={styles.legendItem} onPress={() => handleNodePress(node)} activeOpacity={0.8}>
                    <View style={[styles.legendDot, { backgroundColor: vis.color }]} />
                    <View style={styles.legendInfo}>
                      <Text style={styles.legendTitle}>{info.de}</Text>
                      <Text style={styles.legendStatus}>{vis.label}</Text>
                    </View>
                    {node.state === 'ready_to_reveal' ? <Text style={styles.legendCta}>{'\u2728'}</Text> : null}
                  </TouchableOpacity>
                );
              })
            ) : (
              <BlurView intensity={12} tint="dark" style={styles.emptyCard}>
                <View style={styles.emptyInner}>
                  <Text style={styles.emptyIcon}>{'\u{1F331}'}</Text>
                  <Text style={styles.emptyTitle}>Wähle ein Quiz im Kranz</Text>
                  <Text style={styles.emptySubtitle}>Tippe auf einen Knoten, um eure Reise zu starten</Text>
                </View>
              </BlurView>
            )}
          </View>
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
  brand: { fontSize: 24, fontWeight: '700', color: COLORS.night.text, fontStyle: 'italic', marginBottom: SPACING.m },
  statusRow: { flexDirection: 'row', gap: SPACING.s, marginBottom: SPACING.l },
  statusChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.night.card, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6, gap: 6, borderWidth: 1, borderColor: COLORS.glass.border },
  statusIcon: { fontSize: 14 },
  statusText: { fontSize: 12, color: COLORS.night.textSub, fontWeight: '500' },
  wheelContainer: { width: WHEEL_SIZE, height: WHEEL_SIZE, alignSelf: 'center', marginBottom: SPACING.xl },
  wheelRing: { position: 'absolute', borderWidth: 2, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed' },
  gardenCenter: { position: 'absolute', left: (WHEEL_SIZE - WHEEL_SIZE * 0.38) / 2, top: (WHEEL_SIZE - WHEEL_SIZE * 0.38) / 2, overflow: 'hidden' },
  gardenBlur: { flex: 1, borderRadius: WHEEL_SIZE * 0.19, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border },
  gardenContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.s },
  gardenEmoji: { fontSize: 28 },
  gardenLabel: { fontSize: 11, color: COLORS.night.textSub, marginTop: 4, fontWeight: '600' },
  gardenCount: { fontSize: 10, color: COLORS.night.textSub, opacity: 0.7 },
  wheelNode: { position: 'absolute', width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  nodeIcon: { fontSize: 20 },
  legendContainer: { gap: SPACING.s },
  legendItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.night.card, borderRadius: 16, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.glass.border },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: SPACING.m },
  legendInfo: { flex: 1 },
  legendTitle: { fontSize: 15, fontWeight: '600', color: COLORS.night.text },
  legendStatus: { fontSize: 12, color: COLORS.night.textSub, marginTop: 2 },
  legendCta: { fontSize: 20 },
  emptyCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border },
  emptyInner: { padding: SPACING.xl, alignItems: 'center' },
  emptyIcon: { fontSize: 32, marginBottom: SPACING.s },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.night.text },
  emptySubtitle: { fontSize: 13, color: COLORS.night.textSub, textAlign: 'center', marginTop: SPACING.xs },
});
