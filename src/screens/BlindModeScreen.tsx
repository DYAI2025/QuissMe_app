import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';

type BlindModeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BlindMode'>;
};

const questions = [
  {
    id: 1,
    question: 'Was ist euch in einer Beziehung am wichtigsten?',
    options: [
      { id: 'a', text: 'Vertrauen & Ehrlichkeit', icon: '🤝' },
      { id: 'b', text: 'Gemeinsame Abenteuer', icon: '🏔️' },
      { id: 'c', text: 'Tiefe Gespräche', icon: '💭' },
      { id: 'd', text: 'Körperliche Nähe', icon: '❤️' },
    ],
  },
  {
    id: 2,
    question: 'Wie entspannt ihr am liebsten?',
    options: [
      { id: 'a', text: 'Zuhause entspannen', icon: '🏠' },
      { id: 'b', text: 'Draußen in der Natur', icon: '🌲' },
      { id: 'c', text: 'Sport treiben', icon: '⚡' },
      { id: 'd', text: 'Freunde treffen', icon: '🎉' },
    ],
  },
];

export default function BlindModeScreen({ navigation }: BlindModeScreenProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (optionId: string) => {
    setSelected(optionId);
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        navigation.navigate('Synchronization');
      }
    }, 600);
  };

  const q = questions[currentQ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blind-Mode</Text>
        <Text style={styles.headerSubtitle}>Frage {currentQ + 1} von {questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.question}>{q.question}</Text>
      </View>

      <View style={styles.options}>
        {q.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionBtn,
              selected === option.id && styles.optionSelected,
            ]}
            onPress={() => handleSelect(option.id)}
            disabled={selected !== null}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              styles.optionText,
              selected === option.id && styles.optionTextSelected,
            ]}>
              {option.text}
            </Text>
            {selected === option.id && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.blindIndicator}>
        <View style={styles.blindDot} />
        <Text style={styles.blindText}>Du siehst nicht, was dein Partner wählt</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.violet,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.violet,
    borderRadius: 2,
    transition: 'width 0.3s',
  },
  questionCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 30,
  },
  options: {
    gap: theme.spacing.md,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: 'rgba(91, 70, 255, 0.2)',
    borderColor: theme.colors.indigo,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.violet,
    fontWeight: '600',
  },
  check: {
    fontSize: 20,
    color: theme.colors.success,
  },
  blindIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: theme.borderRadius.md,
  },
  blindDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.violet,
    marginRight: theme.spacing.sm,
    opacity: 0.5,
  },
  blindText: {
    fontSize: 13,
    color: theme.colors.muted,
  },
});
