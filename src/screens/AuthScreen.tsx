import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type AuthScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte Email und Passwort eingeben');
      return;
    }
    // TODO: Implement actual auth
    navigation.navigate('BirthInput');
  };

  const handleSocialAuth = (provider: string) => {
    // TODO: Implement social auth
    navigation.navigate('BirthInput');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brand}>
          <Text style={styles.title}>QuissMe</Text>
          <Text style={styles.subtitle}>Deine Reise beginnt hier</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="deine@email.de"
              placeholderTextColor={theme.colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Passwort</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleAuth}>
            <LinearGradient
              colors={[theme.colors.indigo, theme.colors.violet]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {isLogin ? 'Anmelden ➝' : 'Registrieren ➝'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oder</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialAuth('apple')}
            >
              <Text style={styles.socialButtonText}>🍎 Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialAuth('google')}
            >
              <Text style={styles.socialButtonText}>🔍 Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => setIsLogin(!isLogin)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            {isLogin ? 'Noch kein Konto? ' : 'Bereits registriert? '}
            <Text style={styles.footerLink}>
              {isLogin ? 'Registrieren' : 'Anmelden'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  brand: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 42,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: 16,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.muted,
    marginHorizontal: theme.spacing.md,
    fontSize: 13,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  socialButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  socialButtonText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  footerLink: {
    color: theme.colors.violet,
  },
});
