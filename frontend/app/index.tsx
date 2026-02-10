import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../utils/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const starAnims = useRef(
    Array.from({ length: 12 }, () => ({
      opacity: new Animated.Value(0),
      x: Math.random() * width,
      y: Math.random() * height * 0.6,
      size: Math.random() * 3 + 1,
    }))
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleFade, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    starAnims.forEach((star, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(star.opacity, { toValue: 0.8, duration: 1000 + i * 200, useNativeDriver: true }),
          Animated.timing(star.opacity, { toValue: 0.2, duration: 1000 + i * 200, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {starAnims.map((star, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      <SafeAreaView style={styles.content}>
        <View style={styles.topSpace} />

        <Animated.View style={[styles.brandContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.brandName} testID="brand-name">QuissMe</Text>
          <View style={styles.brandLine} />
          <Text style={styles.brandTagline}>Entertainment first. Connection always.</Text>
        </Animated.View>

        <Animated.View style={[styles.bottomContainer, { opacity: subtitleFade }]}>
          <TouchableOpacity
            testID="start-button"
            style={styles.startButton}
            onPress={() => router.push('/onboarding')}
            activeOpacity={0.8}
          >
            <Text style={styles.startText}>Tippen zum Starten</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Die Reise beginnt hier</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.night.bg,
  },
  star: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: COLORS.night.particles,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
  },
  topSpace: { flex: 1 },
  brandContainer: {
    alignItems: 'center',
    flex: 2,
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 52,
    fontWeight: '700',
    color: COLORS.night.textPrimary,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  brandLine: {
    width: 48,
    height: 2,
    backgroundColor: COLORS.night.accent,
    marginVertical: SPACING.m,
    borderRadius: 1,
  },
  brandTagline: {
    fontSize: 14,
    color: COLORS.night.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: SPACING.xl,
  },
  startButton: {
    backgroundColor: COLORS.night.accent,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.m,
    borderRadius: 9999,
    minWidth: 240,
    alignItems: 'center',
    shadowColor: COLORS.night.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  versionText: {
    color: COLORS.night.textSecondary,
    fontSize: 12,
    marginTop: SPACING.m,
    opacity: 0.6,
  },
});
