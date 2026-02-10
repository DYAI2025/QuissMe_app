import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { api, storage } from '../../utils/api';

const ZODIAC_ICONS: Record<string, string> = {
  'Widder': '\u2648', 'Stier': '\u2649', 'Zwillinge': '\u264A', 'Krebs': '\u264B',
  'Löwe': '\u264C', 'Jungfrau': '\u264D', 'Waage': '\u264E', 'Skorpion': '\u264F',
  'Schütze': '\u2650', 'Steinbock': '\u2651', 'Wassermann': '\u2652', 'Fische': '\u2653',
};

export default function ProfileTab() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const uid = await storage.getUserId();
        if (uid) { setUser(await api.getUser(uid)); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleLogout = async () => {
    await storage.clear();
    router.replace('/');
  };

  if (loading) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.night.accent} /></View>;

  const sign = user?.astro_data?.summary?.sternzeichen || user?.astro_data?.western?.sunSign || '';
  const zodiacIcon = ZODIAC_ICONS[sign] || '\u2728';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.brand}>Profil</Text>

          {user ? (
            <>
              <BlurView intensity={15} tint="dark" style={styles.profileCard}>
                <View style={styles.profileInner}>
                  <Text style={styles.zodiacIcon}>{zodiacIcon}</Text>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.sign}>{sign}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Geburtstag</Text>
                    <Text style={styles.detailValue}>{user.birth_date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ort</Text>
                    <Text style={styles.detailValue}>{user.birth_location}</Text>
                  </View>
                  {user.invite_code ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Einladungscode</Text>
                      <Text style={[styles.detailValue, styles.codeValue]}>{user.invite_code}</Text>
                    </View>
                  ) : null}
                </View>
              </BlurView>

              {!user.couple_id ? (
                <TouchableOpacity testID="invite-from-profile" style={styles.inviteButton} onPress={() => router.push('/invite')} activeOpacity={0.8}>
                  <Text style={styles.inviteText}>Partner:in einladen</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity testID="logout-button" style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                <Text style={styles.logoutText}>Abmelden</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Erstelle zuerst dein Profil</Text>
              <TouchableOpacity style={styles.inviteButton} onPress={() => router.replace('/')} activeOpacity={0.8}>
                <Text style={styles.inviteText}>Zurück zum Start</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night.bg },
  loadContainer: { flex: 1, backgroundColor: COLORS.night.bg, justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  scroll: { padding: SPACING.l, paddingBottom: 100 },
  brand: { fontSize: 24, fontWeight: '700', color: COLORS.night.text, marginBottom: SPACING.xl },
  profileCard: { borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border, marginBottom: SPACING.xl },
  profileInner: { padding: SPACING.xl, alignItems: 'center' },
  zodiacIcon: { fontSize: 56, marginBottom: SPACING.m },
  name: { fontSize: 24, fontWeight: '700', color: COLORS.night.text, marginBottom: SPACING.xs },
  sign: { fontSize: 16, color: COLORS.warm.gold, fontWeight: '600', marginBottom: SPACING.l },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: SPACING.s, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  detailLabel: { fontSize: 14, color: COLORS.night.textSub },
  detailValue: { fontSize: 14, color: COLORS.night.text, fontWeight: '500' },
  codeValue: { fontWeight: '700', letterSpacing: 2, color: COLORS.warm.gold },
  inviteButton: { backgroundColor: COLORS.night.accent, borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginBottom: SPACING.m },
  inviteText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  logoutButton: { alignItems: 'center', paddingVertical: SPACING.m },
  logoutText: { color: COLORS.night.textSub, fontSize: 15 },
  emptyState: { alignItems: 'center', padding: SPACING.xxl },
  emptyText: { fontSize: 16, color: COLORS.night.textSub, marginBottom: SPACING.l },
});
