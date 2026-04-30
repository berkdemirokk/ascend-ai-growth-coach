/**
 * Seed mind-discipline lessons 6-30 (25 new) + add proTip to 1-5.
 * Run: node scripts/seed_mind_discipline.js
 */
const fs = require('fs');
const path = require('path');

const PROTIPS_TR = {
  1: 'Telefonu hep odanın diğer ucuna koy. "Ulaşmak için kalkmak" gerekirse, çoğu kez vazgeçersin.',
  2: 'Distraction listeni telefonun ana ekranına koy. Görmek = farkına varmak.',
  3: 'Deep work başlamadan önce hedefini bir kâğıda yaz. "Şu 90 dakikada şunu bitireceğim."',
  4: 'Sabah ilk e-postayı 11\'den önce açma. Yapanın aksine, e-posta hep bekler.',
  5: 'Telefonu kontrol saatlerini takvime koy: 12:00 ve 17:00. Diğer her zaman uçak modu.',
};
const PROTIPS_EN = {
  1: 'Keep your phone across the room. If reaching means standing, you\'ll often skip it.',
  2: 'Pin your distraction kill list on the phone home screen. Seeing = noticing.',
  3: 'Write your goal on paper before deep work starts. "In these 90 min I will finish ___."',
  4: 'Don\'t open email before 11am. Despite what feels urgent, email always waits.',
  5: 'Schedule phone-check windows on your calendar: 12:00 and 17:00. Airplane mode otherwise.',
};

const NEW_TR = {
  6: { title: 'Tek Görev Disiplini', teaching: 'Multitasking efsanesi: yüksek IQ\'lu insanlar daha iyi çoklu görev yapar. Yanlış. Multitasker\'ların IQ\'su 10 puan düşer (Stanford). Tek seferde tek iş = derin işlem. Aynı 1 saatte 2x verim, 5x kalite.', action: 'Bugün önemli işini tek seferde yap. Sekme kapat, telefon kapat, müzik kapat.', reflectionPrompt: 'Çoklu görevden tek göreve geçtiğinde verimliliğindeki fark neydi?', proTip: 'Çoklu sekme açma alışkanlığı varsa Cmd+W (Mac) ya da Ctrl+W (Windows) ile sırasıyla kapat.' },
  7: { title: 'Bildirim Detoksu', teaching: 'Telefon günde ortalama 80 bildirim verir. Her biri 23 dakika odak kaybı. Toplam = günde 2 saat odak yok. Çözüm: hepsini kapat. Acil olanlar zaten arar. Geri kalan zaten gereksizdi.', action: 'Bugün tüm bildirimleri kapat (Apple/Google haritalar dahil). Sadece doğrudan telefon araması/SMS açık.', reflectionPrompt: 'Bildirimsiz ilk gün nasıl hissettin? Eksik mi tam mı?', proTip: 'Önce sosyal medya, sonra alışveriş, sonra uygulama bildirimleri. 3 dakika ayır.' },
  8: { title: 'Pomodoro Tekniği', teaching: '25 dakika odak + 5 dakika mola = 1 pomodoro. 4 pomodoro sonra 30 dk uzun mola. Beyin sürekli odak yapamaz; ritim olunca yapar. Bu basit teknik 1992\'den beri test edildi.', action: 'Bugün 1 pomodoro ile çalış: 25 dk odak, 5 dk mola. Sayacı görünür yere koy.', reflectionPrompt: '25 dakika sonunda yapmak istediklerinin ne kadarını bitirdin?', proTip: 'Mola süresinde telefon yok. Pencereye bak, su iç, esne. Mola = beyin reset.' },
  9: { title: 'Time Blocking', teaching: 'Yapılacaklar listesi naive. Her madde "en az 15 dakika" — 10 madde = 2.5 saat. Time blocking gerçekçi: takvime saat veriyorsun. 10:00-11:30 derin iş. 11:30-12:00 e-posta. Saatler kararlar verir, sen değil.', action: 'Bugün için takvime 3 zaman bloku koy. Her bloğa 1 görev.', reflectionPrompt: 'Time blocking olmadan günün nasıl geçerdi?', proTip: 'İlk hafta beklenenden 2x süre koy. Doğru tahmin yapmak öğrenilen bir beceridir.' },
  10: { title: 'Enerji Yönetimi', teaching: 'Zaman değil, enerji yönetimi. 24 saat herkeste eşit. Ama yüksek enerjili 4 saat > düşük enerjili 12 saat. Sabah 9-12: derin iş. Öğle: shallow. Akşam: rutin. Enerji eğrini bil, ona göre çalış.', action: 'Bugün enerji eğrini gözle. Sabah-öğle-akşam 1-10 arası puan ver.', reflectionPrompt: 'En yüksek enerji saatin hangisiydi? Hangi işi yapıyordun?', proTip: 'Enerji eğrini 1 hafta gözle. Pattern net olur, çalışma planını ona göre yap.' },
  11: { title: 'Karar Yorgunluğu', teaching: 'Beyin günde ~35.000 karar verir. Her karar willpower yer. Steve Jobs hep aynı kıyafet, Obama hep aynı renk takım — karar yorgunluğunu azaltmak için. Sen de gereksiz kararları otomatikleştir.', action: 'Bugün 3 kararı otomatikleştir. Yarın ne giyeceksin? Kahvaltıda ne? Akşam ne yapacaksın?', reflectionPrompt: 'Otomatikleşince zihninde ne kadar yer açıldı?', proTip: 'Pazar günü hafta için karar ver. Pazartesi - cuma kararsız değilsin.' },
  12: { title: 'Inbox Sıfır', teaching: 'E-posta gelen kutusu = başkasının önceliğinin senin önceliğine üstün gelmesi. Inbox 0 disiplini: gün sonu her e-postayı işle (yanıtla, arşivle, sil, planla). Birikim yok.', action: 'Bugün inbox\'ını sıfırla. Eski 100 e-postayı zorlama, son 24 saatlik yeter.', reflectionPrompt: 'Inbox 0 hissi nasıldı? Daha berrak mı?', proTip: 'Inbox\'ı günde 2x kontrol et: 11:00 ve 17:00. Asla 09:00\'dan önce.' },
  13: { title: 'Toplantı Hijyeni', teaching: 'Çoğu toplantı = e-posta olabilirdi. Toplantı kuralı: 1) Net agenda var mı? 2) Sen olmadan olmaz mı? 3) 30 dk\'yı geçer mi? 3\'üne hayırsa: gitme. Saat = pahalı para birimi.', action: 'Bugün takvimindeki bir toplantıyı sorgula. Net agendası yoksa iptal et.', reflectionPrompt: 'En son hangi toplantı tam zaman kaybıydı? Niye katıldın?', proTip: 'Standing meeting yapılırsa 50% daha kısa sürer. Çoğu toplantıda ayakta dur.' },
  14: { title: 'Deep Work 90 Dakika', teaching: 'Cal Newport: derin iş = ekonominin en değerli becerisi. 90 dakika kesintisiz odak = 8 saat çoklu görev. İlk 1 hafta zorlanırsın, beyin alışmamış. 30 gün sonra hayatın kontrol mekanizması olur.', action: 'Bugün 1 deep work bloğu yap: 90 dakika, telefon başka odada, sekme kapalı.', reflectionPrompt: '90 dakika sonu enerjini ne durumda hissettin?', proTip: 'Deep work öncesi su iç, tuvalet git, yiyecek hazırla. Hiç ayağa kalkma.' },
  15: { title: 'Yakalama Sistemi', teaching: 'Aklına gelen her fikri yazılı yakala. David Allen "GTD" tekniği: yakalanmamış fikir zihinde dolaşır, dikkatini çalar. Notes app, defter, kâğıt — fark etmez. Yakala = serbest bırak.', action: 'Bugün her fikri/görevi yakaladığın 1 yer belirle. 24 saat aktif tut.', reflectionPrompt: '24 saatte kaç fikir yakaladın? Beklediğinden çok mu az mı?', proTip: 'Akşam yakaladığın listeyi 5 dk gözden geçir. Acil olanları ertesi güne planla.' },
  16: { title: 'Haftalık Review', teaching: 'Günlük taktiktir. Haftalık stratejidir. Cuma akşamı veya pazar sabahı 30 dk: 1) Bu hafta neyi başardım? 2) Neyi öğrendim? 3) Önümüzdeki hafta 3 öncelik? Yapan ile yapmayan arasındaki en büyük fark.', action: 'Bu hafta sonu 30 dk haftalık review yap. Yazılı, somut.', reflectionPrompt: 'Bu haftanın en büyük öğrenmesi neydi?', proTip: 'Review için sabit gün/saat seç. Cuma 17:00 ya da pazar 09:00. Esnek olma.' },
  17: { title: '"Hayır" Disiplini', teaching: 'Warren Buffett: başarılı insanlar her şeye "hayır" der. Çünkü zaman = önceliğine harcanır. Her "evet" = başka bir şeye "hayır." Disiplin = neye "evet," neye "hayır" net olmak.', action: 'Bugün 1 isteğe "hayır" de. Suçluluk hissi normal — geçer.', reflectionPrompt: '"Hayır" demek niye zor geldi? Hangi korku vardı?', proTip: '"Hayır" yumuşak versiyonu: "Bunu kabul etmem benim için doğru değil." Açıklama gerekmez.' },
  18: { title: 'Sıkıntı Kaynak Olarak', teaching: 'Sıkıntı = beyin "boş alan istiyorum" sinyali. Çoğu insan sıkıntıda telefona sarılır — beyin bağırırken susturuyor. Sıkıntıya izin ver. 5 dakika sıkılırsan yaratıcılık geri gelir.', action: 'Bugün 10 dakika sıkıntıya izin ver. Telefonsuz, müziksiz, hiç bir şey.', reflectionPrompt: 'Sıkıntıdan sonra zihninde hangi düşünce belirdi?', proTip: 'Sıkılınca telefon refleksin gelirse, ellerini cebe at. Refleksi engelle.' },
  19: { title: 'Varsayılan Uygulama Disiplini', teaching: 'Ana ekranındaki ikonlar = günlük tetikleyiciler. Çıkardığın her sosyal medya = saatlerce odak. Bıraktığın her üretici uygulama = günlük teşvik. Ana ekran = kişisel saymaca makine.', action: 'Bugün ana ekrandaki 3 sosyal medyayı 2. sayfaya at ya da kaldır. 3 üretici uygulama koy.', reflectionPrompt: 'Yeni ana ekranda hangi yeni davranış oluştu?', proTip: 'Ana ekran sadece 6 ikon olsun. Geri kalanı App Library / Drawer.' },
  20: { title: 'Bilgi Diyeti', teaching: 'Çok fazla bilgi = analiz felçi. Tüketmen gereken: senin sorunlarını çözen. Tüketmemen gereken: trend, dedikodu, "ilginç" ama kullanılmaz. 1 alan derinlemesine > 10 alan yüzeyinde.', action: 'Bugün kendine sor: hangi 3 kaynaktan bilgi tüketiyorum? Bunlar bana hizmet ediyor mu?', reflectionPrompt: 'Hangi kaynak çıkarılmalı? Hangisi eklenmeli?', proTip: '"Bana hizmet ediyor mu?" filtresi. Hayır olan her şey = noise.' },
  21: { title: 'Okuma Stratejisi', teaching: 'Okumak = düşük çaba, yüksek getiri. Ama nasıl okuduğun önemli. Pasif okuma = bilgi unutulur. Aktif okuma: not al, sorgula, uygula. 1 sayfa aktif > 20 sayfa pasif.', action: 'Bugün 5 sayfa kitap oku. Kenara not al. Bir cümleyle özetle.', reflectionPrompt: 'Aktif okuma pasif okumadan ne kadar farklı hissettirdi?', proTip: 'Bittikten sonra: yüksek sesle 30 saniyede özetle. Anlamadığın yer = geri dön.' },
  22: { title: 'Not Sistemi', teaching: 'Beyin = işleyici, depo değil. Her düşünceyi taşıyacak diye yorulur. Bir not sistemi (Apple Notes, Notion, defter) = beyin için uzantı. Yazıyorsan unutamazsın.', action: 'Bugün tek bir not sistemi seç ve onu kullan. Karışıklık çıkar = sistem etkisiz.', reflectionPrompt: 'Notlarını yazılı tutmak hangi mental yükü kaldırdı?', proTip: 'Apple Notes basit + senkron. Karmaşık sistem (Notion, Obsidian) sonra eklersin.' },
  23: { title: 'Derin vs Yüzeysel', teaching: 'Yüzeysel iş: e-posta, toplantı, mesaj, raporlama. Derin iş: yaratıcılık, analiz, strateji, öğrenme. Yüzeysel kolay olduğu için cazip — ama değer üretmez. Derin işi savun.', action: 'Bugün günün ilk 90 dakikasını derin işe ayır. Yüzeysel sonra.', reflectionPrompt: 'Derin işle başlayınca günün geri kalanı nasıl şekillendi?', proTip: 'Sabah ilk şey = en derin iş. Beyin 11\'den sonra yüzeyselleşir.' },
  24: { title: 'Yürü + Düşün', teaching: 'Steve Jobs en zor problemlerini yürüyerek çözerdi. Darwin günde 3 kez aynı yolu yürürdü. Stanford çalışması: yürürken yaratıcılık %60 artar. Stuck hissedersen: oturmayı bırak, yürü.', action: 'Bugün bir problem üzerinde 15 dakika yürüyerek düşün. Notlar al.', reflectionPrompt: 'Oturarak çözemediğin neyi yürüyerek çözdün?', proTip: 'Telefonsuz yürü. Müzik bile düşünce alanını daraltır.' },
  25: { title: 'Beyin Boşalt', teaching: 'Aklında dolaşan 47 düşünce = işleyemediğin yük. Brain dump tekniği: 10 dakika boyunca aklına geleni yaz. Hepsini. Sonra düzenle: yapılabilirler / silinmesi gereken / sonra düşünülecek.', action: 'Bugün 10 dakika brain dump yap. Sansürsüz, düzeltmesiz.', reflectionPrompt: 'Yazdıklarının yüzde kaçı gerçekten önemli çıktı?', proTip: 'Sabah brain dump = günü temiz başlat. Akşam brain dump = uyku kalitesi artar.' },
  26: { title: 'Telefonsuz Bölgeler', teaching: 'Yatak odası = sadece uyku ve seks (Matthew Walker). Yemek masası = sadece yemek ve sohbet. Tuvalet = sadece tuvalet. Telefonsuz bölgeler net olunca, telefon zamanın kalır azalır.', action: 'Bugün 1 telefonsuz bölge ilan et. Yatak odası en güçlü başlangıç.', reflectionPrompt: 'O bölgede telefonsuz olmak nasıl hissettirdi?', proTip: 'Telefonu evin girişine koy. Eve girince bırak, çıkarken al.' },
  27: { title: 'Öncelik Hunisi', teaching: '100 fırsat = paralizi. 3 öncelik = ilerleme. Eisenhower Matrix: 1) Acil + Önemli (yap), 2) Önemli + Acil değil (planla), 3) Acil + Önemli değil (delege), 4) Hiçbiri (sil). 3-4 = saatler kaçırıldı.', action: 'Bugünkü görev listenin matrisini yap. 4. kategoriden 3 görev sil.', reflectionPrompt: 'Hangi 4. kategori görevleri sildin? Niye orada başlamıştı?', proTip: 'Haftalık olarak yap. Sürekli kayan öncelikler = stratejik kaymama.' },
  28: { title: 'Tek Yıllık Hedef', teaching: '10 hedef = 0 hedef. 1 hedef = focus. Bir yıl = ortalama 1 büyük şey başarılır. Önümüzdeki 1 yılda en büyük 1 hedefin ne? "Spor yapayım" değil — "ağırlık antrenmanına başla, 1 yılda 50 kg bench press yap."', action: 'Bugün 1 yıllık 1 hedefini yaz. Ölçülebilir, somut, zamanlı.', reflectionPrompt: 'Bu hedefin altındaki gerçek "neden" ne?', proTip: 'Hedefi sürekli görünür yere koy: telefon kilit ekranı, çalışma masası.' },
  29: { title: 'Final Disiplin', teaching: '29 gün boyunca zihinsel disiplin pratik ettin. Yarın "tamamladın." Ama disiplin = yarınla bitmiyor. Final test: 30 günden sonra hangi 1 disiplini her gün yapacaksın? Hayatının dokusu olacak şey.', action: 'Bugün son 30 günde işe yarayan en güçlü 1 disiplini seç. Bunu 100 gün daha yap.', reflectionPrompt: 'Hangi disiplini seçtin? Niye o?', proTip: 'O disiplini akşam mevcut bir alışkanlığa stack et. Yığma = otomatikleşme.' },
  30: { title: 'Tamamlandı — Yeni Zihin', teaching: 'Bugün 30 gün önceki sen değilsin. Odaklanmayı, derin işi, "hayır" demeyi öğrendin. Multitask\'tan single-task\'a, reaktiflikten proaktifliğe geçtin. Bu 30 gün senin yeni baselin.', action: 'Bugün 30 günün özetini yaz: 3 öğrendiğim, 3 sürdüreceğim, 3 unutmayacağım.', reflectionPrompt: 'Yeni zihninle hangi büyük şeyi başaracağına inanıyorsun?', proTip: 'Bir sonraki yola 3 gün dinlendikten sonra başla. Tutarlılık = uzun vade. Acele = gerileme.' },
};

const NEW_EN = {
  6: { title: 'Single-Task Discipline', teaching: 'Multitasking myth: high-IQ people multitask better. Wrong. Multitaskers lose 10 IQ points (Stanford). One thing at a time = deep processing. Same hour, 2x output, 5x quality.', action: 'Today do important work in one go. Close tabs, phone, music.', reflectionPrompt: 'Productivity difference shifting from multi to single?', proTip: 'If multi-tab is a habit, close them with Cmd+W (Mac) or Ctrl+W (Windows) one by one.' },
  7: { title: 'Notification Detox', teaching: 'Phone delivers ~80 notifications/day. Each = 23 min focus loss. Total = 2 hours of no focus. Solution: turn them all off. Real emergencies will call. Rest was useless anyway.', action: 'Today turn off all notifications (Apple/Google maps included). Only direct call/SMS allowed.', reflectionPrompt: 'How did the first notification-free day feel? Missing or full?', proTip: 'Social media first, shopping next, app last. 3 minutes total.' },
  8: { title: 'Pomodoro Technique', teaching: '25 min focus + 5 min break = 1 pomodoro. After 4 pomodoros, 30-min long break. Brain can\'t sustain focus continuously; with rhythm, it can. Tested since 1992.', action: 'Today work 1 pomodoro: 25 min focus, 5 min break. Visible timer.', reflectionPrompt: 'Of what you wanted in 25 min, how much got done?', proTip: 'No phone in break. Look out window, drink water, stretch. Break = brain reset.' },
  9: { title: 'Time Blocking', teaching: 'To-do lists are naive. Each item "at least 15 min" — 10 items = 2.5h. Time blocking is realistic: assign hours on calendar. 10:00-11:30 deep work. 11:30-12:00 email. Hours decide, not you.', action: 'Today block 3 time slots on your calendar. One task per block.', reflectionPrompt: 'Without time blocking, how would today have gone?', proTip: 'First week, double the estimated time. Accurate estimating is a learned skill.' },
  10: { title: 'Energy Management', teaching: 'Not time but energy management. Everyone gets 24h. But high-energy 4h > low-energy 12h. Morning 9-12: deep work. Noon: shallow. Evening: routine. Know your curve, work to it.', action: 'Today track your energy curve. Score morning-noon-evening 1-10.', reflectionPrompt: 'Which hour was peak? What were you doing?', proTip: 'Track for 1 week. Pattern is clear, plan accordingly.' },
  11: { title: 'Decision Fatigue', teaching: 'Brain makes ~35,000 decisions/day. Each consumes willpower. Steve Jobs same outfit, Obama same suit color — to reduce decision fatigue. Automate trivial decisions.', action: 'Today automate 3 decisions. Tomorrow\'s outfit? Breakfast? Evening?', reflectionPrompt: 'How much mental space opened from automating?', proTip: 'Decide for the week on Sunday. Mon-Fri you don\'t hesitate.' },
  12: { title: 'Inbox Zero', teaching: 'Email inbox = someone else\'s priority overriding yours. Inbox 0 discipline: process every email by day\'s end (reply, archive, delete, schedule). No backlog.', action: 'Today zero your inbox. Don\'t force old 100 emails — last 24h is enough.', reflectionPrompt: 'How did inbox 0 feel? Clearer?', proTip: 'Check inbox 2x/day: 11:00 and 17:00. Never before 09:00.' },
  13: { title: 'Meeting Hygiene', teaching: 'Most meetings could have been emails. Rule: 1) Clear agenda? 2) Needed without you? 3) Over 30 min? 3 nos: skip. Hours = expensive currency.', action: 'Today question one meeting on your calendar. No agenda = cancel.', reflectionPrompt: 'Most recent meeting that wasted time? Why did you join?', proTip: 'Standing meetings run 50% shorter. Stand up.' },
  14: { title: 'Deep Work 90 Min', teaching: 'Cal Newport: deep work = the most valuable skill in the economy. 90 uninterrupted min = 8h multitasking. Hard the first week, brain unaccustomed. After 30 days = life\'s control mechanism.', action: 'Today do 1 deep work block: 90 min, phone in another room, tabs closed.', reflectionPrompt: 'How did your energy feel after 90 min?', proTip: 'Before deep work: drink water, restroom, prep snack. Don\'t stand once.' },
  15: { title: 'Capture System', teaching: 'Capture every idea in writing. David Allen "GTD": uncaptured idea loops in mind, steals attention. Notes app, journal, paper — doesn\'t matter. Capture = release.', action: 'Today pick 1 capture spot. Use it for 24 hours.', reflectionPrompt: 'How many ideas did you capture in 24h? More or less than expected?', proTip: 'Review your captured list 5 min each evening. Schedule urgent ones tomorrow.' },
  16: { title: 'Weekly Review', teaching: 'Daily is tactic. Weekly is strategy. Friday evening or Sunday morning, 30 min: 1) What did I accomplish this week? 2) What did I learn? 3) Top 3 priorities next week? Biggest difference between doers and not.', action: 'This weekend do a 30-min weekly review. Written, concrete.', reflectionPrompt: 'Biggest learning of this week?', proTip: 'Pick a fixed time. Friday 17:00 or Sunday 09:00. Don\'t flex.' },
  17: { title: 'The "No" Discipline', teaching: 'Warren Buffett: successful people say "no" to everything. Because time = priority spend. Each "yes" = "no" to something else. Discipline = clarity on what gets yes/no.', action: 'Today say "no" to 1 request. Guilt is normal — passes.', reflectionPrompt: 'Why was "no" hard? What fear was there?', proTip: 'Soft "no": "Accepting this isn\'t right for me." No explanation needed.' },
  18: { title: 'Boredom as Resource', teaching: 'Boredom = brain signaling "I want empty space." Most people grab phones — silencing the signal. Allow boredom. 5 min in, creativity returns.', action: 'Today allow 10 min of boredom. No phone, music, anything.', reflectionPrompt: 'What thought arose after the boredom?', proTip: 'If phone reflex hits, pocket your hands. Block the reflex.' },
  19: { title: 'Default App Discipline', teaching: 'Home screen icons = daily triggers. Each social media you remove = hours of focus regained. Each productive app you add = daily nudge. Home screen = personal slot machine.', action: 'Today move 3 social media icons to page 2 or remove. Add 3 productive apps.', reflectionPrompt: 'What new behavior emerged from the new home screen?', proTip: 'Keep 6 icons only. Rest in App Library / Drawer.' },
  20: { title: 'Information Diet', teaching: 'Too much info = analysis paralysis. Consume: what solves your problems. Skip: trends, gossip, "interesting" but useless. 1 area deep > 10 areas shallow.', action: 'Today ask: which 3 sources do I consume from? Do they serve me?', reflectionPrompt: 'Which source to remove? Which to add?', proTip: '"Does it serve me?" filter. Anything no = noise.' },
  21: { title: 'Reading Strategy', teaching: 'Reading = low effort, high return. But how matters. Passive reading = forgotten. Active reading: take notes, question, apply. 1 page active > 20 passive.', action: 'Today read 5 pages of a book. Margin notes. Summarize in one sentence.', reflectionPrompt: 'How different did active feel from passive?', proTip: 'Right after: out loud 30-sec summary. Where you don\'t understand = re-read.' },
  22: { title: 'Note System', teaching: 'Brain = processor, not warehouse. It tires carrying every thought. A note system (Apple Notes, Notion, journal) = brain extension. Written = unforgettable.', action: 'Today pick 1 note system, use it. Confusion = ineffective system.', reflectionPrompt: 'What mental load lifted writing things down?', proTip: 'Apple Notes = simple + sync. Add complex (Notion, Obsidian) later.' },
  23: { title: 'Deep vs Shallow', teaching: 'Shallow work: email, meeting, message, reporting. Deep work: creativity, analysis, strategy, learning. Shallow is easy and seductive — but produces no value. Defend deep work.', action: 'Today reserve first 90 min for deep work. Shallow after.', reflectionPrompt: 'Starting with deep work, how did the rest of the day shape?', proTip: 'Morning = deepest work. Brain shallows after 11am.' },
  24: { title: 'Walk + Think', teaching: 'Steve Jobs solved hard problems walking. Darwin walked the same path 3x daily. Stanford study: creativity rises 60% walking. When stuck: stop sitting, walk.', action: 'Today think on a problem 15 min while walking. Take notes.', reflectionPrompt: 'What problem did walking solve that sitting couldn\'t?', proTip: 'Walk without phone. Even music narrows thinking space.' },
  25: { title: 'Brain Dump', teaching: '47 thoughts in your head = unprocessed load. Brain dump: write what comes for 10 min. All. Then sort: doable / delete / later.', action: 'Today brain dump for 10 min. No censoring, no editing.', reflectionPrompt: 'What % of what you wrote was actually important?', proTip: 'Morning brain dump = clean start. Evening brain dump = better sleep.' },
  26: { title: 'Phone-Free Zones', teaching: 'Bedroom = sleep + sex (Matthew Walker). Dining table = food + conversation. Restroom = restroom. Clear no-phone zones shrink phone time naturally.', action: 'Today declare 1 phone-free zone. Bedroom is the strongest start.', reflectionPrompt: 'How did phone-free time in that zone feel?', proTip: 'Drop phone at the door. Pick it up only when leaving.' },
  27: { title: 'Priority Funnel', teaching: '100 opportunities = paralysis. 3 priorities = progress. Eisenhower Matrix: 1) Urgent + Important (do), 2) Important not urgent (plan), 3) Urgent not important (delegate), 4) Neither (delete). 3-4 = lost hours.', action: 'Today matrix your task list. Delete 3 items from category 4.', reflectionPrompt: 'Which category-4 tasks did you delete? Why started?', proTip: 'Do weekly. Constantly shifting priorities = strategic drift.' },
  28: { title: 'One-Year Goal', teaching: '10 goals = 0 goals. 1 goal = focus. A year = average 1 big thing accomplished. What\'s your biggest 1-year goal? Not "exercise" — "begin strength training, bench-press 50kg in 1 year."', action: 'Today write your 1-year, 1-goal. Measurable, concrete, timed.', reflectionPrompt: 'What\'s the real "why" beneath this goal?', proTip: 'Keep it visible: phone lock screen, desk.' },
  29: { title: 'Final Discipline', teaching: 'You practiced mental discipline 29 days. Tomorrow you "complete." But discipline doesn\'t end with tomorrow. Final test: post-30-day, which 1 discipline daily? The fabric of your life.', action: 'Today pick the strongest 1 discipline of past 30 days. Do it 100 more days.', reflectionPrompt: 'Which one did you pick? Why that?', proTip: 'Stack it tonight on an existing habit. Stack = automation.' },
  30: { title: 'Complete — New Mind', teaching: 'You\'re not the same as 30 days ago. You learned focus, deep work, saying "no." From multi-task to single-task, from reactive to proactive. These 30 days = your new baseline.', action: 'Today summarize 30 days: 3 learned, 3 to keep, 3 not to forget.', reflectionPrompt: 'With this new mind, what big thing will you accomplish?', proTip: 'Rest 3 days before next path. Consistency = long term. Rush = regress.' },
};

const QUIZ_TR = {
  6: [
    { q: 'Multitasker IQ ne kadar düşer?', options: ['Hiç', '5', '10 puan', '20 puan'], correct: 2, explain: 'Stanford araştırması — 10 puan IQ kaybı.' },
    { q: 'Single-task verim artışı?', options: ['Aynı', '20%', '2x', '10x'], correct: 2, explain: '2x verim, 5x kalite.' },
  ],
  7: [
    { q: 'Bir bildirim odak kaybı?', options: ['1 dk', '5 dk', '10 dk', '23 dk'], correct: 3, explain: '23 dakika tam odağa dönüş.' },
    { q: 'Günde ortalama bildirim?', options: ['10', '40', '80', '200'], correct: 2, explain: 'Yaklaşık 80 bildirim/gün.' },
  ],
  8: [
    { q: '1 pomodoro nedir?', options: ['10/2 dk', '15/3 dk', '25/5 dk', '60/15 dk'], correct: 2, explain: '25 odak + 5 mola.' },
    { q: '4 pomodoro sonra mola?', options: ['Yok', '10 dk', '30 dk', '60 dk'], correct: 2, explain: '30 dk uzun mola.' },
  ],
  9: [
    { q: 'Time blocking nedir?', options: ['Liste yapmak', 'Saat blokları', 'Görev silmek', 'Hatırlatıcı'], correct: 1, explain: 'Takvime saat veriyorsun, görev değil.' },
    { q: 'İlk hafta tahmin kuralı?', options: ['Yarısı', 'Tam', '2x süre', '10x'], correct: 2, explain: 'Beklenenin 2x süresi gerçekçi.' },
  ],
  10: [
    { q: 'Zaman vs enerji?', options: ['Zaman', 'Enerji', 'Eşit', 'Hiçbiri'], correct: 1, explain: 'Yüksek enerjili 4h > düşük enerjili 12h.' },
    { q: 'Sabah enerji önerisi?', options: ['Shallow', 'Derin iş', 'Toplantı', 'Gevşeme'], correct: 1, explain: 'Sabah = derin iş zirvesi.' },
  ],
  11: [
    { q: 'Günde karar sayısı?', options: ['100', '1000', '10K', '35K'], correct: 3, explain: '~35.000 karar/gün.' },
    { q: 'Steve Jobs neden hep aynı kıyafet?', options: ['Tarz', 'Ucuz', 'Karar yorgunluğu', 'Aşk'], correct: 2, explain: 'Karar yorgunluğunu azaltmak için.' },
  ],
  12: [
    { q: 'Inbox 0 amacı?', options: ['Mükemmellik', 'Birikim yok', 'Hızlı yanıt', 'Görünüm'], correct: 1, explain: 'Birikim yok = stres yok.' },
    { q: 'E-posta günde kaç kez?', options: ['Sürekli', 'Saatlik', '2x', 'Haftada 1'], correct: 2, explain: '11:00 ve 17:00 = 2x ideal.' },
  ],
  13: [
    { q: 'Toplantı kuralı?', options: ['Hep katıl', 'Net agenda + 30dk', 'Standing only', 'Kahvaltı'], correct: 1, explain: 'Net agenda + max 30 dk.' },
    { q: 'Standing meeting süresi?', options: ['Aynı', '50% kısa', '%200 uzun', 'Yok'], correct: 1, explain: 'Ayakta = 50% kısa.' },
  ],
  14: [
    { q: 'Deep work bloğu süresi?', options: ['25 dk', '60 dk', '90 dk', '8 saat'], correct: 2, explain: '90 dk = optimum derin iş.' },
    { q: 'Cal Newport tezi?', options: ['Hız', 'Deep work = deep value', 'Hız', 'Multitask'], correct: 1, explain: 'Derin iş derin değer üretir.' },
  ],
  15: [
    { q: 'GTD tekniği kim?', options: ['James Clear', 'David Allen', 'Cal Newport', 'Tim Ferriss'], correct: 1, explain: 'David Allen — Getting Things Done.' },
    { q: 'Yakalanmamış fikir ne yapar?', options: ['Hiç', 'Dikkat çalar', 'Unutulur', 'Etki yok'], correct: 1, explain: 'Zihinde dolaşır, dikkat çalar.' },
  ],
  16: [
    { q: 'Haftalık review süresi?', options: ['5 dk', '30 dk', '2 saat', '1 gün'], correct: 1, explain: '30 dk yeterli.' },
    { q: 'Review en iyi zamanı?', options: ['Pazartesi 09', 'Cuma 17 / pazar 09', 'Cumartesi 12', 'Pazartesi 18'], correct: 1, explain: 'Cuma 17 ya da pazar 09.' },
  ],
  17: [
    { q: '"Hayır" demek = ?', options: ['Kabalık', 'Önceliğine "evet"', 'Kayıp', 'Hata'], correct: 1, explain: 'Her hayır = kendi önceliğine evet.' },
    { q: 'Yumuşak "hayır"?', options: ['Hayır', '"Doğru değil benim için"', 'Sessizlik', 'Telefon kapat'], correct: 1, explain: 'Açıklama gerekmez.' },
  ],
  18: [
    { q: 'Sıkıntı nedir?', options: ['Hastalık', 'Boş alan sinyali', 'Açlık', 'Yorgunluk'], correct: 1, explain: 'Beyin boş alan istiyor.' },
    { q: 'Sıkıntıya izin verme süresi?', options: ['1 dk', '10 dk', '1 saat', '1 gün'], correct: 1, explain: '10 dk yeterli.' },
  ],
  19: [
    { q: 'Ana ekran ikonları = ?', options: ['Süs', 'Tetikleyici', 'Fonksiyon', 'Hatırlatıcı'], correct: 1, explain: 'Tetikleyici = günlük kontrol.' },
    { q: 'Optimum ana ekran ikon sayısı?', options: ['1', '6', '20', '50'], correct: 1, explain: '6 ikon yeter, geri kalan App Library.' },
  ],
  20: [
    { q: 'Bilgi diyeti filtresi?', options: ['Trend', '"Bana hizmet ediyor mu?"', 'Popülerlik', 'Yenilik'], correct: 1, explain: 'Hayır = noise.' },
    { q: 'Optimum derinlik vs genişlik?', options: ['10 alan yüzeyi', '1 alan derin', 'Eşit', 'Random'], correct: 1, explain: '1 alan derinlemesine.' },
  ],
  21: [
    { q: 'Aktif vs pasif okuma?', options: ['Aynı', '5x fark', '20x fark', 'Bilinmiyor'], correct: 2, explain: '1 sayfa aktif > 20 pasif.' },
    { q: 'Aktif okuma araçları?', options: ['Sessizlik', 'Not + sorgulama', 'Müzik', 'Hız'], correct: 1, explain: 'Not al, sorgula, uygula.' },
  ],
  22: [
    { q: 'Beyin = ?', options: ['Depo', 'İşleyici', 'Kasalı', 'Motor'], correct: 1, explain: 'İşleyici, depo değil.' },
    { q: 'Not sistemi başlangıç?', options: ['Notion', 'Apple Notes', 'Obsidian', 'Defter'], correct: 1, explain: 'Basit + senkron öncelikli.' },
  ],
  23: [
    { q: 'Derin iş örneği?', options: ['E-posta', 'Yaratıcılık', 'Toplantı', 'Mesaj'], correct: 1, explain: 'Yaratıcılık, analiz, strateji.' },
    { q: 'Sabah ilk hangisi?', options: ['Email', 'Derin iş', 'Toplantı', 'Sosyal medya'], correct: 1, explain: 'Beyin sabah deeptir.' },
  ],
  24: [
    { q: 'Yürüyüş yaratıcılık etkisi?', options: ['Yok', '%30 artış', '%60 artış', '%200 artış'], correct: 2, explain: 'Stanford — %60 artış.' },
    { q: 'Stuck olunca ne yap?', options: ['Otur', 'Yürü', 'Uyu', 'Yemek'], correct: 1, explain: 'Yürüyüş = yaratıcılık reset.' },
  ],
  25: [
    { q: 'Brain dump nedir?', options: ['Liste', 'Yargılamadan yaz', 'Sansür', 'Plan'], correct: 1, explain: 'Aklına geleni yaz, sansürsüz.' },
    { q: 'Brain dump süresi?', options: ['1 dk', '10 dk', '1 saat', '1 gün'], correct: 1, explain: '10 dakika optimum.' },
  ],
  26: [
    { q: 'Yatak odası kuralı?', options: ['Çalış', 'Sadece uyku', 'Telefon', 'Yemek'], correct: 1, explain: 'Sadece uyku ve seks (Matthew Walker).' },
    { q: 'Telefon nereye?', options: ['Yatak', 'Eve giriş', 'Mutfak', 'Banyo'], correct: 1, explain: 'Eve giriş = sınır.' },
  ],
  27: [
    { q: 'Eisenhower Matrix kategorileri?', options: ['1', '2', '4', '10'], correct: 2, explain: '4 kategori: acil/önemli kombinasyonları.' },
    { q: 'Kategori 4 ne demek?', options: ['Yap', 'Planla', 'Delege', 'Sil'], correct: 3, explain: 'Acil değil + önemli değil = sil.' },
  ],
  28: [
    { q: 'Optimum yıllık hedef sayısı?', options: ['1', '5', '10', '20'], correct: 0, explain: '1 hedef = focus.' },
    { q: '"Spor yapayım" hedefi nasıl?', options: ['Mükemmel', 'Çok belirsiz', 'Olur', 'İyi'], correct: 1, explain: 'Belirsiz = ölçülemez = başarısız.' },
  ],
  29: [
    { q: 'Final disiplin testi?', options: ['Hız', '30 sonra hangi 1?', 'Yorgunluk', 'Memnuniyet'], correct: 1, explain: 'Hangi 1 disiplin sürdürülecek?' },
    { q: 'Disiplin nasıl otomatik?', options: ['Tek başına', 'Stack ile', 'Yorgunlukla', 'Asla'], correct: 1, explain: 'Mevcut alışkanlığa stack et.' },
  ],
  30: [
    { q: 'Geçişten sonra dinlenme?', options: ['Yok', '3 gün', '1 hafta', '1 ay'], correct: 1, explain: '3 gün dinlen, devam et.' },
    { q: '30 günün özeti?', options: ['Yok', '3+3+3', 'Random', 'Liste'], correct: 1, explain: '3 öğrendiğim, 3 sürdüreceğim, 3 unutmayacağım.' },
  ],
};

const QUIZ_EN = {
  6: [
    { q: 'Multitasker IQ drop?', options: ['None', '5', '10 pts', '20 pts'], correct: 2, explain: 'Stanford — 10 IQ point loss.' },
    { q: 'Single-task productivity gain?', options: ['Same', '20%', '2x', '10x'], correct: 2, explain: '2x productivity, 5x quality.' },
  ],
  7: [
    { q: 'Refocus time per notification?', options: ['1 min', '5 min', '10 min', '23 min'], correct: 3, explain: '23 min full refocus.' },
    { q: 'Average daily notifications?', options: ['10', '40', '80', '200'], correct: 2, explain: '~80 notifications/day.' },
  ],
  8: [
    { q: '1 pomodoro?', options: ['10/2 min', '15/3 min', '25/5 min', '60/15 min'], correct: 2, explain: '25 focus + 5 break.' },
    { q: 'After 4 pomodoros break?', options: ['None', '10 min', '30 min', '60 min'], correct: 2, explain: '30 min long break.' },
  ],
  9: [
    { q: 'Time blocking is?', options: ['Listing', 'Hour blocks', 'Deleting tasks', 'Reminder'], correct: 1, explain: 'Hours on calendar, not tasks.' },
    { q: 'First-week estimate rule?', options: ['Half', 'Exact', '2x time', '10x'], correct: 2, explain: '2x estimated time is realistic.' },
  ],
  10: [
    { q: 'Time vs energy?', options: ['Time', 'Energy', 'Equal', 'Neither'], correct: 1, explain: 'High-energy 4h > low-energy 12h.' },
    { q: 'Morning energy suggestion?', options: ['Shallow', 'Deep work', 'Meeting', 'Relax'], correct: 1, explain: 'Morning = deep work peak.' },
  ],
  11: [
    { q: 'Decisions per day?', options: ['100', '1000', '10K', '35K'], correct: 3, explain: '~35,000 decisions/day.' },
    { q: 'Why same outfit Steve Jobs?', options: ['Style', 'Cheap', 'Decision fatigue', 'Love'], correct: 2, explain: 'Reduce decision fatigue.' },
  ],
  12: [
    { q: 'Inbox 0 goal?', options: ['Perfection', 'No backlog', 'Fast reply', 'Looks'], correct: 1, explain: 'No backlog = no stress.' },
    { q: 'Email checks/day?', options: ['Constant', 'Hourly', '2x', 'Weekly'], correct: 2, explain: '11:00 + 17:00 = ideal.' },
  ],
  13: [
    { q: 'Meeting rule?', options: ['Always join', 'Clear agenda + 30min', 'Standing only', 'Breakfast'], correct: 1, explain: 'Clear agenda + max 30 min.' },
    { q: 'Standing meeting length?', options: ['Same', '50% shorter', '200% longer', 'None'], correct: 1, explain: 'Standing = 50% shorter.' },
  ],
  14: [
    { q: 'Deep work block length?', options: ['25 min', '60 min', '90 min', '8h'], correct: 2, explain: '90 min = optimum.' },
    { q: 'Cal Newport thesis?', options: ['Speed', 'Deep work = deep value', 'Speed', 'Multitask'], correct: 1, explain: 'Deep work yields deep value.' },
  ],
  15: [
    { q: 'GTD by whom?', options: ['James Clear', 'David Allen', 'Cal Newport', 'Tim Ferriss'], correct: 1, explain: 'David Allen — Getting Things Done.' },
    { q: 'Uncaptured idea does?', options: ['Nothing', 'Steals attention', 'Forgotten', 'No effect'], correct: 1, explain: 'Loops in mind, takes focus.' },
  ],
  16: [
    { q: 'Weekly review duration?', options: ['5 min', '30 min', '2h', '1 day'], correct: 1, explain: '30 min suffices.' },
    { q: 'Best review time?', options: ['Mon 09', 'Fri 17 / Sun 09', 'Sat 12', 'Mon 18'], correct: 1, explain: 'Friday 17 or Sunday 09.' },
  ],
  17: [
    { q: '"No" = ?', options: ['Rude', 'Yes to your priority', 'Loss', 'Mistake'], correct: 1, explain: 'Each no = yes to your own.' },
    { q: 'Soft "no"?', options: ['No', '"Not right for me"', 'Silence', 'Hang up'], correct: 1, explain: 'No explanation needed.' },
  ],
  18: [
    { q: 'Boredom is?', options: ['Disease', 'Empty space signal', 'Hunger', 'Fatigue'], correct: 1, explain: 'Brain wants empty space.' },
    { q: 'Boredom allowance time?', options: ['1 min', '10 min', '1h', '1 day'], correct: 1, explain: '10 min suffices.' },
  ],
  19: [
    { q: 'Home screen icons = ?', options: ['Decoration', 'Trigger', 'Function', 'Reminder'], correct: 1, explain: 'Trigger = daily check.' },
    { q: 'Optimal home screen icons?', options: ['1', '6', '20', '50'], correct: 1, explain: '6 icons enough, rest in App Library.' },
  ],
  20: [
    { q: 'Info diet filter?', options: ['Trend', '"Does it serve me?"', 'Popularity', 'Novelty'], correct: 1, explain: 'No = noise.' },
    { q: 'Optimum depth vs breadth?', options: ['10 areas shallow', '1 area deep', 'Equal', 'Random'], correct: 1, explain: '1 area deep.' },
  ],
  21: [
    { q: 'Active vs passive reading?', options: ['Same', '5x diff', '20x diff', 'Unknown'], correct: 2, explain: '1 active page > 20 passive.' },
    { q: 'Active reading tools?', options: ['Silence', 'Notes + questioning', 'Music', 'Speed'], correct: 1, explain: 'Take notes, question, apply.' },
  ],
  22: [
    { q: 'Brain = ?', options: ['Storage', 'Processor', 'Vault', 'Engine'], correct: 1, explain: 'Processor, not storage.' },
    { q: 'Note system starter?', options: ['Notion', 'Apple Notes', 'Obsidian', 'Journal'], correct: 1, explain: 'Simple + sync first.' },
  ],
  23: [
    { q: 'Deep work example?', options: ['Email', 'Creativity', 'Meeting', 'Message'], correct: 1, explain: 'Creativity, analysis, strategy.' },
    { q: 'Morning first?', options: ['Email', 'Deep work', 'Meeting', 'Social'], correct: 1, explain: 'Brain is deep in morning.' },
  ],
  24: [
    { q: 'Walk creativity boost?', options: ['None', '+30%', '+60%', '+200%'], correct: 2, explain: 'Stanford — +60%.' },
    { q: 'When stuck do?', options: ['Sit', 'Walk', 'Sleep', 'Eat'], correct: 1, explain: 'Walk = creativity reset.' },
  ],
  25: [
    { q: 'Brain dump?', options: ['List', 'Write without judging', 'Censor', 'Plan'], correct: 1, explain: 'Write what comes, no censor.' },
    { q: 'Brain dump length?', options: ['1 min', '10 min', '1h', '1 day'], correct: 1, explain: '10 min optimum.' },
  ],
  26: [
    { q: 'Bedroom rule?', options: ['Work', 'Sleep only', 'Phone', 'Food'], correct: 1, explain: 'Sleep + sex only (Walker).' },
    { q: 'Phone where?', options: ['Bed', 'Door', 'Kitchen', 'Bath'], correct: 1, explain: 'Door = boundary.' },
  ],
  27: [
    { q: 'Eisenhower Matrix categories?', options: ['1', '2', '4', '10'], correct: 2, explain: '4 categories: urgent/important combos.' },
    { q: 'Category 4 means?', options: ['Do', 'Plan', 'Delegate', 'Delete'], correct: 3, explain: 'Not urgent + not important = delete.' },
  ],
  28: [
    { q: 'Optimal annual goals?', options: ['1', '5', '10', '20'], correct: 0, explain: '1 goal = focus.' },
    { q: '"Exercise more" goal is?', options: ['Perfect', 'Too vague', 'Fine', 'Good'], correct: 1, explain: 'Vague = unmeasurable = fail.' },
  ],
  29: [
    { q: 'Final discipline test?', options: ['Speed', 'Which 1 after 30?', 'Fatigue', 'Satisfaction'], correct: 1, explain: 'Which 1 discipline continues?' },
    { q: 'Discipline auto how?', options: ['Alone', 'With stack', 'Tiredness', 'Never'], correct: 1, explain: 'Stack onto existing habit.' },
  ],
  30: [
    { q: 'Rest after transition?', options: ['None', '3 days', '1 week', '1 month'], correct: 1, explain: '3 days rest, then move on.' },
    { q: '30-day summary?', options: ['None', '3+3+3', 'Random', 'List'], correct: 1, explain: '3 learned, 3 to keep, 3 not to forget.' },
  ],
};

function buildLessons(newContent, quizMap, protips) {
  const out = {};
  for (const [order, tip] of Object.entries(protips)) out[order] = { proTip: tip };
  for (const [order, lesson] of Object.entries(newContent)) {
    out[order] = {
      title: lesson.title, teaching: lesson.teaching, action: lesson.action,
      reflectionPrompt: lesson.reflectionPrompt, proTip: lesson.proTip,
      quiz: quizMap[order] || [],
    };
  }
  return out;
}
function applyToFile(filePath, pathId, lessonsMerge) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.lessons[pathId]) data.lessons[pathId] = {};
  for (const [order, fields] of Object.entries(lessonsMerge)) {
    data.lessons[pathId][order] = { ...(data.lessons[pathId][order] || {}), ...fields };
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

const TR_MERGE = buildLessons(NEW_TR, QUIZ_TR, PROTIPS_TR);
const EN_MERGE = buildLessons(NEW_EN, QUIZ_EN, PROTIPS_EN);
applyToFile(path.join(__dirname, '..', 'src', 'i18n', 'locales', 'lessons.tr.json'), 'mind-discipline', TR_MERGE);
applyToFile(path.join(__dirname, '..', 'src', 'i18n', 'locales', 'lessons.en.json'), 'mind-discipline', EN_MERGE);
console.log(`✓ Mind Discipline seeded — ${Object.keys(NEW_TR).length} new lessons + 5 pro tips × 2 langs`);
