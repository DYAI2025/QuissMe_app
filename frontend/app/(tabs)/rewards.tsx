import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { api, storage } from '../../utils/api';

const { width } = Dimensions.get('window');
const GARDEN_SIZE = width - 64;

export default function RewardsTab() {
  const router = useRouter();
  const [garden, setGarden] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cid = await storage.getCoupleId();
        if (cid) { const g = await api.getGarden(cid); setGarden(g?.garden); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const items = garden?.items || [];

  if (loading) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.night.accent} /></View>;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.brand}>Euer Garten</Text>
          <Text style={styles.subtitle}>Hier wächst eure gemeinsame Welt</Text>

          {/* Garden Visualization */}
          <View style={styles.gardenContainer}>
            <View style={[styles.gardenIsland, { width: GARDEN_SIZE, height: GARDEN_SIZE }]}>
              {/* Core ring */}
              <View style={styles.gardenCore}>
                <Text style={styles.coreIcon}>{'\u{1F3DD}'}</Text>
              </View>

              {/* Placed items */}
              {items.map((item: any, i: number) => {
                const angle = (i / Math.max(items.length, 1)) * 2 * Math.PI;
                const radius = 40 + (i % 3) * 30;
                const x = GARDEN_SIZE / 2 + radius * Math.cos(angle) - 16;
                const y = GARDEN_SIZE / 2 + radius * Math.sin(angle) - 16;
                return (
                  <View key={item.id || i} style={[styles.gardenItem, { left: x, top: y }]}>
                    <Text style={styles.gardenItemIcon}>{'\u{1F33F}'}</Text>
                  </View>
                );
              })}

              {/* Ring indicators */}
              <View style={[styles.ring, { width: GARDEN_SIZE * 0.5, height: GARDEN_SIZE * 0.5, borderRadius: GARDEN_SIZE * 0.25 }]} />
              <View style={[styles.ring, { width: GARDEN_SIZE * 0.75, height: GARDEN_SIZE * 0.75, borderRadius: GARDEN_SIZE * 0.375 }]} />
            </View>
          </View>

          <BlurView intensity={12} tint="dark" style={styles.statsCard}>
            <View style={styles.statsInner}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{items.length}</Text>
                  <Text style={styles.statLabel}>Pflanzen</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{garden?.level || 1}</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{items.length > 0 ? 'Wächst' : 'Neu'}</Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>
            </View>
          </BlurView>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{'\u{1F331}'}</Text>
              <Text style={styles.emptyTitle}>Euer Garten wartet</Text>
              <Text style={styles.emptyText}>Schließt gemeinsam ein Quiz ab, um eure ersten Pflanzen zu verdienen</Text>
            </View>
          ) : null}
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
  gardenContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  gardenIsland: { backgroundColor: 'rgba(45,212,191,0.08)', borderRadius: 9999, borderWidth: 2, borderColor: 'rgba(45,212,191,0.15)', justifyContent: 'center', alignItems: 'center' },
  gardenCore: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(45,212,191,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  coreIcon: { fontSize: 28 },
  gardenItem: { position: 'absolute', width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  gardenItemIcon: { fontSize: 20 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed', top: '50%', left: '50%', marginLeft: '-37.5%', marginTop: '-37.5%' },
  statsCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border, marginBottom: SPACING.xl },
  statsInner: { padding: SPACING.l },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.warm.gold },
  statLabel: { fontSize: 12, color: COLORS.night.textSub, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },
  emptyState: { alignItems: 'center', padding: SPACING.xl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.m },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.night.text, marginBottom: SPACING.s },
  emptyText: { fontSize: 14, color: COLORS.night.textSub, textAlign: 'center', lineHeight: 22 },
});
