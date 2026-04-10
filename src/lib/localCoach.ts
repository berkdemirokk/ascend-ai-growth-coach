import { DailyTask, Message, Path, UserProfile } from '../types';
import { getAdaptationSignal, getSignalLabel } from './adaptation';
import { getCoachMemoryTasks, isPremiumProfile } from './premium';
import { getWeeklyReviewSummary } from './weeklyReview';
import { getAdaptivePlanSummary } from './adaptivePlan';
import { getPathLabel } from './productCopy';
import { formatUiText } from './textFormat';

const pathLabels: Record<Path, string> = {
  fitness: 'Spor ve Sağlık',
  culture: 'Genel Kültür',
  social: 'Sosyal İlişkiler',
  entertainment: 'Kültür ve Sanat',
  career: 'Kariyer',
  general: 'Genel Gelişim',
};

export const buildWelcomeMessage = (profile: UserProfile, activeTask: DailyTask | null) =>
  `Merhaba ${profile.name}. Odak alanın ${getPathLabel(profile.selectedPath)}. ${
    activeTask
      ? `Bugünün görevi: "${formatUiText(activeTask.title)}". İstersen önce bu görevin neden önemli olduğunu netleştirelim.`
      : 'Bugün için hazır görev görünmüyor. Yine de odağını birlikte netleştirebiliriz.'
  }`;

const findKeywords = (input: string) => {
  const lowered = input.toLowerCase();
  return {
    decision: lowered.includes('karar') || lowered.includes('seçmek') || lowered.includes('seçenek'),
    motivation: lowered.includes('motivasyon') || lowered.includes('ertele') || lowered.includes('zorlan'),
    plan: lowered.includes('plan') || lowered.includes('program') || lowered.includes('günlük'),
    mission: lowered.includes('görev') || lowered.includes('bugün') || lowered.includes('ders'),
  };
};

const focusSuggestion = (path: Path | null) => {
  switch (path) {
    case 'fitness':
      return ['harekete başlamayı kolaylaştır', 'öğün seçimini sadeleştir', 'yarın için ortam hazırlığını bugünden yap'];
    case 'culture':
      return ['okuma süresini kısa tut ama aksatma', 'tek fikir notu çıkar', 'öğrendiğini kendi cümlenle tekrar et'];
    case 'social':
      return ['tek bir açık uçlu soru sor', 'dikkatini tek kişide tut', 'kısa ama bilinçli temas kur'];
    case 'entertainment':
      return ['ne tüketeceğini önceden seç', 'tüketim sonrası tek not al', 'algoritma yerine bilinçli seçim yap'];
    case 'career':
      return ['tek kritik işe odaklan', 'ilk 10 dakikayı netleştir', 'gün sonu yarın için kapanış yap'];
    default:
      return ['tek öncelik belirle', '25 dakikalık odak bloğu kur', 'gün sonu kısa değerlendirme yap'];
  }
};

const getRecentReflection = (profile: UserProfile, tasks: DailyTask[]) =>
  getCoachMemoryTasks(profile, tasks)
    .map((task) => `- ${task.title}: ${task.reflection}`);

export const buildCoachReply = (
  profile: UserProfile,
  history: Message[],
  input: string,
  activeTask: DailyTask | null,
  tasks: DailyTask[],
) => {
  const keywords = findKeywords(input);
  const suggestions = focusSuggestion(profile.selectedPath);
  const recentUserMessages = history.filter((message) => message.role === 'user').slice(-3).map((message) => `- ${message.text}`);
  const recentReflections = getRecentReflection(profile, tasks);
  const adaptationSignal = getAdaptationSignal(tasks);
  const signalLabel = getSignalLabel(adaptationSignal);
  const weeklyReview = isPremiumProfile(profile) ? getWeeklyReviewSummary(profile, tasks) : null;
  const adaptivePlan = isPremiumProfile(profile) ? getAdaptivePlanSummary(profile, tasks) : null;

  if (keywords.mission && activeTask) {
    return `Bugünün görevine odaklanalım.\n\n- Görev: ${formatUiText(activeTask.title)}\n- Neden önemli: ${formatUiText(activeTask.teaching)}\n- Kısa aksiyon: ${formatUiText(activeTask.description)}\n\nUygulama adımları:\n1. Başlama saatini netleştir.\n2. İlk 10 dakikayı tamamla.\n3. Bitince kısa yansıtma yaz.`;
  }

  if (keywords.decision) {
    return `Bunu netleştirelim:\n\n1. Seçeneklerini tek tek yaz.\n2. Her seçenek için kısa vadeli etkisini not et.\n3. Bir hafta sonra en az pişman edecek seçeneği al.\n\nBaşlamadan önce şu üç soruya cevap ver:\n- En önemli kriterin ne?\n- En büyük risk ne?\n- Ertelemenin maliyeti ne?`;
  }

  if (keywords.plan) {
    return `${signalLabel} aktif.\n\nBugün için sade plan:\n- ${suggestions[0]}\n- ${suggestions[1]}\n- ${suggestions[2]}\n\nSıralı ilerle. Önce en küçük adımla başla.`;
  }

  if (keywords.motivation) {
    return `Motivasyon beklemek yerine sürtünmeyi azaltalım.\n\n- Hedefi 10 dakikalık parçaya böl.\n- Başlama anını netleştir.\n- Bitince küçük bir kapanış notu yaz.\n\nBugün 10 dakikada hangi tek adımı atabilirsin?`;
  }

  return `Seni duyuyorum. Odak alanımız ${pathLabels[profile.selectedPath ?? 'general']}. Aktif tempo: ${signalLabel}.\n\n${
    activeTask
      ? `Bugünün görevi: ${formatUiText(activeTask.title)}\nBugünkü aksiyon: ${formatUiText(activeTask.description)}\n`
      : ''
  }${
    weeklyReview
      ? `Haftalık özet:\n- ${weeklyReview.memorySummary}\n- Tempo: ${weeklyReview.momentum}\n`
      : ''
  }${
    adaptivePlan
      ? `Adaptif plan:\n- Odak: ${adaptivePlan.focusTitle}\n- Neden: ${adaptivePlan.focusReason}\n- Sonraki adım: ${adaptivePlan.nextMove}\n`
      : ''
  }${
    recentReflections.length > 0
      ? `Son yansımaların:\n${recentReflections.join('\n')}\n`
      : ''
  }${
    recentUserMessages.length > 0
      ? `Son mesajların:\n${recentUserMessages.join('\n')}\n`
      : ''
  }\nŞimdi şöyle ilerleyelim:\n- Sorunu tek cümlede tanımla.\n- Bugün etkileyebileceğin parçayı seç.\n- Onun için 15 dakikalık bir adım belirle.`;
};

export const buildDecisionResult = (options: string[]) => {
  const cleaned = options.map((option) => option.trim()).filter(Boolean);
  if (cleaned.length < 2) {
    return 'Sağlıklı bir karar için en az iki net seçenek gerekli.';
  }

  const scored = cleaned
    .map((option) => ({
      option,
      score:
        (option.length >= 8 ? 1 : 0) +
        (/\b(uzun|geliş|öğren|kalıcı|düzen|strateji)\b/i.test(option) ? 2 : 0) +
        (/\b(kolay|hemen|anlık)\b/i.test(option) ? -1 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  const winner = scored[0];
  return `"${winner.option}" daha güçlü görünüyor. Nedeni: kısa rahatlama yerine daha kalıcı fayda üretme ihtimali daha yüksek. Kararı bugün küçük bir ilk adımla sabitle.`;
};
