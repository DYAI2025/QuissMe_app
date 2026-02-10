import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api, storage } from '../utils/api';

export default function JoinScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim() || !name.trim() || !birthDate.trim() || !birthTime.trim() || !birthLocation.trim()) {
      setError('Bitte fülle alle Felder aus');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.joinInvite({
        invite_code: inviteCode.trim().toUpperCase(),
        name: name.trim(),
        birth_date: birthDate,
        birth_time: birthTime,
        birth_location: birthLocation.trim(),
      });
      await storage.setUserId(result.user.id);
      await storage.setCoupleId(result.couple_id);
      router.push({ pathname: '/match', params: { coupleId: result.couple_id } });
    } catch (e: any) {
      setError('Ungültiger Code oder Fehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-button" activeOpacity={0.7}>
              <Text style={styles.backText}>{'\u2190'} Zurück</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Einladung annehmen</Text>
            <Text style={styles.subtitle}>Gib den Code deines/deiner Partner:in ein</Text>

            <BlurView intensity={15} tint="dark" style={styles.glassCard}>
              <View style={styles.cardInner}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Einladungscode</Text>
                  <TextInput testID="input-invite-code" style={[styles.input, styles.codeInput]} value={inviteCode} onChangeText={setInviteCode} placeholder="Z.B. ABC123" placeholderTextColor={COLORS.night.textSecondary} autoCapitalize="characters" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dein Name</Text>
                  <TextInput testID="input-name" style={styles.input} value={name} onChangeText={setName} placeholder="z.B. Max" placeholderTextColor={COLORS.night.textSecondary} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Geburtsdatum</Text>
                  <TextInput testID="input-birthdate" style={styles.input} value={birthDate} onChangeText={setBirthDate} placeholder="JJJJ-MM-TT" placeholderTextColor={COLORS.night.textSecondary} keyboardType="numbers-and-punctuation" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Geburtszeit</Text>
                  <TextInput testID="input-birthtime" style={styles.input} value={birthTime} onChangeText={setBirthTime} placeholder="HH:MM" placeholderTextColor={COLORS.night.textSecondary} keyboardType="numbers-and-punctuation" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Geburtsort</Text>
                  <TextInput testID="input-birthlocation" style={styles.input} value={birthLocation} onChangeText={setBirthLocation} placeholder="z.B. München" placeholderTextColor={COLORS.night.textSecondary} />
                </View>

                {error ? <Text style={styles.errorText} testID="error-text">{error}</Text> : null}

                <TouchableOpacity testID="join-button" style={[styles.submitButton, loading && styles.submitDisabled]} onPress={handleJoin} disabled={loading} activeOpacity={0.8}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Verbinden</Text>}
                </TouchableOpacity>
              </View>
            </BlurView>
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
  scrollContent: { padding: SPACING.l },
  backBtn: { paddingVertical: SPACING.s, marginBottom: SPACING.m },
  backText: { color: COLORS.night.textSecondary, fontSize: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.night.textPrimary, textAlign: 'center', marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: COLORS.night.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  glassCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border },
  cardInner: { padding: SPACING.l },
  inputGroup: { marginBottom: SPACING.m },
  label: { fontSize: 13, color: COLORS.night.textSecondary, marginBottom: SPACING.xs, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.input, paddingHorizontal: SPACING.m, paddingVertical: 14, color: COLORS.night.textPrimary, fontSize: 16 },
  codeInput: { fontSize: 20, fontWeight: '700', letterSpacing: 4, textAlign: 'center' },
  errorText: { color: COLORS.functional.error, fontSize: 13, marginBottom: SPACING.m, textAlign: 'center' },
  submitButton: { backgroundColor: COLORS.night.accent, borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.s, shadowColor: COLORS.night.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 5 },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});
