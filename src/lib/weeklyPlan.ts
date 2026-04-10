import { DailyTask, UserProfile, WeeklyPlanSnapshot } from '../types';
import { getAdaptivePlanDirection, getAdaptivePlanSummary } from './adaptivePlan';
import { getWeeklyReviewSummary } from './weeklyReview';

export interface WeeklyPlanDay {
  day: number;
  title: string;
  focus: string;
  checkpoint: string;
  branchFocus: 'support' | 'standard' | 'stretch';
}

export interface WeeklyPlanPreview {
  direction: 'support' | 'standard' | 'stretch';
  title: string;
  summary: string;
  days: WeeklyPlanDay[];
}

const getWeekKey = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  const weekday = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - weekday);
  return date.toISOString().slice(0, 10);
};

const buildSupportPlan = (reviewSummary: ReturnType<typeof getWeeklyReviewSummary>): WeeklyPlanPreview => ({
  direction: 'support',
  title: '7 günlük destek rotası',
  summary: `Ritim son haftada dalgalandı. Bu plan, ${reviewSummary.dominantUnitTitle ?? 'aktif alan'} etrafında sistemi sadeleştirip tekrarlı mini tamamlamalara odaklanır.`,
  days: [
    { day: 1, title: 'Baslangici kucult', focus: 'Bugunun gorevini sadece ilk 10 dakikaya sigacak sekilde bitir.', checkpoint: 'Tamamlamak mi, baslamak mi daha zordu?', branchFocus: 'support' },
    { day: 2, title: 'Ortami sadele', focus: 'Goreve baslamadan once tek bir dikkat dagiticiyi kaldir.', checkpoint: 'Baslama surtunmesi azaldi mi?', branchFocus: 'support' },
    { day: 3, title: 'Ayni saatte geri don', focus: 'Gorevi dunle ayni saat araliginda ac.', checkpoint: 'Tekrar zamani bulmak kolaylasti mi?', branchFocus: 'support' },
    { day: 4, title: 'Yarim guc kabul', focus: 'Perfekt olmadan, gorevin en hafif versiyonunu tamamla.', checkpoint: 'Eksik ama devam eden ritim sende ne yaratti?', branchFocus: 'support' },
    { day: 5, title: 'Reflectioni koru', focus: 'Gorev sonrasi yansitmayi bos gecme; tek cumle bile olsa yaz.', checkpoint: 'Reflection motivasyonu etkiledi mi?', branchFocus: 'support' },
    { day: 6, title: 'Destek sinyali kur', focus: 'Goreve baslamayi kolaylastiran tek bir tetikleyici belirle.', checkpoint: 'Hangi tetikleyici en gercekci geldi?', branchFocus: 'support' },
    { day: 7, title: 'Mini review', focus: 'Haftanin en iyi calisan mini davranisini sec ve koru.', checkpoint: 'Gelecek hafta neyi oldugu gibi tasiyacaksin?', branchFocus: 'support' },
  ],
});

const buildStandardPlan = (reviewSummary: ReturnType<typeof getWeeklyReviewSummary>): WeeklyPlanPreview => ({
  direction: 'standard',
  title: '7 günlük standart rota',
  summary: `Sistem şu an çalışıyor. Bu plan, ${reviewSummary.dominantUnitTitle ?? 'mevcut yol'} içinde ritmi koruyup tekrar kalitesini sabitlemeye odaklanır.`,
  days: [
    { day: 1, title: 'Ayni standardi koru', focus: 'Bugunun gorevini planlanan sekilde tamamla.', checkpoint: 'Beklenen ritim korunabildi mi?', branchFocus: 'standard' },
    { day: 2, title: 'Tekrar penceresi', focus: 'Gorev oncesi onceki reflectiona 1 dakika goz at.', checkpoint: 'Hatirlamak gorevi etkiledi mi?', branchFocus: 'standard' },
    { day: 3, title: 'Biraz daha netlik', focus: 'Goreve baslamadan once bitmis hali tek cumleyle tanimla.', checkpoint: 'Netlik uygulamayi hizlandirdi mi?', branchFocus: 'standard' },
    { day: 4, title: 'Tempo kontrolu', focus: 'Ayni saat bandinda devam etmeye calis.', checkpoint: 'Zaman sabitligi fark yaratiyor mu?', branchFocus: 'standard' },
    { day: 5, title: 'Quality close', focus: 'Reflectionda sadece ne yaptigini degil ne ogrendigini yaz.', checkpoint: 'Ogrenme dili guclendi mi?', branchFocus: 'standard' },
    { day: 6, title: 'Checkpoint hazirligi', focus: 'Bu haftadan bir davranisi bilincli olarak tekrar sec.', checkpoint: 'Hangi davranis omurga gibi hissettiriyor?', branchFocus: 'standard' },
    { day: 7, title: 'Haftayi kilitle', focus: 'Haftadan tasiyacagin tek standart davranisi sec.', checkpoint: 'Bir sonraki haftaya ne tasiyorsun?', branchFocus: 'standard' },
  ],
});

const buildStretchPlan = (reviewSummary: ReturnType<typeof getWeeklyReviewSummary>): WeeklyPlanPreview => ({
  direction: 'stretch',
  title: '7 günlük ileri rota',
  summary: `Momentum güçleniyor. Bu plan, ${reviewSummary.dominantUnitTitle ?? 'aktif yol'} içinde görevleri biraz daha görünür çıktı ve zorlayıcı tekrar tarafına iter.`,
  days: [
    { day: 1, title: 'Cikiyi buyut', focus: 'Bugunun gorevinde minimumun bir tik ustune cik.', checkpoint: 'Ek zorluk seni itti mi, dagitti mi?', branchFocus: 'stretch' },
    { day: 2, title: 'Gorunur sonuc', focus: 'Gorev sonunda gorunur bir cikti veya net not birak.', checkpoint: 'Sonuc hissi motivasyonu artirdi mi?', branchFocus: 'stretch' },
    { day: 3, title: 'Sureni uzat', focus: 'Odak blogunu biraz daha uzun tut veya tekrar sayisini arttir.', checkpoint: 'Hangi noktada direnclenme basladi?', branchFocus: 'stretch' },
    { day: 4, title: 'Ikinci tekrar', focus: 'Ayni gun kisa bir ikinci mini tekrar ekle.', checkpoint: 'Ikinci tekrar seni yipratti mi guclendirdi mi?', branchFocus: 'stretch' },
    { day: 5, title: 'Daha net olcu', focus: 'Bugunku gorevde bir olcu yaz: sure, tekrar, cikti veya not.', checkpoint: 'Olculen sey daha guclu hissettirdi mi?', branchFocus: 'stretch' },
    { day: 6, title: 'Stretch reflection', focus: 'Reflectionda bir sonraki seviye icin neyin hazir oldugunu yaz.', checkpoint: 'Gercekten hazir misin yoksa sadece motive misin?', branchFocus: 'stretch' },
    { day: 7, title: 'Push review', focus: 'Bu haftadan tasiyacagin zorlayici ama surdurulebilir davranisi sec.', checkpoint: 'Gelecek hafta neyi bilincli olarak yukselteceksin?', branchFocus: 'stretch' },
  ],
});

const getCompletedCurriculumCount = (tasks: DailyTask[]) =>
  tasks.filter((task) => task.completed && task.source === 'curriculum').length;

export const createWeeklyPlanSnapshot = (profile: UserProfile, tasks: DailyTask[], timestamp = Date.now()): WeeklyPlanSnapshot => {
  const plan = getWeeklyPlanPreview(profile, tasks);

  return {
    weekKey: getWeekKey(timestamp),
    direction: plan.direction,
    title: plan.title,
    summary: plan.summary,
    days: plan.days,
    createdAt: timestamp,
  };
};

export const ensureWeeklyPlanSnapshot = (
  profile: UserProfile,
  tasks: DailyTask[],
  snapshot: WeeklyPlanSnapshot | null,
  timestamp = Date.now(),
) => {
  if (profile.planTier !== 'premium') {
    return null;
  }

  const activeWeekKey = getWeekKey(timestamp);
  if (snapshot && snapshot.weekKey === activeWeekKey) {
    return snapshot;
  }

  return createWeeklyPlanSnapshot(profile, tasks, timestamp);
};

export const getCurrentWeeklyPlanDay = (
  profile: UserProfile,
  tasks: DailyTask[],
  snapshot?: WeeklyPlanSnapshot | null,
) => {
  const plan = snapshot ?? getWeeklyPlanPreview(profile, tasks);
  const completedCount = getCompletedCurriculumCount(tasks);
  const stepIndex = completedCount % plan.days.length;

  return plan.days[stepIndex] ?? plan.days[0];
};

export const getWeeklyPlanPreview = (profile: UserProfile, tasks: DailyTask[]): WeeklyPlanPreview => {
  const reviewSummary = getWeeklyReviewSummary(profile, tasks);
  const adaptiveSummary = getAdaptivePlanSummary(profile, tasks);
  const direction = getAdaptivePlanDirection(profile, tasks);

  const basePlan =
    direction === 'support'
      ? buildSupportPlan(reviewSummary)
      : direction === 'stretch'
        ? buildStretchPlan(reviewSummary)
        : buildStandardPlan(reviewSummary);

  return {
    ...basePlan,
    summary: `${adaptiveSummary.focusTitle}: ${basePlan.summary}`,
  };
};
