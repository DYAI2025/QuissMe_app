import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api, storage } from '../utils/api';

const ITEM_ICONS: Record<string, string> = {
  plant: '\u{1F33A}', land: '\u{1F3DD}', deco: '\u{1FA94}',
  crystal_lily: '\u{1F338}', prism_rose: '\u{1F339}', facet_fern: '\u{1F33F}',
  moss_tile: '\u{1F332}', water_shard: '\u{1F4A7}', earth_chunk: '\u{26F0}',
  glow_lantern: '\u{1F3EE}', star_stone: '\u2B50', crystal_shard: '\u{1F48E}',
};

export default function RewardChoiceScreen() {
  const router = useRouter();
  const { cycleId } = useLocalSearchParams<{ cycleId: string }>();
  const [cycle, setCycle] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { if (cycleId) setCycle(await api.getCycle(cycleId)); } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleChoose = async () => {
    if (!selected || !cycleId) return;
    try {
      const uid = await storage.getUserId();
      const cid = await storage.getCoupleId();
      if (uid && cid) {
        await api.placeGardenItem({ couple_id: cid, user_id: uid, item_id: selected, position_x: Math.random() * 200, position_y: Math.random() * 200 });
      }
      router.replace('/(tabs)');
    } catch (e) { console.error(e); }
  };

  if (loading) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.warm.gold} /></View>;

  const choices = cycle?.reward_choices || [];
  const zone = cycle?.zone || 'flow';
  const zoneColor = COLORS.resonance[zone as keyof typeof COLORS.resonance]?.primary || COLORS.warm.gold;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.brand}>QuissMe</Text>
        <Text style={styles.title}>Deine Belohnung</Text>
        <Text style={styles.subtitle}>Wähle ein Stück für euren Garten</Text>

        <View style={styles.choicesContainer}>
          {choices.map((item: any) => {
            const isSelected = selected === item.id;
            const icon = ITEM_ICONS[item.id] || ITEM_ICONS[item.category] || '\u{1F33F}';
            return (
              <TouchableOpacity
                key={item.id}
                testID={`reward-${item.id}`}
                style={[styles.choiceCard, isSelected && { borderColor: zoneColor }]}
                onPress={() => setSelected(item.id)}
                activeOpacity={0.8}
              >
                <BlurView intensity={isSelected ? 25 : 12} tint="dark" style={styles.choiceBlur}>
                  <View style={styles.choiceInner}>
                    <Text style={styles.choiceIcon}>{icon}</Text>
                    <Text style={styles.choiceName}>{item.name}</Text>
                    <Text style={styles.choiceCategory}>
                      {item.category === 'plant' ? 'Pflanze' : item.category === 'land' ? 'Landstück' : 'Deko'}
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          testID="confirm-reward"
          style={[styles.confirmButton, !selected && styles.confirmDisabled]}
          onPress={handleChoose}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmText}>In den Garten pflanzen</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1232' },
  loadContainer: { flex: 1, backgroundColor: '#1C1232', justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1, paddingHorizontal: SPACING.l },
  brand: { fontSize: 22, fontWeight: '700', color: COLORS.warm.text, fontStyle: 'italic', textAlign: 'center', marginTop: SPACING.xl },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.warm.text, textAlign: 'center', marginTop: SPACING.s },
  subtitle: { fontSize: 15, color: COLORS.warm.textSub, textAlign: 'center', marginBottom: SPACING.xxl },
  choicesContainer: { gap: SPACING.m, flex: 1, justifyContent: 'center' },
  choiceCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  choiceBlur: { borderRadius: RADIUS.card, overflow: 'hidden' },
  choiceInner: { padding: SPACING.xl, alignItems: 'center' },
  choiceIcon: { fontSize: 48, marginBottom: SPACING.m },
  choiceName: { fontSize: 18, fontWeight: '700', color: COLORS.warm.text },
  choiceCategory: { fontSize: 13, color: COLORS.warm.textSub, marginTop: SPACING.xs },
  confirmButton: { backgroundColor: COLORS.warm.gold, borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginBottom: SPACING.xxl },
  confirmDisabled: { opacity: 0.4 },
  confirmText: { color: '#1C1232', fontSize: 17, fontWeight: '700' },
});
