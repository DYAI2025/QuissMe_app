import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { storage } from '../utils/api';

export default function InviteScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCode();
  }, []);

  const loadCode = async () => {
    const code = await storage.getInviteCode();
    setInviteCode(code || 'XXXXXX');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mach mit mir den QuissMe Beziehungstest! Mein Einladungscode: ${inviteCode}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-button" activeOpacity={0.7}>
          <Text style={styles.backText}>{'\u2190'} Zurück</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Partner:in einladen</Text>
          <Text style={styles.subtitle}>Teile diesen Code mit deinem/deiner Partner:in</Text>

          <BlurView intensity={18} tint="dark" style={styles.glassCard}>
            <View style={styles.cardInner}>
              <Text style={styles.codeLabel}>Dein Einladungscode</Text>
              <TouchableOpacity onPress={handleCopy} testID="invite-code" activeOpacity={0.8}>
                <Text style={styles.code}>{inviteCode}</Text>
              </TouchableOpacity>
              {copied ? <Text style={styles.copiedText}>Kopiert!</Text> : null}

              <View style={styles.divider} />

              <Text style={styles.instruction}>
                Dein:e Partner:in gibt diesen Code in der App ein und füllt ebenfalls die Geburtsdaten aus. Danach seht ihr eure gemeinsamen Insights.
              </Text>
            </View>
          </BlurView>

          <TouchableOpacity testID="share-button" style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
            <Text style={styles.shareText}>Code teilen</Text>
          </TouchableOpacity>

          <TouchableOpacity testID="waiting-room-button" style={styles.waitButton} onPress={() => router.push('/waiting')} activeOpacity={0.7}>
            <Text style={styles.waitText}>Zum Warteraum</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night.bg },
  safeArea: { flex: 1, paddingHorizontal: SPACING.l },
  backButton: { paddingVertical: SPACING.m },
  backText: { color: COLORS.night.textSecondary, fontSize: 16 },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.night.textPrimary, textAlign: 'center', marginBottom: SPACING.s },
  subtitle: { fontSize: 15, color: COLORS.night.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  glassCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border },
  cardInner: { padding: SPACING.xl, alignItems: 'center' },
  codeLabel: { fontSize: 13, color: COLORS.night.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.m },
  code: { fontSize: 42, fontWeight: '800', color: COLORS.dusk.gold, letterSpacing: 6 },
  copiedText: { fontSize: 13, color: COLORS.functional.success, marginTop: SPACING.s },
  divider: { width: 48, height: 2, backgroundColor: COLORS.night.accent, marginVertical: SPACING.l, borderRadius: 1 },
  instruction: { fontSize: 14, color: COLORS.night.textSecondary, textAlign: 'center', lineHeight: 22 },
  shareButton: {
    backgroundColor: COLORS.night.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.xl,
    shadowColor: COLORS.night.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  shareText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  waitButton: { alignItems: 'center', paddingVertical: SPACING.m, marginTop: SPACING.s },
  waitText: { color: COLORS.night.textSecondary, fontSize: 15 },
});
