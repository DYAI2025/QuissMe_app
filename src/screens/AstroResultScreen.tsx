import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';
import { 
  calculateSimpleAstro, 
  calculateWesternChart,
  getZodiacSignFromDegree,
  AstroResult,
  WesternChart,
  BirthData 
} from '../utils/astroApi';

type AstroResultScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AstroResult'>;
  route: RouteProp<RootStackParamList, 'AstroResult'>;
};

export default function AstroResultScreen({ navigation, route }: AstroResultScreenProps) {
  const [loading, setLoading] = useState(true);
  const [astroData, setAstroData] = useState<AstroResult | null>(null);
  const [westernChart, setWesternChart] = useState<WesternChart | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAstroData();
  }, []);

  const loadAstroData = async () => {
    try {
      const { birthData } = route.params;
      
      // Format date and time
      const date = birthData.date.toISOString().split('T')[0];
      const time = birthData.time.toTimeString().slice(0, 5);
      
      const data: BirthData = {
        date,
        time,
        location: birthData.location,
        lat: birthData.lat || 52.52,
        lon: birthData.lon || 13.405,
      };

      // Load both simple and detailed results
      const [simpleResult, chart] = await Promise.all([
        calculateSimpleAstro(data),
        calculateWesternChart(data).catch(() => null),
      ]);

      setAstroData(simpleResult);
      setWesternChart(chart);
    } catch (err) {
      setError('Berechnung fehlgeschlagen. Bitte versuche es erneut.');
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

  if (error || !astroData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.errorText}>{error || 'Ein Fehler ist aufgetreten'}</Text>
        <TouchableOpacity onPress={loadAstroData}>
          <Text style={styles.retryText}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get detailed signs from western chart if available
  const sunSign = westernChart?.bodies?.Sun 
    ? getZodiacSignFromDegree(westernChart.bodies.Sun.longitude)
    : astroData.sunSign;
  
  const moonSign = westernChart?.bodies?.Moon
    ? getZodiacSignFromDegree(westernChart.bodies.Moon.longitude)
    : astroData.moonSign;
    
  const ascendant = westernChart?.angles?.Ascendant
    ? getZodiacSignFromDegree(westernChart.angles.Ascendant)
    : undefined;

  const element = getElementFromZodiac(sunSign);

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
              <Text style={styles.zodiacEmoji}>{getZodiacEmoji(sunSign)}</Text>
            </View>
            
            <Text style={styles.zodiacName}>{sunSign}</Text>
            <Text style={styles.zodiacDate}>{getZodiacDate(sunSign)}</Text>
            
            <View style={styles.elementBadge}>
              <Text style={styles.elementText}>{element}</Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>☀️</Text>
                <Text style={styles.detailLabel}>Sonne</Text>
                <Text style={styles.detailValue}>{sunSign}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🌙</Text>
                <Text style={styles.detailLabel}>Mond</Text>
                <Text style={styles.detailValue}>{moonSign}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>⬆️</Text>
                <Text style={styles.detailLabel}>Aszendent</Text>
                <Text style={styles.detailValue}>{ascendant || 'Berechnung...'}</Text>
              </View>
            </View>
          </View>

          {(astroData.chineseYear || astroData.chineseElement) && (
            <View style={styles.chineseCard}>
              <Text style={styles.chineseTitle}>Chinesisches Horoskop</Text>
              <View style={styles.chineseRow}>
                <Text style={styles.chineseValue}>
                  {astroData.chineseElement} {astroData.chineseYear}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            onPress={() => navigation.navigate('PartnerInvite')}
            style={{ marginHorizontal: theme.spacing.lg }}
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
      </LinearGradient>
    </ScrollView>
  );
}

// Helper functions
function getZodiacEmoji(sign: string): string {
  const emojis: Record<string, string> = {
    'Widder': '♈', 'Stier': '♉', 'Zwillinge': '♊', 'Krebs': '♋',
    'Löwe': '♌', 'Jungfrau': '♍', 'Waage': '♎', 'Skorpion': '♏',
    'Schütze': '♐', 'Steinbock': '♑', 'Wassermann': '♒', 'Fische': '♓',
  };
  return emojis[sign] || '✨';
}

function getZodiacDate(sign: string): string {
  const dates: Record<string, string> = {
    'Widder': '21. März – 20. April',
    'Stier': '21. April – 21. Mai',
    'Zwillinge': '21. Mai – 21. Juni',
    'Krebs': '22. Juni – 22. Juli',
    'Löwe': '23. Juli – 23. August',
    'Jungfrau': '24. August – 23. September',
    'Waage': '24. September – 23. Oktober',
    'Skorpion': '24. Oktober – 22. November',
    'Schütze': '23. November – 21. Dezember',
    'Steinbock': '22. Dezember – 20. Januar',
    'Wassermann': '21. Januar – 19. Februar',
    'Fische': '20. Februar – 20. März',
  };
  return dates[sign] || '';
}

function getElementFromZodiac(sign: string): string {
  const elements: Record<string, string> = {
    'Widder': '🔥 Feuer', 'Löwe': '🔥 Feuer', 'Schütze': '🔥 Feuer',
    'Stier': '🌍 Erde', 'Jungfrau': '🌍 Erde', 'Steinbock': '🌍 Erde',
    'Zwillinge': '💨 Luft', 'Waage': '💨 Luft', 'Wassermann': '💨 Luft',
    'Krebs': '💧 Wasser', 'Skorpion': '💧 Wasser', 'Fische': '💧 Wasser',
  };
  return elements[sign] || '✨';
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontSize: 16,
  },
  errorText: {
    marginTop: theme.spacing.md,
    color: '#ef4444',
    fontSize: 16,
  },
  retryText: {
    marginTop: theme.spacing.md,
    color: theme.colors.violet,
    fontSize: 16,
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
  elementText: {
    color: theme.colors.text,
    fontSize: 14,
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
  chineseCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chineseTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  chineseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chineseValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
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
