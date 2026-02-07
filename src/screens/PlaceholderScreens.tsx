import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
};

export function PartnerInviteScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💌</Text>
      <Text style={styles.title}>Partner einladen</Text>
      <Text style={styles.desc}>QR Code / Magic Link</Text>
    </View>
  );
}

export function WaitingRoomScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>Warten auf Partner...</Text>
      <Text style={styles.desc}>Zeigarnik-Effekt</Text>
    </View>
  );
}

export function BlindModeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎯</Text>
      <Text style={styles.title}>Blind-Mode Quiz</Text>
      <Text style={styles.desc}>Fragen beantworten</Text>
    </View>
  );
}

export function SynchronizationScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✨</Text>
      <Text style={styles.title}>Synchronisation...</Text>
      <Text style={styles.desc}>Merge Animation</Text>
    </View>
  );
}

export function InsightDropScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🏆</Text>
      <Text style={styles.title}>Insight Drop</Text>
      <Text style={styles.desc}>Ergebnis + Trophy</Text>
    </View>
  );
}

export function BuffsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✨</Text>
      <Text style={styles.title}>Buffs & Challenges</Text>
      <Text style={styles.desc}>Daily Missions</Text>
    </View>
  );
}

export function WishesScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💝</Text>
      <Text style={styles.title}>Deine Wünsche</Text>
      <Text style={styles.desc}>KI-Rewrite</Text>
    </View>
  );
}

export function SettingsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚙️</Text>
      <Text style={styles.title}>Einstellungen</Text>
      <Text style={styles.desc}>Profil & mehr</Text>
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
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
