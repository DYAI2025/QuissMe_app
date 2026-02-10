import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api, storage } from '../utils/api';

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !birthDate.trim() || !birthTime.trim() || !birthLocation.trim()) {
      setError('Bitte fülle alle Felder aus');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      setError('Datumsformat: JJJJ-MM-TT');
      return;
    }
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(birthTime)) {
      setError('Zeitformat: HH:MM');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await api.registerUser({
        name: name.trim(),
        birth_date: birthDate,
        birth_time: birthTime,
        birth_location: birthLocation.trim(),
      });
      await storage.setUserId(result.id);
      if (result.invite_code) {
        await storage.setInviteCode(result.invite_code);
      }
      router.push({ pathname: '/result', params: { userId: result.id } });
    } catch (e: any) {
      setError('Etwas ist schiefgelaufen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.brandName}>QuissMe</Text>
              <Text style={styles.title}>Astrologisches Profil</Text>
              <Text style={styles.subtitle}>Deine Sterne verraten uns, wer du bist</Text>
            </View>

            <View style={styles.formContainer}>
              <BlurView intensity={15} tint="dark" style={styles.glassCard}>
                <View style={styles.cardInner}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dein Name</Text>
                    <TextInput
                      testID="input-name"
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="z.B. Anna"
                      placeholderTextColor={COLORS.night.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Geburtsdatum</Text>
                    <TextInput
                      testID="input-birthdate"
                      style={styles.input}
                      value={birthDate}
                      onChangeText={setBirthDate}
                      placeholder="JJJJ-MM-TT"
                      placeholderTextColor={COLORS.night.textSecondary}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Geburtszeit</Text>
                    <TextInput
                      testID="input-birthtime"
                      style={styles.input}
                      value={birthTime}
                      onChangeText={setBirthTime}
                      placeholder="HH:MM"
                      placeholderTextColor={COLORS.night.textSecondary}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Geburtsort</Text>
                    <TextInput
                      testID="input-birthlocation"
                      style={styles.input}
                      value={birthLocation}
                      onChangeText={setBirthLocation}
                      placeholder="z.B. Berlin"
                      placeholderTextColor={COLORS.night.textSecondary}
                    />
                  </View>

                  {error ? <Text style={styles.errorText} testID="error-text">{error}</Text> : null}

                  <TouchableOpacity
                    testID="calculate-button"
                    style={[styles.submitButton, loading && styles.submitDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitText}>Berechnen</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>

            <TouchableOpacity
              testID="join-invite-link"
              onPress={() => router.push('/join')}
              style={styles.joinLink}
              activeOpacity={0.7}
            >
              <Text style={styles.joinLinkText}>Einladungscode eingeben</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night.bg },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { padding: SPACING.l, paddingTop: SPACING.m },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  brandName: { fontSize: 28, fontWeight: '700', color: COLORS.night.textPrimary, fontStyle: 'italic', marginBottom: SPACING.s },
  title: { fontSize: 22, fontWeight: '600', color: COLORS.night.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: COLORS.night.textSecondary, textAlign: 'center' },
  formContainer: { marginBottom: SPACING.l },
  glassCard: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  cardInner: { padding: SPACING.l },
  inputGroup: { marginBottom: SPACING.m },
  label: { fontSize: 13, color: COLORS.night.textSecondary, marginBottom: SPACING.xs, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.m,
    paddingVertical: 14,
    color: COLORS.night.textPrimary,
    fontSize: 16,
  },
  errorText: { color: COLORS.functional.error, fontSize: 13, marginBottom: SPACING.m, textAlign: 'center' },
  submitButton: {
    backgroundColor: COLORS.night.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.s,
    shadowColor: COLORS.night.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  joinLink: { alignItems: 'center', paddingVertical: SPACING.m },
  joinLinkText: { color: COLORS.night.accent, fontSize: 15, textDecorationLine: 'underline' },
});
