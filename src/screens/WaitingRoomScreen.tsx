import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type WaitingRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WaitingRoom'>;
  route: RouteProp<RootStackParamList, 'WaitingRoom'>;
};

export default function WaitingRoomScreen({ navigation, route }: WaitingRoomScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation for the sync icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Simulate partner joining after 5 seconds (for demo)
    const timer = setTimeout(() => {
      navigation.navigate('Dashboard');
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.syncCircle,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Text style={styles.syncIcon}>⟳</Text>
          </Animated.View>
        </Animated.View>

        <Text style={styles.title}>Warten auf Partner...</Text>
        <Text style={styles.subtitle}>
          Sobald {route.params?.inviteCode || 'dein Partner'} beigetreten ist, startet eure Reise.
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusDotActive} />
            <Text style={styles.statusText}>Du bist bereit ✓</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusDotWaiting} />
            <Text style={styles.statusText}>Warte auf Partner...</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Abbrechen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 100,
    alignItems: 'center',
  },
  syncCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(91, 70, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.5)',
  },
  syncIcon: {
    fontSize: 48,
    color: theme.colors.violet,
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
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    maxWidth: 280,
  },
  statusCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.md,
  },
  statusDotWaiting: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.warning,
    marginRight: theme.spacing.md,
    animation: 'pulse 1s infinite',
  },
  statusText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  cancelBtn: {
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.lg,
  },
  cancelText: {
    color: theme.colors.muted,
    fontSize: 16,
  },
});
