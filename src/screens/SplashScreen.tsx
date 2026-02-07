import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after 2.5s or on tap
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={1}
      onPress={() => navigation.replace('Onboarding')}
    >
      <LinearGradient
        colors={['#0a0a0b', '#1a1a2e', '#16213e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <View style={styles.logoContainer}>
            <View style={styles.heartIcon}>
              <Text style={styles.heartEmoji}>💫</Text>
            </View>
          </View>
          
          <Text style={styles.title}>QuissMe</Text>
          <Text style={styles.subtitle}>Relationship Entertainment</Text>
          
          <Text style={styles.tapHint}>Tap to start ✨</Text>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: theme.spacing.xxl,
  },
  heartIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(91, 70, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  heartEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -1,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xxl,
  },
  tapHint: {
    fontSize: 14,
    color: theme.colors.violet,
    opacity: 0.8,
  },
});
