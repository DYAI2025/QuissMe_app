import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../utils/theme';
import { storage } from '../utils/api';

export default function WaitingScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const dotAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    dotAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    });

    // Auto-check - in production this would poll the API
    const timer = setTimeout(async () => {
      const coupleId = await storage.getCoupleId();
      if (coupleId) {
        router.replace({ pathname: '/match', params: { coupleId } });
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleSkipToDemo = async () => {
    router.push('/dashboard');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.pulseCircle, { opacity: pulseAnim }]} />

          <Text style={styles.title}>Warten auf Partner:in</Text>

          <View style={styles.dotsRow}>
            {dotAnims.map((anim, i) => (
              <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
            ))}
          </View>

          <Text style={styles.subtitle}>
            Sobald dein:e Partner:in die Geburtsdaten eingegeben hat, berechnen wir eure gemeinsame Deutung.
          </Text>

          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>In der Zwischenzeit</Text>
            <Text style={styles.tipText}>Teile den Einladungscode mit deinem/deiner Partner:in, damit er/sie beitreten kann.</Text>
          </View>
        </View>

        <TouchableOpacity testID="skip-demo-button" style={styles.skipButton} onPress={handleSkipToDemo} activeOpacity={0.7}>
          <Text style={styles.skipText}>Dashboard ansehen</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night.bg },
  safeArea: { flex: 1, paddingHorizontal: SPACING.l },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pulseCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.night.accent,
    marginBottom: SPACING.xl,
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.night.textPrimary, marginBottom: SPACING.m },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.l },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.night.accent },
  subtitle: { fontSize: 15, color: COLORS.night.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  tipLabel: { fontSize: 13, color: COLORS.dusk.gold, fontWeight: '600', marginBottom: SPACING.s, textTransform: 'uppercase', letterSpacing: 0.5 },
  tipText: { fontSize: 14, color: COLORS.night.textSecondary, lineHeight: 22 },
  skipButton: { alignItems: 'center', paddingVertical: SPACING.l },
  skipText: { color: COLORS.night.textSecondary, fontSize: 15 },
});
