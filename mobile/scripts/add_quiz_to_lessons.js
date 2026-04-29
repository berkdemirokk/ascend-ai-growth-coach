/**
 * Add quiz field to existing lessons in lessons.tr.json + lessons.en.json
 * Each lesson gets 2 multiple-choice questions.
 *
 * Run: node scripts/add_quiz_to_lessons.js
 */
const fs = require('fs');
const path = require('path');

// Quiz questions per lesson (TR + EN parallel arrays).
// Format: { q, options: [4], correct: 0-3, explain: short }
const QUIZ_TR = {
  'dopamine-detox': {
    1: [
      { q: 'Dopamin neyle salınır?', options: ['Ödül geldiğinde', 'Ödül beklerken', 'Stresle', 'Uyurken'], correct: 1, explain: 'Dopamin beklenti kimyasalıdır — ödülün gelmesini hayal ederken salınır.' },
      { q: 'Beyin yeni baseline\'a kaç günde oturur?', options: ['1-3 gün', '4-7 gün', '7-30 gün', '60+ gün'], correct: 2, explain: 'Bilim 7-30 günlük aralık gösteriyor.' },
    ],
    2: [
      { q: 'Bir bildirimden sonra dikkat ne kadar dağılır?', options: ['1 dakika', '5 dakika', '10 dakika', '23 dakika'], correct: 3, explain: '23 dakika tam odağa dönüş süresi.' },
      { q: 'Bildirimler kime hizmet eder?', options: ['Sana', 'Uygulamalara', 'Ailene', 'Hiç kimseye'], correct: 1, explain: 'Bildirimler app\'lerin growth metriklerine hizmet eder.' },
    ],
    3: [
      { q: 'Phantom reaching nedir?', options: ['Telefonu düşürmek', 'Otomatik telefona uzanma', 'Sosyal medya orucu', 'Yeni bildirim'], correct: 1, explain: 'Beyin alışkanlıkla telefona otomatik uzanır.' },
      { q: 'Sosyal medya orucu kaç saat?', options: ['6 saat', '12 saat', '24 saat', '48 saat'], correct: 2, explain: 'İlk denemede 24 saat yeterli — alışkanlığı kırar.' },
    ],
    4: [
      { q: 'Junk içerik nedir?', options: ['Eski içerik', 'Beyin için boş kalori', 'Premium içerik', 'Eğitim videosu'], correct: 1, explain: 'Amaçsız tüketilen içerik beyne boş kalori gibidir.' },
      { q: 'Bugünün ana fikri?', options: ['Üret, tüketme', 'Daha çok tüket', 'Sadece dinle', 'Hiçbir şey yapma'], correct: 0, explain: 'Üretmek tüketmekten daha besleyicidir.' },
    ],
    5: [
      { q: 'Sıkıntının ana mesajı?', options: ['Hastalık', 'Boş zaman istiyor', 'Açlık', 'Yorgunluk'], correct: 1, explain: 'Sıkıntı, beynin boş alan istemesinin sinyalidir.' },
      { q: 'Yaratıcılık nerede doğar?', options: ['Yoğun çalışmada', 'Idle modda', 'Sosyal medyada', 'Müzikte'], correct: 1, explain: 'Idle mod = yaratıcılık tohumlarının çimlendiği yer.' },
    ],
  },
  'silent-morning': {
    1: [
      { q: 'Erken kalkmanın gerçek anahtarı?', options: ['Erken yat', 'Çok kahve', 'Gürültülü alarm', 'Hiç uyuma'], correct: 0, explain: 'Erken yatmadan erken kalkmak sürdürülemez.' },
      { q: 'Optimum melatonin saati?', options: ['18:00-22:00', '22:00-06:00', '00:00-08:00', '20:00-04:00'], correct: 1, explain: '22:00-06:00 arasında derin uyku derin olur.' },
    ],
    2: [
      { q: 'Telefonu alarm olarak kullanmak neden kötü?', options: ['Pil bitirir', 'Scroll alışkanlığı yapar', 'Çok pahalı', 'Gürültülü'], correct: 1, explain: 'Alarm = telefon = scroll = günün başı kayıp.' },
      { q: 'Fiziksel alarm saati niye gerekli?', options: ['Şıklık', 'Telefonsuz uyanma', 'Daha uzun ses', 'Daha pahalı'], correct: 1, explain: 'Telefonu uzaklaştırmak zihinsel sınır kurar.' },
    ],
    3: [
      { q: 'Sabah üçlü zincir nedir?', options: ['Su-yüz-pencere', 'Kahve-haber-mesaj', 'Spor-duş-yemek', 'Müzik-meditasyon-okuma'], correct: 0, explain: 'Su-yüz-pencere uyandırma + sirkadiyen reset zinciri.' },
      { q: 'Soğuk yüz yıkamanın etkisi?', options: ['Uyku verir', 'Parasempatikten çıkarır', 'Cildi kurutur', 'Vakit alır'], correct: 1, explain: 'Soğuk şok = uyanıklık moduna geçiş.' },
    ],
    4: [
      { q: 'Sabah sessizlik niye lüks değil?', options: ['Eğlenceli', 'Beyne yer açar', 'Pahalı', 'Modern'], correct: 1, explain: 'Sessizlik = düşünmek için beyinde alan.' },
      { q: 'İlk 60 dk sessiz geçmek ne sağlar?', options: ['Yorgunluk', 'Daha az reaktiflik', 'Açlık', 'Kafa karışıklığı'], correct: 1, explain: 'Sessiz başlangıç = gün boyu sakin reaktivite.' },
    ],
    5: [
      { q: 'Reaktif gün başlangıcı ne demektir?', options: ['Erken kalkmak', 'Sana gelene tepki vermek', 'Spor yapmak', 'Su içmek'], correct: 1, explain: 'Niyet etmediğin şeylere tepki vermek = reaktif.' },
      { q: '5 dk niyet pratiği kaç soruyla yapılır?', options: ['1', '2', '3', '5'], correct: 2, explain: 'Öncelik, alışkanlık, gurur — üç soru günü şekillendirir.' },
    ],
  },
  'mind-discipline': {
    1: [
      { q: 'Multitasking efsanesi nedir?', options: ['Beyin paralel çalışır', 'Beyin hızlı geçiş yapar', 'Bilim kanıtladı', 'Daha verimli'], correct: 1, explain: 'Beyin paralel değil, hızlı geçiş yapar — performans düşer.' },
      { q: 'Görev geçişinde performans ne kadar düşer?', options: ['%10', '%20', '%30', '%40'], correct: 3, explain: '%40 düşüş + hata oranı artışı.' },
    ],
    2: [
      { q: 'Distraction Kill List nedir?', options: ['Görmezden gelme', 'Listele + savunma', 'Sil', 'Yoksay'], correct: 1, explain: 'Listele = farkına var, savunma kur.' },
      { q: 'Farkına vardığın şey ne kaybeder?', options: ['Önemini', 'Gücünü', 'Anlamını', 'Cazibesini'], correct: 1, explain: 'Bilinç gücü — fark etmek alışkanlığı kırar.' },
    ],
    3: [
      { q: 'Deep work günde kaç dakika optimal?', options: ['25', '60', '90', '180'], correct: 2, explain: '90 dakika kesintisiz = deep work bloku.' },
      { q: 'Cal Newport\'un tezi?', options: ['Hız önemli', 'Deep work = deep value', 'Multitask iyidir', 'E-posta öncelik'], correct: 1, explain: 'Derin iş, derin değer üretir.' },
    ],
    4: [
      { q: 'Sabah 90 dk altın penceresi neden?', options: ['Daha az ses var', 'En yüksek istem gücü', 'Beyin uyanır', 'Kahvenin etkisi'], correct: 1, explain: 'Sabah istem gücün en yüksek seviyede.' },
      { q: 'Sabah ne yapmamalı?', options: ['Spor', 'E-posta/WhatsApp', 'Su içmek', 'Dışarı çıkmak'], correct: 1, explain: 'Sığ iş altın saatte yapılırsa suç.' },
    ],
    5: [
      { q: 'Telefon aralık kuralı nedir?', options: ['Saatte bir bak', 'Günde 2-3 kontrol', 'Sürekli aç', 'Asla bakma'], correct: 1, explain: 'Günde 2-3 belirlenmiş zaman, gerisi uçak modu.' },
      { q: '8 saatte 50 kontrol = kaç kesinti?', options: ['10', '20', '50 mikro-kesinti', 'Hiç'], correct: 2, explain: 'Her kontrol = mikro-kesinti = odak kaybı.' },
    ],
  },
  'body-discipline': {
    1: [
      { q: 'Modern hayatın en büyük fiziksel sorunu?', options: ['Çok yemek', 'Hareketsizlik', 'Az uyku', 'Stres'], correct: 1, explain: '8 saat oturma = kafa bulanıklığının ana sebebi.' },
      { q: 'Günde minimum hareket?', options: ['10 dk', '20 dk', '30 dk', '60 dk'], correct: 2, explain: '30 dakika tempolu hareket yeterli.' },
    ],
    2: [
      { q: 'Soğuk şok hangi sistemi aktif eder?', options: ['Sindirim', 'Sempatik', 'Parasempatik', 'Bağışıklık'], correct: 1, explain: 'Sempatik aktivasyon = adrenalin + dopamin = berrak zihin.' },
      { q: 'Soğuk duş için minimum süre?', options: ['10 sn', '30 sn', '1 dk', '5 dk'], correct: 1, explain: '30 saniye yeterli, fayda başlar.' },
    ],
    3: [
      { q: 'Günlük protein kuralı?', options: ['0.5g/kg', '1g/kg', '2g/kg', '5g/kg'], correct: 1, explain: 'Vücut ağırlığının her kg\'ı için 1g protein.' },
      { q: 'En kötü protein kaynağı?', options: ['Et', 'Yumurta', 'Şekerli atıştırmalık', 'Baklagil'], correct: 2, explain: 'Atıştırmalık değil, öğün kaynağı.' },
    ],
    4: [
      { q: 'İşlenmiş şekerin etkisi?', options: ['Stabil enerji', 'Yükseliş + crash', 'Kilo verdirir', 'Bağışıklık güçlendirir'], correct: 1, explain: 'Şeker = yükseliş + crash döngüsü.' },
      { q: 'Şeker bağımlılığı kaç günde kırılır?', options: ['1', '3', '7', '30'], correct: 2, explain: '7 gün sonra şeker tatsızlaşır.' },
    ],
    5: [
      { q: 'Disiplinin temeli?', options: ['Motivasyon', 'Uyku', 'Para', 'Plan'], correct: 1, explain: 'Kötü uyumuş adam disiplinsizliğe optimize.' },
      { q: 'Optimal oda sıcaklığı?', options: ['15°C', '18-20°C', '22-24°C', '26°C'], correct: 1, explain: '18-20°C derin uyku için optimum.' },
    ],
  },
  'money-discipline': {
    1: [
      { q: 'En tehlikeli harcama tipi?', options: ['Büyük tek', 'Görünmez abonelikler', 'Yemek', 'Ulaşım'], correct: 1, explain: 'Otomatik ödenen küçük tutarlar yıllık binleri yakar.' },
      { q: 'İlk adım ne olmalı?', options: ['Tasarruf', 'Banka özeti incele', 'Kredi al', 'Yatırım'], correct: 1, explain: 'Görünmezi görünür yapmak ilk adım.' },
    ],
    2: [
      { q: '50/30/20 kuralı nedir?', options: ['50 ihtiyaç, 30 istek, 20 tasarruf', '50 tasarruf, 50 harca', '20-20-60', '30-30-40'], correct: 0, explain: '50% zorunlu, 30% istek, 20% tasarruf.' },
      { q: 'Bütçenin gerçek faydası?', options: ['Kısıtlama', 'Özgürlük', 'Stres', 'Vergi'], correct: 1, explain: 'Bilinç = kontrol = özgürlük.' },
    ],
    3: [
      { q: '24-saat kuralı kaç TL üstüne uygulanır?', options: ['10', '50', '100', '500'], correct: 2, explain: '100 TL üstü her satın alma 24 saat ertelenir.' },
      { q: 'Erteleyince % kaçı gereksiz çıkar?', options: ['%30', '%50', '%80', '%95'], correct: 2, explain: '%80 dürtüseldi, gereksizdi.' },
    ],
    4: [
      { q: 'Ev pişirme vs dışarı maliyet farkı?', options: ['Aynı', '2x', '5-10x', 'Aynı'], correct: 2, explain: '5-10x maliyet farkı yıllık binleri etkiler.' },
      { q: 'Dışarıda yemek ne olmalı?', options: ['Günlük rutin', 'Tatil deneyimi', 'Hiç', 'Haftada 1'], correct: 1, explain: 'Tatil deneyimi olmalı, günlük değil.' },
    ],
    5: [
      { q: 'Acil durum fonu kaç aylık olmalı?', options: ['1', '3', '6', '12'], correct: 1, explain: '3 aylık zorunlu giderlerin minimumu.' },
      { q: 'Acil fon olmadan finansal disiplin nasıldır?', options: ['Güçlü', 'Yapay', 'Kolay', 'Sürdürülebilir'], correct: 1, explain: 'Acil fon olmadan disiplin yapaydır.' },
    ],
  },
};

// EN parallel translations
const QUIZ_EN = {
  'dopamine-detox': {
    1: [
      { q: 'When is dopamine released?', options: ['When reward arrives', 'While anticipating reward', 'Under stress', 'During sleep'], correct: 1, explain: 'Dopamine is the anticipation chemical — released while imagining future reward.' },
      { q: 'How many days for new baseline?', options: ['1-3 days', '4-7 days', '7-30 days', '60+ days'], correct: 2, explain: 'Science shows 7-30 day window.' },
    ],
    2: [
      { q: 'Time to refocus after one notification?', options: ['1 min', '5 min', '10 min', '23 min'], correct: 3, explain: '23 minutes is the full refocus window.' },
      { q: 'Notifications serve who?', options: ['You', 'The apps', 'Your family', 'Nobody'], correct: 1, explain: 'They serve apps\' growth metrics, not you.' },
    ],
    3: [
      { q: 'What is "phantom reaching"?', options: ['Dropping phone', 'Auto-reaching for phone', 'Social fast', 'New notification'], correct: 1, explain: 'Habitual auto-reach for phone without thinking.' },
      { q: 'Social media fast duration?', options: ['6 hrs', '12 hrs', '24 hrs', '48 hrs'], correct: 2, explain: '24 hours breaks the habit on first try.' },
    ],
    4: [
      { q: 'What is junk content?', options: ['Old content', 'Empty calories for brain', 'Premium content', 'Educational'], correct: 1, explain: 'Purposeless consumption is empty calories.' },
      { q: 'Today\'s main idea?', options: ['Produce, don\'t consume', 'Consume more', 'Just listen', 'Do nothing'], correct: 0, explain: 'Producing is more nourishing than consuming.' },
    ],
    5: [
      { q: 'Boredom\'s real message?', options: ['Sickness', 'Wants empty time', 'Hunger', 'Fatigue'], correct: 1, explain: 'Brain signaling for empty space.' },
      { q: 'Where is creativity born?', options: ['Heavy work', 'Idle mode', 'Social media', 'Music'], correct: 1, explain: 'Idle mode = where creative seeds germinate.' },
    ],
  },
  'silent-morning': {
    1: [
      { q: 'Real key to waking early?', options: ['Sleep early', 'More coffee', 'Loud alarm', 'Don\'t sleep'], correct: 0, explain: 'Without sleeping early, waking early isn\'t sustainable.' },
      { q: 'Optimal melatonin window?', options: ['18:00-22:00', '22:00-06:00', '00:00-08:00', '20:00-04:00'], correct: 1, explain: 'Deep sleep happens between 22:00-06:00.' },
    ],
    2: [
      { q: 'Why is phone-as-alarm bad?', options: ['Drains battery', 'Triggers scroll habit', 'Too expensive', 'Too loud'], correct: 1, explain: 'Alarm = phone = scroll = day already lost.' },
      { q: 'Why physical alarm clock?', options: ['Style', 'Phoneless wakeup', 'Louder', 'More expensive'], correct: 1, explain: 'Distance from phone creates mental boundary.' },
    ],
    3: [
      { q: 'Morning triple chain?', options: ['Water-face-window', 'Coffee-news-msg', 'Sport-shower-meal', 'Music-meditate-read'], correct: 0, explain: 'Water-face-window = wake + circadian reset.' },
      { q: 'Cold face wash effect?', options: ['Sleepy', 'Out of parasympathetic', 'Dries skin', 'Time waster'], correct: 1, explain: 'Cold shock = wake mode activation.' },
    ],
    4: [
      { q: 'Why morning silence isn\'t luxury?', options: ['Fun', 'Brain space', 'Expensive', 'Modern'], correct: 1, explain: 'Silence = thinking room for brain.' },
      { q: 'First 60 silent minutes give?', options: ['Fatigue', 'Less reactivity', 'Hunger', 'Confusion'], correct: 1, explain: 'Silent start = calm reactivity all day.' },
    ],
    5: [
      { q: 'Reactive day start means?', options: ['Waking early', 'Reacting to incoming', 'Doing sport', 'Drinking water'], correct: 1, explain: 'Reacting to what comes = reactive.' },
      { q: '5-min intent uses how many questions?', options: ['1', '2', '3', '5'], correct: 2, explain: 'Priority, habits, pride — three shape the day.' },
    ],
  },
  'mind-discipline': {
    1: [
      { q: 'Multitasking myth is?', options: ['Brain works parallel', 'Brain switches fast', 'Science proved', 'More productive'], correct: 1, explain: 'Brain switches fast — performance drops.' },
      { q: 'Performance drop per switch?', options: ['10%', '20%', '30%', '40%'], correct: 3, explain: '40% drop + error rate increase.' },
    ],
    2: [
      { q: 'Distraction Kill List is?', options: ['Ignore', 'List + defense', 'Delete', 'Pretend gone'], correct: 1, explain: 'List = notice, then build defense.' },
      { q: 'What you notice loses?', options: ['Importance', 'Power', 'Meaning', 'Allure'], correct: 1, explain: 'Awareness breaks habit power.' },
    ],
    3: [
      { q: 'Optimal deep work block?', options: ['25', '60', '90', '180'], correct: 2, explain: '90 min uninterrupted = deep work block.' },
      { q: 'Cal Newport\'s thesis?', options: ['Speed matters', 'Deep work = deep value', 'Multitask good', 'Email priority'], correct: 1, explain: 'Deep work produces deep value.' },
    ],
    4: [
      { q: 'Why morning 90 min is golden?', options: ['Less noise', 'Highest willpower', 'Brain wakes', 'Coffee effect'], correct: 1, explain: 'Willpower peaks in morning.' },
      { q: 'What NOT to do in morning?', options: ['Sport', 'Email/WhatsApp', 'Drink water', 'Go outside'], correct: 1, explain: 'Shallow work in golden hour is a crime.' },
    ],
    5: [
      { q: 'Phone interval rule?', options: ['Hourly check', 'Day 2-3 designated checks', 'Always on', 'Never check'], correct: 1, explain: '2-3 daily windows, rest in airplane mode.' },
      { q: '50 checks in 8 hrs = how many breaks?', options: ['10', '20', '50 micro-breaks', 'None'], correct: 2, explain: 'Every check = micro-interruption to focus.' },
    ],
  },
  'body-discipline': {
    1: [
      { q: 'Modern life\'s biggest physical issue?', options: ['Eating too much', 'Sedentariness', 'Less sleep', 'Stress'], correct: 1, explain: '8 hours sitting = main fog cause.' },
      { q: 'Min movement per day?', options: ['10 min', '20 min', '30 min', '60 min'], correct: 2, explain: '30 min brisk movement is enough.' },
    ],
    2: [
      { q: 'Cold shock activates which system?', options: ['Digestive', 'Sympathetic', 'Parasympathetic', 'Immune'], correct: 1, explain: 'Sympathetic = adrenaline + dopamine = clear mind.' },
      { q: 'Min cold shower duration?', options: ['10s', '30s', '1m', '5m'], correct: 1, explain: '30 seconds is enough; benefits begin.' },
    ],
    3: [
      { q: 'Daily protein rule?', options: ['0.5g/kg', '1g/kg', '2g/kg', '5g/kg'], correct: 1, explain: '1g protein per kg body weight.' },
      { q: 'Worst protein source?', options: ['Meat', 'Eggs', 'Sugary snack', 'Legumes'], correct: 2, explain: 'Snacks aren\'t meals.' },
    ],
    4: [
      { q: 'Processed sugar effect?', options: ['Stable energy', 'Spike + crash', 'Weight loss', 'Immunity'], correct: 1, explain: 'Sugar = spike + crash cycle.' },
      { q: 'Sugar addiction breaks in days?', options: ['1', '3', '7', '30'], correct: 2, explain: '7 days, sugar tastes flat.' },
    ],
    5: [
      { q: 'Foundation of discipline?', options: ['Motivation', 'Sleep', 'Money', 'Plan'], correct: 1, explain: 'Bad sleep = optimized for indiscipline.' },
      { q: 'Optimal room temp?', options: ['15°C', '18-20°C', '22-24°C', '26°C'], correct: 1, explain: '18-20°C optimum for deep sleep.' },
    ],
  },
  'money-discipline': {
    1: [
      { q: 'Most dangerous spending type?', options: ['Big single', 'Invisible subs', 'Food', 'Transport'], correct: 1, explain: 'Auto-debits accumulate to thousands yearly.' },
      { q: 'First step?', options: ['Save', 'Audit bank statement', 'Take loan', 'Invest'], correct: 1, explain: 'Make invisible visible first.' },
    ],
    2: [
      { q: '50/30/20 rule?', options: ['50 essentials, 30 wants, 20 save', '50 save, 50 spend', '20-20-60', '30-30-40'], correct: 0, explain: '50% needs, 30% wants, 20% savings.' },
      { q: 'Real benefit of budget?', options: ['Restriction', 'Freedom', 'Stress', 'Tax'], correct: 1, explain: 'Awareness = control = freedom.' },
    ],
    3: [
      { q: '24-hour rule applies above?', options: ['$1', '$5', '$10', '$50'], correct: 2, explain: 'Any $10+ purchase waits 24h.' },
      { q: 'After waiting, % unnecessary?', options: ['30%', '50%', '80%', '95%'], correct: 2, explain: '80% was impulse, not need.' },
    ],
    4: [
      { q: 'Home cooking vs eating out cost?', options: ['Same', '2x', '5-10x', 'Same'], correct: 2, explain: '5-10x cost difference compounds yearly.' },
      { q: 'Eating out should be?', options: ['Daily routine', 'Vacation experience', 'Never', 'Weekly once'], correct: 1, explain: 'Vacation experience, not routine.' },
    ],
    5: [
      { q: 'Emergency fund months?', options: ['1', '3', '6', '12'], correct: 1, explain: '3 months of essential expenses minimum.' },
      { q: 'Without emergency fund, discipline is?', options: ['Strong', 'Artificial', 'Easy', 'Sustainable'], correct: 1, explain: 'Without fund, discipline is artificial.' },
    ],
  },
};

function applyQuiz(filePath, quizMap) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let added = 0;
  Object.entries(quizMap).forEach(([pathId, lessons]) => {
    if (!data.lessons[pathId]) return;
    Object.entries(lessons).forEach(([order, questions]) => {
      if (data.lessons[pathId][order]) {
        data.lessons[pathId][order].quiz = questions;
        added++;
      }
    });
  });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  return added;
}

const trCount = applyQuiz(
  path.join(__dirname, '..', 'src', 'i18n', 'locales', 'lessons.tr.json'),
  QUIZ_TR,
);
const enCount = applyQuiz(
  path.join(__dirname, '..', 'src', 'i18n', 'locales', 'lessons.en.json'),
  QUIZ_EN,
);
console.log(`Added quiz to ${trCount} TR lessons, ${enCount} EN lessons`);
