import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const slides = [
  {
    emoji: '🌟',
    title: 'Die Reise der\\nSynchronisation',
    desc: 'Entdecke die verborgene Verbindung zwischen dir und deinem Partner durch die Weisheit der Sterne.',
  },
  {
    emoji: '🎯',
    title: 'Blind-Mode Quiz',
    desc: 'Beantworte Fragen, ohne zu wissen, was dein Partner gewählt hat. Spannung pur!',
  },
  {
    emoji: '✨',
    title: 'Insight Drops',
    desc: 'Erhalte personalisierte Erkenntnisse über eure Beziehung – wissenschaftlich fundiert, magisch verpackt.',
  },
  {
    emoji: '🏆',
    title: 'Wachse zusammen',
    desc: 'Sammelt Buffs, meistert Challenges und stärkt eure Verbindung Tag für Tag.',
  },
];

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Auth');
    }
  };

  const skip = () => {
    navigation.navigate('Auth');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0b', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={skip}>
          <Text style={styles.skipText}>Überspringen</Text>
        </TouchableOpacity>

        {/* Content */}
        <ScrollView
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: currentSlide * width, y: 0 }}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{slide.emoji}</Text>
              </View>
              <Text style={styles.title}>{slide.title.replace('\\n', '\n')}</Text>
              <Text style={styles.desc}>{slide.desc}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity onPress={nextSlide}>
          <LinearGradient
            colors={[theme.colors.indigo, theme.colors.violet]}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {currentSlide === slides.length - 1 ? 'Los geht\'s!' : 'Weiter'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  skipButton: {
    alignSelf: 'flex-end',
    marginTop: 50,
    padding: theme.spacing.sm,
  },
  skipText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  slide: {
    width: width - 48,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(91, 70, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 40,
  },
  desc: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: theme.spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: theme.colors.violet,
    width: 24,
  },
  button: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
