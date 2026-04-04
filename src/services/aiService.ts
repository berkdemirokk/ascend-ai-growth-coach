import { AI_PROXY_URL } from '../env';
import { AI_RUNTIME } from '../lib/runtime';
import { DailyTask, Path, TaskDraft, UserProfile } from '../types';

export interface AIResponse {
  text: string;
}

interface StructuredCoaching {
  well: string;
  slipped: string;
  next: string;
  recommendation: string;
}

interface EvolutionInsight {
  analysis: string;
  secretMission: string;
  quote: string;
}

const pathLabels: Record<Path, string> = {
  fitness: 'sağlık ve fiziksel dayanıklılık',
  culture: 'genel kültür ve öğrenme',
  social: 'sosyal ilişkiler',
  entertainment: 'kültür ve sanat',
  career: 'kariyer gelişimi',
  general: 'genel yaşam disiplini',
};

const generatedTaskTemplates: Record<Path, TaskDraft[]> = {
  fitness: [
    {
      title: '10 dakikalık tempolu yürüyüş yap',
      description: 'Bugün kısa ama ritimli bir yürüyüşle vücudunu uyandır.',
      category: 'fitness',
      priority: 'high',
      source: 'generated',
    },
    {
      title: '2 bardak suyu erken saatte bitir',
      description: 'Günün ilk bölümünde su hedefini erkenden tamamla.',
      category: 'fitness',
      priority: 'medium',
      source: 'generated',
    },
    {
      title: '5 dakikalık esneme rutini uygula',
      description: 'Boyun, omuz ve bel bölgesine odaklanan kısa bir esneme yap.',
      category: 'fitness',
      priority: 'medium',
      source: 'generated',
    },
  ],
  culture: [
    {
      title: '15 dakika odaklı okuma yap',
      description: 'Dikkatini dağıtmadan tek bir metne odaklan ve not çıkar.',
      category: 'culture',
      priority: 'high',
      source: 'generated',
    },
    {
      title: 'Bugün öğrendiğin bir bilgiyi yaz',
      description: 'Yeni bir bilgiyi kısa bir özet halinde notlarına ekle.',
      category: 'culture',
      priority: 'medium',
      source: 'generated',
    },
    {
      title: 'Tek bir konuda merak araştırması yap',
      description: 'Merak ettiğin bir başlığı 10 dakika boyunca araştır.',
      category: 'culture',
      priority: 'medium',
      source: 'generated',
    },
  ],
  social: [
    {
      title: 'Bir kişiye içten bir mesaj gönder',
      description: 'Uzun zamandır konuşmadığın birine kısa ama samimi bir mesaj yaz.',
      category: 'social',
      priority: 'high',
      source: 'generated',
    },
    {
      title: 'Bugün bir sohbet başlat',
      description: 'Gün içinde yeni bir sohbet başlatmak için küçük bir fırsat yarat.',
      category: 'social',
      priority: 'medium',
      source: 'generated',
    },
    {
      title: 'Birine dikkatle kulak ver',
      description: 'Bugün bir konuşmada sadece gerçekten dinlemeye odaklan.',
      category: 'social',
      priority: 'medium',
      source: 'generated',
    },
  ],
  entertainment: [
    {
      title: 'Bir kültür-sanat önerisi seç',
      description: 'Bugün bir film, belgesel ya da sergi önerisi bul ve kaydet.',
      category: 'entertainment',
      priority: 'medium',
      source: 'generated',
    },
    {
      title: '15 dakikalık ilham molası ver',
      description: 'Sevdiğin yaratıcı bir içeriği bilinçli şekilde tüket ve not al.',
      category: 'entertainment',
      priority: 'low',
      source: 'generated',
    },
    {
      title: 'Bir sahneyi ya da fikri yorumla',
      description: 'İzlediğin veya okuduğun bir içerikten aklında kalan şeyi yaz.',
      category: 'entertainment',
      priority: 'medium',
      source: 'generated',
    },
  ],
  career: [
    {
      title: '25 dakikalık derin çalışma yap',
      description: 'Tek bir işle ilgili dikkat dağıtıcı her şeyi kapat ve odaklan.',
      category: 'career',
      priority: 'high',
      source: 'generated',
    },
    {
      title: 'Bir küçük profesyonel çıktı üret',
      description: 'Bir not, mail taslağı veya mini plan hazırlayarak ilerleme yarat.',
      category: 'career',
      priority: 'high',
      source: 'generated',
    },
    {
      title: 'Geliştirmek istediğin bir beceriyi çalış',
      description: 'Kariyer hedefin için 15 dakika kas hafızası oluştur.',
      category: 'career',
      priority: 'medium',
      source: 'generated',
    },
  ],
  general: [
    {
      title: 'Günün en önemli işini erken bitir',
      description: 'Zihnin tazeyken seni ileri taşıyacak tek işi seç ve bitir.',
      category: 'general',
      priority: 'high',
      source: 'generated',
    },
    {
      title: '10 dakikalık dikkat temizliği yap',
      description: 'Bildirimleri kapat, masanı toparla ve odağını sıfırla.',
      category: 'general',
      priority: 'medium',
      source: 'generated',
    },
    {
      title: 'Akşam için kısa bir değerlendirme notu bırak',
      description: 'Bugün neyin iyi gittiğini tek cümleyle yaz ve görünür bırak.',
      category: 'general',
      priority: 'low',
      source: 'generated',
    },
  ],
};

function getCompletedTasks(tasks: DailyTask[]) {
  return tasks.filter((task) => task.completedAt);
}

function getPendingTasks(tasks: DailyTask[]) {
  return tasks.filter((task) => !task.completed);
}

async function requestProxy<T>(action: string, payload: unknown): Promise<T | null> {
  if (!AI_PROXY_URL) {
    return null;
  }

  const response = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI proxy request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

function handleProxyFailure(context: string, error: unknown): never | void {
  console.error(context, error);
  if (AI_RUNTIME.hasTrustedAIBackend) {
    throw error instanceof Error ? error : new Error(`${context} failed.`);
  }
}

function throwIfTrustedProxyReturnedInvalid(action: string, response: unknown) {
  if (AI_RUNTIME.hasTrustedAIBackend) {
    throw new Error(`AI proxy returned an invalid ${action} response.`);
  }

  return response;
}

function getDailyTaskTarget(dailyTime?: UserProfile['dailyTime'], intensity?: UserProfile['intensity']) {
  const baseByTime: Record<NonNullable<UserProfile['dailyTime']>, number> = {
    '15m': 2,
    '30m': 2,
    '1h': 3,
    '2h+': 3,
  };

  const modifierByIntensity: Record<NonNullable<UserProfile['intensity']>, number> = {
    casual: 0,
    regular: 0,
    intense: 1,
  };

  if (!dailyTime) {
    return 2;
  }

  return Math.min(3, baseByTime[dailyTime] + (intensity ? modifierByIntensity[intensity] : 0));
}

function buildProfileAnalysisFallback(input: {
  name: string;
  selectedPath: string | null;
  currentLevel: string;
  intensity: string;
  dailyTime: string;
}) {
  const pathLabel = input.selectedPath ? pathLabels[input.selectedPath as Path] ?? 'kişisel gelişim' : 'kişisel gelişim';
  const intensityCopy =
    input.intensity === 'intense'
      ? 'yüksek tempoda'
      : input.intensity === 'regular'
        ? 'istikrarlı bir tempoda'
        : 'rahat ama sürdürülebilir bir tempoda';

  return `${input.name}, ${pathLabel} alanında ${intensityCopy} ilerlemeye hazırsın. ${input.dailyTime} odaklı çalışma penceresiyle küçük ama düzenli adımlar kısa sürede görünür sonuç üretecek.`;
}

function buildDecisionFallback(prompt: string) {
  const options = prompt
    .split(':')
    .pop()
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!options || options.length < 2) {
    return 'İlk net adımı seç ve onu bugün bitir. Hızlı netlik, uzun kararsızlıktan iyidir.';
  }

  const [bestOption, backupOption] = [...options].sort((left, right) => left.length - right.length);
  return `${bestOption} seçeneğiyle başla. Daha yalın ve uygulanabilir görünen seçenek genelde daha hızlı ivme üretir; ${backupOption} ise ikinci adım olarak bekleyebilir.`;
}

function buildEvolutionFallback(profile: UserProfile, tasks: DailyTask[]): EvolutionInsight {
  const completedCount = getCompletedTasks(tasks).length;
  const pendingCount = getPendingTasks(tasks).length;

  return {
    analysis:
      completedCount === 0
        ? `${profile.name}, sistemini kurma aşamasındasın. İlk tamamlanan görevden sonra ivme çok daha görünür hale gelecek.`
        : `${profile.name}, şu ana kadar ${completedCount} görevi bitirdin ve ${profile.streak} günlük bir istikrar çizgisi oluşturdun. Kalan ${pendingCount} görev için ritmini korursan gelişimin daha da netleşecek.`,
    secretMission:
      pendingCount > 0
        ? `Bugün bekleyen görevler arasından en çok sürüncemede bıraktığını seç ve ilk 15 dakikasını hemen başlat.`
        : 'Bugün kendine bir çıta yükselt: seni hafifçe zorlayan tek bir yeni görev yaz ve tamamla.',
    quote: 'Disiplin görünmezken inşa edilir, sonuçlar ise sonra konuşur.',
  };
}

function buildCoachingFallback(profile: UserProfile, tasks: DailyTask[]): StructuredCoaching {
  const completedCount = getCompletedTasks(tasks).length;
  const pendingTasks = getPendingTasks(tasks);

  return {
    well:
      completedCount > 0
        ? `Tamamladığın görev sayısı ${completedCount}. Yani motivasyona değil, davranışa yaslanan bir düzen kurmaya başlamışsın.`
        : 'Henüz ilk bitiş çizgini geçmedin ama sistem kurma niyetin çok net. Başlangıç enerjisi hâlâ elinde.',
    slipped:
      pendingTasks.length > 2
        ? `Aynı anda çok fazla açık uç bıraktığında odağın bölünüyor. Şu anda ${pendingTasks.length} görev bekliyor; bu sayı karar yorgunluğu yaratabilir.`
        : 'Ritmin fena değil ama kazanımını görünür kılmak için daha net bir günlük kapanış düzenine ihtiyacın var.',
    next:
      pendingTasks[0]
        ? `Sıradaki adımın: "${pendingTasks[0].title}" görevini bugünün ilk odak bloğuna yerleştir.`
        : 'Bir sonraki adımın: yarına kalmadan yeni bir hedef belirleyip ilk adımını bugün atmak.',
    recommendation:
      profile.currentLevel === 'beginner'
        ? 'Çıtayı küçük tut ama her gün görünür bir tamamlanmışlık üret.'
        : 'Az ama net görevlerle ilerle; kaliteyi sayının önüne koy.',
  };
}

function buildTaskDrafts(profile: Pick<UserProfile, 'selectedPath' | 'dailyTime' | 'intensity'>) {
  const selectedPath = profile.selectedPath ?? 'general';
  const templates = generatedTaskTemplates[selectedPath];
  const taskTarget = getDailyTaskTarget(profile.dailyTime, profile.intensity);
  return templates.slice(0, taskTarget);
}

function detectCategory(input: string): Path {
  const normalized = input.toLocaleLowerCase('tr-TR');

  if (/(spor|yürüyüş|koşu|su iç|egzersiz|antrenman)/i.test(normalized)) return 'fitness';
  if (/(kitap|oku|araştır|öğren|makale|not çıkar)/i.test(normalized)) return 'culture';
  if (/(arkadaş|mesaj|ara|toplantı|konuş|tanış)/i.test(normalized)) return 'social';
  if (/(film|dizi|müzik|sergi|sanat|belgesel)/i.test(normalized)) return 'entertainment';
  if (/(iş|kariyer|sunum|mail|proje|çalış|toplantı|kod)/i.test(normalized)) return 'career';
  return 'general';
}

function detectPriority(input: string): DailyTask['priority'] {
  const normalized = input.toLocaleLowerCase('tr-TR');
  if (/(acil|önemli|mutlaka|bugün bitir)/i.test(normalized)) return 'high';
  if (/(sonra|vakit bulursam|opsiyonel)/i.test(normalized)) return 'low';
  return 'medium';
}

function detectReminderTime(input: string) {
  const match = input.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (!match) {
    return undefined;
  }

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export async function generateAIResponse(prompt: string, context: string): Promise<AIResponse> {
  try {
    const response = await requestProxy<AIResponse>('decision-support', {
      prompt,
      context,
    });

    if (response?.text) {
      return response;
    }
    throwIfTrustedProxyReturnedInvalid('decision-support', response);
  } catch (error) {
    handleProxyFailure('AI proxy error:', error);
  }

  return {
    text: buildDecisionFallback(prompt),
  };
}

export async function generateProfileAnalysis(input: {
  name: string;
  selectedPath: string | null;
  currentLevel: string;
  intensity: string;
  dailyTime: string;
}): Promise<string> {
  try {
    const response = await requestProxy<{ text: string }>('profile-analysis', input);
    if (response?.text) {
      return response.text;
    }
    throwIfTrustedProxyReturnedInvalid('profile-analysis', response);
  } catch (error) {
    handleProxyFailure('Profile analysis error:', error);
  }

  return buildProfileAnalysisFallback(input);
}

export async function generateEvolutionAnalysis(profile: UserProfile, tasks: DailyTask[]): Promise<EvolutionInsight> {
  try {
    const response = await requestProxy<EvolutionInsight>('evolution-insight', {
      profile,
      tasks,
    });
    if (response?.analysis && response.secretMission && response.quote) {
      return response;
    }
    throwIfTrustedProxyReturnedInvalid('evolution-insight', response);
  } catch (error) {
    handleProxyFailure('Evolution insight error:', error);
  }

  return buildEvolutionFallback(profile, tasks);
}

export async function generateDailyInsight(profile: UserProfile, tasks: DailyTask[]): Promise<string> {
  try {
    const response = await requestProxy<{ text: string }>('daily-insight', {
      profile,
      tasks,
    });
    if (response?.text) {
      return response.text;
    }
    throwIfTrustedProxyReturnedInvalid('daily-insight', response);
  } catch (error) {
    handleProxyFailure('Daily insight error:', error);
  }

  const pendingCount = getPendingTasks(tasks).length;
  if (pendingCount === 0) {
    return 'Bugün disiplin kasını korumak için yeni bir hedef belirle.';
  }

  return `Bugün en önemli ${Math.min(2, pendingCount)} işe önce başla; momentum günün tonunu belirler.`;
}

export async function generateTasksFromProfile(profile: Pick<UserProfile, 'selectedPath' | 'dailyTime' | 'intensity'> & { analysis?: string }): Promise<TaskDraft[]> {
  try {
    const response = await requestProxy<TaskDraft[]>('task-plan', profile);
    if (Array.isArray(response) && response.length > 0) {
      return response.map((task) => ({
        ...task,
        source: task.source ?? AI_RUNTIME.generatedTaskSource,
      }));
    }
    throwIfTrustedProxyReturnedInvalid('task-plan', response);
  } catch (error) {
    handleProxyFailure('Task generation error:', error);
  }

  return buildTaskDrafts(profile as Pick<UserProfile, 'selectedPath' | 'dailyTime' | 'intensity'>).map((task) => ({
    ...task,
    source: AI_RUNTIME.generatedTaskSource,
  }));
}

export async function generateStructuredCoaching(profile: UserProfile, tasks: DailyTask[]): Promise<StructuredCoaching> {
  try {
    const response = await requestProxy<StructuredCoaching>('structured-coaching', {
      profile,
      tasks,
    });
    if (response?.well && response.slipped && response.next && response.recommendation) {
      return response;
    }
    throwIfTrustedProxyReturnedInvalid('structured-coaching', response);
  } catch (error) {
    handleProxyFailure('Structured coaching error:', error);
  }

  return buildCoachingFallback(profile, tasks);
}

export async function parseTask(input: string): Promise<Pick<TaskDraft, 'title' | 'category' | 'priority' | 'reminderTime'>> {
  try {
    const response = await requestProxy<Pick<TaskDraft, 'title' | 'category' | 'priority' | 'reminderTime'>>('parse-task', {
      input,
    });
    if (response?.title && response.category && response.priority) {
      return response;
    }
    throwIfTrustedProxyReturnedInvalid('parse-task', response);
  } catch (error) {
    handleProxyFailure('Task parse error:', error);
  }

  return {
    title: input.replace(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g, '').trim() || input,
    category: detectCategory(input),
    priority: detectPriority(input),
    reminderTime: detectReminderTime(input),
  };
}
