import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type SynchronizationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Synchronization'>;
};

export default function SynchronizationScreen({ navigation }: SynchronizationScreenProps) {
  const scale1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate both circles converging
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale1, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scale2, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      // Merge animation
      Animated.parallel([
        Animated.timing(scale1, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale2, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulse animation for the merged state
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate after animation
    const timer = setTimeout(() => {
      navigation.replace('InsightDrop', { result: { compatibility: 85 } });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {/* Left circle (You) */}
        <Animated.View
          style={[
            styles.circle,
            styles.circleLeft,
            {
              transform: [
                { scale: scale1 },
                { translateX: scale1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                })},
              ],
            },
          ]}
        >
          <Text style={styles.circleEmoji}>😊</Text>
          <Text style={styles.circleLabel}>Du</Text>
        </Animated.View>

        {/* Right circle (Partner) */}
        <Animated.View
          style={[
            styles.circle,
            styles.circleRight,
            {
              transform: [
                { scale: scale2 },
                { translateX: scale2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })},
              ],
            },
          ]}
        >
          <Text style={styles.circleEmoji}>🥰</Text>
          <Text style={styles.circleLabel}>Partner</Text>
        </Animated.View>

        {/* Merged result */}
        <Animated.View
          style={[
            styles.mergedCircle,
            {
              opacity,
              transform: [{ scale: pulse }],
            },
          ]}
        >
          <Text style={styles.mergedEmoji}>💫</Text>
          <Text style={styles.mergedLabel}>Verbunden</Text>
        </Animated.View>
      </View>

      <Text style={styles.title}>Synchronisation...</Text>
      <Text style={styles.subtitle}>Eure Antworten werden zusammengeführt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  circle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.panel,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  circleLeft: {
    left: 10,
    borderColor: theme.colors.indigo,
  },
  circleRight: {
    right: 10,
    borderColor: theme.colors.violet,
  },
  circleEmoji: {
    fontSize: 32,
  },
  circleLabel: {
    position: 'absolute',
    bottom: -24,
    fontSize: 12,
    color: theme.colors.muted,
  },
  mergedCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(91, 70, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.violet,
  },
  mergedEmoji: {
    fontSize: 40,
  },
  mergedLabel: {
    position: 'absolute',
    bottom: -28,
    fontSize: 14,
    color: theme.colors.violet,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
  },
});
