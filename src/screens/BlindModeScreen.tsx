import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';
import { MOSAIC_QUIZZES, getQuizById } from '../data/mosaicQuizzes';
import { QuizStateManager, QuizAnswer } from '../utils/quizLogic';

type BlindModeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BlindMode'>;
  route?: {
    params?: {
      quizId?: string;
    };
  };
};

// Mock questions for demo (will be replaced with mosaicQuizzes data)
const DEMO_QUESTIONS = [
  {
    id: 'demo_1',
    question: 'Was ist euch in einer Beziehung am wichtigsten?',
    options: [
      { index: 0, text: 'Vertrauen & Ehrlichkeit', icon: '🤝' },
      { index: 1, text: 'Gemeinsame Abenteuer', icon: '🏔️' },
      { index: 2, text: 'Tiefe Gespräche', icon: '💭' },
      { index: 3, text: 'Körperliche Nähe', icon: '❤️' },
    ],
  },
  {
    id: 'demo_2',
    question: 'Wie entspannt ihr am liebsten?',
    options: [
      { index: 0, text: 'Zuhause entspannen', icon: '🏠' },
      { index: 1, text: 'Draußen in der Natur', icon: '🌲' },
      { index: 2, text: 'Sport treiben', icon: '⚡' },
      { index: 3, text: 'Freunde treffen', icon: '🎉' },
    ],
  },
];

export default function BlindModeScreen({ navigation, route }: BlindModeScreenProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizState] = useState(() => new QuizStateManager());
  const [partnerType] = useState<'A' | 'B'>('A'); // In production, get from auth
  
  const quizId = route?.params?.quizId || DEMO_QUESTIONS[currentQ].id;
  const questions = DEMO_QUESTIONS; // Will use MOSAIC_QUIZZES in production
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = async (optionIndex: number) => {
    setSelected(optionIndex);

    // Submit answer
    const answer: QuizAnswer = {
      quizId,
      selectedOptionIndex: optionIndex,
      partnerType,
      timestamp: Date.now(),
    };
    
    const result = quizState.submitAnswer(answer);
    
    // Delay for animation
    setTimeout(() => {
      setSelected(null);
      
      if (currentQ < questions.length - 1) {
        // Next question
        setCurrentQ(currentQ + 1);
      } else {
        // Quiz complete - check if both partners finished
        const completed = quizState.getCompletedQuizzes();
        if (completed.length >= 2) {
          // Both answered - navigate to synchronization/gate
          navigation.navigate('Synchronization');
        } else {
          // Only one answered - wait for partner
          navigation.navigate('Synchronization');
        }
      }
    }, 600);
  };

  const q = questions[currentQ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blind-Mode</Text>
        <Text style={styles.headerSubtitle}>
          Frage {currentQ + 1} von {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.question}>{q.question}</Text>
      </View>

      <View style={styles.options}>
        {q.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionBtn,
              selected === index && styles.optionSelected,
            ]}
            onPress={() => handleSelect(index)}
            disabled={selected !== null}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              styles.optionText,
              selected === index && styles.optionTextSelected,
            ]}>
              {option.text}
            </Text>
            {selected === index && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.blindIndicator}>
        <View style={styles.blindDot} />
        <Text style={styles.blindText}>
          Du siehst nicht, was dein Partner wählt
        </Text>
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
