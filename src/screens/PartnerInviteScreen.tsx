import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Share,
  Clipboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type PartnerInviteScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerInvite'>;
};

export default function PartnerInviteScreen({ navigation }: PartnerInviteScreenProps) {
  const [inviteCode] = useState('QUISS-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    Clipboard.setString(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async () => {
    try {
      await Share.share({
        message: `Lade dich zu QuissMe ein! Code: ${inviteCode} oder https://quiss.me/join/${inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💌</Text>
        <Text style={styles.title}>Partner einladen</Text>
        <Text style={styles.subtitle}>
          Teile diesen Code mit deinem Partner, um eure Reise zu beginnen.
        </Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Euer Einladungscode</Text>
          <TouchableOpacity onPress={copyCode}>
            <View style={styles.codeBox}>
              <Text style={styles.code}>{inviteCode}</Text>
              <Text style={styles.copyHint}>{copied ? '✓ Kopiert!' : 'Zum Kopieren tippen'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.shareOptions}>
          <TouchableOpacity style={styles.shareBtn} onPress={shareInvite}>
            <Text style={styles.shareIcon}>📱</Text>
            <Text style={styles.shareText}>Teilen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareBtn} onPress={copyCode}>
            <Text style={styles.shareIcon}>📋</Text>
            <Text style={styles.shareText}>Kopieren</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareIcon}>💬</Text>
            <Text style={styles.shareText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('WaitingRoom', { inviteCode })}
          style={styles.waitBtn}
        >
          <Text style={styles.waitBtnText}>Ich habe den Code geteilt ➝</Text>
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
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    maxWidth: 300,
  },
  codeCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: 'rgba(91, 70, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(91, 70, 255, 0.3)',
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.violet,
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  copyHint: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  shareOptions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  shareBtn: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shareIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  shareText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  waitBtn: {
    padding: theme.spacing.lg,
  },
  waitBtnText: {
    color: theme.colors.violet,
    fontSize: 16,
    fontWeight: '500',
  },
});
