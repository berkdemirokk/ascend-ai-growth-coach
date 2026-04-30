/**
 * Add quiz + proTip to dopamine-detox lessons 6-30 (content already exists).
 * Run: node scripts/seed_dopamine_quiz.js
 */
const fs = require('fs');
const path = require('path');

const PROTIPS_TR = {
  6: 'Telefonu yatak odasının dışına bir saat alarmı koy. Eski usul, etkili.',
  7: 'İlk 1 saat aslan kuralı: telefon yok, internet yok, sadece sen + niyet.',
  8: 'Grayscale = renk yok. Beyin renksiz uygulamaları sıkıcı bulur, otomatik bırakır.',
  9: 'Porno = dopamin enflasyonu. Gerçek bağa düşmanca bir etkidir.',
  10: 'Yarıyolda durup geriye bakmak = ilerlemenin ölçüsü. Yapan başarısı, yapmayan unutkanlığı.',
  11: 'Ortam = en güçlü tetikleyici. Aynı çevrede aynı davranış.',
  12: 'İkinci sıkıntı dalgası 14-17. günler arası gelir. Geçer.',
  13: 'Tek görev disiplin testi. Beyin alışmamış, ama gücü buradan gelir.',
  14: 'Müzik bile uyarıdır. Sessiz dakikalar = beyin için ilaç.',
  15: 'İnsan teması ekran tüketiminden 100x besleyici.',
  16: 'Yarıyı geçtin = arkadan vurulmaz. En zor kısım geçti.',
  17: '4-7-8 nefesi: 4 al, 7 tut, 8 ver. Anlık sakinlik.',
  18: 'Dijital minimalizm = "olmazsa olmaz" + "verimlilik" haricinde her şey.',
  19: 'Yavaşlama = disiplinin görsel formu. Hızlı = kontrolsüz.',
  20: 'Yeni baseline = 30 gün öncenin sıkıntısı şimdi normal.',
  21: 'Tetikleyiciyi yazılı tut: "Hangi durumda telefona uzandım?"',
  22: 'Replacement = telefon refleksi yerine derin nefes / 5 push-up / su iç.',
  23: 'Negatif görselleştirme: "Bu telefonu kontrol edersem ne kaybederim?"',
  24: 'Telefon araç olunca: "açtığımda niyetim ne?" sorusunu sor.',
  25: 'Final sprint = en zor 5 gün. Beyin "tamamlandın" sinyali ister.',
  26: 'Sosyal bağışıklık = "herkes yapıyor" yargısına direnç.',
  27: 'Kalıcı sınır = 30 gün sonu da süren disiplin.',
  28: 'Anlam pratiği = "neden bunu yapıyorum?" sorusunun günlük cevabı.',
  29: 'Yarın son gün = bugün son sprint. Yarına kalmasın.',
  30: 'Tamamlandı ≠ bitti. Tamamlandı = artık sen busun.',
};

const PROTIPS_EN = {
  6: 'Place a real alarm clock outside the bedroom. Old-school, effective.',
  7: 'First-hour lion rule: no phone, no internet, just you + intent.',
  8: 'Grayscale = no color. Brain finds colorless apps boring, drops them automatically.',
  9: 'Porn = dopamine inflation. Hostile to real bonding.',
  10: 'Mid-point look back = progress meter. Doer remembers, skipper forgets.',
  11: 'Environment = strongest trigger. Same setting = same behavior.',
  12: 'Second boredom wave hits day 14-17. It passes.',
  13: 'Single-task = discipline test. Brain unfamiliar, but power lives here.',
  14: 'Even music is stimulation. Silent minutes = brain medicine.',
  15: 'Human contact = 100x more nourishing than screen consumption.',
  16: 'Past halfway = no stab in the back. The hardest part is done.',
  17: '4-7-8 breath: 4 in, 7 hold, 8 out. Instant calm.',
  18: 'Digital minimalism = essentials + productivity. Everything else, gone.',
  19: 'Slowing = visual form of discipline. Fast = uncontrolled.',
  20: 'New baseline = 30 days ago boredom is now normal.',
  21: 'Track triggers in writing: "what situation made me reach for the phone?"',
  22: 'Replacement = instead of phone reflex: deep breath / 5 push-ups / water.',
  23: 'Negative visualization: "If I check this phone, what do I lose?"',
  24: 'Phone as tool: ask "what is my intent on opening it?"',
  25: 'Final sprint = hardest 5 days. Brain wants the "complete" signal.',
  26: 'Social immunity = resistance to "everyone does it" judgment.',
  27: 'Permanent boundary = discipline lasting past day 30.',
  28: 'Meaning practice = daily answer to "why am I doing this?"',
  29: 'Tomorrow last day = today last sprint. Don\'t leave for tomorrow.',
  30: 'Complete ≠ finished. Complete = this is who you are now.',
};

const QUIZ_TR = {
  6: [ { q: 'Telefonu yatak odasından çıkarma etkisi?', options: ['Yok', 'Sabah ilk uyaran biten', 'Daha uyanık', 'Negatif'], correct: 1, explain: 'Yatak odasında telefon = sabah ilk uyaran.' }, { q: 'Alternatif alarm?', options: ['Telefon', 'Saat alarmı', 'Yok', 'Komşu'], correct: 1, explain: 'Klasik saat alarmı yeterli.' } ],
  7: [ { q: 'Sabah 1. saat kuralı?', options: ['Telefon kullan', 'Telefonsuz', 'Sosyal medya', 'Müzik'], correct: 1, explain: 'İlk 60 dk = niyet penceresi.' }, { q: 'Erken telefon etkisi?', options: ['İyi', 'Reaktif gün', 'Verimli', 'Yok'], correct: 1, explain: 'Reaktiflikle başlanan gün.' } ],
  8: [ { q: 'Grayscale modu nedir?', options: ['Renkli', 'Renksiz', 'Karanlık', 'Aydınlık'], correct: 1, explain: 'Renksiz = beyin sıkıcı bulur.' }, { q: 'Etkisi?', options: ['Etkisiz', 'Otomatik bırakma', 'Daha çok kullanma', 'Yok'], correct: 1, explain: 'Renksiz uygulamayı beyin reddeder.' } ],
  9: [ { q: 'Porno etkisi?', options: ['Doğal', 'Dopamin enflasyonu', 'Etkisiz', 'Pozitif'], correct: 1, explain: 'Doğal dopamini değersizleştirir.' }, { q: 'Gerçek bağa etkisi?', options: ['Pozitif', 'Düşmanca', 'Etkisiz', 'Hızlandırır'], correct: 1, explain: 'Gerçek bağı zorlaştırır.' } ],
  10: [ { q: 'Mid-point amacı?', options: ['Bitiş', 'Geri bakma + ölçüm', 'Atlama', 'Yorgunluk'], correct: 1, explain: 'İlerlemeyi gözlemle.' }, { q: 'Yarıyolda hangi adım?', options: ['Vazgeç', 'Yansıma', 'Hızlan', 'Aynı'], correct: 1, explain: 'Yansıma = sürdürme yakıtı.' } ],
  11: [ { q: 'En güçlü tetikleyici?', options: ['Düşünce', 'Ortam', 'İnsan', 'Açlık'], correct: 1, explain: 'Aynı ortam = aynı davranış.' }, { q: 'Çözüm?', options: ['İrade', 'Ortamı değiştir', 'Daha çok dene', 'Yok'], correct: 1, explain: 'Ortam değişimi davranış değişimi.' } ],
  12: [ { q: 'Sıkıntı = ?', options: ['Hastalık', 'Boş alan sinyali', 'Açlık', 'Yorgunluk'], correct: 1, explain: 'Beyin boş alan istiyor.' }, { q: 'İkinci sıkıntı dalgası?', options: ['1-3. gün', '14-17. gün', '25-30. gün', 'Yok'], correct: 1, explain: 'Yarıyol civarı 2. dalga.' } ],
  13: [ { q: 'Tek görev = ?', options: ['Yavaş', 'Disiplin testi', 'Etkisiz', 'Modern'], correct: 1, explain: 'Beyin için en zor disiplin.' }, { q: 'Çoklu görev verim?', options: ['2x', 'Aynı', '%40 düşük', '%200'], correct: 2, explain: 'Çoklu görev = %40 verim kaybı.' } ],
  14: [ { q: 'Müzik = ?', options: ['Sakinlik', 'Uyarı', 'Pasif', 'Sessizlik'], correct: 1, explain: 'Müzik bile uyarıdır.' }, { q: 'Sessizliğin faydası?', options: ['Yok', 'Beyin için ilaç', 'Sıkıcı', 'Etkisiz'], correct: 1, explain: 'Sessiz dakikalar derin işlem.' } ],
  15: [ { q: 'İnsan teması ekrana göre?', options: ['Aynı', '100x besleyici', 'Daha az', 'Etkisiz'], correct: 1, explain: 'İnsan bağı 100x değerli.' }, { q: 'Yalnızlık çözümü?', options: ['Telefon', 'Gerçek temas', 'Daha çok ekran', 'Müzik'], correct: 1, explain: 'Gerçek bağ yalnızlığı çözer.' } ],
  16: [ { q: 'Yarıyolu geçince?', options: ['Daha zor', 'En zor geçti', 'Aynı', 'Yorgunluk'], correct: 1, explain: 'En zor kısım geçti.' }, { q: 'Onay önemi?', options: ['Etkisiz', 'Sürdürme yakıtı', 'Lüks', 'Hatırlatıcı'], correct: 1, explain: 'Onay = devam motivasyonu.' } ],
  17: [ { q: '4-7-8 nefesi?', options: ['Random', '4 al, 7 tut, 8 ver', 'Hızlı', 'Yavaş'], correct: 1, explain: 'Klasik anlık sakinlik tekniği.' }, { q: 'Etkisi?', options: ['Yok', 'Anlık sakinlik', 'Yorgunluk', 'Stres'], correct: 1, explain: 'Parasempatik aktivasyon.' } ],
  18: [ { q: 'Dijital minimalizm?', options: ['Sınırsız', 'Olmazsa olmazlar', 'Modern', 'Pahalı'], correct: 1, explain: 'Sadece gerekli + üretici.' }, { q: 'Cal Newport tezi?', options: ['Hız', 'Az ama derin', 'Çok ama yüzeyi', 'Random'], correct: 1, explain: 'Az ama derin tüketim.' } ],
  19: [ { q: 'Yavaşlama = ?', options: ['Tembellik', 'Disiplinin görsel formu', 'Geri', 'Etkisiz'], correct: 1, explain: 'Yavaş = kontrollü.' }, { q: 'Hızlı yaşam?', options: ['İdeal', 'Kontrolsüzlük', 'Verimli', 'Disiplin'], correct: 1, explain: 'Hız = kontrol kaybı.' } ],
  20: [ { q: 'Yeni baseline?', options: ['Eski', '30 gün önceki sıkıntı = şimdi normal', 'Daha kötü', 'Aynı'], correct: 1, explain: 'Beyin yeni standarta oturdu.' }, { q: 'Bilim onayı?', options: ['Yok', '7-30 gün adaptasyon', '1 yıl', 'Asla'], correct: 1, explain: '7-30 günlük adaptasyon süresi.' } ],
  21: [ { q: 'Tetikleyici nasıl tanı?', options: ['Görmezden gel', 'Yazılı kayıt', 'Hatırla', 'Etkisiz'], correct: 1, explain: 'Yazılı = bilinçli.' }, { q: 'En sık tetikleyici?', options: ['Açlık', 'Sıkıntı', 'Yorgunluk', 'Mutluluk'], correct: 1, explain: 'Sıkıntı = ana tetikleyici.' } ],
  22: [ { q: 'Replacement stratejisi?', options: ['Yok', 'Refleks yerine alternatif', 'Tutma', 'Bekle'], correct: 1, explain: 'Alternatif davranış öner.' }, { q: 'Örnek alternatifler?', options: ['Telefon', 'Nefes/push-up/su', 'Daha telefon', 'Bilinmez'], correct: 1, explain: 'Sağlıklı refleks alternatifleri.' } ],
  23: [ { q: 'Negatif görselleştirme?', options: ['Pozitif düşün', '"Ne kaybederim?"', 'Görmezden gel', 'Hızlandır'], correct: 1, explain: 'Kaybı görselleştir.' }, { q: 'Stoik felsefe?', options: ['Yok', 'Premeditatio malorum', 'Hedonizm', 'Modern'], correct: 1, explain: 'Stoa\'nın klasik tekniği.' } ],
  24: [ { q: 'Telefon araç olunca?', options: ['Hep aç', 'Niyet sor', 'Otomatik', 'Yok'], correct: 1, explain: 'Açmadan önce niyet kontrolü.' }, { q: 'Niyetsiz açış etkisi?', options: ['Etkisiz', 'Saatlerce kayıp', 'Verimli', 'Pozitif'], correct: 1, explain: 'Niyetsiz açış = scroll kaybı.' } ],
  25: [ { q: 'Final sprint?', options: ['Kolay', 'En zor 5 gün', 'Etkisiz', 'Random'], correct: 1, explain: 'Beyin "bitir" sinyali ister.' }, { q: 'Sprint çözümü?', options: ['Vazgeç', 'Sürdür + odaklan', 'Hızlandır', 'Yavaşla'], correct: 1, explain: 'Son sprint = sürdürme.' } ],
  26: [ { q: 'Sosyal bağışıklık?', options: ['Yalnızlık', '"Herkes yapıyor" direnişi', 'Sosyal medya', 'Yok'], correct: 1, explain: 'Sürü baskısına direnç.' }, { q: 'Çoğunluk her zaman?', options: ['Doğru', 'Yanlış olabilir', 'Etkisiz', 'Bilinmez'], correct: 1, explain: 'Çoğunluk = sürü, doğru değil.' } ],
  27: [ { q: 'Kalıcı sınır?', options: ['Geçici', '30 gün sonu da süren', 'Esnek', 'Yok'], correct: 1, explain: 'Disiplinin uzun vadesi.' }, { q: 'Esnek sınır = ?', options: ['Disiplin', 'Sınırsızlık', 'Etkisiz', 'Modern'], correct: 1, explain: 'Esnek = sınırsız + kayıp.' } ],
  28: [ { q: 'Anlam pratiği?', options: ['Yok', '"Neden?" sorusu', 'Mutluluk', 'Şans'], correct: 1, explain: 'Neden = motivasyon kaynağı.' }, { q: 'Anlamsız disiplin?', options: ['Sürdürülebilir', 'Sönük', 'Güçlü', 'Modern'], correct: 1, explain: 'Anlamsız = sürdürülemez.' } ],
  29: [ { q: 'Yarın son gün = ?', options: ['Bekle', 'Bugün son sprint', 'Atla', 'Erteleyebilir'], correct: 1, explain: 'Yarına kalmasın.' }, { q: 'Erteleme tehlikesi?', options: ['Etkisiz', 'Disiplin kaybı', 'Verim', 'Pozitif'], correct: 1, explain: 'Erteleme = disiplinin düşmanı.' } ],
  30: [ { q: 'Tamamlandı = ?', options: ['Bitti', 'Yeni sen', 'Aynı', 'Negatif'], correct: 1, explain: 'Sürdüren kimliğe geçtin.' }, { q: 'Geçişten sonra?', options: ['Hemen', '3 gün dinlen', '1 ay bekle', 'Asla'], correct: 1, explain: '3 gün dinlen, sonra devam.' } ],
};

const QUIZ_EN = {
  6: [ { q: 'Phone out of bedroom effect?', options: ['None', 'Removes morning trigger', 'More awake', 'Negative'], correct: 1, explain: 'Phone in bedroom = first stimulus.' }, { q: 'Alternative alarm?', options: ['Phone', 'Clock', 'None', 'Neighbor'], correct: 1, explain: 'Classic clock works.' } ],
  7: [ { q: 'First-hour rule?', options: ['Use phone', 'Phoneless', 'Social media', 'Music'], correct: 1, explain: 'First 60 min = intent window.' }, { q: 'Early phone effect?', options: ['Good', 'Reactive day', 'Productive', 'None'], correct: 1, explain: 'Reactivity-led day.' } ],
  8: [ { q: 'Grayscale mode is?', options: ['Color', 'Colorless', 'Dark', 'Light'], correct: 1, explain: 'Colorless = brain finds boring.' }, { q: 'Effect?', options: ['No effect', 'Auto drop usage', 'More usage', 'None'], correct: 1, explain: 'Brain rejects colorless apps.' } ],
  9: [ { q: 'Porn effect?', options: ['Natural', 'Dopamine inflation', 'No effect', 'Positive'], correct: 1, explain: 'Devalues natural dopamine.' }, { q: 'Effect on real bond?', options: ['Positive', 'Hostile', 'No effect', 'Speeds up'], correct: 1, explain: 'Real bonding harder.' } ],
  10: [ { q: 'Mid-point purpose?', options: ['Finish', 'Look back + measure', 'Skip', 'Fatigue'], correct: 1, explain: 'Observe progress.' }, { q: 'Halfway step?', options: ['Quit', 'Reflect', 'Speed up', 'Same'], correct: 1, explain: 'Reflection = continuation fuel.' } ],
  11: [ { q: 'Strongest trigger?', options: ['Thought', 'Environment', 'Person', 'Hunger'], correct: 1, explain: 'Same setting = same behavior.' }, { q: 'Solution?', options: ['Will', 'Change environment', 'Try harder', 'None'], correct: 1, explain: 'Environment shift = behavior shift.' } ],
  12: [ { q: 'Boredom = ?', options: ['Sickness', 'Empty space signal', 'Hunger', 'Fatigue'], correct: 1, explain: 'Brain wants empty space.' }, { q: 'Second boredom wave?', options: ['Day 1-3', 'Day 14-17', 'Day 25-30', 'None'], correct: 1, explain: 'Around halfway.' } ],
  13: [ { q: 'Single-task = ?', options: ['Slow', 'Discipline test', 'Useless', 'Modern'], correct: 1, explain: 'Hardest brain discipline.' }, { q: 'Multitask productivity?', options: ['2x', 'Same', '40% lower', '200%'], correct: 2, explain: 'Multi = 40% loss.' } ],
  14: [ { q: 'Music = ?', options: ['Calm', 'Stimulus', 'Passive', 'Silence'], correct: 1, explain: 'Even music is stim.' }, { q: 'Silence benefit?', options: ['None', 'Brain medicine', 'Boring', 'No effect'], correct: 1, explain: 'Silent minutes = deep processing.' } ],
  15: [ { q: 'Human contact vs screen?', options: ['Same', '100x more nourishing', 'Less', 'No effect'], correct: 1, explain: 'Human bond 100x more valuable.' }, { q: 'Loneliness solution?', options: ['Phone', 'Real contact', 'More screen', 'Music'], correct: 1, explain: 'Real bond solves loneliness.' } ],
  16: [ { q: 'Past halfway?', options: ['Harder', 'Hardest done', 'Same', 'Tired'], correct: 1, explain: 'Hardest part done.' }, { q: 'Affirmation importance?', options: ['No effect', 'Continuation fuel', 'Luxury', 'Reminder'], correct: 1, explain: 'Affirmation = motivation.' } ],
  17: [ { q: '4-7-8 breath?', options: ['Random', '4 in, 7 hold, 8 out', 'Fast', 'Slow'], correct: 1, explain: 'Classic instant-calm technique.' }, { q: 'Effect?', options: ['None', 'Instant calm', 'Fatigue', 'Stress'], correct: 1, explain: 'Parasympathetic activation.' } ],
  18: [ { q: 'Digital minimalism?', options: ['Unlimited', 'Essentials only', 'Modern', 'Expensive'], correct: 1, explain: 'Necessities + productive only.' }, { q: 'Cal Newport thesis?', options: ['Speed', 'Less but deep', 'More shallow', 'Random'], correct: 1, explain: 'Less but deep consumption.' } ],
  19: [ { q: 'Slowing = ?', options: ['Lazy', 'Visual discipline', 'Backward', 'No effect'], correct: 1, explain: 'Slow = controlled.' }, { q: 'Fast life?', options: ['Ideal', 'Uncontrolled', 'Productive', 'Discipline'], correct: 1, explain: 'Fast = control loss.' } ],
  20: [ { q: 'New baseline?', options: ['Old', '30-days-ago boredom = now normal', 'Worse', 'Same'], correct: 1, explain: 'Brain set new standard.' }, { q: 'Science backing?', options: ['None', '7-30 day adaptation', '1 year', 'Never'], correct: 1, explain: '7-30 day adaptation window.' } ],
  21: [ { q: 'Recognize trigger how?', options: ['Ignore', 'Written log', 'Remember', 'No effect'], correct: 1, explain: 'Written = conscious.' }, { q: 'Most common trigger?', options: ['Hunger', 'Boredom', 'Fatigue', 'Joy'], correct: 1, explain: 'Boredom = main trigger.' } ],
  22: [ { q: 'Replacement strategy?', options: ['None', 'Alternative for reflex', 'Hold', 'Wait'], correct: 1, explain: 'Offer alternative behavior.' }, { q: 'Example alternatives?', options: ['Phone', 'Breath/push-up/water', 'More phone', 'Unknown'], correct: 1, explain: 'Healthy reflex options.' } ],
  23: [ { q: 'Negative visualization?', options: ['Think positive', '"What do I lose?"', 'Ignore', 'Speed up'], correct: 1, explain: 'Visualize the loss.' }, { q: 'Stoic philosophy?', options: ['None', 'Premeditatio malorum', 'Hedonism', 'Modern'], correct: 1, explain: 'Classic Stoic technique.' } ],
  24: [ { q: 'Phone as tool?', options: ['Always on', 'Ask intent', 'Auto', 'None'], correct: 1, explain: 'Intent check before opening.' }, { q: 'Aimless opening effect?', options: ['No effect', 'Hours lost', 'Productive', 'Positive'], correct: 1, explain: 'Aimless = scroll loss.' } ],
  25: [ { q: 'Final sprint?', options: ['Easy', 'Hardest 5 days', 'No effect', 'Random'], correct: 1, explain: 'Brain wants "complete" signal.' }, { q: 'Sprint solution?', options: ['Quit', 'Sustain + focus', 'Speed up', 'Slow'], correct: 1, explain: 'Last sprint = sustain.' } ],
  26: [ { q: 'Social immunity?', options: ['Loneliness', '"Everyone does it" resistance', 'Social media', 'None'], correct: 1, explain: 'Resist herd pressure.' }, { q: 'Majority always?', options: ['Right', 'Maybe wrong', 'No effect', 'Unknown'], correct: 1, explain: 'Majority = herd, not always right.' } ],
  27: [ { q: 'Permanent boundary?', options: ['Temp', 'Lasts past day 30', 'Flexible', 'None'], correct: 1, explain: 'Long-term discipline.' }, { q: 'Flexible boundary = ?', options: ['Discipline', 'No boundary', 'No effect', 'Modern'], correct: 1, explain: 'Flex = boundless = loss.' } ],
  28: [ { q: 'Meaning practice?', options: ['None', '"Why?" question', 'Joy', 'Luck'], correct: 1, explain: 'Why = motivation source.' }, { q: 'Meaningless discipline?', options: ['Sustainable', 'Fades', 'Strong', 'Modern'], correct: 1, explain: 'Meaningless = unsustainable.' } ],
  29: [ { q: 'Tomorrow last day = ?', options: ['Wait', 'Today last sprint', 'Skip', 'Postpone'], correct: 1, explain: 'Don\'t leave for tomorrow.' }, { q: 'Postponement risk?', options: ['No effect', 'Discipline loss', 'Productive', 'Positive'], correct: 1, explain: 'Postpone = enemy of discipline.' } ],
  30: [ { q: 'Complete = ?', options: ['Done', 'New you', 'Same', 'Negative'], correct: 1, explain: 'Switched to sustaining identity.' }, { q: 'After transition?', options: ['Immediately', '3-day rest', '1-month wait', 'Never'], correct: 1, explain: '3 days rest, then continue.' } ],
};

function applyToFile(filePath, pathId, quizMap, protips) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const lessons = data.lessons[pathId];
  if (!lessons) return 0;
  let count = 0;
  for (const [order, q] of Object.entries(quizMap)) {
    if (lessons[order]) {
      lessons[order].quiz = q;
      lessons[order].proTip = protips[order];
      count++;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  return count;
}

const trCount = applyToFile(
  path.join(__dirname, '..', 'src', 'i18n', 'locales', 'lessons.tr.json'),
  'dopamine-detox', QUIZ_TR, PROTIPS_TR,
);
const enCount = applyToFile(
  path.join(__dirname, '..', 'src', 'i18n', 'locales', 'lessons.en.json'),
  'dopamine-detox', QUIZ_EN, PROTIPS_EN,
);
console.log(`✓ Dopamine-detox seeded — ${trCount} TR + ${enCount} EN quiz packs + pro tips for lessons 6-30`);
