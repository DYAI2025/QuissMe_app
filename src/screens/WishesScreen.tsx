import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Switch
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type WishesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wishes'>;
};

const savedWishes = [
  {
    id: 1,
    text: 'Ich wünsche mir, dass wir einmal pro Woche ein Date haben, ganz ohne Ablenkung',
    date: 'Vor 2 Tagen',
    optimized: true,
  },
  {
    id: 2,
    text: 'Es wäre schön, wenn wir gemeinsam über unsere Finanzen sprechen könnten',
    date: 'Vor 5 Tagen',
    optimized: true,
  },
];

export default function WishesScreen({ navigation }: WishesScreenProps) {
  const [wish, setWish] = useState('');
  const [rewriteEnabled, setRewriteEnabled] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>💝</Text>
          <Text style={styles.title}>Deine Wünsche</Text>
          <Text style={styles.subtitle}>Artikuliere, was dir wichtig ist</Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Was wünschst du dir?</Text>
          <TextInput
            style={styles.wishInput}
            multiline
            placeholder="Ich würde mich freuen, wenn wir mehr Zeit für..."
            placeholderTextColor={theme.colors.muted}
            value={wish}
            onChangeText={setWish}
          />

          <View style={styles.rewriteToggle}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>KI-Rewrite aktivieren</Text>
              <Text style={styles.toggleDesc}>Wandelt harte Forderungen in sanfte Wünsche um</Text>
            </View>
            <Switch
              value={rewriteEnabled}
              onValueChange={setRewriteEnabled}
              trackColor={{ false: '#767577', true: theme.colors.indigo }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Wunsch speichern ✨</Text>
        </TouchableOpacity>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleLabel}>Beispiel Rewrite</Text>
          <Text style={styles.exampleOriginal}>"Du musst mehr im Haushalt helfen"</Text>
          <Text style={styles.exampleRewritten}>"Ich würde mich so freuen, wenn wir die Hausarbeit mehr als Team angehen könnten 💕"</Text>
        </View>

        <Text style={styles.listTitle}>Gespeicherte Wünsche</Text>

        {savedWishes.map((w) => (
          <View key={w.id} style={styles.wishItem}>
            <View style={styles.wishStatus} />
            <View style={styles.wishContent}>
              <Text style={styles.wishText}>{w.text}</Text>
              <Text style={styles.wishDate}>
                {w.date} {w.optimized && '• Von KI optimiert'}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.guardrail}>
          <Text style={styles.guardrailText}>
            ⚠️ Keine "Du-Sprache", Ultimaten oder negative Formulierungen erlaubt
          </Text>
        </View>
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
  emoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
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
  },
  inputCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  wishInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  rewriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(91,70,255,0.08)',
    padding: theme.spacing.md,
    borderRadius: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  saveButton: {
    backgroundColor: theme.colors.indigo,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exampleCard: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
  },
  exampleOriginal: {
    fontSize: 14,
    color: theme.colors.muted,
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  exampleRewritten: {
    fontSize: 15,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  wishItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  wishStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.md,
    marginTop: 6,
  },
  wishContent: {
    flex: 1,
  },
  wishText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  wishDate: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  guardrail: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 10,
  },
  guardrailText: {
    fontSize: 12,
    color: '#fca5a5',
  },
});
