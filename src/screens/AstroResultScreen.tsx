import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type AstroResultScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AstroResult'>;
  route: RouteProp<RootStackParamList, 'AstroResult'>;
};

// Mock data - replace with actual calculation
const astroData = {
  sunSign: 'Zwillinge',
  sunDate: '21. Mai – 21. Juni',
  moonSign: 'Fische',
  risingSign: 'Skorpion',
  element: 'Luft',
  elementEmoji: '🌬️',
  traits: ['Kommunikativ', 'Neugierig', 'Anpassungsfähig'],
};

export default function AstroResultScreen({ navigation }: AstroResultScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0b', '#1a1a2e']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.headerTitle}>Dein Astro-Profil</Text>
          <Text style={styles.headerSubtitle}>Basierend auf deinen Geburtsdaten</Text>

          <View style={styles.mainCard}>
            <View style={styles.zodiacIcon}>
              <Text style={styles.zodiacEmoji}>♊</Text>
            </View>
            
            <Text style={styles.zodiacName}>{astroData.sunSign}</Text>
            <Text style={styles.zodiacDate}>{astroData.sunDate}</Text>
            
            <View style={styles.elementBadge}>
              <Text>{astroData.elementEmoji} {astroData.element}</Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>☀️</Text>
                <Text style={styles.detailLabel}>Sonne</Text>
                <Text style={styles.detailValue}>{astroData.sunSign}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🌙</Text>
                <Text style={styles.detailLabel}>Mond</Text>
                <Text style={styles.detailValue}>{astroData.moonSign}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>⬆️</Text>
                <Text style={styles.detailLabel}>Aszendent</Text>
                <Text style={styles.detailValue}>{astroData.risingSign}</Text>
              </View>
            </View>
          </View>

          <View style={styles.traitsCard}>
            <Text style={styles.traitsTitle}>Deine Stärken</Text>
            <View style={styles.traitsList}>
              {astroData.traits.map((trait, index) => (
                <View key={index} style={styles.traitBadge}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('PartnerInvite')}>
            <LinearGradient
              colors={[theme.colors.indigo, theme.colors.violet]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Partner einladen ➝</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  },
  content: {
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  mainCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  zodiacIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  zodiacEmoji: {
    fontSize: 40,
  },
  zodiacName: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  zodiacDate: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.lg,
  },
  elementBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  detailsCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  traitsCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  traitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  traitBadge: {
    backgroundColor: 'rgba(91, 70, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
  },
  traitText: {
    color: theme.colors.violet,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
