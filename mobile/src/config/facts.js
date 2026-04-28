// Günlük bilgi kartları — her gün döndürülen bite-sized içerikler.
// Kategori: discipline, neuroscience, productivity, health, money, mindset, history, biology

const factsBatch1 = [
  { id: 'f1', category: 'neuroscience', title: 'Beyin Plastiği', body: 'Beyninin yapısı her gün değişir. 21 günde değil — yıllarca süren tutarlı eylemle yeni nöral yollar inşa edilir.' },
  { id: 'f2', category: 'discipline', title: 'Motivasyon Yalanı', body: 'Motivasyon duygudur — gelir gider. Disiplin sistemdir — kalır. Başarılılar motivasyon beklemez.' },
  { id: 'f3', category: 'productivity', title: '2 Dakika Kuralı', body: 'Bir iş 2 dakikadan az sürüyorsa şimdi yap. Listeye eklemek 5 dakika sürer.' },
  { id: 'f4', category: 'health', title: 'Su ve Beyin', body: 'Vücudun %1\'i su kaybı bilişsel performansı %12 düşürür. Sabah ilk iş 500ml su iç.' },
  { id: 'f5', category: 'money', title: 'Latte Faktörü', body: 'Günlük 50 TL kahve = aylık 1500 TL = 30 yılda %10 yatırımla 3.4M TL.' },
  { id: 'f6', category: 'mindset', title: 'Sabit vs Gelişim', body: 'Sabit zihniyet: "Yapamam." Gelişim zihniyeti: "Henüz yapamıyorum." Tek kelime fark — devasa sonuç farkı.' },
  { id: 'f7', category: 'history', title: 'Edison\'un 10.000\'i', body: 'Ampul icadı için 10.000 başarısız deneme. "Başarısız olmadım — işe yaramayan 10.000 yol buldum." dedi.' },
  { id: 'f8', category: 'biology', title: 'Kortizol Sabahı', body: 'Kortizol sabah 6-9 arası tepe yapar. Bu zarar değil — uyanmana yardım eder. Sabah enerji burada.' },
  { id: 'f9', category: 'discipline', title: 'Marcus Aurelius', body: '"Sen, kendi düşüncelerinin gücüsün. Bunu fark et — özgürlüğü kazan."' },
  { id: 'f10', category: 'neuroscience', title: 'Dopamin Detoksu', body: 'Yüksek uyaranlardan uzak durmak dopamin reseptörlerini günlerde sıfırlar. Sıkıcı şeyler tekrar tatmin eder.' },
];

const factsBatch2 = [
  { id: 'f11', category: 'productivity', title: 'Pomodoro Bilimi', body: 'Beyin 25-45 dakika derin odaklanır, sonra dağılır. Mola = zayıflık değil — verimlilik aracı.' },
  { id: 'f12', category: 'health', title: 'Yürüyüş Mucizesi', body: 'Günde 10K adım kalp hastalığı riskini %35, depresyon riskini %26 düşürür. Bedava ilaç.' },
  { id: 'f13', category: 'discipline', title: 'Aristoteles', body: '"Tekrarlanan eylem kim olduğumuzdur. Mükemmellik bir eylem değil — alışkanlıktır."' },
  { id: 'f14', category: 'money', title: 'Warren Buffett Kuralı', body: 'Kural 1: Para kaybetme. Kural 2: Kural 1\'i unutma. Kazanmak değil — kaybetmemek zenginleştirir.' },
  { id: 'f15', category: 'mindset', title: 'Sokratik Şüphe', body: '"Bildiğim tek şey hiçbir şey bilmediğimdir." Gerçek zekâ — kendi cehaletini görmektir.' },
  { id: 'f16', category: 'neuroscience', title: 'Mirror Neurons', body: 'Beyninde "ayna nöronlar" var — etrafındakileri kopyalar. Çevreni seç, çünkü beynin seçmiyor.' },
  { id: 'f17', category: 'history', title: 'Roma Stoacıları', body: 'Marcus Aurelius imparator olduğu halde her sabah günlük yazardı. "Meditations" kişisel günlüğüydü — yayın değil.' },
  { id: 'f18', category: 'biology', title: 'Testosteron ve Egzersiz', body: 'Ağırlık çalışması erkeklerde testosteronu %20-40 yükseltir. Doğal — sürdürülebilir — bedava.' },
  { id: 'f19', category: 'productivity', title: 'Parkinson Yasası', body: '"İş, ona ayrılan zamanı doldurur." 1 saatte yapılacak işe 8 saat verirsen 8 saat sürer.' },
  { id: 'f20', category: 'discipline', title: '%1 Daha İyi', body: 'Her gün %1 iyileşme = yılda 37 kat. Her gün %1 kötüleşme = yılda 0.03\'e düşme. Küçük kararlar büyük hayatlar yaratır.' },
  { id: 'f21', category: 'health', title: 'Magnezyum Eksikliği', body: 'Yetişkinlerin %50\'si magnezyum eksikliği yaşar. Uyku, kas, ruh hali bozulur. Yeşil yapraklı, kuruyemiş, koyu çikolata.' },
  { id: 'f22', category: 'money', title: '70/20/10 Yatırım', body: 'Pro yatırımcı dağılımı: %70 endeks (güvenli), %20 sektör (orta), %10 spekülatif (yüksek). Asla terse çevirme.' },
  { id: 'f23', category: 'mindset', title: 'Memento Mori', body: 'Latince: "Ölümü hatırla." Stoikler her gün ölümü düşünürdü — küçük şeylerle uğraşmayı bırakırdın.' },
  { id: 'f24', category: 'neuroscience', title: 'Spaced Repetition', body: 'Bilgi 1 gün, 3 gün, 7 gün, 30 gün aralıklarla tekrarlanırsa kalıcı belleğe geçer. Bir gecede çalışma boş.' },
  { id: 'f25', category: 'biology', title: 'Sirkadyen Ritim', body: 'Vücudun saati ışığa göre çalışır. Sabah güneş + gece karanlık = derin uyku, net beyin.' },
  { id: 'f26', category: 'productivity', title: 'Eisenhower Matrisi', body: 'Acil + önemli = HEMEN. Önemli + acil değil = PLANLA. Acil + önemsiz = DELEGE. İkisi de değil = SİL.' },
  { id: 'f27', category: 'discipline', title: 'Stoik Tepki', body: 'Olaylar sana zarar vermez — yorumların verir. Tepki seçilir, otomatik değildir.' },
  { id: 'f28', category: 'history', title: 'Da Vinci Günlükleri', body: 'Leonardo 13.000 sayfa not bıraktı. Çoğu yarım kaldı. Dahi = bitmemiş projelerin müzesidir.' },
  { id: 'f29', category: 'money', title: 'Acil Fon Mantığı', body: 'Acil fon olmadan yatırım = krizde dipte satmak. 3 aylık gider rezervi her yatırımdan önce gelir.' },
  { id: 'f30', category: 'mindset', title: 'Antifragility', body: 'Kırılgan: stresle bozulur. Sağlam: stresle değişmez. Antifragile: stresle güçlenir. Hedef bu olmalı.' },
];

const factsBatch3 = [
  { id: 'f31', category: 'neuroscience', title: 'Default Mode Network', body: 'Beyin "boş" görünürken bile çalışır — fikirleri birleştirir. Sıkılmak — yaratıcılık fabrikasıdır.' },
  { id: 'f32', category: 'health', title: 'Soğuk Duş', body: '2-3 dk soğuk duş norepinefrini %200-300 yükseltir. Odak, ruh hali, bağışıklık güçlenir.' },
  { id: 'f33', category: 'discipline', title: 'David Goggins', body: '"Cüzdanını dolu — düşmanını yakın tut." Konfor düşmandır. Onu her gün görmen gerek.' },
  { id: 'f34', category: 'money', title: 'Gelir vs Servet', body: 'Yüksek gelirli ≠ zengin. Gelir taşıyıcıdır — servet birikimdir. %50 maaş harcayan, %5 harcayanın yanına geçemez.' },
  { id: 'f35', category: 'mindset', title: 'Amor Fati', body: 'Latince: "Kaderini sev." Olanı kabul et — sonra hareket et. Direnç enerji harcatır.' },
  { id: 'f36', category: 'productivity', title: 'Maker vs Manager', body: 'Üretici saat bloklarına ihtiyaç duyar — yönetici toplantılarla yaşar. Karıştırma — biri diğerini öldürür.' },
  { id: 'f37', category: 'biology', title: 'Adenozin Birikimi', body: 'Uyanıkken adenozin birikir — uyku istersin. Kafein onu maskeler — borç birikir. Faiz öder.' },
  { id: 'f38', category: 'history', title: 'Roma Banyo Zamanı', body: 'Romalı yöneticiler günde 2-3 saat banyoda düşünürdü. Boş zaman lüks değil — strateji aracıydı.' },
  { id: 'f39', category: 'discipline', title: 'Jocko Willink', body: '"Disiplin = özgürlük." Şimdi disiplinli ol — gelecekte istediğini yap.' },
  { id: 'f40', category: 'neuroscience', title: 'Yarıcı Beyin', body: 'Beyninin sol yarısı analizci, sağ yarısı sezgisel. İkisi de gerek. Sadece birini kullanan eksiktir.' },
  { id: 'f41', category: 'money', title: 'Ortalamanın Sırrı', body: 'Borsa kötü gün satın alır — endeks fonuna düzenli yatırım = "dollar cost averaging" — zamanlama riskini siler.' },
  { id: 'f42', category: 'health', title: 'Yağ vs Şeker', body: '40 yıl "yağ kötü" yalanı — gerçek suçlu işlenmiş şekerdi. Doğal yağ (avokado, balık, zeytin) beyne ilaç.' },
  { id: 'f43', category: 'mindset', title: 'Ego Düşmanı', body: '"Ego is the enemy" — Ryan Holiday. Başarı ego ister, sürdürmek ego yokluğu ister.' },
  { id: 'f44', category: 'productivity', title: 'Single-Tasking', body: 'Multitasking yalandır — beyin görev değiştirir. Her geçiş %40 verim kaybı. Tek iş — tek pencere.' },
  { id: 'f45', category: 'biology', title: 'Kalp Hızı Değişkenliği', body: 'HRV yüksekse — sistem dirençli. Düşükse — yorgun. Nefes egzersizi 2 haftada HRV\'yi yükseltir.' },
  { id: 'f46', category: 'history', title: 'Benjamin Franklin Sistemi', body: 'Franklin 13 erdemi haftalara böldü — her hafta birine odaklanırdı. Sistem > Hedef.' },
  { id: 'f47', category: 'discipline', title: 'Naval Ravikant', body: '"Belirli bir bilgi (specific knowledge) öğretilemez — sadece keşfedilir. Tutkun seni oraya götürür."' },
  { id: 'f48', category: 'neuroscience', title: 'Visualization', body: 'Beyninin görüntüleme ile gerçek arasındaki farkı ayırt etmesi zor. Sporcular zihinsel prova kaslarını çalıştırır.' },
  { id: 'f49', category: 'money', title: 'Lifestyle Inflation', body: 'Maaş arttıkça harcama artar — net zenginlik aynı. Yeni maaşı %50 yatır — eski hayatla yaşa.' },
  { id: 'f50', category: 'mindset', title: 'Beginner\'s Mind', body: 'Zen "shoshin" — başlangıç zihni. Her şeyi ilk kez gibi gör. Uzmanlar dar görür — başlangıçlar her şeyi.' },
  { id: 'f51', category: 'health', title: 'Protein Hesabı', body: 'Vücut ağırlığı (kg) × 1.6 gram protein/gün = optimal kas onarımı. Çoğu insan yarısını yer.' },
  { id: 'f52', category: 'productivity', title: 'Deep Work', body: 'Cal Newport: "Konsantre derin çalışma süper güçtür." 4 saat derin > 12 saat dağınık.' },
  { id: 'f53', category: 'discipline', title: 'Seneca', body: '"Yaşamak boyunca öğreniyorsun — özellikle nasıl yaşanacağını."' },
  { id: 'f54', category: 'biology', title: 'Glikoz vs Beyin', body: 'Beyin günlük enerjinin %20\'sini ister — sadece %2\'lik kütleye rağmen. Düşük glikoz = düşünememe.' },
  { id: 'f55', category: 'history', title: 'Steve Jobs Yürüyüşü', body: 'Jobs önemli kararları yürürken alırdı. Yürüyüş + düşünce = bilim doğrulanmış yaratıcılık artışı.' },
  { id: 'f56', category: 'money', title: 'Pareto Prensibi', body: 'Kazançlarının %80\'i eylemlerinin %20\'sinden gelir. O %20\'yi bul — kalanı temizle.' },
  { id: 'f57', category: 'mindset', title: 'Stockdale Paradox', body: 'En kötüye hazırlan — en iyiye inan. Sonun iyi olacağına güven, yolun zor olacağını bil.' },
  { id: 'f58', category: 'neuroscience', title: 'Sleep & Memory', body: 'Uyurken beynin günün anılarını uzun süreli belleğe yazar. Uykusuz öğrenme = sızıntılı disk.' },
  { id: 'f59', category: 'productivity', title: 'Time Blocking', body: 'Takvim = istek listesi değil — kontrat. Her saat birine ayrılmazsa kimse bilmez nereye gittiğini.' },
  { id: 'f60', category: 'discipline', title: 'Robert Greene', body: '"Zorluk seninle değildir — kendine olan inancındadır. Mastery zaman ister."' },
];

const factsBatch4 = [
  { id: 'f61', category: 'health', title: 'Yeşil Çay vs Kahve', body: 'Yeşil çayda L-theanine var — kafein ile birleşince odak verir, anksiyete vermez. Pürüzsüz enerji.' },
  { id: 'f62', category: 'money', title: 'Mortgage Mantığı', body: 'Konut kredisi 30 yıl ödendiğinde fiyatın 2.5-3 katı ödenir. Erken kapatma faiz katili.' },
  { id: 'f63', category: 'mindset', title: 'Locus of Control', body: 'İçeride: "Sonuç bana bağlı." Dışarıda: "Şans/diğerleri belirler." İçeridekiler her alanda kazanır.' },
  { id: 'f64', category: 'neuroscience', title: 'Beyin Yağı', body: 'Beynin %60\'ı yağdır. Omega-3 eksikse — hafıza, ruh hali, odak çöker. Balık + ceviz + chia.' },
  { id: 'f65', category: 'biology', title: 'Otofaji', body: 'Vücut açken hücrelerin hasarlı parçalarını yer — Nobel ödülü kazandı. 16 saatlik aralıklı oruç tetikler.' },
  { id: 'f66', category: 'productivity', title: 'MIT Tekniği', body: 'Most Important Task — sabah ilk 90 dakikada. Geri kalanı zaten dağınık olur. Asıl iş ilk başta.' },
  { id: 'f67', category: 'discipline', title: 'Epictetus', body: '"Bir şey değişebilirse şikayet etme — değiştir. Değişemezse — kabul et."' },
  { id: 'f68', category: 'history', title: 'Spartalı Çocuklar', body: '7 yaşında savaşçı eğitimi başlardı. Acı = öğretmendi. Modern hayat çok yumuşak.' },
  { id: 'f69', category: 'money', title: 'Kompound Yine', body: '$1\'ı 30 gün boyunca her gün 2 katlasan = $1 milyar. Bileşik üs sezgisel değil — matematiksel canavar.' },
  { id: 'f70', category: 'mindset', title: 'Negative Visualization', body: 'Stoikler "ya kaybetsem?" diye düşünürdü — minnet artardı. Kayıp imgele — sahip olduğunun değerini gör.' },
  { id: 'f71', category: 'neuroscience', title: 'Gut-Brain Axis', body: 'Bağırsağında 100 milyon nöron var — "ikinci beyin" denir. Probiyotikler ruh halini etkiler.' },
  { id: 'f72', category: 'health', title: 'VO2 Max', body: 'Maksimal oksijen kullanımı — uzun ömrün en güçlü göstergesi. Sigara içmekten daha öldürücü düşük VO2.' },
  { id: 'f73', category: 'productivity', title: 'Tasks vs Projects', body: 'Görev: tek eylem. Proje: birden fazla eylem. Karıştırırsan ilerleyemezsin — projeyi göreve böl.' },
  { id: 'f74', category: 'discipline', title: 'Bushido', body: 'Samuray kodu: dürüstlük, cesaret, merhamet, saygı, sadakat, şeref, samimiyet. 7 sütun — 800 yıllık öğreti.' },
  { id: 'f75', category: 'biology', title: 'BDNF Hormonu', body: 'Brain-Derived Neurotrophic Factor — "beyin gübresi". Egzersiz, oruç, öğrenme tetikler. Alzheimer\'a karşı kalkan.' },
  { id: 'f76', category: 'history', title: 'Edison vs Tesla', body: 'Edison ısrarcıydı — Tesla dehaydı. İkisi de zengin değildi. Tek başına dahi para kazanmaz — sistem kazanır.' },
  { id: 'f77', category: 'money', title: 'Cashflow Kuadrantı', body: 'Robert Kiyosaki: Çalışan, Serbest, Patron, Yatırımcı. Sağ taraf (P, Y) zenginleşir — sol taraf çalışır.' },
  { id: 'f78', category: 'mindset', title: 'Comparison Trap', body: 'Sosyal medya = başkasının highlight reel\'i vs senin behind-the-scenes\'in. Kıyaslamak matematiksel olarak adaletsiz.' },
  { id: 'f79', category: 'neuroscience', title: 'Habit Loop', body: 'Cue → Routine → Reward. Beyninin alışkanlık döngüsü. Tetikleyiciyi değiştir — alışkanlığı değiştirirsin.' },
  { id: 'f80', category: 'productivity', title: 'Inbox Zero', body: 'E-posta kontrol = takvimi başkasına vermek. Günde 2-3 kez bakman yeterli — geri kalanı bildirimleri kapat.' },
  { id: 'f81', category: 'discipline', title: 'Cato\'nun Dayanıklılığı', body: 'Roma senatörü Cato fakir gibi giyinirdi — zenginken. Lüks kasları zayıflatır — basitlik güç verir.' },
  { id: 'f82', category: 'health', title: 'Mavi Bölgeler', body: '5 bölgede insanlar 100+ yıl yaşar: Sardunya, Okinawa, Loma Linda, Nicoya, Ikaria. Ortak: hareket, topluluk, az et.' },
  { id: 'f83', category: 'biology', title: 'Telomerler', body: 'Kromozomların ucundaki "kapakçıklar" — yaşlandıkça kısalır. Egzersiz ve meditasyon kısalmayı yavaşlatır.' },
  { id: 'f84', category: 'money', title: 'Vergi Cenneti Yalanı', body: '"Vergi cennetleri" çoğunlukla zenginlere — ortalama insana zarar verir. Legal yapılarla yerel vergi avantajı kullan.' },
  { id: 'f85', category: 'mindset', title: 'Praemeditatio Malorum', body: 'Stoik egzersiz: gün başında "neyin yanlış gidebileceğini" düşün. Sürpriz olmaz — tepki kontrollü olur.' },
  { id: 'f86', category: 'neuroscience', title: 'Eustress', body: 'Stres iki tür: distress (zararlı), eustress (faydalı). Kontrol edilebilir zorluklar büyütür — çaresizlik küçültür.' },
  { id: 'f87', category: 'history', title: 'Rockefeller Sırrı', body: 'John D. Rockefeller 7 yaşında not defteri tutardı — gelir/gider. Servet alışkanlıkla başladı.' },
  { id: 'f88', category: 'productivity', title: 'Sprint vs Marathon', body: 'Yaratıcı iş = sprint. 90 dk yoğun + 20 dk dinlen. Maraton koşamazsın — kendine yalan söyleme.' },
  { id: 'f89', category: 'discipline', title: 'Gandhi Sözü', body: '"Olmak istediğin değişim ol." Değiştiremediğin tek şey kendin — onu değiştirirsen dünya değişir.' },
  { id: 'f90', category: 'biology', title: 'REM ve Yaratıcılık', body: 'REM uykusu sırasında beyin uzak fikirleri bağlar — yaratıcı çözümler doğar. Kestirmek = problem çözmek.' },
];

const factsBatch5 = [
  { id: 'f91', category: 'health', title: 'Sauna Ömrü', body: 'Haftada 4+ kez 20 dk sauna = kalp ölümü riski %50 düşer. Finlandiya çalışması — 20 yıl takip.' },
  { id: 'f92', category: 'money', title: 'Buffett 5/25', body: '25 hedef yaz — en önemli 5\'i seç. Kalan 20 = "ne pahasına olursa olsun kaçın." Odak = ret listesidir.' },
  { id: 'f93', category: 'mindset', title: 'Cogito Stoik', body: '"Sınırlarımı kabul ediyorum — ama onlardan korkmuyorum." Sınır = başlangıç noktası, son değil.' },
  { id: 'f94', category: 'neuroscience', title: 'Neurogenesis', body: 'Yetişkin beyni HALA yeni nöron üretir — özellikle hipokampusta. Egzersiz, öğrenme, oruç tetikler.' },
  { id: 'f95', category: 'productivity', title: 'Two Lists', body: 'Buffett tekniği: gün sonu yarın için 6 öncelik yaz. Sırala. 1\'den başla — bitmeden 2\'ye geçme.' },
  { id: 'f96', category: 'discipline', title: 'Kobe Bryant', body: '"4\'te uyandım — herkes uyurken çalıştım." Mamba mentality: rakip uyurken antrenman yapmak.' },
  { id: 'f97', category: 'biology', title: 'Mitokondri Sayısı', body: 'Hücrelerinin enerji fabrikaları. HIIT antrenmanı sayısını ve verimini artırır = daha çok dayanıklılık.' },
  { id: 'f98', category: 'history', title: 'Marcus\'un Günlüğü', body: 'Roma imparatoru Marcus Aurelius "Meditations"u kendisi için yazdı — yayın için değil. Saf düşünce.' },
  { id: 'f99', category: 'money', title: 'House Hacking', body: 'Çok aileli ev al — birinde otur, kalanını kirala. Kiralar mortgage\'ı öder. Sıfır harcamayla mülk.' },
  { id: 'f100', category: 'mindset', title: 'Goggins Kuralı', body: '"Vücudun durmak istediğinde — daha %40 enerjin kaldı demektir." Zihin önce pes eder.' },
  { id: 'f101', category: 'health', title: 'Uyku Aritmetiği', body: '6 saat uyku = sarhoşken araba kullanmak. Bilim defalarca kanıtladı — uykunu çalan başarı sahte.' },
  { id: 'f102', category: 'neuroscience', title: 'Habit Time', body: 'Yeni alışkanlık ortalama 66 günde otomatikleşir — 21 değil. Sabırla devam et.' },
  { id: 'f103', category: 'productivity', title: 'Decision Fatigue', body: 'Beyin günlük belli sayıda karar verebilir. Steve Jobs aynı kıyafeti giyerdi — beynini önemli kararlara sakladı.' },
  { id: 'f104', category: 'discipline', title: 'Confucius', body: '"Bin millik yolculuk tek adımla başlar." Ama kimse o ilk adımı atmıyor — burada kazanırsın.' },
  { id: 'f105', category: 'money', title: 'Black Swan', body: 'Tahmin edilemez büyük olaylar = en büyük kayıp/kazanç kaynağı. Çeşitlendirme = anti-fragility.' },
  { id: 'f106', category: 'biology', title: 'Cold Shock Protein', body: 'Soğuk maruziyeti RBM3 proteini üretir — beyinde nöron koruyucu. Soğuk = anti-aging.' },
  { id: 'f107', category: 'history', title: 'Musa\'nın 40 Yılı', body: 'Tüm dini metinlerde "40" sembolü — dönüşüm. 40 günlük disiplin sıkıntısı = kalıcı değişim eşiği.' },
  { id: 'f108', category: 'mindset', title: 'View From Above', body: 'Stoik teknik: kendini uzaydan gör — sorunların ne kadar küçük? Perspektif = sürtünme yağı.' },
  { id: 'f109', category: 'productivity', title: 'Theme Days', body: 'Pazartesi planlama, Salı yaratım, Çarşamba toplantı... Beyin tek bağlamda derinleşir, geçişi sevmez.' },
  { id: 'f110', category: 'discipline', title: 'Ben Franklin', body: '"Erken yatan, erken kalkan — sağlıklı, varlıklı, bilge olur." 250 yıl sonra hala doğru.' },
  { id: 'f111', category: 'health', title: 'Statin Tartışması', body: 'Egzersiz + diyet çoğu kolesterol ilacından etkili. İlk önce yaşam tarzı — sonra ilaç.' },
  { id: 'f112', category: 'neuroscience', title: 'Mirror Test', body: 'Çevrendeki 5 kişinin ortalaması olursun — gelir, sağlık, mutluluk. Kimse hariç değil.' },
  { id: 'f113', category: 'money', title: 'Dave Ramsey 7 Adım', body: '1) $1K acil, 2) Borçları öde, 3) 3-6 ay fon, 4) %15 emeklilik, 5) Çocuk eğitim, 6) Ev öde, 7) Servet & ver.' },
  { id: 'f114', category: 'biology', title: 'Glymphatic System', body: 'Beyin uyurken kendi atıklarını temizler — sadece o zaman. Uykusuz beyin = çöp tenekesi.' },
  { id: 'f115', category: 'mindset', title: 'Frankl\'s Choice', body: 'Viktor Frankl: "Uyaran ile tepki arasında bir aralık var. O aralıkta gücümüz — özgürlüğümüz yatar."' },
  { id: 'f116', category: 'productivity', title: 'NSDR', body: 'Non-Sleep Deep Rest — 20 dk derin gevşeme uyumadan dinlendirir. Andrew Huberman önerir.' },
  { id: 'f117', category: 'discipline', title: 'Jiro Sushi Master', body: '"Aynı şeyi 50 yıl yaparsan — usta olursun." Mastery sıkıcı tekrarda saklı.' },
  { id: 'f118', category: 'history', title: 'Roma\'nın Düşüşü', body: 'Lüks, ahlaksızlık, askeri zayıflık. Bireyler için de geçerli — konfor ölümün başlangıcıdır.' },
  { id: 'f119', category: 'money', title: 'Munger\'ın Sırrı', body: '"Aptallık yapmamak — zekâdan değerlidir." Servetin kalıcılığı zekâya değil — hatasızlığa bağlı.' },
  { id: 'f120', category: 'mindset', title: 'Final Truth', body: 'Hiçbir kitap, ders, fikir — eylem olmadan değişim getirmez. Bu uygulamayı oku — sonra KAPAT — yap.' },
];

export const FACTS = [
  ...factsBatch1,
  ...factsBatch2,
  ...factsBatch3,
  ...factsBatch4,
  ...factsBatch5,
];

export const getFactOfTheDay = (userId = '') => {
  const today = new Date();
  const ymd = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const seed = `${userId}-${ymd}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return FACTS[h % FACTS.length];
};

export const getFactById = (id) => FACTS.find((f) => f.id === id) || null;

export const getFactsByCategory = (category) =>
  FACTS.filter((f) => f.category === category);
