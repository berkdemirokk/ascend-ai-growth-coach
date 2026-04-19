// Duolingo-style lesson curriculum.
// Each sprint has ~10 lessons that unlock progressively by sprint day.
// A lesson = swipeable info cards + quiz questions.

const dopamineLessons = [
  {
    id: 'dd_1',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 1,
    title: 'Dopamin Nedir?',
    cards: [
      { type: 'info', title: 'Tanım', body: 'Dopamin "ödül" değil, "isteme" molekülüdür. Beyne "bunu tekrar yap" sinyali gönderir, hazzı değil; arzuyu üretir.' },
      { type: 'info', title: 'Beyin Devresi', body: 'Mezolimbik yol (VTA → nucleus accumbens) dopamin salınımını yönetir. Bu devre yiyecek, seks, sosyal onay ve ekran uyaranlarıyla aktive olur.' },
      { type: 'tip', text: 'Yüksek dopamin ≠ mutluluk. Sürekli dopamin uyarımı baseline seviyeyi düşürür ve normal hayat sıkıcı gelir.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Dopamin esas olarak hangi hissi üretir?', options: ['Mutluluk', 'İsteme/arzu', 'Korku', 'Tokluk'], correctIndex: 1, explanation: 'Dopamin "isteme" molekülüdür. Hazzı opioid sistemi üretir.' },
      { type: 'truefalse', question: 'Sürekli yüksek dopamin uyarımı baseline mutluluk seviyesini düşürür.', correct: true, explanation: 'Reseptörler downregulate olur, normal aktiviteler yetersiz uyarıcı kalır.' },
    ],
  },
  {
    id: 'dd_2',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 3,
    title: 'Sosyal Medya Beyni Nasıl Etkiler',
    cards: [
      { type: 'info', title: 'Variable Reward', body: 'TikTok ve Instagram "değişken ödül" prensibiyle çalışır — kumar makinesi gibi. Her kaydırmada belki ilginç bir şey gelir, bu belirsizlik dopamini patlatır.' },
      { type: 'info', title: 'Dikkat Süresi', body: 'Ortalama dikkat süresi 2000\'de 12 sn, 2024\'te 8.25 sn. Bunun büyük nedeni kısa video formatı.' },
      { type: 'tip', text: 'Bildirimleri kapatmak telefonu kontrol etme dürtüsünü %40 azaltır (UCI çalışması).' },
    ],
    quiz: [
      { type: 'multiple', question: 'TikTok\'u bağımlılık yapan ana mekanizma nedir?', options: ['Yüksek çözünürlük', 'Değişken ödül programı', 'Müzik', 'Renk teması'], correctIndex: 1, explanation: 'Değişken ödül = belirsiz dopamin = en güçlü bağımlılık modeli.' },
      { type: 'truefalse', question: '21. yüzyılda insan dikkat süresi azaldı.', correct: true, explanation: '12 sn → 8.25 sn (2000-2024). Kısa video formatı en büyük etken.' },
    ],
  },
  {
    id: 'dd_3',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 5,
    title: 'Delayed Gratification',
    cards: [
      { type: 'info', title: 'Marshmallow Testi', body: 'Walter Mischel\'in deneyinde 4 yaşında bekleyebilen çocuklar 30 yıl sonra daha yüksek SAT puanı, daha düşük BMI ve daha iyi ilişkilere sahipti.' },
      { type: 'info', title: 'Beyin Bölgesi', body: 'Prefrontal korteks dürtüleri kontrol eder. Egzersiz, meditasyon ve yeterli uyku bu bölgeyi güçlendirir.' },
      { type: 'tip', text: 'Bir şeyi 10 dk ertele. Çoğu istek bu sürede kaybolur. "Urge surfing" tekniği.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Marshmallow testinde bekleyen çocuklar uzun vadede ne kazandı?', options: ['Daha çok şeker', 'Daha iyi yaşam sonuçları', 'Daha fazla arkadaş', 'Daha uzun boy'], correctIndex: 1, explanation: 'SAT puanı, BMI, ilişki kalitesi gibi göstergelerde daha iyiydiler.' },
      { type: 'truefalse', question: 'Dürtü kontrolünden sorumlu beyin bölgesi prefrontal kortekstir.', correct: true, explanation: 'Karar verme ve dürtü kontrolünün merkezi.' },
    ],
  },
  {
    id: 'dd_4',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 8,
    title: 'Dijital Minimalizm',
    cards: [
      { type: 'info', title: 'Cal Newport Yaklaşımı', body: 'Dijital minimalizm: teknolojiyi yaşamına değer katanlar dışında ele. 30 günlük detox sonrası sadece kanıtlanmış değer üretenleri geri ekle.' },
      { type: 'info', title: '3 Soru Filtresi', body: 'Bir uygulamayı geri eklemeden önce sor: 1) En önemli değerlerime hizmet ediyor mu? 2) En iyi yol bu mu? 3) Nasıl kullanacağımı standartlaştıracak mıyım?' },
      { type: 'tip', text: 'Telefonun ana ekranında sadece "araç" uygulamalar olsun. Sosyal medya gri tonda + ikinci sayfada.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Dijital minimalizmin kurucusu kim?', options: ['Tim Ferriss', 'Cal Newport', 'James Clear', 'Naval Ravikant'], correctIndex: 1, explanation: 'Cal Newport, MIT bilgisayar bilimleri profesörü.' },
      { type: 'truefalse', question: 'Dijital minimalizm "teknolojiyi tamamen bırak" demektir.', correct: false, explanation: 'Hayır — değer katanları seçici şekilde tut, gerisini bırak.' },
    ],
  },
  {
    id: 'dd_5',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 11,
    title: 'Flow State',
    cards: [
      { type: 'info', title: 'Csikszentmihalyi', body: 'Flow = beceri seviyesi ile zorluk seviyesinin tam buluştuğu nokta. Zaman kaybolur, ego susar, performans pik yapar.' },
      { type: 'info', title: 'Flow\'un Düşmanları', body: 'Bildirimler, multitasking, yüksek dopamin uyaranları (sosyal medya) flow\'u imkansız kılar. Beyin "ucuz dopamin" arar, derin işe değil.' },
      { type: 'tip', text: 'Flow için min. 90 dk kesintisiz blok ayır. İlk 15 dk genelde dirençlidir, sonra akar.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Flow state için ideal koşul nedir?', options: ['Çok kolay görev', 'Çok zor görev', 'Beceri = zorluk', 'Grup çalışması'], correctIndex: 2, explanation: 'Beceri ve zorluk dengelendiğinde flow oluşur.' },
      { type: 'truefalse', question: 'Sosyal medya flow state\'i destekler.', correct: false, explanation: 'Tam tersi — sürekli kesintilerle flow\'u parçalar.' },
    ],
  },
  {
    id: 'dd_6',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 14,
    title: 'Nöroplastisite',
    cards: [
      { type: 'info', title: 'Beyin Değişir', body: 'Beyin sabit değil — yeni nöral yollar her yaşta oluşturulabilir. "Neurons that fire together, wire together" (Hebb).' },
      { type: 'info', title: 'Tekrarın Gücü', body: '21-66 gün arasında bir alışkanlık otomatikleşir (Lally et al., 2009). Sprint süreleri tesadüf değil.' },
      { type: 'tip', text: 'Yeni alışkanlık zor değil — eski yolu kullanmamak zor. Sabır + tekrar.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Bir alışkanlığın otomatikleşmesi ortalama kaç gün sürer?', options: ['7 gün', '21 gün', '66 gün', '180 gün'], correctIndex: 2, explanation: '66 gün ortalama (Lally et al., aralık 18-254 gün).' },
      { type: 'truefalse', question: 'Yetişkin beyni yeni nöral yollar oluşturamaz.', correct: false, explanation: 'Nöroplastisite yaşam boyu devam eder.' },
    ],
  },
  {
    id: 'dd_7',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 17,
    title: 'Alışkanlık Döngüsü',
    cards: [
      { type: 'info', title: 'Cue → Routine → Reward', body: 'Charles Duhigg modeli: Tetikleyici → Davranış → Ödül. Beyin döngüyü öğrenince otomatik çalışır.' },
      { type: 'info', title: 'Habit Stacking', body: 'James Clear: yeni alışkanlığı mevcut bir alışkanlığın üstüne koy. "Diş fırçaladıktan sonra 1 dk meditasyon yapacağım."' },
      { type: 'tip', text: 'Kötü alışkanlığı kırmak için tetikleyiciyi yok et. Telefonu yatak odasından çıkar — uyumadan scroll dürtüsü ölür.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Habit Stacking nedir?', options: ['Çok alışkanlık aynı anda', 'Yeni alışkanlığı eskinin üstüne koymak', 'Alışkanlığı bırakmak', 'Liste yapmak'], correctIndex: 1, explanation: 'Mevcut alışkanlık yeni davranış için tetikleyici olur.' },
      { type: 'truefalse', question: 'Tetikleyiciyi yok etmek alışkanlığı kırmanın en kolay yoludur.', correct: true, explanation: 'Çevre değişimi iradeden daha güçlüdür.' },
    ],
  },
  {
    id: 'dd_8',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 20,
    title: 'Mindfulness Bilimi',
    cards: [
      { type: 'info', title: 'Default Mode Network', body: 'Beyin "boş" zaman geçirdiğinde DMN aktifleşir — gezici düşünceler, kaygı, geçmiş/gelecek. Meditasyon DMN aktivitesini düşürür.' },
      { type: 'info', title: 'Bilimsel Faydalar', body: '8 hafta günde 10 dk meditasyon: amigdala küçülür (stres azalır), prefrontal korteks kalınlaşır (odak artar). Harvard 2011 çalışması.' },
      { type: 'tip', text: 'Meditasyon = "düşünme" değil. Düşüncelerin gelip gittiğini fark etmek. Başarı 0 düşünce değil, 1000 fark.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Meditasyon hangi beyin bölgesini küçültür?', options: ['Amigdala', 'Hipokampus', 'Prefrontal korteks', 'Serebellum'], correctIndex: 0, explanation: 'Amigdala stres ve korkudan sorumlu. Küçülmesi = daha az reaktiflik.' },
      { type: 'truefalse', question: 'Başarılı meditasyon = hiç düşünmemek.', correct: false, explanation: 'Hayır — düşünceleri fark edip nazikçe geri dönmek.' },
    ],
  },
  {
    id: 'dd_9',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 24,
    title: 'Doğanın Etkisi',
    cards: [
      { type: 'info', title: 'Attention Restoration', body: 'Doğada 20 dk yürüyüş prefrontal korteksi dinlendirir, dikkat süresini artırır. Şehirde aynı yürüyüş bu etkiyi vermez.' },
      { type: 'info', title: '120 Dakika Kuralı', body: 'Haftada en az 120 dk doğada geçirenler %90 daha yüksek "iyi olma" rapor ediyor (Nature, 2019).' },
      { type: 'tip', text: 'Pencereden ağaç görmek bile stres hormonunu düşürür. Mümkünse iş alanını yeşile bakacak şekilde ayarla.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Haftalık doğa için bilimsel "tatlı nokta" kaç dakika?', options: ['30 dk', '60 dk', '120 dk', '300 dk'], correctIndex: 2, explanation: '120 dk eşik — altında etki minimal, üstünde plato.' },
      { type: 'truefalse', question: 'Şehirde park yürüyüşü doğa yürüyüşü kadar zihni dinlendirir.', correct: false, explanation: 'Doğa daha güçlü etki yapar — yeşil yoğunluğu önemli.' },
    ],
  },
  {
    id: 'dd_10',
    sprintId: 'dopamine_detox_30',
    dayUnlock: 28,
    title: 'Detox Sonrası Kural',
    cards: [
      { type: 'info', title: 'Yeniden Tanışma', body: 'Detox bittiğinde sosyal medyaya geri dönersen baseline\'ın yükseldiğini fark edersin — "sıkıcı" gelir. Bu işaret iyidir.' },
      { type: 'info', title: 'Seçici Geri Dönüş', body: 'Hangi platformlar gerçekten değer kattı? Sadece onları geri ekle. Diğerleri bağımlılığın ürünüydü.' },
      { type: 'tip', text: 'Sosyal medyayı sadece masaüstünden kullan, telefondan sil. %80 kullanım düşer.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Detox sonrası en sağlıklı yaklaşım nedir?', options: ['Tüm platformları geri yükle', 'Hiçbirini geri yükleme', 'Değer katanları seçici geri al', 'Yeni platformlar dene'], correctIndex: 2, explanation: 'Seçici geri dönüş = dijital minimalizm felsefesi.' },
      { type: 'truefalse', question: 'Detox sonrası sosyal medyanın "sıkıcı" gelmesi kötü işarettir.', correct: false, explanation: 'Tam tersi — baseline\'ının yükseldiğini gösterir.' },
    ],
  },
];

const fitnessLessons = [
  {
    id: 'fit_1',
    sprintId: 'fitness_60',
    dayUnlock: 1,
    title: 'Progressive Overload',
    cards: [
      { type: 'info', title: 'Temel Prensip', body: 'Kas büyümesi için sürekli artan stres gerekir. Aynı ağırlık, aynı tekrar = aynı vücut. Her hafta ya ağırlık ya tekrar ya set artmalı.' },
      { type: 'info', title: 'Nasıl Uygulanır', body: '4 yol: 1) Daha ağır kaldır, 2) Daha çok tekrar yap, 3) Set sayısını artır, 4) Dinlenme süresini azalt.' },
      { type: 'tip', text: 'Antrenman defteri tut. Hafıza yalan söyler — kağıt söylemez.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Progressive overload\'un anahtarı nedir?', options: ['Hep aynı rutin', 'Sürekli artan stres', 'Daha çok protein', 'Daha az dinlenme'], correctIndex: 1, explanation: 'Vücut adapte olur — sürekli yeni meydan okuma şart.' },
      { type: 'truefalse', question: 'Aynı ağırlıkla yıllarca antrenman yapmak kas büyütür.', correct: false, explanation: 'Adaptasyon olur, büyüme durur. Overload şart.' },
    ],
  },
  {
    id: 'fit_2',
    sprintId: 'fitness_60',
    dayUnlock: 4,
    title: 'Protein Sentezi',
    cards: [
      { type: 'info', title: 'MPS Nedir', body: 'Muscle Protein Synthesis = vücudun yeni kas yapma süreci. Antrenman ile uyarılır, leucine (BCAA) ile tetiklenir.' },
      { type: 'info', title: 'Hedef Miktar', body: 'Vücut ağırlığının kg başına 1.6-2.2g protein optimal. 80kg biri için: 130-175g/gün. Bu eşiğin üstü ekstra fayda vermez.' },
      { type: 'tip', text: 'Proteini güne yay — 4-5 öğünde 30-40g. Tek seferde 100g almanın faydası yok.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Optimal protein miktarı (kas büyümesi için)?', options: ['0.8g/kg', '1.6-2.2g/kg', '3-4g/kg', '5g/kg+'], correctIndex: 1, explanation: '1.6-2.2g/kg eşiği — fazlası ekstra fayda yok.' },
      { type: 'truefalse', question: 'Tek öğünde 100g protein almak günlük dağıtmaktan iyidir.', correct: false, explanation: 'Vücut tek seferde sınırlı kullanır. Yaymak optimal.' },
    ],
  },
  {
    id: 'fit_3',
    sprintId: 'fitness_60',
    dayUnlock: 7,
    title: 'Uyku ve Kas',
    cards: [
      { type: 'info', title: 'Toparlanma Anahtarı', body: 'Kas antrenmanda yıkılır, uykuda büyür. Growth hormone\'un %75\'i derin uykuda salınır.' },
      { type: 'info', title: 'Uyku Eksikliğinin Bedeli', body: 'Haftada 5 sa uyku → testosteron %15 düşer (Chicago Üni). Kas kaybı + yağ artışı + motivasyon kaybı.' },
      { type: 'tip', text: '7-9 saat uyu. 1 sa eksik uyku = 2 antrenman boşa.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Growth hormone\'un büyük kısmı ne zaman salınır?', options: ['Sabah uyanınca', 'Antrenmanda', 'Derin uykuda', 'Yemekten sonra'], correctIndex: 2, explanation: 'Derin uyku evresinde GH zirvesi.' },
      { type: 'truefalse', question: 'Az uyku testosteronu düşürür.', correct: true, explanation: 'Doğrudan ve hızlı etki — 1 hafta yetersiz uyku %15 düşüş.' },
    ],
  },
  {
    id: 'fit_4',
    sprintId: 'fitness_60',
    dayUnlock: 11,
    title: 'NEAT — Görünmez Kalori',
    cards: [
      { type: 'info', title: 'NEAT Nedir', body: 'Non-Exercise Activity Thermogenesis = antrenman dışı hareketin yaktığı kalori. Yürüme, ayakta durma, fıkırdama, ev işi.' },
      { type: 'info', title: 'Büyük Fark', body: 'Bir oturak ofis çalışanı vs ayakta çalışan: günde 800-1500 kcal fark. Antrenmanın etkisinden büyük.' },
      { type: 'tip', text: 'Günde 8-10K adım hedefle. Diyetten önce NEAT artır.' },
    ],
    quiz: [
      { type: 'multiple', question: 'NEAT ne anlama gelir?', options: ['Antrenman kalorisi', 'Antrenman dışı hareket kalorisi', 'Bazal metabolizma', 'Yemek termik etkisi'], correctIndex: 1, explanation: 'Non-Exercise Activity Thermogenesis.' },
      { type: 'truefalse', question: 'Günlük adım sayısını artırmak antrenmandan daha çok kalori yakabilir.', correct: true, explanation: 'NEAT toplam enerji tüketiminin büyük payını alır.' },
    ],
  },
  {
    id: 'fit_5',
    sprintId: 'fitness_60',
    dayUnlock: 15,
    title: 'Kardiyo vs Kuvvet',
    cards: [
      { type: 'info', title: 'İkili Dengeleme', body: 'Kuvvet → kas, kemik, hormon. Kardiyo → kalp, dayanıklılık, mitokondri. İkisi birbirinin yerini tutmaz.' },
      { type: 'info', title: 'Optimal Kombinasyon', body: 'Haftada 3-4 kuvvet + 2-3 kardiyo. Aynı gün yapılırsa önce kuvvet, sonra kardiyo (interferans azalır).' },
      { type: 'tip', text: 'Sadece kardiyo yapan biri kas kaybeder. Sadece kuvvet yapan biri 5 kat merdiven çıkamaz.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Aynı gün kardiyo + kuvvet yapılıyorsa hangisi önce?', options: ['Kardiyo', 'Kuvvet', 'Fark etmez', 'Aynı anda'], correctIndex: 1, explanation: 'Önce kuvvet — yorgunlukken ağırlık kaldırmak yaralanma riski yaratır.' },
      { type: 'truefalse', question: 'Sadece kardiyo da kas geliştirebilir.', correct: false, explanation: 'Kas için mekanik gerilim (ağırlık) şart.' },
    ],
  },
  {
    id: 'fit_6',
    sprintId: 'fitness_60',
    dayUnlock: 19,
    title: 'Kalori Açığı / Fazlası',
    cards: [
      { type: 'info', title: 'Termodinamik Yasa', body: 'Kilo verme = açık (yediğin < harcadığın). Kilo alma = fazla. Hangi makro önemsiz, toplam kalori belirleyici.' },
      { type: 'info', title: 'Güvenli Hız', body: 'Vücut ağırlığının haftalık %0.5-1 kaybı optimal. Daha hızlı = kas kaybı + metabolik yavaşlama.' },
      { type: 'tip', text: '300-500 kcal açık idealdir. 1000 kcal açık ego boost değil — sabotaj.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Sağlıklı haftalık kilo kaybı yüzdesi nedir?', options: ['%0.5-1', '%2-3', '%5+', 'Sabit değer yok'], correctIndex: 0, explanation: '%0.5-1 — daha fazlası kas kaybı + metabolik adaptasyon.' },
      { type: 'truefalse', question: 'Düşük karbonhidrat tek başına kilo verdirir.', correct: false, explanation: 'Hayır — toplam kalori açığı verdirir. Karbonhidrat azalınca su atılır.' },
    ],
  },
  {
    id: 'fit_7',
    sprintId: 'fitness_60',
    dayUnlock: 24,
    title: 'Suplemanlar Gerçekleri',
    cards: [
      { type: 'info', title: 'Kanıtı Olanlar', body: 'Sadece 3 suplement evrensel kanıtlı: Kreatine (5g/gün), D vitamini (eksiklikte), kafein (performans). Gerisi büyük ölçüde plasebo.' },
      { type: 'info', title: 'Para Tuzakları', body: 'BCAA, glutamin, "fat burner", "test booster": çoğu çalışmada plaseboyla aynı sonuç. Para diyetine git, suplemana değil.' },
      { type: 'tip', text: 'Önce diyet + uyku + antrenman düzelsin. Suplement sonra düşün.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Hangi suplementin kas üzerinde net kanıtı var?', options: ['BCAA', 'Kreatine', 'Glutamin', 'Test booster'], correctIndex: 1, explanation: 'Kreatine en çok araştırılmış ve kanıtlı suplement.' },
      { type: 'truefalse', question: 'Suplemanlar diyet eksikliğini kapatır.', correct: false, explanation: 'Hayır — temel diyet düzelmeden suplement marjinal etki yapar.' },
    ],
  },
  {
    id: 'fit_8',
    sprintId: 'fitness_60',
    dayUnlock: 32,
    title: 'Esneklik ve Yaralanma',
    cards: [
      { type: 'info', title: 'Mobility > Esneklik', body: 'Mobility = kontrol ile hareket aralığı. Pasif esneklik (oturup uzanmak) yaralanmayı önlemez; mobility önler.' },
      { type: 'info', title: 'Yaralanma Sebepleri', body: 'Çoğu yaralanma ego kaldırışından (form bozuk + ağırlık fazla). Önce hareketi öğren, sonra yüklen.' },
      { type: 'tip', text: 'Antrenman öncesi 5 dk dinamik ısınma. Sonra 5 dk statik esneme.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Yaralanmayı önleyen ne?', options: ['Pasif esneklik', 'Mobility', 'Ağrı kesici', 'Yüksek tekrar'], correctIndex: 1, explanation: 'Kontrollü hareket aralığı (mobility) yaralanmayı azaltır.' },
      { type: 'truefalse', question: 'Antrenman öncesi statik esneme performansı artırır.', correct: false, explanation: 'Tam tersi — kuvveti geçici düşürür. Önce dinamik, sonra statik.' },
    ],
  },
  {
    id: 'fit_9',
    sprintId: 'fitness_60',
    dayUnlock: 42,
    title: 'Zihinsel Dayanıklılık',
    cards: [
      { type: 'info', title: 'Antrenmanda Beyin', body: 'Fiziksel limit gerçek limitten %40 önce gelir. Beyin "dur" diyor ama vücut yapabilir. David Goggins\'in "40% kuralı".' },
      { type: 'info', title: 'Discomfort Tolerance', body: 'Rahatsızlığa dayanma kası antrenmanda büyür ve hayata yayılır. Spor disiplini = hayat disiplini.' },
      { type: 'tip', text: 'Set sonunda "1 tane daha" diye sor. 1 → 1 → 1 = ilerleme.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Goggins\'in "40% kuralı" nedir?', options: ['Kalori açığı yüzdesi', 'Beyinin "dur" dediği nokta gerçek limitin %40\'ı', 'Protein yüzdesi', 'Set arası dinlenme'], correctIndex: 1, explanation: 'Vücut beyninden çok daha fazlasını yapabilir.' },
      { type: 'truefalse', question: 'Antrenmandaki disiplin hayatın diğer alanlarına yayılır.', correct: true, explanation: 'Rahatsızlığa tolerans transfer edilebilir bir beceri.' },
    ],
  },
  {
    id: 'fit_10',
    sprintId: 'fitness_60',
    dayUnlock: 55,
    title: 'Vücut Kompozisyonu',
    cards: [
      { type: 'info', title: 'Kilo Yanıltıcı', body: 'Tartı bütün hikayeyi söylemez. Kas kazanıp yağ kaybedebilirsin — kilo aynı kalır ama vücut değişir.' },
      { type: 'info', title: 'Daha İyi Ölçümler', body: 'Aynı koşullarda fotoğraf (sabah aç), bel-kalça oranı, mezura, antrenmandaki performans artışı.' },
      { type: 'tip', text: 'Haftalık aynı gün/saatte tartıl, 7 günün ortalamasını al. Günlük dalgalanma normaldir.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Vücut değişimini en iyi neyle takip edersin?', options: ['Sadece tartı', 'Tartı + ölçü + fotoğraf', 'Sadece ayna', 'Doktor ziyareti'], correctIndex: 1, explanation: 'Tek metrik aldatır — çok kaynaklı veri gerçeği gösterir.' },
      { type: 'truefalse', question: 'Kilo değişmemesi vücut kompozisyonu değişmediği anlamına gelir.', correct: false, explanation: 'Hayır — kas/yağ takası kiloda görünmez ama büyük fark yaratır.' },
    ],
  },
];

const businessLessons = [
  {
    id: 'biz_1',
    sprintId: 'business_90',
    dayUnlock: 1,
    title: 'MVP Nedir',
    cards: [
      { type: 'info', title: 'Minimum Viable Product', body: 'MVP = en az çabayla en çok öğrenmeyi sağlayan ürün versiyonu. Mükemmellik değil, validasyon arar.' },
      { type: 'info', title: 'MVP ≠ Kötü Ürün', body: 'MVP "kötü" değil; "küçük ama gerçek değer üreten" demektir. Dropbox MVP\'si bir videoydu — 75K kullanıcı topladı.' },
      { type: 'tip', text: 'İlk MVP\'ni 2 hafta içinde çıkar. Mükemmelleştirmeye çalışma — kullanıcı söylesin neyi düzelteceğini.' },
    ],
    quiz: [
      { type: 'multiple', question: 'MVP\'nin amacı nedir?', options: ['Mükemmel ürün', 'Maksimum öğrenme', 'Yatırım çekmek', 'Marka oluşturmak'], correctIndex: 1, explanation: 'En az çaba — en çok öğrenme. Validasyon önce.' },
      { type: 'truefalse', question: 'Dropbox MVP\'si tamamen çalışan bir ürün müydü?', correct: false, explanation: 'Hayır — bir tanıtım videosuydu. Talebi test ettiler.' },
    ],
  },
  {
    id: 'biz_2',
    sprintId: 'business_90',
    dayUnlock: 5,
    title: 'Product-Market Fit',
    cards: [
      { type: 'info', title: 'PMF Tanımı', body: 'Marc Andreessen: "Pazar ürünü senden çekiyor". Sen satmaya çalışmıyorsun, kullanıcı kullanmadan duramıyor.' },
      { type: 'info', title: 'Sean Ellis Testi', body: '"Bu ürün yarın kapansa nasıl hissedersin?" %40+ kullanıcı "çok hayal kırıklığı" derse PMF var.' },
      { type: 'tip', text: 'PMF\'siz büyüme = delik kovaya su dökmek. Önce fit, sonra scale.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Sean Ellis PMF testinde hedef yüzde?', options: ['%10', '%25', '%40', '%70'], correctIndex: 2, explanation: '%40+ "çok hayal kırıklığı" = PMF sinyali.' },
      { type: 'truefalse', question: 'PMF olmadan büyüme yatırımı yapmak akıllıcadır.', correct: false, explanation: 'Tam tersi — PMF\'siz scale para yakar.' },
    ],
  },
  {
    id: 'biz_3',
    sprintId: 'business_90',
    dayUnlock: 10,
    title: 'İlk 100 Müşteri',
    cards: [
      { type: 'info', title: 'Scale Etmeyen Şeyler', body: 'Paul Graham: "İlk kullanıcılarını elle al". Otomasyon, reklam değil — birebir konuşma, manuel servis.' },
      { type: 'info', title: 'Nereden Başla', body: 'Kendi network\'ün → forum/topluluk → cold outreach → küçük influencer. Reklam en son.' },
      { type: 'tip', text: 'İlk 10 kullanıcıya bizzat sen kur. Onları memnun edemiyorsan ürün hazır değil.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Paul Graham\'a göre erken aşamada en önemli şey?', options: ['Reklam', 'Scale etmeyen şeyler yapmak', 'AI entegrasyonu', 'Yatırım almak'], correctIndex: 1, explanation: 'Manuel kullanıcı edinimi en güçlü öğrenmeyi sağlar.' },
      { type: 'truefalse', question: 'İlk müşteriler için en iyi kanal Facebook reklamıdır.', correct: false, explanation: 'Reklam ölçeklenir — ama PMF\'siz para yakar. Önce manuel.' },
    ],
  },
  {
    id: 'biz_4',
    sprintId: 'business_90',
    dayUnlock: 18,
    title: 'Cold Outreach',
    cards: [
      { type: 'info', title: 'Mesaj Formülü', body: '1) Kişiselleştirme (1 cümle), 2) Onların problemi, 3) Sen nasıl çözüyorsun, 4) Tek soru. Kısa = güçlü.' },
      { type: 'info', title: 'Ölçek Beklentileri', body: 'Cold mail conversion %1-3 normal. 100 mesaj = 1-3 görüşme. Sayı oyunu — ama kalite arttıkça oran çıkar.' },
      { type: 'tip', text: 'Toplu spam atma. 10 mesajı kişiselleştir, 1 cevap al.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Cold outreach\'te tipik conversion rate?', options: ['%50', '%20', '%1-3', '%0.01'], correctIndex: 2, explanation: '%1-3 sektör normu. Üstü excellent.' },
      { type: 'truefalse', question: 'Aynı mesajı 1000 kişiye atmak en etkili stratejidir.', correct: false, explanation: 'Spam filtresi + insan filtresi öldürür. Kalite > kantite.' },
    ],
  },
  {
    id: 'biz_5',
    sprintId: 'business_90',
    dayUnlock: 26,
    title: 'Lean Startup',
    cards: [
      { type: 'info', title: 'Build-Measure-Learn', body: 'Eric Ries döngüsü: küçük yap, ölç, öğren, tekrar. Hipotez ile başla, veri ile doğrula.' },
      { type: 'info', title: 'Pivot Cesareti', body: 'Veri ürünü/pazarı doğrulamıyorsa pivot şart. Twitter podcasting platformuydu, Slack oyun şirketiydi.' },
      { type: 'tip', text: '"Inanmak" yetmez — ölç. Vanity metrics (toplam indirme) değil, behavior metrics (haftalık aktif).' },
    ],
    quiz: [
      { type: 'multiple', question: 'Lean Startup\'ın temel döngüsü?', options: ['Plan-Do-Check', 'Build-Measure-Learn', 'Idea-Money-Exit', 'Code-Ship-Promote'], correctIndex: 1, explanation: 'Eric Ries\'in build-measure-learn döngüsü.' },
      { type: 'truefalse', question: 'Twitter ilk olarak Twitter\'dı.', correct: false, explanation: 'Hayır — Odeo isimli podcasting şirketinin pivot ürünü.' },
    ],
  },
  {
    id: 'biz_6',
    sprintId: 'business_90',
    dayUnlock: 35,
    title: 'Networking',
    cards: [
      { type: 'info', title: 'Önce Ver', body: 'Network = bankaya yatırım. Önce yardım et, beklenti koymadan. Adam Grant: "givers" uzun vadede kazanır.' },
      { type: 'info', title: 'Zayıf Bağ Gücü', body: 'En büyük fırsatlar yakın çevreden değil, "zayıf bağlardan" gelir (Granovetter). Çünkü onlar farklı bilgi havuzlarına bağlı.' },
      { type: 'tip', text: 'Haftada 1 yeni bağlantı kur. Yıl sonunda 50 yeni insan = devasa fark.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Granovetter\'a göre fırsatlar genelde nereden gelir?', options: ['En yakın arkadaş', 'Aile', 'Zayıf bağlar', 'Patron'], correctIndex: 2, explanation: 'Zayıf bağlar farklı bilgi ağlarına köprüdür.' },
      { type: 'truefalse', question: 'Networking\'te önce alıp sonra vermek doğru stratejidir.', correct: false, explanation: 'Önce ver. Givers uzun vadede kazanır.' },
    ],
  },
  {
    id: 'biz_7',
    sprintId: 'business_90',
    dayUnlock: 45,
    title: 'Deep Work',
    cards: [
      { type: 'info', title: 'Cal Newport Yasası', body: 'Yüksek kaliteli iş = (zaman) × (odak yoğunluğu). Bölünmüş 8 saat, kesintisiz 3 saatten az üretir.' },
      { type: 'info', title: 'Deep Work Skoru', body: 'Günde minimum 90 dk kesintisiz blok. Aynı zaman + yer + ritüel = beyin "şimdi odak zamanı" der.' },
      { type: 'tip', text: 'Telefon başka odada. Bildirim kapalı. Tarayıcıda 1 sekme. Bu 3 kural %80 fark yaratır.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Cal Newport\'a göre kaliteli iş formülü?', options: ['Zaman + para', 'Zaman × odak yoğunluğu', 'Yetenek + şans', 'Çok çalışma + uyku'], correctIndex: 1, explanation: 'Zaman × odak — multitasking değer üretmez.' },
      { type: 'truefalse', question: '8 saat bölünmüş çalışma 3 saat deep work\'ten fazla üretir.', correct: false, explanation: 'Tam tersi — kesintiler bilişsel maliyet üretir.' },
    ],
  },
  {
    id: 'biz_8',
    sprintId: 'business_90',
    dayUnlock: 55,
    title: 'Gelir Modelleri',
    cards: [
      { type: 'info', title: '5 Ana Model', body: '1) Subscription (SaaS), 2) One-time sales, 3) Marketplace (komisyon), 4) Ads, 5) Freemium. Her model farklı metrik ve scale dinamiği.' },
      { type: 'info', title: 'Subscription Üstünlüğü', body: 'Tekrarlayan gelir 1 birim satıştan çok daha değerlidir. Bu yüzden Wall Street SaaS\'a 10-20x revenue valuation veriyor.' },
      { type: 'tip', text: 'Mümkünse subscription. One-time satışta her ay sıfırdan başlarsın.' },
    ],
    quiz: [
      { type: 'multiple', question: 'En yüksek valuation çarpanına sahip model?', options: ['Reklam', 'One-time sales', 'Subscription (SaaS)', 'Marketplace'], correctIndex: 2, explanation: 'Tekrarlayan gelir + yüksek margin → 10-20x.' },
      { type: 'truefalse', question: 'Bir kerelik satış subscription\'dan sürdürülebilir.', correct: false, explanation: 'Genelde değil — her ay yeniden satış baskısı yorucudur.' },
    ],
  },
  {
    id: 'biz_9',
    sprintId: 'business_90',
    dayUnlock: 65,
    title: 'Pazarlama Temelleri',
    cards: [
      { type: 'info', title: 'AIDA', body: 'Attention → Interest → Desire → Action. Klasik ama hala geçerli. Her satış kopyası bu sırayı izler.' },
      { type: 'info', title: 'Distribution > Product', body: 'Naval: "Distribution sorunu olan iyi ürün, ürün sorunu olan iyi distribution\'dan hep kaybeder". Pazarlama yan iş değil, ana iş.' },
      { type: 'tip', text: 'İlk hafta ürün, sonraki 51 hafta pazarlama. Bu oran çoğu girişimcide 50/50 ya da tersi — yanlış.' },
    ],
    quiz: [
      { type: 'multiple', question: 'AIDA modeli sırası nedir?', options: ['Action-Interest-Desire-Attention', 'Attention-Interest-Desire-Action', 'Awareness-Interest-Decision-Action', 'Hepsi'], correctIndex: 1, explanation: 'Attention → Interest → Desire → Action.' },
      { type: 'truefalse', question: 'İyi ürün kötü pazarlama olsa da kazanır.', correct: false, explanation: 'Genelde kaybeder — distribution kritik faktördür.' },
    ],
  },
  {
    id: 'biz_10',
    sprintId: 'business_90',
    dayUnlock: 80,
    title: 'Girişimci Finans',
    cards: [
      { type: 'info', title: 'Cash is King', body: 'Şirketler kar etmedikleri için değil, nakitleri tükendiği için batar. Karlı ama nakitsiz şirket → iflas.' },
      { type: 'info', title: 'Runway', body: 'Runway = nakit / aylık burn rate. Her zaman 6-12 ay runway tut. 3 ayın altına düşersen acil önlem.' },
      { type: 'tip', text: 'Aylık P&L tablosu çıkar. Tahmin değil, gerçek rakam. Para nereye gidiyor — bilmek = kontrol.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Şirketler genelde neden batar?', options: ['Kar etmedikleri için', 'Nakit tükendiği için', 'Çalışan ayrıldığı için', 'Piyasa düştüğü için'], correctIndex: 1, explanation: 'Karlı ama nakitsiz şirket bile batabilir.' },
      { type: 'truefalse', question: '3 ay runway sağlıklı bir limittir.', correct: false, explanation: '6-12 ay sağlıklı. 3 ay = acil durum.' },
    ],
  },
];

const earlyRiserLessons = [
  {
    id: 'er_1',
    sprintId: 'early_riser_30',
    dayUnlock: 1,
    title: 'Sirkadiyen Ritim',
    cards: [
      { type: 'info', title: 'Vücut Saati', body: 'Hipotalamustaki SCN (suprakiazmatik nükleus) tüm hücrelere "saati" söyler. Işık birincil zaman vericisidir.' },
      { type: 'info', title: 'Kuvvetli Sinyal', body: 'Sabah 100K+ lux güneş ışığı (kapalı oda 500 lux). Bu fark sirkadiyen ritmi kilitler.' },
      { type: 'tip', text: 'Uyandıktan 30 dk içinde 5-10 dk dışarı çık. Bulutlu gün bile yeterli.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Sirkadiyen ritmi en güçlü ne ayarlar?', options: ['Yemek', 'Egzersiz', 'Sabah ışığı', 'Kafein'], correctIndex: 2, explanation: 'Işık ana zaman vericidir.' },
      { type: 'truefalse', question: 'Kapalı ofis ışığı dış güneş ışığı kadar güçlüdür.', correct: false, explanation: '500 lux vs 100,000+ lux — 200 kat fark.' },
    ],
  },
  {
    id: 'er_2',
    sprintId: 'early_riser_30',
    dayUnlock: 3,
    title: 'Cortisol Uyanma',
    cards: [
      { type: 'info', title: 'CAR — Cortisol Awakening Response', body: 'Uyandıktan 30-45 dk sonra cortisol pik yapar — bu doğal "uyanma" hormonudur. Sağlıklı CAR enerji + odak demek.' },
      { type: 'info', title: 'Kafein Müdahalesi', body: 'Kahveyi uyanır uyanmaz içersen vücudun cortisol üretimini durdurur. 90 dk bekle = kendi sistemin çalışsın.' },
      { type: 'tip', text: 'İlk içecek su (500ml). Kafein 90 dk sonra. Daha güçlü ve uzun süreli enerji.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Sabah kahve için optimal zaman?', options: ['Hemen uyanınca', '30 dk sonra', '90 dk sonra', 'Öğleden sonra'], correctIndex: 2, explanation: '90 dk sonra — CAR\'ı bozmazsın, kafein etkisi maksimum.' },
      { type: 'truefalse', question: 'Cortisol kötü bir hormondur.', correct: false, explanation: 'Sirkadiyen cortisol sağlıklıdır — kronik stres cortisol\'ü kötüdür.' },
    ],
  },
  {
    id: 'er_3',
    sprintId: 'early_riser_30',
    dayUnlock: 6,
    title: 'Uyku Evreleri',
    cards: [
      { type: 'info', title: '4 Evre Döngüsü', body: 'N1 (geçiş) → N2 (hafif) → N3 (derin/onarım) → REM (rüya/öğrenme). Tam döngü ~90 dk.' },
      { type: 'info', title: 'Doğru Uyandırma', body: 'Hafif uykuda uyanmak kolay; derin uykuda kabus. 90 dk\'lık katlarla uyku planla (4.5, 6, 7.5, 9 sa).' },
      { type: 'tip', text: 'Alarmı 7.5 saat sonrasına kur. 8 saatten daha iyi hissedersin.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Bir tam uyku döngüsü kaç dakika?', options: ['45 dk', '60 dk', '90 dk', '120 dk'], correctIndex: 2, explanation: '90 dk — N1, N2, N3, REM.' },
      { type: 'truefalse', question: '8 saat uyku 7.5 saatten her zaman daha iyidir.', correct: false, explanation: 'Hayır — 8 saat döngünün ortasında uyandırabilir.' },
    ],
  },
  {
    id: 'er_4',
    sprintId: 'early_riser_30',
    dayUnlock: 9,
    title: 'Mavi Işık Etkisi',
    cards: [
      { type: 'info', title: 'Melatonin Düşmanı', body: 'Mavi ışık (telefon, TV) melatonin üretimini %50+ baskılar. Beyin hala "gündüz" sanır.' },
      { type: 'info', title: 'Pratik Çözüm', body: 'Yatmadan 1-2 sa önce ekran yok. Şart yapacaksan: night shift + dim + minimum ışık.' },
      { type: 'tip', text: 'Yatak odası kütüphane gibi olmalı: kitap, defter, varsa kindle. Telefon başka odada şarjda.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Mavi ışık hangi hormonu baskılar?', options: ['Melatonin', 'Cortisol', 'Testosteron', 'İnsülin'], correctIndex: 0, explanation: 'Melatonin = uyku hormonu.' },
      { type: 'truefalse', question: 'Night shift modu mavi ışık etkisini tamamen engeller.', correct: false, explanation: 'Azaltır ama tamamen engellemez. En iyisi ekran kullanmamak.' },
    ],
  },
  {
    id: 'er_5',
    sprintId: 'early_riser_30',
    dayUnlock: 12,
    title: 'Sabah Rutini Bilimi',
    cards: [
      { type: 'info', title: '"Mücadele Yokluğu"', body: 'Sabah rutini sayesinde irade harcamadan üretkenliğe geçersin. Kararlar otomatik = enerji korunur.' },
      { type: 'info', title: 'Bilimsel Çekirdek', body: 'Optimal rutin: 1) Su, 2) Güneş, 3) Hareket (10-20 dk), 4) Beslenme (protein), 5) Plan (3 hedef).' },
      { type: 'tip', text: 'Akşamdan kıyafet, antrenman çantası, kahvaltı planı hazır. Sabah karar yok.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Sabah rutininin ana faydası nedir?', options: ['Sosyal görünüm', 'İrade harcamadan üretken olmak', 'Daha çok kahvaltı', 'Sosyal medya'], correctIndex: 1, explanation: 'Otomatik kararlar = enerji koruma.' },
      { type: 'truefalse', question: 'Akşamdan hazırlık yapmak sabahı kolaylaştırır.', correct: true, explanation: 'Karar yorgunluğunu azaltır.' },
    ],
  },
  {
    id: 'er_6',
    sprintId: 'early_riser_30',
    dayUnlock: 15,
    title: 'Power Nap',
    cards: [
      { type: 'info', title: 'Tatlı Nokta: 10-20 Dk', body: '10-20 dk şekerleme = enerji boost, REM girmeden çıkış. 30 dk üstü = sersemlik (sleep inertia).' },
      { type: 'info', title: 'Nap Zamanı', body: 'Öğleden sonra 13:00-15:00 arası ideal. Geç şekerleme gece uykusunu bozar.' },
      { type: 'tip', text: '"Coffee nap": kahveyi iç → 20 dk uyu → uyandığında kafein devreye girer. Çift etki.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Optimal power nap süresi?', options: ['5 dk', '10-20 dk', '45 dk', '90 dk'], correctIndex: 1, explanation: '10-20 dk — REM\'e girmeden enerji boost.' },
      { type: 'truefalse', question: '60 dk şekerleme her zaman daha iyidir.', correct: false, explanation: '30 dk üstü sleep inertia yaratır — uyandığında daha yorgun.' },
    ],
  },
  {
    id: 'er_7',
    sprintId: 'early_riser_30',
    dayUnlock: 18,
    title: 'Melatonin Doğal Artırma',
    cards: [
      { type: 'info', title: 'Karanlık = Sinyal', body: 'Vücut karanlıkta melatonin üretir. Yatmadan 1 sa karanlık ortam = uyku kalitesi 2x.' },
      { type: 'info', title: 'Yiyecek Desteği', body: 'Vişne, ceviz, muz, yulaf doğal melatonin/triptofan içerir. Yatmadan önce hafif aperitif.' },
      { type: 'tip', text: 'Melatonin suplementine bağlanma. 0.3mg yeter — etiketteki 5-10mg fazlaysa uzun vadede sistemi bozar.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Melatonin için optimal suplement dozu?', options: ['0.3 mg', '5 mg', '10 mg', '20 mg'], correctIndex: 0, explanation: 'Düşük doz daha etkili — yüksek doz reseptör desensitize eder.' },
      { type: 'truefalse', question: 'Vücut karanlıkta otomatik melatonin üretir.', correct: true, explanation: 'Pineal bez karanlığa cevap verir.' },
    ],
  },
  {
    id: 'er_8',
    sprintId: 'early_riser_30',
    dayUnlock: 21,
    title: 'Enerji Yönetimi',
    cards: [
      { type: 'info', title: 'Ultradiyen Ritim', body: '90 dk yüksek odak + 20 dk dinlenme döngüleri (Tony Schwartz). Bunu kabul edersen üretkenlik 2x.' },
      { type: 'info', title: 'Sabah Avantajı', body: 'Çoğu insanda en yüksek bilişsel performans uyandıktan 2-4 sa sonra. Bu "altın saatleri" e-mail/toplantıyla harcama.' },
      { type: 'tip', text: 'Sabah ilk 2 saat = en zor/önemli iş. E-mail öğleden sonraya.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Ultradiyen ritim döngüsü kaç dakika?', options: ['30 dk', '60 dk', '90 dk', '120 dk'], correctIndex: 2, explanation: '90 dk odak + 20 dk dinlenme.' },
      { type: 'truefalse', question: 'Sabah ilk işin e-mail kontrol etmek olmalı.', correct: false, explanation: 'En değerli saatleri reaktif işe harcamak israf.' },
    ],
  },
  {
    id: 'er_9',
    sprintId: 'early_riser_30',
    dayUnlock: 24,
    title: 'Kronotipler',
    cards: [
      { type: 'info', title: '4 Tip', body: 'Aslan (sabah erken) %15, Ayı (genel ritim) %55, Kurt (gece) %15, Yunus (huzursuz) %10. Genetik etken büyük.' },
      { type: 'info', title: 'Kronotip Değişir', body: 'Yaşa göre değişir: ergen → kurt, yetişkin → ayı, yaşlı → aslan. Esnetilebilir, ama doğal eğilim kalır.' },
      { type: 'tip', text: 'Doğan kronotipini öğren (Michael Breus testi). 5AM herkese değil — kuşan uygun saat var.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Nüfusun yüzde kaçı doğal "aslan" kronotiptir?', options: ['%15', '%50', '%75', '%100'], correctIndex: 0, explanation: '%15 — herkes 5AM kalkamaz, normal.' },
      { type: 'truefalse', question: 'Kronotip yaşam boyu sabittir.', correct: false, explanation: 'Yaşla değişir — ergen kurt, yaşlı aslan eğilimli.' },
    ],
  },
  {
    id: 'er_10',
    sprintId: 'early_riser_30',
    dayUnlock: 28,
    title: 'Uyku Hijyeni',
    cards: [
      { type: 'info', title: 'Yatak Odası Kuralları', body: '18-20°C sıcaklık, tam karanlık, sessizlik (veya beyaz gürültü). Yatak sadece uyku + yakınlık için — TV/laptop yok.' },
      { type: 'info', title: 'Tutarlılık > Süre', body: 'Hafta sonu da aynı saatte yat-kalk. "Sosyal jet lag" sirkadiyen sistemi bozar.' },
      { type: 'tip', text: 'Akşam 18:00 sonrası kafein yok. Yarı ömrü 5-6 saat — gece dolaşır.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Optimal yatak odası sıcaklığı?', options: ['16°C', '18-20°C', '23°C', '26°C'], correctIndex: 1, explanation: 'Vücut sıcaklığı düşmesi melatonin tetikler.' },
      { type: 'truefalse', question: 'Hafta sonu geç kalkmak uyku borcunu kapatır.', correct: false, explanation: 'Sosyal jet lag yaratır — pazartesiyi mahveder.' },
    ],
  },
];

const moneyLessons = [
  {
    id: 'mon_1',
    sprintId: 'money_60',
    dayUnlock: 1,
    title: 'Bileşik Faiz: Sekizinci Harika',
    cards: [
      { type: 'info', title: 'Einstein\'ın Sözü', body: 'Bileşik faiz dünyanın 8. harikasıdır. Anlayan kazanır, anlamayan öder.' },
      { type: 'info', title: 'Matematiği', body: 'Aylık 1000 TL\'yi yıllık %15 ile yatırırsan: 10 yılda 275K, 20 yılda 1.4M, 30 yılda 7M olur.' },
      { type: 'tip', text: '20\'lerinde başlayan biri, 30\'larında 2 kat fazla yatıran birini geçer. Zaman > Miktar.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Bileşik faizde en kritik faktör nedir?', options: ['Yüksek getiri', 'Zaman', 'Düşük risk', 'Çok para'], correctIndex: 1, explanation: 'Zaman üssel büyümenin motorudur.' },
      { type: 'truefalse', question: 'Geç başlamak yüksek miktarla telafi edilebilir.', correct: false, explanation: 'Matematiksel olarak zor — bileşik etki yıllar ister.' },
    ],
  },
  {
    id: 'mon_2',
    sprintId: 'money_60',
    dayUnlock: 4,
    title: '50/30/20 Bütçe Kuralı',
    cards: [
      { type: 'info', title: 'Sistem', body: '%50 ihtiyaçlar (kira, fatura, market), %30 istekler (eğlence, hobi), %20 birikim/yatırım/borç ödeme.' },
      { type: 'info', title: 'Gerçek', body: 'Çoğu insan %80 ihtiyaç + %20 istek = %0 birikim yaşar. Bu orantı seni yoksul tutar.' },
      { type: 'tip', text: 'Maaş günü ÖNCE %20\'yi otomatik aktar — kalanla yaşa. "Önce öde kendine."' },
    ],
    quiz: [
      { type: 'multiple', question: '50/30/20 kuralında "20" neyi temsil eder?', options: ['İstekler', 'İhtiyaçlar', 'Birikim/yatırım', 'Vergi'], correctIndex: 2, explanation: 'En kritik %20 — gelecek senin.' },
      { type: 'truefalse', question: 'Birikim, ay sonunda kalandan yapılmalı.', correct: false, explanation: 'Tersi — önce ayır, sonra harca.' },
    ],
  },
  {
    id: 'mon_3',
    sprintId: 'money_60',
    dayUnlock: 8,
    title: 'Enflasyon: Sessiz Hırsız',
    cards: [
      { type: 'info', title: 'Etki', body: 'Yıllık %20 enflasyonda yastık altı 100K TL → 5 yılda 40K TL\'ye düşer. Hareketsiz para erir.' },
      { type: 'info', title: 'Korunma', body: 'Enflasyondan üstün getiri verecek araçlar: hisse, gayrimenkul, altın, döviz, endeks fonu.' },
      { type: 'tip', text: '"Tasarruf" yetmez — yatırım gerek. Para çalışmazsa enflasyon yer.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Hangisi enflasyona karşı en zayıf koruma?', options: ['Altın', 'Hisse senedi', 'Vadesiz mevduat', 'Gayrimenkul'], correctIndex: 2, explanation: 'Düşük faiz = enflasyonun altında = değer kaybı.' },
      { type: 'truefalse', question: 'Nakit tutmak en güvenli stratejidir.', correct: false, explanation: 'Görünmez kayıp — alım gücü her yıl düşer.' },
    ],
  },
  {
    id: 'mon_4',
    sprintId: 'money_60',
    dayUnlock: 12,
    title: 'Yatırım Temelleri: Hisse vs Tahvil vs Fon',
    cards: [
      { type: 'info', title: 'Hisse', body: 'Şirkete ortak olursun. Yüksek getiri potansiyeli + yüksek risk. Uzun vadede tarihsel %7-10 reel getiri.' },
      { type: 'info', title: 'Tahvil', body: 'Devlete/şirkete borç verirsin. Sabit faiz, düşük risk, düşük getiri.' },
      { type: 'info', title: 'Endeks Fonu (ETF)', body: 'Otomatik çeşitlenmiş hisse sepeti. Yeni başlayanlar için en mantıklı seçim.' },
      { type: 'tip', text: 'Bireysel hisse seçmeye çalışma — profesyonellerin %85\'i bile endeksi yenemez.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Yeni başlayan biri için en uygun yatırım?', options: ['Bireysel hisse', 'Kripto', 'Endeks fonu', 'Forex'], correctIndex: 2, explanation: 'Çeşitlenme + düşük komisyon + sıfır araştırma.' },
    ],
  },
  {
    id: 'mon_5',
    sprintId: 'money_60',
    dayUnlock: 16,
    title: 'Acil Fon: Finansal Yastık',
    cards: [
      { type: 'info', title: 'Neden?', body: '3-6 aylık giderini karşılayacak nakit lazım. İşten çıkarma, sağlık, beklenmedik = hayat olur.' },
      { type: 'info', title: 'Nerede?', body: 'Vadeli mevduat veya likit fon. Borsada DEĞİL — gerektiğinde dipte satmak istemezsin.' },
      { type: 'tip', text: 'Acil fon olmadan yatırım yapma. Kriz anında zararla satmak en pahalı hatadır.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Acil fon kaç aylık gideri kapsamalı?', options: ['1 ay', '3-6 ay', '1 yıl', '2 yıl'], correctIndex: 1, explanation: 'Çoğu işsizlik 3-6 ayda bulunur.' },
      { type: 'truefalse', question: 'Acil fon borsada tutulmalı.', correct: false, explanation: 'Likit ve güvenli olmalı — borsa volatildir.' },
    ],
  },
  {
    id: 'mon_6',
    sprintId: 'money_60',
    dayUnlock: 20,
    title: 'Dürtüsel Harcama Psikolojisi',
    cards: [
      { type: 'info', title: 'Tetikleyiciler', body: 'Stres, sıkıntı, sosyal medya reklamları, indirim sirenleri, FOMO. Beyin dopamin arar — alışveriş anlık verir.' },
      { type: 'info', title: '24 Saat Kuralı', body: 'İhtiyaç olmayan her şeyi sepete ekle, 24 saat bekle. Çoğu istek söner — beyin "şimdi" odaklıdır.' },
      { type: 'tip', text: 'Bir abonelik iptal et bu hafta. Yıllık 1500 TL = 30 yıl yatırımda 200K+ TL.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Dürtüsel harcamayı azaltan en güçlü teknik?', options: ['Kart kullanma', 'Bekleme süresi', 'Bütçe yapma', 'Az kazan'], correctIndex: 1, explanation: 'Dürtü dalgası 20-30 dakika sürer — bekle, geçer.' },
    ],
  },
  {
    id: 'mon_7',
    sprintId: 'money_60',
    dayUnlock: 25,
    title: 'Borç Çığı vs Borç Kartopu',
    cards: [
      { type: 'info', title: 'Çığ Yöntemi', body: 'En yüksek faizli borçtan başla. Matematiksel olarak optimal — en az faiz ödersin.' },
      { type: 'info', title: 'Kartopu Yöntemi', body: 'En küçük borçtan başla. Psikolojik olarak güçlü — küçük zaferler motive eder.' },
      { type: 'tip', text: 'Disiplinin yoksa kartopunu seç. Disiplinin varsa çığı seç. İkisi de ATIL olmaktan iyidir.' },
    ],
    quiz: [
      { type: 'multiple', question: 'En çok faiz tasarrufu sağlayan yöntem?', options: ['Kartopu', 'Çığ', 'Asgari ödeme', 'Refinansman'], correctIndex: 1, explanation: 'Yüksek faizi önce öderken birikime izin verir.' },
    ],
  },
  {
    id: 'mon_8',
    sprintId: 'money_60',
    dayUnlock: 35,
    title: 'Vergi Temelleri',
    cards: [
      { type: 'info', title: 'Yatırım Vergileri', body: 'Hisse 1 yıldan uzun tutulursa stopaj %0. Mevduat faizinde stopaj var. Bilmek = legal tasarruf.' },
      { type: 'info', title: 'Vergi Avantajlı Hesaplar', body: 'Bireysel Emeklilik (BES) %30 devlet katkısı + vergi avantajı sağlar. Uzun vade için güçlü araç.' },
      { type: 'tip', text: 'Zenginler vergi optimize eder, fakirler ödeyip geçer. Fark burada başlar.' },
    ],
    quiz: [
      { type: 'truefalse', question: 'BES devlet katkısı %30\'dur.', correct: true, explanation: 'Yıllık limiti aşmamak şartıyla.' },
    ],
  },
  {
    id: 'mon_9',
    sprintId: 'money_60',
    dayUnlock: 45,
    title: 'Pasif Gelir: Para Senin İçin Çalışsın',
    cards: [
      { type: 'info', title: 'Tanım', body: 'Aktif çalışmadan gelen gelir: temettü, kira, faiz, telif, dijital ürün satışı, ortaklık.' },
      { type: 'info', title: 'Gerçek', body: 'Pasif gelir ÖNCE aktif emek ister. Temettü için yatırım, kira için mülk, telif için yıllarca üretim.' },
      { type: 'tip', text: 'Tek kaynaklı gelir = tehlike. Ortalama milyoner 7 farklı gelir akışına sahip.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Hangisi gerçek pasif gelir kaynağı?', options: ['Maaş', 'Freelance', 'Hisse temettüsü', 'Saat ücreti'], correctIndex: 2, explanation: 'Yatırdıktan sonra otomatik nakit akışı.' },
    ],
  },
  {
    id: 'mon_10',
    sprintId: 'money_60',
    dayUnlock: 55,
    title: 'Finansal Bağımsızlık (FIRE)',
    cards: [
      { type: 'info', title: '%4 Kuralı', body: 'Yıllık giderinin 25 katına ulaştığında: birikiminden %4 çekerek ömür boyu yaşayabilirsin.' },
      { type: 'info', title: 'Hesap', body: 'Aylık 20K TL gider = yıllık 240K = FIRE rakamı 6M TL. Aylık 5K yatırırsan ~25 yılda mümkün.' },
      { type: 'tip', text: 'FIRE para değil — özgürlüktür. Sevmediğin işe "hayır" diyebilme gücüdür.' },
    ],
    quiz: [
      { type: 'multiple', question: 'FIRE rakamı nasıl hesaplanır?', options: ['Yıllık gider × 10', 'Yıllık gider × 25', 'Maaş × 100', 'Yaş × 50K'], correctIndex: 1, explanation: '%4 kuralı = 1/0.04 = 25.' },
      { type: 'truefalse', question: 'FIRE sadece yüksek gelirliler için.', correct: false, explanation: 'Tasarruf oranı > Gelir miktarı. %50 biriktiren 17 yılda ulaşır.' },
    ],
  },
];

const readingLessons = [
  {
    id: 'rea_1',
    sprintId: 'reading_30',
    dayUnlock: 1,
    title: 'Aktif Okuma vs Pasif Okuma',
    cards: [
      { type: 'info', title: 'Pasif Okuma', body: 'Gözünü sayfada gezdirip bitirmek. Sayfa sayısı artar, anlama sıfırdır. Sosyal medya gibi tüketim modu.' },
      { type: 'info', title: 'Aktif Okuma', body: 'Sorular sor, altını çiz, kenara not al, kendi kelimelerinle özetle, kendine "neden?" de.' },
      { type: 'tip', text: 'Bir paragrafı 2x okumak, 3 paragrafı 1x okumaktan değerlidir.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Aktif okumanın temel özelliği?', options: ['Hızlı bitirme', 'Sorgulama ve etkileşim', 'Sessizce okuma', 'Çok kitap'], correctIndex: 1, explanation: 'Beyin pasifken hiçbir şey kalıcı olmaz.' },
      { type: 'truefalse', question: 'Kitap sayısı bilgi miktarını belirler.', correct: false, explanation: 'Anlama derinliği belirler — 1 kitap iyi okunmuş > 10 kitap geçilmiş.' },
    ],
  },
  {
    id: 'rea_2',
    sprintId: 'reading_30',
    dayUnlock: 3,
    title: 'Zettelkasten: Atomik Notlar Sistemi',
    cards: [
      { type: 'info', title: 'Yöntem', body: 'Niklas Luhmann 90.000 not + 70 kitap üretti. Sırrı: her fikir tek bir kart, kartlar birbirine bağlı.' },
      { type: 'info', title: 'Uygula', body: '1) Okurken iz notu al. 2) Sonra atomik not yaz (1 fikir = 1 kart). 3) Bağlantı kur. 4) Kalıcı klasöre koy.' },
      { type: 'tip', text: 'Notion, Obsidian, Roam gibi araçlar Zettelkasten için yapıldı. Dijitalde başla.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Zettelkasten\'in temel ilkesi?', options: ['Çok not al', 'Atomik + bağlantılı', 'El yazısı şart', 'Renkli kalemler'], correctIndex: 1, explanation: 'Bağlantılar yeni fikirler doğurur.' },
    ],
  },
  {
    id: 'rea_3',
    sprintId: 'reading_30',
    dayUnlock: 5,
    title: 'Hızlı Okuma: Pazarlama Yalanı',
    cards: [
      { type: 'info', title: 'Bilim Diyor', body: 'Anlama oranı %50\'nin altına düşmeden hızlanmak imkansız. "Dakikada 1000 kelime" iddiaları sahte.' },
      { type: 'info', title: 'Gerçek Çözüm', body: 'Hız değil — kalite. Önemli olan ne anlattığını, neden anlattığını, sana ne öğrettiğini içselleştirmek.' },
      { type: 'tip', text: 'Hızlı oku ile YANLIŞ kitabı atlayabilirsin. DOĞRU kitabı yavaşça yut.' },
    ],
    quiz: [
      { type: 'truefalse', question: 'Hızlı okuma anlama kaybı olmadan mümkündür.', correct: false, explanation: 'Bilimsel olarak ispatlanmış ters orantı.' },
    ],
  },
  {
    id: 'rea_4',
    sprintId: 'reading_30',
    dayUnlock: 7,
    title: 'Derin Okuma: Yok Olan Sanat',
    cards: [
      { type: 'info', title: 'Tanım', body: 'Derin okuma = kesintisiz, dikkatli, yansıtıcı okuma. Beyin bağlantı kurar, hayal kurar, sentezler.' },
      { type: 'info', title: 'Tehdit', body: 'Sosyal medya beynimizi yüzeysel taramaya programlıyor. 30 saniyelik içerik dikkat süreni eritir.' },
      { type: 'tip', text: 'Telefonu kapat. Saatini kur — minimum 30 dakika kesintisiz okuma. Bu bir egzersizdir.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Derin okumayı en çok bozan şey?', options: ['Zor kelimeler', 'Bildirimler', 'Eski kitap', 'Kahve'], correctIndex: 1, explanation: 'Her bildirim odaklanmayı sıfırlar.' },
    ],
  },
  {
    id: 'rea_5',
    sprintId: 'reading_30',
    dayUnlock: 10,
    title: 'Kitap Seçme Sanatı',
    cards: [
      { type: 'info', title: 'Süzgeç', body: 'Hayatını değiştirebilir mi? 5 yıl sonra hala değerli olacak mı? Yazar bu konuyu YAŞAMIŞ mı?' },
      { type: 'info', title: 'Klasik Kuralı', body: '50+ yıl ayakta kalan kitaplar test edilmiştir. Yeni kitapların %95\'i 5 yıl sonra unutulur.' },
      { type: 'tip', text: 'Bir kitap ilk 50 sayfada seni kavramadıysa BIRAK. Hayat kısa, kötü kitap çok.' },
    ],
    quiz: [
      { type: 'multiple', question: 'En güçlü kitap seçim filtresi?', options: ['Bestseller listesi', 'Zamanın testi', 'Influencer önerisi', 'Kapak'], correctIndex: 1, explanation: 'Eski kitaplar zamanın elemesinden geçti.' },
    ],
  },
  {
    id: 'rea_6',
    sprintId: 'reading_30',
    dayUnlock: 13,
    title: 'Okuma Alışkanlığı İnşa Etmek',
    cards: [
      { type: 'info', title: 'Mikro Başlangıç', body: 'Günde 10 sayfa = yılda 12 kitap. Az başla, kaçırma. Tutarlılık > yoğunluk.' },
      { type: 'info', title: 'Bağlam Tetikleyici', body: 'Sabah kahvenle, yatakta yatmadan, banyoda — kitabı görüş alanına koy.' },
      { type: 'tip', text: 'Yanına 3 kitap taşı: kurgu, kurgu dışı, hafif. Mizaca göre seç.' },
    ],
    quiz: [
      { type: 'truefalse', question: 'Günde 10 sayfa okumak yılda 12+ kitap demektir.', correct: true, explanation: '300 sayfa/kitap × 12 ≈ 3650 sayfa = 365 gün × 10.' },
    ],
  },
  {
    id: 'rea_7',
    sprintId: 'reading_30',
    dayUnlock: 16,
    title: 'Bellekte Tutmak: Spaced Repetition',
    cards: [
      { type: 'info', title: 'Unutma Eğrisi', body: 'Ebbinghaus: 24 saatte %70 unutulur. Tekrar olmadan okumak = boşa zaman.' },
      { type: 'info', title: 'Aralıklı Tekrar', body: 'Notlarını 1 gün, 3 gün, 7 gün, 14 gün, 30 gün sonra gözden geçir. Bilgi kalıcı belleğe geçer.' },
      { type: 'tip', text: 'Anki, RemNote, Notion gibi araçlarla otomatik aralıklı tekrar yapabilirsin.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Aralıklı tekrar neyi yener?', options: ['Yorgunluğu', 'Unutma eğrisini', 'Yavaş okumayı', 'Dikkat dağınıklığını'], correctIndex: 1, explanation: 'Her tekrar belleği güçlendirir.' },
    ],
  },
  {
    id: 'rea_8',
    sprintId: 'reading_30',
    dayUnlock: 20,
    title: 'Tür Çeşitliliği: Beyni Genişlet',
    cards: [
      { type: 'info', title: 'Neden Karışık?', body: 'Sadece iş kitabı = dar zihin. Roman empati, felsefe perspektif, biyografi rol model, bilim merak verir.' },
      { type: 'info', title: 'Önerilen Karışım', body: '40% kurgu dışı (öğrenme), 30% kurgu (empati/anlatı), 20% biyografi, 10% felsefe/şiir.' },
      { type: 'tip', text: 'Bir konuda uzmanlaşmak için 5 farklı yazardan 5 kitap oku — tek yazara bağımlı kalma.' },
    ],
    quiz: [
      { type: 'truefalse', question: 'Kurgu okumak iş hayatına faydasızdır.', correct: false, explanation: 'Kurgu empati, perspektif, anlatım gücü kazandırır — liderlik için kritik.' },
    ],
  },
  {
    id: 'rea_9',
    sprintId: 'reading_30',
    dayUnlock: 24,
    title: 'Eleştirel Okuma',
    cards: [
      { type: 'info', title: '4 Soru', body: '1) Kitap genel olarak ne anlatıyor? 2) Detayda ne söylüyor? 3) Doğru mu? 4) Bana ne ifade ediyor?' },
      { type: 'info', title: 'Yazara Hesap Sor', body: 'Her iddianın kanıtı var mı? Veriler nereden? Yazarın çıkar çatışması var mı? Otorite mi, yoksa sadece popüler mi?' },
      { type: 'tip', text: 'En tehlikeli kitap, sorgulamadan kabul ettiğindir. Her kitap önyargı taşır.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Eleştirel okumanın temel sorusu?', options: ['Kim yazdı?', 'Kanıt nerede?', 'Kaç sayfa?', 'Popüler mi?'], correctIndex: 1, explanation: 'Otorite değil — kanıt önemlidir.' },
    ],
  },
  {
    id: 'rea_10',
    sprintId: 'reading_30',
    dayUnlock: 27,
    title: 'Bilgiyi Hayata Geçirmek',
    cards: [
      { type: 'info', title: 'Asıl Test', body: 'Kitap bitirmek başarı değildir. Hayatın değişti mi? Bir alışkanlık mı kazandın? Bir karar mı verdin?' },
      { type: 'info', title: 'Eylem Maddesi', body: 'Her kitaptan 3 somut eylem çıkar. Ajandanda sıraya koy. 30 günde uygula. Uygulanmayan bilgi = boş ağırlık.' },
      { type: 'tip', text: '"Ne öğrendim?" yerine "Ne YAPACAĞIM?" diye sor. Cevap yoksa kitap işe yaramamış.' },
    ],
    quiz: [
      { type: 'multiple', question: 'Bir kitabın gerçek değeri nasıl ölçülür?', options: ['Sayfa sayısıyla', 'Hayatına etkisiyle', 'Yazar ünüyle', 'Fiyatıyla'], correctIndex: 1, explanation: 'Bilgi = uygulama. Diğeri entelektüel egzersizdir.' },
      { type: 'truefalse', question: 'Çok kitap okumak = çok bilgili olmak.', correct: false, explanation: 'Az kitap derin uygulanmış > çok kitap unutulmuş.' },
    ],
  },
];

export const LESSONS = [
  ...dopamineLessons,
  ...fitnessLessons,
  ...businessLessons,
  ...earlyRiserLessons,
  ...moneyLessons,
  ...readingLessons,
];

export const getLessonsForSprint = (sprintId) =>
  LESSONS.filter((l) => l.sprintId === sprintId).sort(
    (a, b) => a.dayUnlock - b.dayUnlock,
  );

export const getLessonById = (lessonId) =>
  LESSONS.find((l) => l.id === lessonId) || null;

export const getUnlockedLessons = (sprintId, currentDay) =>
  getLessonsForSprint(sprintId).filter((l) => l.dayUnlock <= currentDay);

export const calculateLessonXP = (lesson, correctAnswers = 0) => {
  const base = 20;
  const perCorrect = 10;
  return base + correctAnswers * perCorrect;
};
