import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, CLUSTER_INFO, STATE_VISUALS } from '../../utils/theme';
import { api, storage } from '../../utils/api';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(width - 48, 340);
const CENTER_R = WHEEL_SIZE * 0.2;
const NODE_SIZE = 48;
const RING_RADIUS = (WHEEL_SIZE - NODE_SIZE) / 2 - 6;

// Sector arc segments for visual background
const SECTOR_ARCS = [
  { key: 'passion', color: COLORS.sector.passion, label: 'Leidenschaft', startAngle: -90, span: 120 },
  { key: 'stability', color: COLORS.sector.stability, label: 'Stabilität', startAngle: 30, span: 120 },
  { key: 'future', color: COLORS.sector.future, label: 'Zukunft', startAngle: 150, span: 120 },
];

export default function DashboardHome() {
  const router = useRouter();
  const [wheel, setWheel] = useState<any>(null);
  const [garden, setGarden] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');
  const [coupleId, setCoupleId] = useState('');
  const [tooltip, setTooltip] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const uid = await storage.getUserId();
      const cid = await storage.getCoupleId();
      setUserId(uid || '');
      setCoupleId(cid || '');
      if (uid && cid) {
        const [w, g] = await Promise.all([api.getQuizWheel(cid, uid), api.getGarden(cid)]);
        setWheel(w);
        setGarden(g?.garden);
      } else if (uid) {
        const quizzes = await api.getQuizzes();
        setWheel({
          nodes: quizzes.map((q: any) => ({
            quiz_id: q.id, cluster: q.hidden_cluster, state: 'available',
            sector: q.sector || 'passion', question_count: q.question_count || 10,
            facet_label: q.facet_label,
          })),
          seeds_remaining: 3, slots_remaining: 3, can_activate: true,
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleNodePress = async (node: any) => {
    // Show tooltip first on press
    const info = CLUSTER_INFO[node.cluster] || { de: node.facet_label?.['de-DE'] || 'Quiz' };
    setTooltip(info.de);
    setTimeout(() => setTooltip(null), 2000);

    if (node.state === 'ready_to_reveal' && node.cycle_id) {
      router.push({ pathname: '/insight-drop', params: { cycleId: node.cycle_id } });
    } else if (node.state === 'available') {
      if (coupleId) {
        try {
          const cycle = await api.activateQuiz({ user_id: userId, couple_id: coupleId, quiz_id: node.quiz_id });
          router.push({ pathname: '/quiz', params: { quizId: node.quiz_id, cycleId: cycle.id, userId, coupleId } });
        } catch (e) { console.error(e); }
      } else {
        router.push({ pathname: '/quiz', params: { quizId: node.quiz_id, userId, coupleId: 'solo' } });
      }
    } else if ((node.state === 'activated_by_me' || node.state === 'activated_by_partner' || node.state === 'completed_by_partner_waiting') && node.cycle_id) {
      router.push({ pathname: '/quiz', params: { quizId: node.quiz_id, cycleId: node.cycle_id, userId, coupleId } });
    }
  };

  const nodes = wheel?.nodes || [];
  const gardenItems = garden?.items || [];

  // Group nodes by sector for positioned layout
  const sectorNodes: Record<string, any[]> = { passion: [], stability: [], future: [] };
  nodes.forEach((n: any) => {
    const s = n.sector || 'passion';
    if (sectorNodes[s]) sectorNodes[s].push(n);
    else sectorNodes.passion.push(n);
  });

  // Position nodes in a circle grouped by sector
  const getNodePos = (sectorIndex: number, nodeIndex: number, sectorNodeCount: number) => {
    const sectorStart = (-90 + sectorIndex * 120) * (Math.PI / 180);
    const sectorSpan = 110 * (Math.PI / 180); // Slightly less than full arc to leave gaps
    const angleOffset = sectorNodeCount > 1 ? (nodeIndex / (sectorNodeCount - 1)) * sectorSpan : sectorSpan / 2;
    const angle = sectorStart + 5 * (Math.PI / 180) + angleOffset;
    return {
      left: WHEEL_SIZE / 2 + RING_RADIUS * Math.cos(angle) - NODE_SIZE / 2,
      top: WHEEL_SIZE / 2 + RING_RADIUS * Math.sin(angle) - NODE_SIZE / 2,
    };
  };

  if (loading) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.warm.gold} /></View>;

  return (
    <LinearGradient colors={['#151028', '#1A1335', '#0F1B2D']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.warm.gold} />}
        >
          <View style={styles.header}>
            <Text style={styles.brand}>QuissMe</Text>
            <Text style={styles.subtitle}>Euer Cluster-Kranz</Text>
          </View>

          {/* Seeds Status */}
          <View style={styles.seedsRow}>
            <View style={styles.seedChip}>
              <Text style={styles.seedIcon}>{'\u{1F331}'}</Text>
              <Text style={styles.seedText}>{wheel?.seeds_remaining || 0} Samen diese Woche</Text>
            </View>
          </View>

          {/* WHEEL */}
          <View style={[styles.wheelContainer, { width: WHEEL_SIZE, height: WHEEL_SIZE }]} testID="quiz-wheel">

            {/* Sector arcs (visual background rings) */}
            {SECTOR_ARCS.map((arc) => {
              const startRad = arc.startAngle * (Math.PI / 180);
              const endRad = (arc.startAngle + arc.span) * (Math.PI / 180);
              // Use dots to indicate sector
              const dots = Array.from({ length: 8 }, (_, i) => {
                const a = startRad + (i / 7) * (endRad - startRad);
                return {
                  x: WHEEL_SIZE / 2 + (RING_RADIUS + 1) * Math.cos(a),
                  y: WHEEL_SIZE / 2 + (RING_RADIUS + 1) * Math.sin(a),
                };
              });
              return dots.map((d, di) => (
                <View key={`${arc.key}_${di}`} style={[styles.sectorDot, { left: d.x - 2, top: d.y - 2, backgroundColor: arc.color, opacity: 0.25 }]} />
              ));
            })}

            {/* Dashed ring */}
            <View style={[styles.ring, { width: RING_RADIUS * 2 + NODE_SIZE, height: RING_RADIUS * 2 + NODE_SIZE, borderRadius: RING_RADIUS + NODE_SIZE / 2 }]} />

            {/* Center Garden */}
            <View style={[styles.gardenCenter, { width: CENTER_R * 2, height: CENTER_R * 2, borderRadius: CENTER_R }]}>
              <LinearGradient colors={['rgba(45,212,191,0.12)', 'rgba(167,139,250,0.08)']} style={styles.gardenGradient}>
                <Text style={styles.gardenIcon}>{gardenItems.length > 0 ? '\u{1F33F}' : '\u{1F3DD}'}</Text>
                <Text style={styles.gardenLabel}>Garten</Text>
                {gardenItems.length > 0 ? <Text style={styles.gardenCount}>{gardenItems.length}</Text> : null}
              </LinearGradient>
            </View>

            {/* Sector Labels */}
            {SECTOR_ARCS.map((arc) => {
              const midAngle = (arc.startAngle + arc.span / 2) * (Math.PI / 180);
              const labelR = CENTER_R + 20;
              return (
                <Text key={`label_${arc.key}`} style={[styles.sectorLabel, {
                  left: WHEEL_SIZE / 2 + labelR * Math.cos(midAngle) - 30,
                  top: WHEEL_SIZE / 2 + labelR * Math.sin(midAngle) - 8,
                  color: arc.color,
                }]}>{arc.label}</Text>
              );
            })}

            {/* Quiz Nodes by Sector */}
            {(['passion', 'stability', 'future'] as const).map((sectorKey, si) => {
              const sNodes = sectorNodes[sectorKey] || [];
              return sNodes.map((node: any, ni: number) => {
                const pos = getNodePos(si, ni, sNodes.length);
                const vis = STATE_VISUALS[node.state] || STATE_VISUALS.available;
                const info = CLUSTER_INFO[node.cluster] || { de: 'Quiz', icon: '\u2728' };
                const sectorColor = COLORS.sector[sectorKey];
                const isReveal = node.state === 'ready_to_reveal';
                const isActive = !['available', 'revealed'].includes(node.state);
                const isWaiting = node.state === 'completed_by_me_waiting';

                return (
                  <TouchableOpacity
                    key={node.quiz_id}
                    testID={`wheel-node-${node.quiz_id}`}
                    style={[
                      styles.node,
                      { left: pos.left, top: pos.top },
                      isReveal && { borderColor: COLORS.warm.gold, backgroundColor: 'rgba(212,163,56,0.2)' },
                      isActive && !isReveal && { borderColor: vis.color, backgroundColor: `${vis.color}22` },
                      !isActive && { borderColor: `${sectorColor}44`, backgroundColor: 'rgba(255,255,255,0.04)' },
                      isWaiting && { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.15)' },
                    ]}
                    onPress={() => handleNodePress(node)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.nodeIcon}>{vis.badge || info.icon}</Text>
                    {isReveal ? <View style={styles.nodeGlow} /> : null}
                  </TouchableOpacity>
                );
              });
            })}
          </View>

          {/* Tooltip */}
          {tooltip ? (
            <View style={styles.tooltipBox}>
              <Text style={styles.tooltipText}>{tooltip}</Text>
            </View>
          ) : null}

          {/* Active Quizzes List */}
          {nodes.filter((n: any) => !['available', 'revealed'].includes(n.state)).length > 0 ? (
            <View style={styles.activeSection}>
              <Text style={styles.sectionTitle}>Aktive Quizze</Text>
              {nodes.filter((n: any) => !['available', 'revealed'].includes(n.state)).map((node: any) => {
                const vis = STATE_VISUALS[node.state] || STATE_VISUALS.available;
                const info = CLUSTER_INFO[node.cluster] || { de: node.facet_label?.['de-DE'] || 'Quiz', icon: '\u2728' };
                return (
                  <TouchableOpacity key={node.quiz_id + '_active'} style={styles.activeCard} onPress={() => handleNodePress(node)} activeOpacity={0.8}>
                    <View style={[styles.activeDot, { backgroundColor: vis.color }]} />
                    <View style={styles.activeInfo}>
                      <Text style={styles.activeTitle}>{info.de}</Text>
                      <Text style={styles.activeStatus}>{vis.badge} {vis.label}</Text>
                    </View>
                    {node.state === 'ready_to_reveal' ? (
                      <View style={styles.revealBadge}><Text style={styles.revealBadgeText}>Aufdecken</Text></View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <BlurView intensity={10} tint="dark" style={styles.hintCard}>
              <View style={styles.hintInner}>
                <Text style={styles.hintIcon}>{'\u{1F331}'}</Text>
                <Text style={styles.hintTitle}>Euer Kranz wartet</Text>
                <Text style={styles.hintText}>Tippe auf einen Knoten im Kranz, um ein Quiz zu starten. Pro Woche stehen euch 3 Samen zur Verfügung.</Text>
              </View>
            </BlurView>
          )}

          {!coupleId ? (
            <TouchableOpacity testID="invite-cta" style={styles.inviteCta} onPress={() => router.push('/invite')} activeOpacity={0.8}>
              <Text style={styles.inviteCtaText}>Partner:in einladen</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadContainer: { flex: 1, backgroundColor: '#151028', justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  scroll: { padding: SPACING.l, paddingBottom: 100, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: SPACING.m, width: '100%' },
  brand: { fontSize: 26, fontWeight: '700', color: COLORS.warm.text, fontStyle: 'italic' },
  subtitle: { fontSize: 14, color: COLORS.night.textSub, marginTop: 2 },
  seedsRow: { marginBottom: SPACING.l },
  seedChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212,163,56,0.12)', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: 'rgba(212,163,56,0.2)' },
  seedIcon: { fontSize: 16 },
  seedText: { fontSize: 13, color: COLORS.warm.gold, fontWeight: '500' },
  wheelContainer: { alignSelf: 'center', marginBottom: SPACING.l },
  ring: { position: 'absolute', left: 0, top: 0, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed' },
  sectorDot: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
  gardenCenter: { position: 'absolute', overflow: 'hidden', left: '50%', top: '50%', marginLeft: -WHEEL_SIZE * 0.2, marginTop: -WHEEL_SIZE * 0.2 },
  gardenGradient: { flex: 1, borderRadius: WHEEL_SIZE * 0.2, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)' },
  gardenIcon: { fontSize: 24 },
  gardenLabel: { fontSize: 10, color: COLORS.night.textSub, fontWeight: '600', marginTop: 2 },
  gardenCount: { fontSize: 10, color: COLORS.warm.gold },
  sectorLabel: { position: 'absolute', fontSize: 9, fontWeight: '700', width: 60, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.6 },
  node: { position: 'absolute', width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  nodeIcon: { fontSize: 18 },
  nodeGlow: { position: 'absolute', width: NODE_SIZE + 8, height: NODE_SIZE + 8, borderRadius: (NODE_SIZE + 8) / 2, borderWidth: 2, borderColor: 'rgba(212,163,56,0.4)' },
  tooltipBox: { backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: SPACING.m },
  tooltipText: { color: COLORS.warm.text, fontSize: 13, fontWeight: '500' },
  activeSection: { width: '100%', marginTop: SPACING.m },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.night.text, marginBottom: SPACING.m },
  activeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.night.card, borderRadius: 16, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: COLORS.glass.border },
  activeDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.m },
  activeInfo: { flex: 1 },
  activeTitle: { fontSize: 15, fontWeight: '600', color: COLORS.night.text },
  activeStatus: { fontSize: 12, color: COLORS.night.textSub, marginTop: 2 },
  revealBadge: { backgroundColor: 'rgba(212,163,56,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(212,163,56,0.3)' },
  revealBadgeText: { fontSize: 11, color: COLORS.warm.gold, fontWeight: '700' },
  hintCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border, width: '100%' },
  hintInner: { padding: SPACING.xl, alignItems: 'center' },
  hintIcon: { fontSize: 32, marginBottom: SPACING.s },
  hintTitle: { fontSize: 16, fontWeight: '600', color: COLORS.night.text },
  hintText: { fontSize: 13, color: COLORS.night.textSub, textAlign: 'center', marginTop: SPACING.xs, lineHeight: 20 },
  inviteCta: { backgroundColor: COLORS.night.accent, borderRadius: 9999, paddingVertical: 16, alignItems: 'center', width: '100%', marginTop: SPACING.l },
  inviteCtaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});
