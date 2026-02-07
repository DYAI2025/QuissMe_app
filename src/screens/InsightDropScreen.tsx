import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type InsightDropScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'InsightDrop'>;
  route: RouteProp<RootStackParamList, 'InsightDrop'>;
};

const insights = {
  strength: {
    title: 'Harmonie in der Kommunikation',
    desc: 'Ihr beide schätzt ehrliche Gespräche. Das ist eure größte Stärke.',
    icon: '💬',
  },
  balance: {
    title: 'Ausgleich durch Gegensätze',
    desc: 'Während einer von euch impulsiv ist, bringt der andere Ruhe ins Spiel.',
    icon: '⚖️',
  },
  growth: {
    title: 'Gemeinsames Wachstum',
    desc: 'Eure unterschiedlichen Perspektiven bereichern euch beide.',
    icon: '🌱',
  },
};

export default function InsightDropScreen({ navigation }: InsightDropScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0b', '#1a1a2e']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.trophyContainer}>
            <Text style={styles.trophy}>🏆</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.score}>85%</Text>
              <Text style={styles.scoreLabel}>Match</Text>
            </View>
          </View>
          
          <Text style={styles.title}>Insight Drop</Text>
          <Text style={styles.subtitle}>Eure persönlichen Erkenntnisse</Text>
        </View>

        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.cardStrength]}>
            <Text style={styles.cardIcon}>{insights.strength.icon}</Text>
            <Text style={styles.cardTitle}>Stärke</Text>
            <Text style={styles.cardInsight}>{insights.strength.title}</Text>
            <Text style={styles.cardDesc}>{insights.strength.desc}</Text>
          </View>

          <View style={[styles.card, styles.cardBalance]}>
            <Text style={styles.cardIcon}>{insights.balance.icon}</Text>
            <Text style={styles.cardTitle}>Ausgleich</Text>
            <Text style={styles.cardInsight}>{insights.balance.title}</Text>
            <Text style={styles.cardDesc}>{insights.balance.desc}</Text>
          </View>

          <View style={[styles.card, styles.cardGrowth]}>
            <Text style={styles.cardIcon}>{insights.growth.icon}</Text>
            <Text style={styles.cardTitle}>Wachstum</Text>
            <Text style={styles.cardInsight}>{insights.growth.title}</Text>
            <Text style={styles.cardDesc}>{insights.growth.desc}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Dashboard')}
          style={{ marginHorizontal: theme.spacing.lg }}
        >
          <LinearGradient
            colors={[theme.colors.indigo, theme.colors.violet]}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Zum Dashboard ➝</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.rewardBanner}>
          <Text style={styles.rewardText}>🎉 +50 XP verdient!</Text>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  trophyContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  trophy: {
    fontSize: 80,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    backgroundColor: theme.colors.indigo,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  score: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
  },
  cardsContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  cardStrength: {
    borderLeftColor: '#22c55e',
  },
  cardBalance: {
    borderLeftColor: theme.colors.violet,
  },
  cardGrowth: {
    borderLeftColor: '#f59e0b',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  cardInsight: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: theme.colors.muted,
    lineHeight: 20,
  },
  button: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rewardBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  rewardText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
  },
});
