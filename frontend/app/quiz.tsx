import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING } from '../utils/theme';
import { api, storage } from '../utils/api';

export default function QuizScreen() {
  const router = useRouter();
  const { quizId, cycleId, userId: pUserId, coupleId: pCoupleId } = useLocalSearchParams<{ quizId: string; cycleId: string; userId: string; coupleId: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: string; option_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try { if (quizId) setQuiz(await api.getQuiz(quizId)); } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSelect = (questionId: string, optionId: string) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      const newAnswers = [...answers.filter(a => a.question_id !== questionId), { question_id: questionId, option_id: optionId }];
      setAnswers(newAnswers);
      if (currentIndex < (quiz?.questions?.length || 0) - 1) {
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        handleSubmit(newAnswers);
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
    }
  };

  const handleSubmit = async (finalAnswers: any[]) => {
    setSubmitting(true);
    try {
      const uid = pUserId || await storage.getUserId() || 'anonymous';
      const cid = pCoupleId || await storage.getCoupleId() || 'solo';

      if (cycleId && cycleId !== 'undefined') {
        // ClusterCycle-based submission
        const result = await api.submitQuiz({
          user_id: uid, couple_id: cid, quiz_id: quizId,
          cycle_id: cycleId, answers: finalAnswers,
        });
        if (result.state === 'ready_to_reveal') {
          router.replace({ pathname: '/insight-drop', params: { cycleId: result.id } });
        } else {
          router.replace({ pathname: '/insight-drop', params: { cycleId: result.id } });
        }
      } else {
        // Solo / legacy flow - create a quick cycle
        try {
          const cycle = await api.activateQuiz({ user_id: uid, couple_id: cid, quiz_id: quizId });
          const result = await api.submitQuiz({
            user_id: uid, couple_id: cid, quiz_id: quizId,
            cycle_id: cycle.id, answers: finalAnswers,
          });
          router.replace({ pathname: '/insight-drop', params: { cycleId: result.id } });
        } catch (e) {
          // Fallback to dashboard
          router.replace('/(tabs)');
        }
      }
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (loading || !quiz) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.night.accent} /></View>;
  if (submitting) return <View style={styles.loadContainer}><ActivityIndicator size="large" color={COLORS.warm.gold} /><Text style={styles.loadText}>Auswertung wird berechnet...</Text></View>;

  const questions = quiz.questions || [];
  const question = questions[currentIndex];
  const questionText = question?.text?.['de-DE'] || question?.text || '';
  const options = question?.options || [];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} testID="back-btn" disabled={currentIndex === 0} activeOpacity={0.7}>
            <Text style={[styles.navText, currentIndex === 0 && styles.disabled]}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.progress} testID="progress-text">{currentIndex + 1}/{questions.length}</Text>
          <TouchableOpacity onPress={() => router.back()} testID="close-btn" activeOpacity={0.7}>
            <Text style={styles.navText}>{'\u2715'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} testID="progress-bar" />
        </View>

        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.questionText} testID="question-text">{questionText}</Text>
          <View style={styles.optionsContainer}>
            {options.map((opt: any) => {
              const optText = opt.text?.['de-DE'] || opt.text || '';
              const isSelected = selectedOption === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  testID={`option-${opt.id}`}
                  style={[styles.optionBtn, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(question.id, opt.id)}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={isSelected ? 25 : 12} tint="dark" style={styles.optionBlur}>
                    <View style={styles.optionInner}>
                      <View style={[styles.optionBadge, isSelected && styles.optionBadgeActive]}>
                        <Text style={[styles.optionBadgeText, isSelected && styles.optionBadgeTextActive]}>{opt.id}</Text>
                      </View>
                      <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{optText}</Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night.bg },
  loadContainer: { flex: 1, backgroundColor: COLORS.night.bg, justifyContent: 'center', alignItems: 'center' },
  loadText: { color: COLORS.night.textSub, fontSize: 16, marginTop: SPACING.m },
  safeArea: { flex: 1, paddingHorizontal: SPACING.l },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.m },
  navText: { fontSize: 24, color: COLORS.night.text },
  disabled: { opacity: 0.3 },
  progress: { fontSize: 14, color: COLORS.night.textSub, fontWeight: '600' },
  progressBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: SPACING.xl },
  progressBarFill: { height: 3, backgroundColor: COLORS.night.accent, borderRadius: 2 },
  questionContainer: { flex: 1, justifyContent: 'center' },
  questionText: { fontSize: 22, fontWeight: '600', color: COLORS.night.text, lineHeight: 32, marginBottom: SPACING.xl, textAlign: 'center' },
  optionsContainer: { gap: SPACING.m },
  optionBtn: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glass.border },
  optionSelected: { borderColor: COLORS.night.accent },
  optionBlur: { borderRadius: 20, overflow: 'hidden' },
  optionInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, paddingHorizontal: SPACING.l, minHeight: 56 },
  optionBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.m },
  optionBadgeActive: { backgroundColor: COLORS.night.accent },
  optionBadgeText: { fontSize: 14, fontWeight: '700', color: COLORS.night.textSub },
  optionBadgeTextActive: { color: '#FFFFFF' },
  optionText: { flex: 1, fontSize: 15, color: COLORS.night.text, lineHeight: 22 },
  optionTextActive: { fontWeight: '600' },
});
