import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
};

// Placeholder screens - to be implemented
export function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌟</Text>
      <Text style={styles.title}>Die Reise der Synchronisation</Text>
      <Text style={styles.desc}>Entdecke eure kosmische Verbindung</Text>
    </View>
  );
}

export function BirthInputScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📅</Text>
      <Text style={styles.title}>Deine Geburtsdaten</Text>
    </View>
  );
}

export function AstroResultScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>♊</Text>
      <Text style={styles.title}>Dein Astro-Profil</Text>
    </View>
  );
}

export function PartnerInviteScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💌</Text>
      <Text style={styles.title}>Partner einladen</Text>
    </View>
  );
}

export function WaitingRoomScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>Warten auf Partner...</Text>
    </View>
  );
}

export function BlindModeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎯</Text>
      <Text style={styles.title}>Blind-Mode Quiz</Text>
    </View>
  );
}

export function SynchronizationScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✨</Text>
      <Text style={styles.title}>Synchronisation...</Text>
    </View>
  );
}

export function InsightDropScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🏆</Text>
      <Text style={styles.title}>Insight Drop</Text>
    </View>
  );
}

export function BuffsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✨</Text>
      <Text style={styles.title}>Buffs & Challenges</Text>
    </View>
  );
}

export function WishesScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💝</Text>
      <Text style={styles.title}>Deine Wünsche</Text>
    </View>
  );
}

export function SettingsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚙️</Text>
      <Text style={styles.title}>Einstellungen</Text>
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
