import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const coupleName = "Alex & Sam";
  const daysTogether = 420;
  const syncScore = 85;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.coupleAvatar}>
          <Text style={styles.avatarEmoji}>💑</Text>
        </View>
        <Text style={styles.coupleName}>{coupleName}</Text>
        <Text style={styles.daysTogether}>{daysTogether} Tage zusammen</Text>
      </View>

      <View style={styles.syncCard}>
        <Text style={styles.syncLabel}>Synchronisations-Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.syncScore}>{syncScore}%</Text>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreFill, { width: `${syncScore}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('BlindMode')}
        >
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={styles.actionTitle}>Neues Quiz</Text>
          <Text style={styles.actionDesc}>Gemeinsam synchronisieren</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Buffs')}
        >
          <Text style={styles.actionIcon}>✨</Text>
          <Text style={styles.actionTitle}>Buffs</Text>
          <Text style={styles.actionDesc}>Daily Challenges</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Wishes')}
        >
          <Text style={styles.actionIcon}>💝</Text>
          <Text style={styles.actionTitle}>Wünsche</Text>
          <Text style={styles.actionDesc}>Was dir wichtig ist</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionTitle}>Einstellungen</Text>
          <Text style={styles.actionDesc}>Profil & mehr</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Letzte Insights</Text>
        
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>🧘</Text>
            <Text style={styles.insightTitle}>Harmonie-Welle</Text>
          </View>
          <Text style={styles.insightDesc}>
            Ihr beide schätzt gleiche Dinge im Alltag. Das stärkt eure Verbindung.
          </Text>
          <Text style={styles.insightDate}>Vor 2 Tagen</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  coupleAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(91, 70, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  avatarEmoji: {
    fontSize: 50,
  },
  coupleName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  daysTogether: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  syncCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    margin: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  syncLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  syncScore: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.violet,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  scoreFill: {
    height: '100%',
    backgroundColor: theme.colors.violet,
    borderRadius: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  recentSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  insightCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  insightDesc: {
    fontSize: 14,
    color: theme.colors.muted,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  insightDate: {
    fontSize: 12,
    color: theme.colors.muted,
  },
});
