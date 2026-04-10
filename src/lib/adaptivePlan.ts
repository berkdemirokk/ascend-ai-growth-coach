import { DailyTask, UserProfile } from '../types';
import { getAdaptationSignal, getSignalLabel } from './adaptation';
import { getWeeklyReviewSummary } from './weeklyReview';

export interface AdaptivePlanSummary {
  focusTitle: string;
  focusReason: string;
  nextMove: string;
  coachMode: string;
  signalLabel: string;
}

export const getAdaptivePlanDirection = (profile: UserProfile, tasks: DailyTask[]) => {
  const review = getWeeklyReviewSummary(profile, tasks);
  const signal = getAdaptationSignal(tasks);

  if (review.momentum === 'stalled' || signal === 'needs_support') {
    return 'support' as const;
  }

  if (review.momentum === 'building' && signal === 'ready_to_push') {
    return 'stretch' as const;
  }

  return 'standard' as const;
};

export const getAdaptivePlanSummary = (profile: UserProfile, tasks: DailyTask[]): AdaptivePlanSummary => {
  const direction = getAdaptivePlanDirection(profile, tasks);
  const signalLabel = getSignalLabel(getAdaptationSignal(tasks));

  if (direction === 'support') {
    return {
      focusTitle: 'Sistemi sadeleştir',
      focusReason: 'Son hafta tempo dalgalandı. Büyük hedef yerine tekrar eden küçük adımı korumak daha değerli.',
      nextMove: 'Yarın görevi 10 dakikalık bir başlangıçla aç ve kısa yansıtmayı atlama.',
      coachMode: 'Daha sakin ve destekleyici bir plan tonu kullan.',
      signalLabel,
    };
  }

  if (direction === 'stretch') {
    return {
      focusTitle: 'Seviyeyi yükselt',
      focusReason: 'Tamamlama ritmi güçlendi. Aynı düzeni koruyarak biraz daha iddialı bir adım atılabilir.',
      nextMove: 'Yarın görevinde görünür bir çıktı üret veya odak süresini bir kademe artır.',
      coachMode: 'Daha net ve sonuç odaklı bir plan tonu kullan.',
      signalLabel,
    };
  }

  return {
    focusTitle: 'Ritmi koru',
    focusReason: 'Sistem çalışıyor. Bu aşamada amaç fazla yüklenmek değil, standardı istikrarlı sürdürmek.',
    nextMove: 'Yarın göreve benzer saat aralığında başla, kapanış notunu koru ve seriyi sürdür.',
    coachMode: 'Dengeli, net ve sakin bir plan tonu kullan.',
    signalLabel,
  };
};
