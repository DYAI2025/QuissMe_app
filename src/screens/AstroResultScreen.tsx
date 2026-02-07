import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';
import { calculateWesternChart, geocodeLocation } from '../utils/astroApi';

type AstroResultScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AstroResult'>;
  route: RouteProp<RootStackParamList, 'AstroResult'>;
};

const ZODIAC_SIGNS_DE = [
  'Widder', 'Stier', 'Zwillinge', 'Krebs', 
  'Löwe', 'Jungfrau', 'Waage', 'Skorpion',
  'Schütze', 'Steinbock', 'Wassermann', 'Fische',
];

function getZodiacFromDegree(degree: number): string {
  const index = Math.floor(degree / 30) % 12;
  return ZODIAC_SIGNS_DE[index];
}

function getElement(sign: string): string {
  const elements: Record<string, string> = {
    'Widder': '🔥 Feuer', 'Löwe': '🔥 Feuer', 'Schütze': '🔥 Feuer',
    'Stier': '🌍 Erde', 'Jungfrau': '🌍 Erde', 'Steinbock': '🌍 Erde',
    'Zwillinge': '💨 Luft', 'Waage': '💨 Luft', 'Wassermann': '💨 Luft',
    'Krebs': '💧 Wasser', 'Skorpion': '💧 Wasser', 'Fische': '💧 Wasser',
  };
  return elements[sign] || '✨';
}

export default function AstroResultScreen({ navigation, route }: AstroResultScreenProps) {
  const [loading, setLoading] = useState(true);
  const [sunSign, setSunSign] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [ascendant, setAscendant] = useState('');

  useEffect(() => {
    calculateAstro();
  }, []);

  const calculateAstro = async () => {
    try {
      const { birthData } = route.params;
      
      // Format date
      const date = birthData.date.toISOString().split('T')[0];
      const time = birthData.time.toTimeString().slice(0, 5);
      
      // Get coordinates
      const coords = await geocodeLocation(birthData.location);
      
      // Calculate western chart
      const chart = await calculateWesternChart({
        date,
        time,
        location: birthData.location,
        lat: coords?.lat || 52.52,
        lon: coords?.lon || 13.405,
      });

      // Extract Sun, Moon, Ascendant
      const sun = getZodiacFromDegree(chart.bodies.Sun.longitude);
      const moon = getZodiacFromDegree(chart.bodies.Moon.longitude);
      const asc = getZodiacFromDegree(chart.angles.Ascendant);

      setSunSign(sun);
      setMoonSign(moon);
      setAscendant(asc);
    } catch (error) {
      console.error('Astro calculation failed:', error);
      // Fallback
      setSunSign('Zwillinge');
      setMoonSign('Fische');
      setAscendant('Skorpion');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.violet} />
        <Text style={styles.loadingText}>Dein Astro-Profil wird berechnet...✨</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dein Astro-Profil</Text>
        <Text style={styles.subtitle}>Das ist deine kosmische Signatur</Text>

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>☀️</Text>
            <Text style={styles.cardLabel}>Sternzeichen</Text>
            <Text style={styles.cardValue}>{sunSign}</Text>
            <Text style={styles.cardElement}>{getElement(sunSign)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>🌙</Text>
            <Text style={styles.cardLabel}>Mondzeichen</Text>
            <Text style={styles.cardValue}>{moonSign}</Text>
            <Text style={styles.cardElement}>{getElement(moonSign)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>⬆️</Text>
            <Text style={styles.cardLabel}>Aszendent</Text>
            <Text style={styles.cardValue}>{ascendant}</Text>
            <Text style={styles.cardElement}>{getElement(ascendant)}</Text>
          </View>
        </View>

        <Text style={styles.matchingText}>
          Diese 3 Signatur-Punkte bestimmen euer Matching-Potenzial.
        </Text>

        <TouchableOpacity 
          onPress={() => navigation.navigate('PartnerInvite')}
          style={styles.buttonContainer}
        >
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
    paddingTop: 80,
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xl,
  },
  cardsContainer: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardElement: {
    fontSize: 14,
    color: theme.colors.violet,
  },
  matchingText: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
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
