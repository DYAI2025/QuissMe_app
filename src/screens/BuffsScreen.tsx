import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type BuffsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Buffs'>;
};

const activeBuff = {
  name: 'Harmonie-Welle',
  desc: '+Geduld, -Konflikte',
  icon: '🧘',
  timeLeft: '2 Tage 4 Std',
};

const challenges = [
  { id: 1, name: 'Liebesflüsterer', desc: 'Überrasche deinen Partner', icon: '💝', reward: '+50 XP' },
  { id: 2, name: '2-Minuten Check-in', desc: 'Was war gut? Was brauchen wir?', icon: '🎯', reward: '+30 XP' },
  { id: 3, name: 'Team-Modus', desc: 'Eine Entscheidung gemeinsam', icon: '🤝', reward: '+40 XP' },
];

const stats = [
  { label: 'Challenges', value: '12' },
  { label: 'Buffs', value: '3' },
  { label: 'XP', value: '1.2k' },
];

export default function BuffsScreen({ navigation }: BuffsScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buffs & Challenges</Text>
        <View style={styles.streakBadge}>
          <Text>🔥 7 Tage</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Aktiver Buff</Text>
      
      <View style={styles.buffCard}>
        <View style={styles.buffHeader}>
          <View style={styles.buffIcon}>
            <Text style={{ fontSize: 32 }}>{activeBuff.icon}</Text>
          </View>
          <View style={styles.buffInfo}>
            <Text style={styles.buffName}>{activeBuff.name}</Text>
            <Text style={styles.buffDesc}>{activeBuff.desc}</Text>
          </View>
        </View>
        <View style={styles.buffTimer}>
          <Text>⏱️ Noch {activeBuff.timeLeft}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Tägliche Challenges</Text>

      <View style={styles.challengesList}>
        {challenges.map((challenge) => (
          <TouchableOpacity key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeIcon}>
              <Text style={{ fontSize: 24 }}>{challenge.icon}</Text>
            </View>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.challengeDesc}>{challenge.desc}</Text>
            </View>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>{challenge.reward}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsBar}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  streakBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  buffCard: {
    background: 'linear-gradient(135deg, rgba(91,70,255,0.15), rgba(167,139,250,0.1))',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(91,70,255,0.3)',
  },
  buffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buffIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(91,70,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  buffInfo: {
    flex: 1,
  },
  buffName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  buffDesc: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  buffTimer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: theme.spacing.md,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  challengesList: {
    gap: theme.spacing.md,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  challengeContent: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  rewardBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rewardText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.indigo,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
