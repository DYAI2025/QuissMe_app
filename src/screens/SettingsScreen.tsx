import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const settingsGroups = [
  {
    title: 'Profil',
    items: [
      { icon: '👤', label: 'Name ändern', value: 'Alex' },
      { icon: '📧', label: 'Email', value: 'alex@email.de' },
      { icon: '🎂', label: 'Geburtsdaten', value: 'Bearbeiten' },
    ],
  },
  {
    title: 'Beziehung',
    items: [
      { icon: '💑', label: 'Partner', value: 'Sam' },
      { icon: '📅', label: 'Beziehungsbeginn', value: '01.01.2024' },
      { icon: '🔗', label: 'Verbindung', value: 'Verbunden ✓' },
    ],
  },
  {
    title: 'App',
    items: [
      { icon: '🔔', label: 'Benachrichtigungen', value: 'An' },
      { icon: '🌙', label: 'Dark Mode', value: 'Immer' },
      { icon: '🔒', label: 'Privatsphäre', value: '' },
    ],
  },
];

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>😊</Text>
          </View>
          <Text style={styles.name}>Alex</Text>
          <Text style={styles.email}>alex@email.de</Text>
        </View>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={[
                    styles.settingItem,
                    itemIndex === group.items.length - 1 && styles.settingItemLast
                  ]}
                >
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingValue}>{item.value}</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerText}>🚪 Ausloggen</Text>
        </TouchableOpacity>

        <Text style={styles.version}>QuissMe v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(91,70,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  group: {
    marginBottom: theme.spacing.xl,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  groupCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    width: 30,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  settingValue: {
    fontSize: 14,
    color: theme.colors.muted,
    marginRight: theme.spacing.sm,
  },
  chevron: {
    fontSize: 18,
    color: theme.colors.muted,
  },
  dangerButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  dangerText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: theme.spacing.xl,
    marginBottom: 40,
  },
});
