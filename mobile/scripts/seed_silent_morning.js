/**
 * Seed silent-morning lessons 6-30 (25 new lessons) + add proTip to 1-5.
 * Run: node scripts/seed_silent_morning.js
 */
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// PRO TIPS for existing lessons 1-5
// ─────────────────────────────────────────────────────────────────────────────
const PROTIPS_TR = {
  1: 'Yatma saatini "günün en önemli randevusu" olarak takvime ekle.',
  2: 'Telefonu odanın en uzak köşesine ya da başka bir odaya bırak — fiziksel mesafe psikolojik sınır kurar.',
  3: 'Soğuk yüz yıkamaktan sonra havluyu kullanma; suyun kendiliğinden kuruması ekstra uyandırır.',
  4: 'İlk 30 dakikan boyunca konuşmaya da gerek yok — gerçek sessizlik içsel + dışsal birliktedir.',
  5: 'Niyet sorularını yazılı yap. Beyin yazılı niyeti zihinsel niyetten 4x daha fazla hatırlar.',
};
const PROTIPS_EN = {
  1: 'Put your bedtime in the calendar as "the most important appointment of the day."',
  2: 'Place the phone in the farthest corner of the room — physical distance builds psychological boundary.',
  3: 'After cold face-wash, skip the towel; air-drying delivers extra wake-up shock.',
  4: 'Even talking can break silence — true silence is internal + external.',
  5: 'Write your intent answers. The brain remembers written intent 4x more than mental intent.',
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW LESSONS 6-30 (25 lessons)
// ─────────────────────────────────────────────────────────────────────────────
const NEW_TR = {
  6: {
    title: 'Sabah Işığı: 10 Dakika',
    teaching: 'Beyin sirkadiyen ritmi göz retinasından gelen mavi-yeşil ışıkla sıfırlar. Sabah dışarıda 10 dakika = gece daha derin uyku. Cam arkasından bakmak yetmez — direkt gökyüzü gerek. Bulutlu havada bile lux miktarı kapalı odadan 100x fazla.',
    action: 'Bugün uyandıktan 30 dakika içinde 10 dakika dışarı çık (balkon/sokak/pencere açık). Telefonsuz.',
    reflectionPrompt: 'Direkt gökyüzü gördüğünde içsel olarak ne değişti?',
    proTip: 'Ofiste çalışıyorsan öğle yemeği molasında 10 dk daha al — ikinci doz daha güçlüdür.',
  },
  7: {
    title: 'İlk Su: 300ml',
    teaching: 'Uyku boyunca vücut 6-8 saat dehidrate kalır. Sabah ilk içecek kahve ise — kortizolü zaten zirvedeyken daha da yükselten bir hata. Önce su, sonra (en az 90 dakika sonra) kahve. Su = enerji, odak, açlık kontrolü.',
    action: 'Bugün uyanır uyanmaz 300ml su iç. Kahveden önce minimum 60 dakika geçsin.',
    reflectionPrompt: 'Su içtiğinde bedeninde fark ettiğin ilk değişiklik ne oldu?',
    proTip: 'Bardağı gece başucuna bırak. Sabah hatırlatmaya gerek kalmaz.',
  },
  8: {
    title: 'Soğuk Sıçrama',
    teaching: 'Tam soğuk duş zorlu — ama yüze 30 saniye soğuk su sıçratmak %80 faydayı verir. Sempatik sinir sistemi devreye girer, dopamin %250 yükselir, odak 2 saat sürer. Ücretsiz, hızlı, pazarlama yok.',
    action: 'Bugün yüzünü 30 saniye soğuk suyla yıka. Mümkünse el bileklerini de sok.',
    reflectionPrompt: 'Soğuk şokun ardından zihinsel netliğin nasıldı?',
    proTip: 'Çok zorlanıyorsan ilk gün 10 saniyeyle başla, her gün 5 saniye ekle.',
  },
  9: {
    title: 'Postür Disiplini',
    teaching: 'Eğri postür = düşük testosteron, yüksek kortizol. 2 dakika dik durmak hormon profilini değiştirir (Amy Cuddy araştırması). Sabah aynaya bak: omuzlar geride, göğüs açık, çene paralel. Bu duruş gün boyu dayanır.',
    action: 'Bugün 5 dakika dik dur (ayakta veya otururken). Saat başı 30 saniye postür kontrolü yap.',
    reflectionPrompt: 'Postürünü düzelttiğinde içsel olarak nasıl hissettin?',
    proTip: 'Telefonu göz hizasında tut, yere değil. Tek başına bu boyun gerginliğini %70 azaltır.',
  },
  10: {
    title: 'Esneme Rutini: 5 Dakika',
    teaching: 'Uyku boyunca kaslar kasılır, fasya sıkışır. Sabah esneme = günü esnek bedenle başlatma. 3 hareket yeter: kollar yukarı (omuz), öne eğil (sırt-bacak), yan dönüş (omurga). Her biri 30 saniye × 3 set.',
    action: 'Bugün 5 dakika esneme yap. Acıma noktasında değil, gerilme noktasında dur.',
    reflectionPrompt: 'Esneme sonrası hangi vücut bölgen serbestleşti?',
    proTip: 'Esneme nefesle birleşir. Her hareketin nefes ver fazında derinleştir.',
  },
  11: {
    title: 'Kutu Nefesi: 4-4-4-4',
    teaching: 'Box breathing (Navy SEAL tekniği): 4 saniye nefes al, 4 tut, 4 ver, 4 tut. 5 dakika tekrar = parasempatik aktivasyon, kortizol düşüşü, odak artışı. Bilim kanıtladı, savaşçılar kullandı, sen de kullanabilirsin.',
    action: 'Bugün uyandıktan sonra 5 dakika kutu nefesi yap. Oturarak, dik postürle.',
    reflectionPrompt: 'Nefes pratiği sonrası zihninin hızı ne durumda?',
    proTip: 'Saymak zorlanıyorsan parmaklarını kullan: 4 parmak yumru, 4 yum, vs.',
  },
  12: {
    title: 'Üç Şükran',
    teaching: 'Şükran beyni dopamin/serotonin üretmeye programlar. 3 spesifik şey yaz: dünkünden farklı, bugün için. "Sağlıklıyım" değil — "kahvaltıda annemin sıcak ekmeğini yedim." Detay = etki.',
    action: 'Bugün 3 spesifik şükran maddesi yaz. Genel değil, konkret.',
    reflectionPrompt: 'En zor yazdığın madde hangisi oldu? Neden?',
    proTip: 'Şükranı yatak kenarında yap, defterini başucunda tut. Akşam dünkü maddeleri oku.',
  },
  13: {
    title: 'Günün Üçü',
    teaching: 'Tüm gün her şeyi başarmaya çalışmak = hiçbir şey başaramamak. Sabah 3 öncelik seç: sadece 3. Gün sonunda hepsi tamamsa, gün başarılı. Geri kalan bonus.',
    action: 'Bugün gün başında 3 öncelik yaz. Akşam tikle.',
    reflectionPrompt: 'Üçü seçerken hangi 7 şeyi listeden çıkardın?',
    proTip: 'Bir tanesini saat 11\'e kadar bitir. Erken galibiyet gün boyu enerji verir.',
  },
  14: {
    title: 'Vücut Taraması',
    teaching: 'Vücut günden güne biriken stresi taşır. Sabah vücut taraması = "ne taşıyorum" farkındalığı. Tepeden tırnağa: çene gergin mi, omuzlar yukarda mı, mide sıkışık mı? Fark et = serbest bırak.',
    action: 'Bugün uyandığında 3 dakika vücut taraması yap. Her gergin bölgeye nefes gönder.',
    reflectionPrompt: 'Vücudunun en gergin bölgesi neresiydi? Ne anlatıyor olabilir?',
    proTip: 'Çene en sık ihmal edilen yerdir. Dilini damağa yapıştır, çene gevşesin.',
  },
  15: {
    title: 'İçsel Selam',
    teaching: 'Çoğu sabah dışsal başlar: telefon, haber, mesaj. İçsel selam = "kendine merhaba." Aynaya bak, gözünün içine bak, "günaydın [adın]" de. Zorlama değil, yumuşak bir tanışma.',
    action: 'Bugün aynada kendine "günaydın" de. 10 saniye gözüne bak.',
    reflectionPrompt: 'Aynadaki kendinden bugün ne hissettin?',
    proTip: 'Garipse, ilk günü gülümsemekle bitir. Yapay olabilir; beyin gerçekle yapay arasında ayrım yapmaz.',
  },
  16: {
    title: 'Soğuk Duş Tanışması',
    teaching: 'Soğuk duş = disiplinin fiziksel kanıtı. Akıl "yapma" derken yaparsan beyin yeniden eğitilir. 30 saniyeden başla. Norepinefrin patlar, depresyon riskini %29 düşürür (Wim Hof araştırması).',
    action: 'Bugün duşun son 30 saniyesinde suyu mümkün olduğunca soğuk yap.',
    reflectionPrompt: 'Soğuk akmaya başlayınca aklında ilk düşünce ne oldu?',
    proTip: 'Nefesi tutma. Tam tersine: derin nefes al, kontrollü ver. Şok tepkisi otomatiktir, nefesle yumuşatılır.',
  },
  17: {
    title: 'Yer Egzersizi: 5 Dakika',
    teaching: 'Spor salonu opsiyonel, beden egzersizi zorunlu. 5 dakika = 25 squat + 15 push-up + 30 saniye plank. Ev içinde, ekipmansız. Tutarlılık > yoğunluk. Her gün 5dk > haftada 1 saat.',
    action: 'Bugün 5 dakika yer egzersizi yap. Sayılar küçük olsun, devamı önemli.',
    reflectionPrompt: 'En zorlandığın hareket hangisiydi? Neden?',
    proTip: 'Diş fırçaladıktan hemen sonra yap. "Diş + spor" zinciri otomatikleşir.',
  },
  18: {
    title: '12\'ye Kadar Aç (Intermittent Fasting)',
    teaching: 'Sabah kahvaltı = "günün en önemli öğünü" mitos. Çoğu disiplinli insan 12-16 saat aç durur. Kahvaltı geç olunca insülin düşer, enerji stabil, kafa daha berrak. Kahve ve su serbest.',
    action: 'Bugün kahvaltıyı saat 12\'ye kadar geciktir. Sadece su, çay, kara kahve.',
    reflectionPrompt: 'Açken zihinsel performansın nasıldı? Beklediğinden farklı mı?',
    proTip: 'İlk 3 gün zor olabilir. 4. günden sonra vücut adapte olur, açlık sinyali yumuşar.',
  },
  19: {
    title: 'Sabah 10 Sayfa Oku',
    teaching: 'Sosyal medya ile başlayan gün = başkasının fikriyle dolu kafa. Kitap ile başlayan gün = derin düşünceyle dolu kafa. 10 sayfa × 365 gün = yılda 12 kitap. Ortalama insan yılda 0 kitap okur.',
    action: 'Bugün sabah 10 sayfa kitap oku (kâğıt veya e-kitap, sosyal medyasız cihaz).',
    reflectionPrompt: 'Okumadan sosyal medyaya gitseydin günün nasıl başlardı?',
    proTip: 'Kitabı yatak kenarında tut, telefonu başka odada. Önce hangisi gözünün önünde, onu açarsın.',
  },
  20: {
    title: 'Günlük: 5 Dakika',
    teaching: 'Düşünceler kafanın içinde dolaşır, gerçek olur. Yazıya dökünce dışarı çıkar, gerçeklik kaybolur. Sabah 5 dakika beyin boşaltma = günün geri kalanı daha temiz. Yargılama, yaz.',
    action: 'Bugün 5 dakika önüne ne gelirse yaz. Düzeltme, sansür yok.',
    reflectionPrompt: 'Yazdıkların arasında en şaşırtıcı olan hangisiydi?',
    proTip: '"3 sayfa boş yaz" (Julia Cameron tekniği) — sabah sayfaları (morning pages) 30 yıl test edilmiş.',
  },
  21: {
    title: '10 Dakika Yürüyüş',
    teaching: 'Yürüyüş = beyin için en doğal terapi. Hipokampus büyür, BDNF artar, depresyon riski %47 düşer. Sabah yürüyüşü güneş ışığıyla birleşince çift etki. Müziksiz, telefonsuz, sadece adım.',
    action: 'Bugün 10 dakika yürüyüşe çık. Mahallenin etrafında bir tur.',
    reflectionPrompt: 'Yürürken aklına gelen en temiz düşünce neydi?',
    proTip: 'Stuck hissedersen düşünmeyi bırak yürü. Çoğu yaratıcı çözüm yürürken gelir (Steve Jobs, Darwin, Nietzsche tekniği).',
  },
  22: {
    title: 'Müzik mi Sessizlik mi?',
    teaching: 'Müzik motivasyon verir ama beyne yer kaplar. Sessizlik düşünce yer açar. Sabah müzik dinleyenler genelde başkasının duygusunu yaşar. Sabah sessizlik = kendi duygunla yüzleş.',
    action: 'Bugün sabah ilk 1 saat sessizlikte geçir. Müzik, podcast, video yok.',
    reflectionPrompt: 'Sessizlik rahatsız etti mi? Hangi anda?',
    proTip: 'Trafikteyken bile dene. Müzik yerine pencere camını aç, sokak sesini dinle.',
  },
  23: {
    title: 'Saat 9\'a Kadar Telefonsuz',
    teaching: 'Sabahın altın 90 dakikası = istem gücü zirvesi. O 90 dakikayı telefonla harcamak = günün kalitesini satmak. 9\'a kadar telefonsuz olan insan, 9-12 arası 3x verimli olur.',
    action: 'Bugün saat 9\'a kadar telefonu açma (alarm hariç). Acil ise eşin/aile arar zaten.',
    reflectionPrompt: '9\'a kadar geçen sürede beklediğin gibi mi geçti?',
    proTip: 'Uçak modunda bırak, 9\'da aç. Bildirimleri toplu görmek 1 saat boyunca tek tek görmekten daha az emek.',
  },
  24: {
    title: 'Kahvaltı Stratejisi',
    teaching: 'Kahvaltı yerseniz: yüksek protein, düşük şeker. 30g protein = 4 saatlik tokluk + odak. Ekmek-bal-çay = 1 saat sonra çökme. Yumurta-avokado-yeşillik = öğleye kadar net kafa.',
    action: 'Bugün protein bazlı kahvaltı yap (yumurta, peynir, baklagil). Şekersiz.',
    reflectionPrompt: 'Bu kahvaltıdan sonra öğle saatlerine kadar enerjin nasıldı?',
    proTip: 'Akşamdan kahvaltıyı hazırla. Sabah karar vermek = istem gücü kaybı.',
  },
  25: {
    title: 'Pazar Reseti',
    teaching: 'Hafta içi rutin, pazar ise reset. Pazar sabahı = haftalık review + niyet. Geçen haftada ne işe yaradı, ne yaramadı? Önümüzdeki hafta hangi 1 disipline odaklanacaksın? 30 dakika yeter.',
    action: 'Bu pazar 30 dakika haftalık review yap. Yazılı, somut.',
    reflectionPrompt: 'Geçen haftanın en güçlü ve en zayıf günü hangisiydi? Fark ne?',
    proTip: 'Pazar gece değil, pazar sabah yap. Yorgun review yüzeysel olur.',
  },
  26: {
    title: 'Rutin Yığma (Habit Stacking)',
    teaching: 'Yeni alışkanlık tek başına zayıf — mevcut alışkanlığa bağlanırsa güçlü. James Clear tekniği: "Diş fırçaladıktan sonra ___" (1 push-up, 1 dakika nefes, 3 şükran). Eski + yeni = daha güçlü zincir.',
    action: 'Bugün mevcut bir alışkanlığa yeni bir mikro alışkanlık ekle.',
    reflectionPrompt: 'Hangi mevcut alışkanlığa hangi yenisini bağladın?',
    proTip: 'Yığını yazılı yap. "Sabah dişimi fırçaladıktan sonra 5 push-up" şeklinde.',
  },
  27: {
    title: '100-Gün Testi',
    teaching: 'İlk 30 gün: zorlanırsın. 30-60: alışırsın. 60-100: sen olur. 100 gün sonunda dönüş yok. Sabah rutini = 100 gün sonra "hep böyle yapıyordum" denilir. İşte bu noktaya gel.',
    action: 'Bugün 100 günlük taahhüdünü yaz. Hangi 1 sabah disiplinini 100 gün sürdüreceksin?',
    reflectionPrompt: '100 gün sonrası "yeni sen" kim? Ne yapıyor?',
    proTip: 'Takvime her gün sonrası tik koy. Görsel zincir = 21 gün sonra kırmak fiziksel acı verir.',
  },
  28: {
    title: 'Kimlik Kayması',
    teaching: '"Spor yapan biriyim" demek "spor yapmaya çalışıyorum"dan 10x daha güçlüdür. Disiplin = davranış değil, kimlik. "Ben sabahın insanıyım" — bunu söyleyen kişi otomatik erken kalkar.',
    action: 'Bugün kendine 1 yeni kimlik etiketi yapıştır. "Ben ___ yapan biriyim."',
    reflectionPrompt: 'Hangi kimliği seçtin? Hangi kanıtla destekleyeceksin?',
    proTip: 'Kimliği günde 3 kez tekrar et. Beyin tekrara inanır, gerçeğe değil.',
  },
  29: {
    title: 'Final Sprint Günü',
    teaching: '29. gün = son sprint günü. Yarın "tamamladın." Ama bugün şu önemli: bu 30 günü yapanın kim olduğunu hatırla. Geçmişine bakma — sonucu hatırla. Yapacağın bir sonraki şey: sürdür.',
    action: 'Bugün son 30 gündeki en güçlü 3 anını yaz. Bunlar artık senin kanıtın.',
    reflectionPrompt: 'En zor an hangisiydi? Onu nasıl aştın?',
    proTip: 'Bu 3 maddeyi telefon kilit ekranına koy. Geri dönüş anında bakacaksın.',
  },
  30: {
    title: 'Tamamlandı — Yeni Sabah',
    teaching: '30 gün önce sabahların kaotikti. Şimdi sistematik. 30 gün önce reaktiftin. Şimdi proaktif. Sen değiştin — sabahların değişti çünkü. Bu sabah sıradan değil. Bu sabah kanıt: yapabilirsin.',
    action: 'Bugün 30 gün boyunca işe yarayan 3 disiplini yaz. Bunlar yeni baselin.',
    reflectionPrompt: 'En çok hangi disiplini sürdüreceksin? Neden?',
    proTip: 'Bir sonraki yola geçmeden 3 gün dinlen. Tutarlılık = kalıcılık. Aceleci geçiş = gerileme.',
  },
};

const NEW_EN = {
  6: {
    title: 'Morning Light: 10 Minutes',
    teaching: 'Brain resets circadian rhythm via blue-green light hitting the retina. 10 min outside in morning = deeper sleep at night. Glass blocks it — direct sky needed. Even cloudy days deliver 100x more lux than indoors.',
    action: 'Today, within 30 min of waking, get 10 min of direct outdoor light. No phone.',
    reflectionPrompt: 'What shifted internally when you saw direct sky?',
    proTip: 'If you work in an office, take a second 10 min dose at lunch. The afternoon dose is even stronger.',
  },
  7: {
    title: 'First Water: 300ml',
    teaching: 'Body is dehydrated 6-8 hours from sleep. Coffee first = stacking on already-peaking cortisol. Water first, coffee 90+ min later. Water = energy, focus, hunger control.',
    action: 'Today drink 300ml water on waking. Wait at least 60 min before coffee.',
    reflectionPrompt: 'What was the first physical change you noticed after drinking?',
    proTip: 'Leave a glass at your bedside the night before — no morning decision needed.',
  },
  8: {
    title: 'Cold Splash',
    teaching: 'Full cold shower is intense — but 30 sec of cold water on your face delivers 80% of the benefit. Sympathetic nervous system fires, dopamine jumps 250%, focus lasts 2 hours. Free, fast, no marketing.',
    action: 'Today splash cold water on your face for 30 seconds. Add wrists if you can.',
    reflectionPrompt: 'How was your mental clarity right after the shock?',
    proTip: 'If 30 sec is too much, start with 10. Add 5 sec each day.',
  },
  9: {
    title: 'Posture Discipline',
    teaching: 'Slumped posture = low testosterone, high cortisol. 2 minutes of upright stance shifts hormone profile (Amy Cuddy research). Mirror check: shoulders back, chest open, chin parallel. This stance carries the day.',
    action: 'Today stand tall for 5 min (standing or sitting). Hourly 30-sec posture check.',
    reflectionPrompt: 'How did you feel internally once you fixed your posture?',
    proTip: 'Hold your phone at eye level, not down. This alone reduces neck strain by 70%.',
  },
  10: {
    title: 'Stretch Routine: 5 Minutes',
    teaching: 'Sleep contracts muscles, fascia stiffens. Morning stretch = launching the day in a flexible body. 3 moves are enough: arms up (shoulders), forward bend (back-leg), side rotation (spine). 30 sec × 3 sets each.',
    action: 'Today stretch 5 min. Stop at the stretch point, not the pain point.',
    reflectionPrompt: 'Which body part loosened up the most?',
    proTip: 'Sync stretch with breath. Deepen on the exhale of each move.',
  },
  11: {
    title: 'Box Breath: 4-4-4-4',
    teaching: 'Box breathing (Navy SEAL technique): 4 sec in, 4 hold, 4 out, 4 hold. 5 minutes = parasympathetic activation, cortisol drop, focus boost. Science-proven, warriors used it, you can too.',
    action: 'Today after waking do 5 min of box breathing. Sitting, upright posture.',
    reflectionPrompt: 'What is the speed of your mind after the practice?',
    proTip: 'If counting feels hard, use fingers. 4 closed, 4 hold, etc.',
  },
  12: {
    title: 'Three Gratitudes',
    teaching: 'Gratitude trains brain to produce dopamine/serotonin. Write 3 specific things: different from yesterday, for today. "I\'m healthy" doesn\'t hit — "I had my mom\'s warm bread at breakfast" does. Detail = effect.',
    action: 'Today write 3 specific gratitudes. Concrete, not abstract.',
    reflectionPrompt: 'Which entry was the hardest to write? Why?',
    proTip: 'Do gratitude bedside, journal at hand. Each evening read yesterday\'s.',
  },
  13: {
    title: 'Three of the Day',
    teaching: 'Trying to do everything = doing nothing. Pick 3 priorities at sunrise: only 3. If all done by night, day is a win. Rest is bonus.',
    action: 'Today write 3 priorities at the start. Tick them by night.',
    reflectionPrompt: 'Which 7 items did you cut to land on 3?',
    proTip: 'Finish one before 11am. Early win = energy all day.',
  },
  14: {
    title: 'Body Scan',
    teaching: 'Body carries accumulated stress. Morning body scan = "what am I carrying" awareness. Head to toe: clenched jaw, raised shoulders, tight stomach? Notice = release.',
    action: 'Today on waking, do a 3-min body scan. Send breath into each tense area.',
    reflectionPrompt: 'Which body part was tightest? What might it be telling you?',
    proTip: 'Jaw is the most ignored. Place tongue on roof of mouth — jaw releases.',
  },
  15: {
    title: 'Inner Greeting',
    teaching: 'Most mornings start outward: phone, news, message. Inner greeting = "hello to self." Look in the mirror, into your own eyes, say "good morning [name]." Not forced — a soft introduction.',
    action: 'Today say "good morning" to yourself in the mirror. 10 sec eye contact.',
    reflectionPrompt: 'What did you feel from the mirror version of you?',
    proTip: 'If awkward, end with a smile day one. Brain doesn\'t separate real from forced.',
  },
  16: {
    title: 'Cold Shower Initiation',
    teaching: 'Cold shower = physical proof of discipline. Acting when mind says "don\'t" rewires the brain. Start at 30 sec. Norepinephrine spikes, depression risk drops 29% (Wim Hof research).',
    action: 'Today turn the last 30 seconds of your shower as cold as possible.',
    reflectionPrompt: 'When the cold hit, what was the first thought?',
    proTip: 'Don\'t hold breath. Opposite: deep breath in, controlled out. Shock fades when breath leads.',
  },
  17: {
    title: 'Floor Workout: 5 Minutes',
    teaching: 'Gym is optional, body workout is mandatory. 5 min = 25 squats + 15 push-ups + 30 sec plank. Indoor, no equipment. Consistency > intensity. Daily 5 min > weekly 1 hour.',
    action: 'Today do 5 min floor workout. Numbers small, the streak is what matters.',
    reflectionPrompt: 'Which move was hardest? Why?',
    proTip: 'Right after brushing teeth. "Brush + train" chain becomes automatic.',
  },
  18: {
    title: 'Fast Until 12 (Intermittent Fasting)',
    teaching: 'Breakfast as "most important meal" is myth. Most disciplined people fast 12-16 hours. Late breakfast = lower insulin, stable energy, sharper mind. Coffee and water free.',
    action: 'Today push breakfast to noon. Only water, tea, black coffee.',
    reflectionPrompt: 'How was your mental performance fasted? Different from expected?',
    proTip: 'First 3 days are tough. Day 4+ body adapts, hunger softens.',
  },
  19: {
    title: 'Read 10 Pages',
    teaching: 'Day starting with social media = head full of someone else\'s thoughts. Day starting with a book = head full of deep thought. 10 pages × 365 days = 12 books a year. Average person reads 0.',
    action: 'Today read 10 pages in the morning (paper or e-ink, no social-media device).',
    reflectionPrompt: 'How would the day start if you opened social media instead?',
    proTip: 'Book by bedside, phone in another room. Whichever your eyes find first wins.',
  },
  20: {
    title: 'Journal: 5 Minutes',
    teaching: 'Thoughts circle in the head and become real. Written down, they exit and lose force. 5 min brain dump in morning = cleaner rest of day. No judging. Write.',
    action: 'Today write 5 minutes of whatever comes. No editing, no censoring.',
    reflectionPrompt: 'What was the most surprising thing you wrote?',
    proTip: '"Three pages free-write" (Julia Cameron) — morning pages have 30 years of test.',
  },
  21: {
    title: '10-Min Walk',
    teaching: 'Walk = brain\'s most natural therapy. Hippocampus grows, BDNF rises, depression risk drops 47%. Morning walk plus sunlight = double effect. No music, no phone — just steps.',
    action: 'Today take a 10 min walk. One loop around your block.',
    reflectionPrompt: 'What was the cleanest thought that arrived while walking?',
    proTip: 'When stuck, stop thinking and walk. Most creative breakthroughs happen walking (Jobs, Darwin, Nietzsche).',
  },
  22: {
    title: 'Music or Silence?',
    teaching: 'Music gives motivation but takes mental space. Silence makes room for thought. Morning music listeners often live someone else\'s emotion. Morning silence = facing your own.',
    action: 'Today spend the first hour in silence. No music, podcast, video.',
    reflectionPrompt: 'Did silence feel uncomfortable? When?',
    proTip: 'Even in traffic. Roll down a window — let the street sound replace music.',
  },
  23: {
    title: 'No Phone Until 9',
    teaching: 'Morning\'s golden 90 minutes = peak willpower. Spending it on the phone = selling the day\'s quality. Phoneless until 9 → 3x productivity 9-12.',
    action: 'Today no phone until 9am (alarm aside). Real emergencies still reach you.',
    reflectionPrompt: 'How did the time before 9 feel — as expected?',
    proTip: 'Airplane mode all night, off at 9. Batched notifications = less effort than one-by-one.',
  },
  24: {
    title: 'Breakfast Strategy',
    teaching: 'If you eat breakfast: high protein, low sugar. 30g protein = 4 hours of fullness + focus. Bread-honey-tea = 1-hour crash. Eggs-avocado-greens = clear head until lunch.',
    action: 'Today eat protein-based breakfast (eggs, cheese, legumes). Sugar-free.',
    reflectionPrompt: 'How was your energy until lunch on this breakfast?',
    proTip: 'Prep breakfast the night before. Morning decisions = willpower drain.',
  },
  25: {
    title: 'Sunday Reset',
    teaching: 'Weekdays = routine, Sunday = reset. Sunday morning = weekly review + intent. What worked last week, what didn\'t? Which one discipline next week? 30 min is enough.',
    action: 'This Sunday do a 30-min weekly review. Written, concrete.',
    reflectionPrompt: 'Strongest and weakest day last week? Difference?',
    proTip: 'Sunday morning, not Sunday night. Tired review goes shallow.',
  },
  26: {
    title: 'Habit Stacking',
    teaching: 'A new habit alone is weak — tied to an existing habit, it\'s strong. James Clear: "After I brush my teeth, I will ___" (1 pushup, 1 min breath, 3 gratitudes). Old + new = stronger chain.',
    action: 'Today stack a new micro-habit on an existing habit.',
    reflectionPrompt: 'Which existing habit got which new addition?',
    proTip: 'Write the stack down. "After I brush my teeth, I do 5 pushups."',
  },
  27: {
    title: 'The 100-Day Test',
    teaching: 'First 30 days: hard. 30-60: get used to it. 60-100: become it. After day 100, no return. Morning routine after 100 days = "I\'ve always done this." Reach that point.',
    action: 'Today write your 100-day commitment. Which one morning discipline for 100 days?',
    reflectionPrompt: 'Who is "future you" after 100 days? What do they do?',
    proTip: 'Mark a calendar tick after each day. Visual chain — breaking it after 21 days physically hurts.',
  },
  28: {
    title: 'Identity Shift',
    teaching: '"I am someone who exercises" is 10x stronger than "I am trying to exercise." Discipline = not behavior, identity. "I am a morning person" — saying it makes early rising automatic.',
    action: 'Today claim a new identity label. "I am someone who ___."',
    reflectionPrompt: 'Which identity did you pick? What proof will support it?',
    proTip: 'Repeat the identity 3x daily. Brain believes repetition, not truth.',
  },
  29: {
    title: 'Final Sprint Day',
    teaching: 'Day 29 = last sprint. Tomorrow you "complete." But today matters: remember who did these 30 days. Don\'t look at the past — remember the result. Next thing to do: keep going.',
    action: 'Today write your 3 strongest moments of the past 30 days. These are now your proof.',
    reflectionPrompt: 'Hardest moment? How did you push through?',
    proTip: 'Put those 3 lines on your phone\'s lock screen. You\'ll see them when you start drifting.',
  },
  30: {
    title: 'Complete — New Morning',
    teaching: '30 days ago your mornings were chaos. Now they\'re systematic. 30 days ago you were reactive. Now proactive. You changed — your morning changed because of it. This morning isn\'t ordinary. This morning is proof: you can.',
    action: 'Today write the 3 disciplines that worked over 30 days. These are the new baseline.',
    reflectionPrompt: 'Which discipline will you carry forward? Why?',
    proTip: 'Rest 3 days before starting another path. Consistency = permanence. Rushing = regression.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ packs (TR + EN parallel) for new lessons 6-30
// ─────────────────────────────────────────────────────────────────────────────
const QUIZ_TR = {
  6: [
    { q: 'Sirkadiyen ritm nasıl reset olur?', options: ['Mavi-yeşil ışıkla', 'Müzikle', 'Yemekle', 'Telefonla'], correct: 0, explain: 'Retinaya çarpan sabah ışığı = ana sirkadiyen sinyal.' },
    { q: 'Bulutlu havada bile lux farkı?', options: ['Aynı', '10x', '50x', '100x dış'], correct: 3, explain: 'Bulutlu dışarı kapalı odadan ~100x daha aydınlıktır.' },
  ],
  7: [
    { q: 'Sabah önce ne içilmeli?', options: ['Kahve', 'Su', 'Çay', 'Süt'], correct: 1, explain: 'Sabah kortizolü zaten zirvede — kahve değil su.' },
    { q: 'Kahveden önce minimum süre?', options: ['0 dk', '15 dk', '60 dk', '180 dk'], correct: 2, explain: 'Vücut hidratasyonu için en az 60 dk gerekir.' },
  ],
  8: [
    { q: 'Soğuk yüz yıkama kaç saniye?', options: ['10', '30', '60', '180'], correct: 1, explain: '30 saniye %80 faydayı verir.' },
    { q: 'Soğuk şok dopaminini nasıl etkiler?', options: ['%10 düşürür', '%50 yükseltir', '%150 yükseltir', '%250 yükseltir'], correct: 3, explain: '250% dopamin artışı 2 saat sürer.' },
  ],
  9: [
    { q: 'Eğri postür hangi hormon profilini bozar?', options: ['İnsülin', 'Test/kortizol', 'Tiroid', 'Adrenalin'], correct: 1, explain: 'Düşük test, yüksek kortizol — tipik eğri postür imzası.' },
    { q: 'Postür hormonları ne kadar sürede değiştirir?', options: ['10 saniye', '2 dakika', '20 dakika', '2 saat'], correct: 1, explain: 'Cuddy araştırması — 2 dk yeter.' },
  ],
  10: [
    { q: 'Sabah esneme kaç hareketle yeterli?', options: ['1', '3', '7', '15'], correct: 1, explain: '3 ana hareket: omuz, sırt-bacak, yan dönüş.' },
    { q: 'Esnemenin durulma noktası neresi?', options: ['Acıma', 'Gerilme', 'Yanma', 'Çıtlama'], correct: 1, explain: 'Gerilme noktasında dur, acıma noktasında değil.' },
  ],
  11: [
    { q: 'Kutu nefesi ritmi?', options: ['4-4-4-4', '5-2-7-2', '4-7-8', 'Random'], correct: 0, explain: '4 sn al, 4 tut, 4 ver, 4 tut.' },
    { q: 'Kutu nefesi hangi sistemi aktif eder?', options: ['Sempatik', 'Parasempatik', 'Endokrin', 'Sindirim'], correct: 1, explain: 'Parasempatik aktivasyon = sakinleşme.' },
  ],
  12: [
    { q: 'Şükran maddesi nasıl olmalı?', options: ['Genel', 'Spesifik + farklı', 'Aynı her gün', 'Kısa'], correct: 1, explain: 'Spesifik + dünkünden farklı = etki.' },
    { q: 'Şükran beyni hangi kimyasala programlar?', options: ['Kortizol', 'Dopamin/serotonin', 'Adrenalin', 'Melatonin'], correct: 1, explain: 'Pozitif duygu kimyasalları aktif olur.' },
  ],
  13: [
    { q: 'Günün önceliği kaç olmalı?', options: ['1', '3', '7', '15'], correct: 1, explain: '3 öncelik = yapılabilir + odaklı.' },
    { q: 'İlk öncelik ne zaman bitmeli?', options: ['Saat 7', 'Saat 11', 'Öğleden sonra', 'Akşam'], correct: 1, explain: 'Erken galibiyet = enerji.' },
  ],
  14: [
    { q: 'Vücut taraması süresi?', options: ['30 saniye', '3 dakika', '15 dakika', '1 saat'], correct: 1, explain: '3 dakika tepeden tırnağa yeter.' },
    { q: 'En sık ihmal edilen gergin bölge?', options: ['Çene', 'Ayak', 'Diz', 'Bilek'], correct: 0, explain: 'Çene 24 saat boyunca farkında olmadan kasılır.' },
  ],
  15: [
    { q: 'İçsel selam nasıl yapılır?', options: ['Telefonla', 'Aynaya 10 sn bakmak', 'Yazılı', 'Hızlı'], correct: 1, explain: 'Aynada gözüne bakmak = içsel tanışma.' },
    { q: 'İlk gün garipse ne yap?', options: ['Bırak', 'Gülümseyerek bitir', 'Atla', 'Hızlandır'], correct: 1, explain: 'Beyin yapay-gerçek ayrımı yapmaz.' },
  ],
  16: [
    { q: 'Soğuk duş başlangıç süresi?', options: ['5 sn', '30 sn', '2 dk', '10 dk'], correct: 1, explain: '30 saniye = sürdürülebilir başlangıç.' },
    { q: 'Soğuk duş depresyon riskini ne kadar düşürür?', options: ['%5', '%15', '%29', '%50'], correct: 2, explain: 'Wim Hof araştırması — %29 düşüş.' },
  ],
  17: [
    { q: 'Ev egzersizi süresi?', options: ['1 dk', '5 dk', '30 dk', '60 dk'], correct: 1, explain: '5 dk yeter — tutarlılık önemli.' },
    { q: 'Tutarlılık vs yoğunluk?', options: ['Yoğunluk', 'Tutarlılık', 'İkisi de eşit', 'Hiçbiri'], correct: 1, explain: 'Her gün 5 dk > haftada 1 saat.' },
  ],
  18: [
    { q: 'Intermittent fasting saat aralığı?', options: ['8 saat', '12-16 saat', '24 saat', '48 saat'], correct: 1, explain: '12-16 saat = sürdürülebilir IF.' },
    { q: 'IF\'de izin verilenler?', options: ['Sadece su', 'Su + kahve + çay', 'Süt', 'Diet kola'], correct: 1, explain: 'Kalorisiz içecekler insülini etkilemez.' },
  ],
  19: [
    { q: '10 sayfa × 365 gün = ?', options: ['2 kitap', '6 kitap', '12 kitap', '50 kitap'], correct: 2, explain: 'Yılda ~12 kitap.' },
    { q: 'Ortalama insan yıllık kaç kitap okur?', options: ['12', '6', '3', '0'], correct: 3, explain: 'Çoğu insan yılda 0 kitap.' },
  ],
  20: [
    { q: 'Sabah günlük kuralı?', options: ['Mükemmel olsun', 'Yargılamadan yaz', 'Sansürle', 'Dijital'], correct: 1, explain: 'Yargılamadan yaz — beyin boşalt.' },
    { q: 'Morning pages tekniği kim?', options: ['James Clear', 'Cal Newport', 'Julia Cameron', 'Tim Ferriss'], correct: 2, explain: 'Julia Cameron — 30 yıl test edilmiş.' },
  ],
  21: [
    { q: 'Yürüyüş depresyon riskini ne kadar düşürür?', options: ['%5', '%15', '%47', '%80'], correct: 2, explain: '%47 düşüş bilim kanıtladı.' },
    { q: 'Yürüyüş hangi beyin proteinini artırır?', options: ['BDNF', 'Insülin', 'Kortizol', 'Adrenalin'], correct: 0, explain: 'BDNF = nöron büyümesi.' },
  ],
  22: [
    { q: 'Sabah müziği etkisi?', options: ['Beyne yer kaplar', 'Hep iyidir', 'Etkisiz', 'Bilinmeyen'], correct: 0, explain: 'Müzik mental yer tutar — sessizlik düşünce yer açar.' },
    { q: 'İlk saat sessizliği zorlu olabilir mi?', options: ['Hiç', 'Belki', 'Evet', 'Asla'], correct: 2, explain: 'Sessizlik rahatsızlığı normaldir, geçer.' },
  ],
  23: [
    { q: 'Sabah istem gücü zirvesi?', options: ['Akşam', 'Öğle', 'İlk 90 dk', 'Hiç'], correct: 2, explain: 'İlk 90 dk = altın pencere.' },
    { q: 'Telefonsuz 9\'a kadar verim artışı?', options: ['Yok', '%50', '3x', '10x'], correct: 2, explain: '9-12 arası 3x verim.' },
  ],
  24: [
    { q: 'En iyi sabah kahvaltısı?', options: ['Tatlı', 'Yüksek protein', 'Sadece kahve', 'Ekmek-bal'], correct: 1, explain: 'Protein = 4 saat tokluk.' },
    { q: '30g protein ne sağlar?', options: ['Kilo', '4 saat tokluk', 'Şeker', 'Susuzluk'], correct: 1, explain: '4 saat tokluk + odak.' },
  ],
  25: [
    { q: 'Pazar reseti süresi?', options: ['5 dk', '30 dk', '2 saat', '1 gün'], correct: 1, explain: '30 dk yeterli.' },
    { q: 'Pazar reseti ne zaman?', options: ['Sabah', 'Gece', 'Akşam', 'Fark etmez'], correct: 0, explain: 'Sabah = berrak review.' },
  ],
  26: [
    { q: 'Habit stacking kim?', options: ['BJ Fogg', 'James Clear', 'Cal Newport', 'Tim Ferriss'], correct: 1, explain: 'Atomic Habits — James Clear.' },
    { q: 'Stack formülü?', options: ['Yeni alone', 'Eski + yeni', 'Sadece yeni', '3 yeni'], correct: 1, explain: 'Eski alışkanlık + yeni = güçlü zincir.' },
  ],
  27: [
    { q: '100 gün sonrası ne olur?', options: ['Sıkılırsın', 'Geri dönmek zor', 'Aynı kalır', 'Bilinmeyen'], correct: 1, explain: '100 gün sonrası dönüş yok.' },
    { q: '60-100 gün arası fazı?', options: ['Zorlanma', 'Alışma', 'Sen olur', 'Yorulma'], correct: 2, explain: 'Sen olursun — kimlik kayması.' },
  ],
  28: [
    { q: '"Yapan biriyim" vs "yapmaya çalışıyorum" gücü?', options: ['Aynı', '2x', '5x', '10x'], correct: 3, explain: 'Kimlik 10x güçlüdür.' },
    { q: 'Disiplin = ?', options: ['Davranış', 'Kimlik', 'Plan', 'Motivasyon'], correct: 1, explain: 'Disiplin = kimlik > davranış.' },
  ],
  29: [
    { q: 'Final günde ne yap?', options: ['Geleceği planla', 'Geçmişe bak', 'Kanıtı yaz', 'Dinlen'], correct: 2, explain: '3 güçlü an = senin kanıtın.' },
    { q: 'Yarın ne olacak?', options: ['Yeni başlangıç', 'Tamamlanma', 'Bitiş', 'Hiç'], correct: 1, explain: '30. gün = tamamlama.' },
  ],
  30: [
    { q: '30 gün sonra fark?', options: ['Yok', 'Reaktif değil proaktif', 'Aynı', 'Daha kötü'], correct: 1, explain: 'Reaktiflikten proaktifliğe geçiş.' },
    { q: 'Bir sonraki yola geçiş?', options: ['Hemen', '3 gün dinlen', '1 ay bekle', 'Hiç'], correct: 1, explain: '3 gün dinlen, sonra devam.' },
  ],
};

const QUIZ_EN = {
  6: [
    { q: 'How does circadian rhythm reset?', options: ['Blue-green light', 'Music', 'Food', 'Phone'], correct: 0, explain: 'Morning light hitting retina = primary circadian signal.' },
    { q: 'Lux difference even cloudy?', options: ['Same', '10x', '50x', '100x outdoor'], correct: 3, explain: 'Cloudy outdoors ~100x brighter than indoors.' },
  ],
  7: [
    { q: 'First morning drink should be?', options: ['Coffee', 'Water', 'Tea', 'Milk'], correct: 1, explain: 'Cortisol already peaks — water, not coffee.' },
    { q: 'Min wait before coffee?', options: ['0 min', '15 min', '60 min', '180 min'], correct: 2, explain: 'At least 60 min for hydration.' },
  ],
  8: [
    { q: 'Cold face wash duration?', options: ['10s', '30s', '60s', '180s'], correct: 1, explain: '30 seconds = 80% of the benefit.' },
    { q: 'Cold shock effect on dopamine?', options: ['-10%', '+50%', '+150%', '+250%'], correct: 3, explain: '250% rise lasts 2 hours.' },
  ],
  9: [
    { q: 'Slumped posture distorts which hormones?', options: ['Insulin', 'Test/cortisol', 'Thyroid', 'Adrenaline'], correct: 1, explain: 'Low T, high cortisol = slump signature.' },
    { q: 'Time for posture to shift hormones?', options: ['10s', '2 min', '20 min', '2h'], correct: 1, explain: 'Cuddy research — 2 min suffices.' },
  ],
  10: [
    { q: 'Min stretch moves needed?', options: ['1', '3', '7', '15'], correct: 1, explain: '3 main moves: shoulder, back-leg, side rotation.' },
    { q: 'Stop point of stretch?', options: ['Pain', 'Stretch sensation', 'Burn', 'Crack'], correct: 1, explain: 'Stretch point, not pain point.' },
  ],
  11: [
    { q: 'Box breath rhythm?', options: ['4-4-4-4', '5-2-7-2', '4-7-8', 'Random'], correct: 0, explain: '4 in, 4 hold, 4 out, 4 hold.' },
    { q: 'Box breath activates?', options: ['Sympathetic', 'Parasympathetic', 'Endocrine', 'Digestive'], correct: 1, explain: 'Parasympathetic = calm.' },
  ],
  12: [
    { q: 'Gratitude entry should be?', options: ['Generic', 'Specific + new', 'Same daily', 'Short'], correct: 1, explain: 'Specific + different from yesterday = effect.' },
    { q: 'Gratitude triggers which chemicals?', options: ['Cortisol', 'Dopamine/serotonin', 'Adrenaline', 'Melatonin'], correct: 1, explain: 'Positive emotion chemistry fires.' },
  ],
  13: [
    { q: 'How many priorities a day?', options: ['1', '3', '7', '15'], correct: 1, explain: '3 = doable + focused.' },
    { q: 'When should first priority finish?', options: ['7am', '11am', 'PM', 'Evening'], correct: 1, explain: 'Early win = energy.' },
  ],
  14: [
    { q: 'Body scan duration?', options: ['30s', '3 min', '15 min', '1h'], correct: 1, explain: '3 min head-to-toe is enough.' },
    { q: 'Most ignored tense area?', options: ['Jaw', 'Foot', 'Knee', 'Wrist'], correct: 0, explain: 'Jaw clenches unnoticed all day.' },
  ],
  15: [
    { q: 'Inner greeting how?', options: ['Phone', '10 sec mirror eye contact', 'Written', 'Fast'], correct: 1, explain: 'Eye-contact in mirror = inner introduction.' },
    { q: 'If first day awkward?', options: ['Skip', 'End with smile', 'Quit', 'Speed up'], correct: 1, explain: 'Brain doesn\'t separate forced from real.' },
  ],
  16: [
    { q: 'Cold shower starting duration?', options: ['5s', '30s', '2 min', '10 min'], correct: 1, explain: '30s = sustainable start.' },
    { q: 'Cold shower depression risk drop?', options: ['5%', '15%', '29%', '50%'], correct: 2, explain: 'Wim Hof — 29% drop.' },
  ],
  17: [
    { q: 'Home workout duration?', options: ['1 min', '5 min', '30 min', '60 min'], correct: 1, explain: '5 min suffices — consistency matters.' },
    { q: 'Consistency vs intensity?', options: ['Intensity', 'Consistency', 'Equal', 'Neither'], correct: 1, explain: 'Daily 5 min > weekly 1 hour.' },
  ],
  18: [
    { q: 'Intermittent fasting hours?', options: ['8h', '12-16h', '24h', '48h'], correct: 1, explain: '12-16h = sustainable IF.' },
    { q: 'Allowed during IF?', options: ['Only water', 'Water + coffee + tea', 'Milk', 'Diet coke'], correct: 1, explain: 'Calorie-free drinks don\'t spike insulin.' },
  ],
  19: [
    { q: '10 pages × 365 days = ?', options: ['2 books', '6 books', '12 books', '50 books'], correct: 2, explain: '~12 books a year.' },
    { q: 'Average yearly books read?', options: ['12', '6', '3', '0'], correct: 3, explain: 'Most read 0 a year.' },
  ],
  20: [
    { q: 'Morning journal rule?', options: ['Be perfect', 'Write without judging', 'Censor', 'Digital'], correct: 1, explain: 'Write without judging — empty the brain.' },
    { q: 'Who developed morning pages?', options: ['James Clear', 'Cal Newport', 'Julia Cameron', 'Tim Ferriss'], correct: 2, explain: 'Cameron — 30 years of testing.' },
  ],
  21: [
    { q: 'Walk depression risk drop?', options: ['5%', '15%', '47%', '80%'], correct: 2, explain: '47% drop science-proven.' },
    { q: 'Walking raises which protein?', options: ['BDNF', 'Insulin', 'Cortisol', 'Adrenaline'], correct: 0, explain: 'BDNF = neuron growth.' },
  ],
  22: [
    { q: 'Morning music effect?', options: ['Takes mental space', 'Always good', 'Neutral', 'Unknown'], correct: 0, explain: 'Music takes mental space — silence makes thinking room.' },
    { q: 'First-hour silence challenging?', options: ['Never', 'Maybe', 'Yes', 'No'], correct: 2, explain: 'Discomfort with silence is normal, passes.' },
  ],
  23: [
    { q: 'Peak willpower in morning?', options: ['Evening', 'Noon', 'First 90 min', 'Never'], correct: 2, explain: 'First 90 min = golden window.' },
    { q: 'Phoneless to 9am productivity?', options: ['None', '50%', '3x', '10x'], correct: 2, explain: '3x productivity 9-12.' },
  ],
  24: [
    { q: 'Best morning breakfast?', options: ['Sweet', 'High protein', 'Coffee only', 'Bread-honey'], correct: 1, explain: 'Protein = 4-hour fullness.' },
    { q: '30g protein delivers?', options: ['Weight', '4h fullness', 'Sugar', 'Thirst'], correct: 1, explain: '4h fullness + focus.' },
  ],
  25: [
    { q: 'Sunday reset duration?', options: ['5 min', '30 min', '2h', '1 day'], correct: 1, explain: '30 min suffices.' },
    { q: 'Sunday reset when?', options: ['Morning', 'Night', 'Evening', 'Anytime'], correct: 0, explain: 'Morning = clear review.' },
  ],
  26: [
    { q: 'Habit stacking by whom?', options: ['BJ Fogg', 'James Clear', 'Cal Newport', 'Tim Ferriss'], correct: 1, explain: 'Atomic Habits — James Clear.' },
    { q: 'Stack formula?', options: ['New alone', 'Old + new', 'Only new', '3 new'], correct: 1, explain: 'Old habit + new = strong chain.' },
  ],
  27: [
    { q: 'After 100 days?', options: ['Boredom', 'Hard to stop', 'Same', 'Unknown'], correct: 1, explain: 'After 100 no return.' },
    { q: '60-100 day phase?', options: ['Strain', 'Adapt', 'Become it', 'Tire'], correct: 2, explain: 'Become it — identity shift.' },
  ],
  28: [
    { q: '"I am" vs "I try" power?', options: ['Same', '2x', '5x', '10x'], correct: 3, explain: 'Identity 10x stronger.' },
    { q: 'Discipline = ?', options: ['Behavior', 'Identity', 'Plan', 'Motivation'], correct: 1, explain: 'Discipline = identity > behavior.' },
  ],
  29: [
    { q: 'On final day do?', options: ['Plan future', 'Look at past', 'Write proof', 'Rest'], correct: 2, explain: '3 strong moments = your proof.' },
    { q: 'Tomorrow brings?', options: ['New start', 'Completion', 'End', 'Nothing'], correct: 1, explain: 'Day 30 = completion.' },
  ],
  30: [
    { q: 'After 30 days, difference?', options: ['None', 'Proactive vs reactive', 'Same', 'Worse'], correct: 1, explain: 'Reactive to proactive shift.' },
    { q: 'Switching to next path?', options: ['Immediately', 'Rest 3 days', 'Wait month', 'Never'], correct: 1, explain: 'Rest 3 days, then move on.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Apply
// ─────────────────────────────────────────────────────────────────────────────
function buildLessons(newContent, quizMap, protips) {
  const out = {};
  // Pro tips for 1-5
  for (const [order, tip] of Object.entries(protips)) {
    out[order] = { proTip: tip };
  }
  // New 6-30
  for (const [order, lesson] of Object.entries(newContent)) {
    out[order] = {
      title: lesson.title,
      teaching: lesson.teaching,
      action: lesson.action,
      reflectionPrompt: lesson.reflectionPrompt,
      proTip: lesson.proTip,
      quiz: quizMap[order] || [],
    };
  }
  return out;
}

function applyToFile(filePath, pathId, lessonsMerge) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.lessons[pathId]) data.lessons[pathId] = {};
  for (const [order, fields] of Object.entries(lessonsMerge)) {
    data.lessons[pathId][order] = {
      ...(data.lessons[pathId][order] || {}),
      ...fields,
    };
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

const TR_MERGE = buildLessons(NEW_TR, QUIZ_TR, PROTIPS_TR);
const EN_MERGE = buildLessons(NEW_EN, QUIZ_EN, PROTIPS_EN);

applyToFile(
  path.join(__dirname, '..', 'src', 'i18n', 'locales', 'lessons.tr.json'),
  'silent-morning',
  TR_MERGE,
);
applyToFile(
  path.join(__dirname, '..', 'src', 'i18n', 'locales', 'lessons.en.json'),
  'silent-morning',
  EN_MERGE,
);

console.log(`✓ Silent Morning seeded — ${Object.keys(NEW_TR).length} new lessons + 5 pro tips × 2 langs`);
