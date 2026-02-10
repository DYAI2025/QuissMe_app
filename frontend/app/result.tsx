import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api, storage } from '../utils/api';

const ZODIAC_ICONS: Record<string, string> = {
  'Widder': '\u2648', 'Stier': '\u2649', 'Zwillinge': '\u264A', 'Krebs': '\u264B',
  'Löwe': '\u264C', 'Jungfrau': '\u264D', 'Waage': '\u264E', 'Skorpion': '\u264F',
  'Schütze': '\u2650', 'Steinbock': '\u2651', 'Wassermann': '\u2652', 'Fische': '\u2653',
};

export default function ResultScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const id = userId || (await storage.getUserId());
      if (id) {
        const data = await api.getUser(id);
        setUser(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.night.accent} />
      </View>
    );
  }

  const astro = user?.astro_data;
  const sunSign = astro?.summary?.sternzeichen || astro?.western?.sunSign || 'Unbekannt';
  const moonSign = astro?.western?.moonSign || '';
  const chinese = astro?.summary?.chinesischesZeichen || '';
  const zodiacIcon = ZODIAC_ICONS[sunSign] || '\u2728';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.brand}>QuissMe</Text>

        <View style={styles.centerContent}>
          <BlurView intensity={18} tint="dark" style={styles.glassCard}>
            <View style={styles.cardInner}>
              <Text style={styles.zodiacIcon}>{zodiacIcon}</Text>
              <Text style={styles.signName} testID="sun-sign">{sunSign}</Text>
              {moonSign && moonSign !== 'Unbekannt' ? (
                <Text style={styles.detail}>Mond: {moonSign}</Text>
              ) : null}
              {chinese && chinese !== 'Unbekannt' ? (
                <Text style={styles.detail}>Chinesisch: {chinese}</Text>
              ) : null}
              <View style={styles.divider} />
              <Text style={styles.profileText}>
                Dein astrologisches Profil steht. Jetzt wird es spannend!
              </Text>
            </View>
          </BlurView>

          <Text style={styles.teaser}>
            Mit Partner:in matchen & Quiz-Reisen starten
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            testID="invite-partner-button"
            style={styles.primaryButton}
            onPress={() => router.push('/invite')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Partner:in einladen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="solo-quiz-button"
            style={styles.secondaryButton}
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Erst mal solo erkunden</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night.bg, justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', paddingHorizontal: SPACING.l },
  brand: { fontSize: 22, fontWeight: '700', color: COLORS.night.textPrimary, fontStyle: 'italic', textAlign: 'center', marginTop: SPACING.m },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glassCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border, width: '100%' },
  cardInner: { padding: SPACING.xl, alignItems: 'center' },
  zodiacIcon: { fontSize: 72, marginBottom: SPACING.m },
  signName: { fontSize: 32, fontWeight: '700', color: COLORS.night.textPrimary, marginBottom: SPACING.s },
  detail: { fontSize: 15, color: COLORS.night.textSecondary, marginBottom: SPACING.xs },
  divider: { width: 48, height: 2, backgroundColor: COLORS.night.accent, marginVertical: SPACING.l, borderRadius: 1 },
  profileText: { fontSize: 15, color: COLORS.night.textSecondary, textAlign: 'center', lineHeight: 22 },
  teaser: { fontSize: 14, color: COLORS.dusk.gold, textAlign: 'center', marginTop: SPACING.l, fontStyle: 'italic' },
  bottomActions: { paddingBottom: SPACING.xl },
  primaryButton: {
    backgroundColor: COLORS.night.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: SPACING.m,
    shadowColor: COLORS.night.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  secondaryButton: { alignItems: 'center', paddingVertical: SPACING.s },
  secondaryButtonText: { color: COLORS.night.textSecondary, fontSize: 15 },
});
