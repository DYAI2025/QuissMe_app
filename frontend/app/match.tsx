import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api, storage } from '../utils/api';

export default function MatchScreen() {
  const router = useRouter();
  const { coupleId } = useLocalSearchParams<{ coupleId: string }>();
  const [couple, setCouple] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCouple();
  }, []);

  const loadCouple = async () => {
    try {
      const id = coupleId || (await storage.getCoupleId());
      if (id) {
        const data = await api.getCouple(id);
        setCouple(data);
        await storage.setCoupleId(id);
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(scoreAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]).start();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadContainer}>
        <ActivityIndicator size="large" color={COLORS.dusk.gold} />
        <Text style={styles.loadText}>Eure Sterne werden gelesen...</Text>
      </View>
    );
  }

  const matchScore = couple?.match_score || 85;
  const interpretation = couple?.interpretation || 'Eure Verbindung ist etwas Besonderes.';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Text style={styles.brand}>QuissMe</Text>
            <Text style={styles.title}>Eure Begegnung</Text>

            <BlurView intensity={20} tint="dark" style={styles.glassCard}>
              <View style={styles.cardInner}>
                <Text style={styles.gemIcon}>{'\u2666'}</Text>
                <Text style={styles.syncLabel}>Eure Synchronität</Text>
                <Animated.Text style={[styles.scoreText, { opacity: scoreAnim }]} testID="match-score">
                  {Math.round(matchScore)}%
                </Animated.Text>
              </View>
            </BlurView>

            <BlurView intensity={15} tint="dark" style={styles.interpretCard}>
              <View style={styles.interpretInner}>
                <Text style={styles.interpretText} testID="interpretation-text">
                  {interpretation}
                </Text>
              </View>
            </BlurView>

            <TouchableOpacity
              testID="go-dashboard-button"
              style={styles.ctaButton}
              onPress={() => router.push('/dashboard')}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaText}>Zum Dashboard</Text>
            </TouchableOpacity>
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
  content: { alignItems: 'center' },
  brand: { fontSize: 22, fontWeight: '700', color: COLORS.dusk.textPrimary, fontStyle: 'italic', marginBottom: SPACING.s },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.dusk.textPrimary, marginBottom: SPACING.xl },
  glassCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,163,56,0.3)', width: '100%', marginBottom: SPACING.l },
  cardInner: { padding: SPACING.xl, alignItems: 'center' },
  gemIcon: { fontSize: 48, color: COLORS.dusk.gold, marginBottom: SPACING.m },
  syncLabel: { fontSize: 16, color: COLORS.dusk.textSecondary, marginBottom: SPACING.s },
  scoreText: { fontSize: 64, fontWeight: '800', color: COLORS.dusk.gold },
  interpretCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', width: '100%', marginBottom: SPACING.xl },
  interpretInner: { padding: SPACING.l },
  interpretText: { fontSize: 16, color: COLORS.dusk.textPrimary, lineHeight: 26, textAlign: 'center' },
  ctaButton: {
    backgroundColor: COLORS.dusk.gold,
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    width: '100%',
    shadowColor: COLORS.dusk.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaText: { color: '#1C1232', fontSize: 17, fontWeight: '700' },
});
