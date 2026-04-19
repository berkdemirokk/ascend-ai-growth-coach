import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';
import { getLessonById } from '../config/lessons';
import { useApp } from '../contexts/AppContext';

export default function LessonScreen({ route, navigation }) {
  const { lessonId } = route?.params || {};
  const { completeLesson, lessonCompletions } = useApp();
  const lesson = useMemo(() => getLessonById(lessonId), [lessonId]);

  const [phase, setPhase] = useState('cards'); // 'cards' | 'quiz' | 'result'
  const [cardIndex, setCardIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [resultPayload, setResultPayload] = useState(null);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Ders bulunamadı.</Text>
          <TouchableOpacity onPress={() => navigation?.goBack?.()}>
            <Text style={styles.link}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const alreadyDone = !!lessonCompletions[lesson.id];
  const cards = lesson.cards || [];
  const quiz = lesson.quiz || [];
  const currentCard = cards[cardIndex];
  const currentQuestion = quiz[quizIndex];

  const handleNextCard = () => {
    if (cardIndex < cards.length - 1) {
      setCardIndex((i) => i + 1);
    } else if (quiz.length > 0) {
      setPhase('quiz');
    } else {
      finalize(0);
    }
  };

  const handleSelectOption = (idx) => {
    if (revealed) return;
    setSelectedOption(idx);
  };

  const handleCheck = () => {
    if (!currentQuestion) return;
    const isCorrect =
      currentQuestion.type === 'multiple'
        ? selectedOption === currentQuestion.correctIndex
        : currentQuestion.type === 'truefalse'
          ? (selectedOption === 0) === !!currentQuestion.correct
          : false;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setRevealed(true);
  };

  const handleNextQuestion = () => {
    setRevealed(false);
    setSelectedOption(null);
    if (quizIndex < quiz.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      finalize(correctCount);
    }
  };

  const finalize = (correct) => {
    if (alreadyDone) {
      setPhase('result');
      setResultPayload({ xpEarned: 0, alreadyDone: true });
      return;
    }
    const result = completeLesson(lesson.id, correct);
    setResultPayload(result || { xpEarned: 0 });
    setPhase('result');
  };

  const handleClose = () => {
    if (phase === 'result') {
      navigation?.goBack?.();
      return;
    }
    Alert.alert(
      'Çıkmak istediğine emin misin?',
      'Bu dersteki ilerleme kaybolacak.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Çık', style: 'destructive', onPress: () => navigation?.goBack?.() },
      ],
    );
  };

  // ─── Header ──────────────────────────────────────────────────────────
  const totalSteps = cards.length + quiz.length;
  const stepNum =
    phase === 'cards' ? cardIndex + 1
      : phase === 'quiz' ? cards.length + quizIndex + 1
        : totalSteps;
  const progress = Math.min(stepNum / Math.max(totalSteps, 1), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {phase === 'cards' && currentCard && (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <CardView card={currentCard} />
          <Text style={styles.stepLabel}>
            Kart {cardIndex + 1} / {cards.length}
          </Text>
        </ScrollView>
      )}

      {phase === 'quiz' && currentQuestion && (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          <Text style={styles.quizLabel}>SORU {quizIndex + 1} / {quiz.length}</Text>
          <Text style={styles.quizQuestion}>{currentQuestion.question}</Text>
          {renderOptions(currentQuestion, selectedOption, revealed, handleSelectOption)}
          {revealed && currentQuestion.explanation && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>AÇIKLAMA</Text>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {phase === 'result' && (
        <View style={styles.body}>
          <View style={styles.resultBox}>
            <Text style={styles.resultEmoji}>
              {correctCount === quiz.length ? '🏆' : correctCount > 0 ? '✨' : '📚'}
            </Text>
            <Text style={styles.resultTitle}>Ders Tamamlandı</Text>
            <Text style={styles.resultStat}>
              {correctCount} / {quiz.length} doğru
            </Text>
            {!resultPayload?.alreadyDone && resultPayload?.xpEarned ? (
              <Text style={styles.resultXP}>+{resultPayload.xpEarned} XP</Text>
            ) : (
              <Text style={styles.resultMuted}>Bu ders daha önce tamamlandı.</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        {phase === 'cards' && (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleNextCard}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>
                {cardIndex < cards.length - 1 ? 'Devam' : quiz.length > 0 ? 'Quiz\'e Geç' : 'Bitir'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {phase === 'quiz' && !revealed && (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              selectedOption === null && styles.disabledBtn,
            ]}
            disabled={selectedOption === null}
            activeOpacity={0.85}
            onPress={handleCheck}
          >
            <LinearGradient
              colors={
                selectedOption === null
                  ? [COLORS.border, COLORS.border]
                  : [COLORS.primary, COLORS.accent]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>Kontrol Et</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {phase === 'quiz' && revealed && (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleNextQuestion}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>
                {quizIndex < quiz.length - 1 ? 'Devam' : 'Bitir'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {phase === 'result' && (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.goBack?.()}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>Tamam</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function CardView({ card }) {
  if (card.type === 'tip') {
    return (
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>{card.text}</Text>
      </View>
    );
  }
  return (
    <View style={styles.infoCard}>
      {card.title && <Text style={styles.infoTitle}>{card.title}</Text>}
      <Text style={styles.infoBody}>{card.body}</Text>
    </View>
  );
}

function renderOptions(question, selected, revealed, onSelect) {
  if (question.type === 'truefalse') {
    const opts = [
      { idx: 0, label: 'Doğru' },
      { idx: 1, label: 'Yanlış' },
    ];
    return opts.map((o) => {
      const isSelected = selected === o.idx;
      const isCorrect = revealed && (o.idx === 0) === !!question.correct;
      const isWrong = revealed && isSelected && !isCorrect;
      return (
        <TouchableOpacity
          key={o.idx}
          activeOpacity={0.85}
          style={[
            styles.option,
            isSelected && !revealed && styles.optionSelected,
            isCorrect && styles.optionCorrect,
            isWrong && styles.optionWrong,
          ]}
          onPress={() => onSelect(o.idx)}
        >
          <Text style={styles.optionText}>{o.label}</Text>
        </TouchableOpacity>
      );
    });
  }
  return (question.options || []).map((opt, idx) => {
    const isSelected = selected === idx;
    const isCorrect = revealed && idx === question.correctIndex;
    const isWrong = revealed && isSelected && !isCorrect;
    return (
      <TouchableOpacity
        key={idx}
        activeOpacity={0.85}
        style={[
          styles.option,
          isSelected && !revealed && styles.optionSelected,
          isCorrect && styles.optionCorrect,
          isWrong && styles.optionWrong,
        ]}
        onPress={() => onSelect(idx)}
      >
        <Text style={styles.optionText}>{opt}</Text>
      </TouchableOpacity>
    );
  });
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeIcon: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 40 },
  lessonTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  stepLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  infoBody: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 26,
  },
  tipCard: {
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.gold,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: { fontSize: 28, marginRight: 12 },
  tipText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  quizLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  quizQuestion: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 24,
  },
  option: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  optionWrong: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  optionText: { color: COLORS.text, fontSize: 16, fontWeight: '500' },
  explanationBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  explanationLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  explanationText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryBtn: { borderRadius: 14, overflow: 'hidden' },
  disabledBtn: { opacity: 0.5 },
  primaryGrad: { paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  resultBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  resultEmoji: { fontSize: 80, marginBottom: 16 },
  resultTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultStat: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginBottom: 12,
  },
  resultXP: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: '800',
  },
  resultMuted: { color: COLORS.textMuted, fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, marginBottom: 12 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
