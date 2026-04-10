import { MissionDefinition, Path } from '../types';

type RawMissionDefinition = Omit<MissionDefinition, 'unitId' | 'unitTitle' | 'unitOrder'>;
type LessonSeed = Omit<RawMissionDefinition, 'id' | 'path' | 'minLevel'>;

interface UnitMeta {
  id: string;
  title: string;
  order: number;
}

const unitTitles: Record<Path, [string, string, string]> = {
  fitness: ['Hareket Temeli', 'Sistem Kur', 'Performans Ritmi'],
  culture: ['Ogrenme Temeli', 'Derinlik Kur', 'Kulturel Sistem'],
  social: ['Temas Temeli', 'Bag Kur', 'Guvenli Tekrar'],
  entertainment: ['Bilincli Tuketim', 'Secim Disiplini', 'Zevk Sistemi'],
  career: ['Odak Temeli', 'Icra Disiplini', 'Profesyonel Review'],
  general: ['Gunluk Temel', 'Sistem Kur', 'Yon Netlestir'],
};

const pathPrefixes: Record<Path, string> = {
  fitness: 'fit',
  culture: 'cul',
  social: 'soc',
  entertainment: 'ent',
  career: 'car',
  general: 'gen',
};

const levelPatternByUnit = [
  [1, 1, 1, 2, 2, 2, 2],
  [3, 3, 3, 4, 4, 4, 4],
  [5, 5, 5, 6, 6, 7, 7],
] as const;

const getUnitMetaForLesson = (path: Path, minLevel: number): UnitMeta => {
  if (minLevel <= 2) {
    return {
      id: `${path}-unit-1`,
      title: unitTitles[path][0],
      order: 1,
    };
  }

  if (minLevel <= 4) {
    return {
      id: `${path}-unit-2`,
      title: unitTitles[path][1],
      order: 2,
    };
  }

  return {
    id: `${path}-unit-3`,
    title: unitTitles[path][2],
    order: 3,
  };
};

const attachUnitMeta = (path: Path, lessons: RawMissionDefinition[]): MissionDefinition[] =>
  lessons.map((lesson) => {
    const unitMeta = getUnitMetaForLesson(path, lesson.minLevel);

    return {
      ...lesson,
      unitId: unitMeta.id,
      unitTitle: unitMeta.title,
      unitOrder: unitMeta.order,
    };
  });

const buildTrack = (path: Path, units: [LessonSeed[], LessonSeed[], LessonSeed[]]): RawMissionDefinition[] =>
  units.flatMap((unitLessons, unitIndex) =>
    unitLessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `${pathPrefixes[path]}-${unitIndex * 7 + lessonIndex + 1}`,
      path,
      minLevel: levelPatternByUnit[unitIndex][lessonIndex],
    })),
  );

const fitnessTrack = buildTrack('fitness', [
  [
    {
      title: 'Mikro hareket baslangici',
      teaching: 'Davranis degisimi buyuk patlamalarla degil, tekrar edilebilir mikro eforlarla kurulur.',
      action: 'Bugun 10 dakikalik tempolu yuruyus yap ve donunce bir bardak su ic.',
      variantActions: {
        support: 'Bugun sadece 5 dakikalik tempolu yuruyus yap ve donunce su ic.',
        stretch: 'Bugun 15 dakikalik tempolu yuruyus yap ve son 2 dakikada hizlan.',
      },
      reflectionPrompt: 'Baslamayi kolaylastiran sey neydi, zorlastiran sey neydi?',
      rewardXp: 15,
    },
    {
      title: 'Protein farkindaligi',
      teaching: 'Enerji ve tokluk, gun icindeki protein dagilimindan beklediginden daha fazla etkilenir.',
      action: 'Bir sonraki ogunune belirgin bir protein kaynagi ekle ve ne sectigini not et.',
      reflectionPrompt: 'Bu ekleme seni daha tok veya daha kontrollu hissettirdi mi?',
      rewardXp: 15,
    },
    {
      title: 'Spor ortamini hazirla',
      teaching: 'Spora direncin cogu egzersizin kendisinden degil, hazirlik surtunmesinden gelir.',
      action: 'Yarin icin spor kiyafetini, su siseni ve ayakkabini simdiden hazirla.',
      reflectionPrompt: 'Hazirlik yapinca yarina baslamak zihninde daha kolay gorundu mu?',
      rewardXp: 15,
    },
    {
      title: 'Adim hedefi kur',
      teaching: 'Olculen hedefler soyut niyetlerden daha cok tekrar edilir.',
      action: 'Bugun kendine makul bir adim hedefi belirle ve gun bitmeden kontrol et.',
      reflectionPrompt: 'Hedef koymak hareket istegini etkiledi mi?',
      rewardXp: 20,
    },
    {
      title: 'Esneme acilisi',
      teaching: 'Kisa bir acilis rutini, beynine hareketin basladigi sinyalini verir.',
      action: 'Yuruyus veya spor oncesi 3 dakikalik boyun, omuz ve kalca esnetmesi yap.',
      reflectionPrompt: 'Acilis ritueli baslamayi kolaylastirdi mi?',
      rewardXp: 20,
    },
    {
      title: 'Abur cubur gorunurlugu',
      teaching: 'Ne yedigin sadece irade ile degil, gozunun ne gordugu ile de belirlenir.',
      action: 'Bugun seni zorlayan bir atistirmaligi gorunur yerden kaldir ve yerine su veya meyve koy.',
      reflectionPrompt: 'Ortami degistirmek secimlerini etkiledi mi?',
      rewardXp: 20,
    },
    {
      title: 'Ilk haftayi kapat',
      teaching: 'Ilk hedef kusursuzluk degil, bedenine hareket eden biri oldugunu kanitlamaktir.',
      action: 'Bu haftadan tekrar etmek istedigin iki mikro davranisi sec ve yaz.',
      reflectionPrompt: 'Hangisi sana en dogal gelen temel oldu?',
      rewardXp: 20,
    },
  ],
  [
    {
      title: 'Kisa kuvvet rutini',
      teaching: 'Tutarlilik icin kusursuz programdan cok tekrar edilebilir mini rutin gerekir.',
      action: 'Bugun 3 tur: 10 squat, 5 push-up varyasyonu ve 20 saniye plank yap.',
      variantActions: {
        support: 'Bugun 2 tur: 8 squat, 4 push-up varyasyonu ve 15 saniye plank yap.',
        stretch: 'Bugun 4 tur: 12 squat, 6 push-up ve 30 saniye plank yap.',
      },
      reflectionPrompt: 'En zor gelen bolum neydi ve neyi kolaylastirabilirsin?',
      rewardXp: 25,
    },
    {
      title: 'Antrenman zamani sabitle',
      teaching: 'Aliskanlik, zaman belirsiz kaldiginda degil takvimde yeri oldugunda guclenir.',
      action: 'Bu hafta icin iki hareket zamanini gun ve saat olarak belirle.',
      reflectionPrompt: 'Takvimlestirmek disiplini daha gercek kildi mi?',
      rewardXp: 25,
    },
    {
      title: 'Yuruyusu guce cevir',
      teaching: 'Ayni aktiviteyi biraz daha niyetli yapmak, fitness hissini hizli arttirir.',
      action: 'Bugunki yuruyuste 3 kez 45 saniyelik hizlanma bolumu ekle.',
      variantActions: {
        support: 'Bugunki yuruyuste 2 kez 30 saniyelik hizlanma bolumu ekle.',
        stretch: 'Bugunki yuruyuste 4 kez 60 saniyelik hizlanma bolumu ekle.',
      },
      reflectionPrompt: 'Hiz degisimi beden algini degistirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Lif ve tokluk',
      premiumPlanTag: 'support',
      teaching: 'Sadece ne kadar yedigin degil, ne kadar tok kaldigin da sistemi belirler.',
      action: 'Bugun bir ogunune sebze, salata veya lifli bir eslik ekle.',
      reflectionPrompt: 'Bu ekleme ogun kaliteni nasil etkiledi?',
      rewardXp: 25,
    },
    {
      title: 'Hareketten once ekran freni',
      premiumPlanTag: 'stretch',
      teaching: 'Antrenman once ekran kaymasi, enerjiyi ve niyeti kolayca emer.',
      action: 'Bugun hareketten onceki 10 dakikada telefonu birak ve sadece hazirlan.',
      reflectionPrompt: 'Telefonsuz gecis hareket direncini azaltabildi mi?',
      rewardXp: 25,
    },
    {
      title: 'Toparlanma gece rutini',
      teaching: 'Uyku kotuyse disiplin zayiflar; toparlanma antrenman kadar sistemin parcasi.',
      action: 'Bu gece icin net bir uyku saati belirle ve son 20 dakikayi ekran olmadan gecir.',
      reflectionPrompt: 'Erken kapanis yarina bakisini degistirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Ikinci unit review',
      teaching: 'Sistem kurmak, davranislari tek tek yapmak kadar hangi parcanin seni tasidigini gormeyi de gerektirir.',
      action: 'Sana en cok guc veren hareket, beslenme ve hazirlik davranisini birer cumleyle yaz.',
      reflectionPrompt: 'Hangi davranis senden en az irade istiyor?',
      rewardXp: 30,
    },
  ],
  [
    {
      title: 'Haftalik hareket plani',
      teaching: 'Fit kalmayi belirleyen sey tek bir guclu gun degil, haftaya yayilan tekrar duzenidir.',
      action: 'Onumuzdeki 7 gun icin 3 hareket zamani sec ve takvimine yaz.',
      reflectionPrompt: 'Planli gunler seni daha guvende mi hissettirdi?',
      rewardXp: 30,
    },
    {
      title: 'Kuvvette ilerleme notu',
      teaching: 'Gelisim hissi, tekrar sayisi veya sure gibi gorunur olculerle hizlanir.',
      action: 'Bugun yaptigin mini rutinde bir olcuyu not et: tur, tekrar veya sure.',
      reflectionPrompt: 'Olcum almak seni daha odakli yapti mi?',
      rewardXp: 30,
    },
    {
      title: 'Beslenme tetikleyicisi sec',
      teaching: 'Saglikli secimlerin tekrar etmesi icin karar aninda degil, once tetikleyici gerekir.',
      action: 'Yarin icin tek bir ogunde kullanacagin saglikli secim tetigini belirle.',
      reflectionPrompt: 'Tetikleyici belirlemek secimi kolaylastirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Durgun gun protokolu',
      teaching: 'Sistemler en cok motivasyonsuz gunlerde seni ayakta tuttugunda degerlidir.',
      action: 'Enerjin dusukse uygulayacagin minimum fitness planini yaz: sure, hareket, bitis kriteri.',
      reflectionPrompt: 'Dusuk enerji gunu icin net plan yapmak seni rahatlatti mi?',
      rewardXp: 30,
    },
    {
      title: 'Dis ortama uyum',
      teaching: 'Saglikli sistem, sadece ideal ev gunlerinde degil disari cikilan gunlerde de calisir.',
      action: 'Yarin programin bozulursa uygulayacagin 10 dakikalik yedek hareket planini hazirla.',
      reflectionPrompt: 'Yedek plan, sistemini daha esnek hissettirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Kendine koçluk et',
      teaching: 'Kalici disiplin, ne yapacagini bilmenin yaninda kendine nasil konustugunu da guclendirir.',
      action: 'Bugun zorlandigin bir anda kendine soyleyecegin destekleyici tek cumleyi yaz.',
      reflectionPrompt: 'Bu cumle gelecekteki direnci azaltabilir mi?',
      rewardXp: 35,
    },
    {
      title: '30 gunluk omurga',
      teaching: 'Uzun vadeli fitness, muthis motivasyon degil tekrar eden omurga davranislari ister.',
      action: 'Gelecek ay icin koruyacagin 3 temel davranisi sec: hareket, beslenme ve toparlanma.',
      reflectionPrompt: 'Bu omurga seni daha gercek bir sisteme tasiyor mu?',
      rewardXp: 35,
    },
  ],
]);

const cultureTrack = buildTrack('culture', [
  [
    {
      title: '10 dakikalik okuma',
      teaching: 'Okuma aliskanligi hacimle degil, duzenli tekrar ile kurulur.',
      action: 'Bugun 10 dakika boyunca tek bir yazi veya kitap bolumu oku.',
      variantActions: {
        support: 'Bugun sadece 6 dakika boyunca dikkat dagitmadan tek bir yazi oku.',
        stretch: 'Bugun 15 dakika boyunca tek bir metne odaklan ve sonunda bir not cikar.',
      },
      reflectionPrompt: 'Dikkatini dagitan sey neydi, devam etmeyi kolaylastiran sey neydi?',
      rewardXp: 15,
    },
    {
      title: 'Tek fikir notu',
      teaching: 'Gercek ogrenme, tuketilen icerigi kendi cumlene cevirdiginde baslar.',
      action: 'Bugun ogrendiginden tek bir fikir sec ve kendi cumlenle bir not yaz.',
      reflectionPrompt: 'Bu fikri neden secmis oldun?',
      rewardXp: 15,
    },
    {
      title: 'Merak sorusu sor',
      teaching: 'Kultur, pasif biriktirme degil iyi sorular sormayi ogrenmektir.',
      action: 'Bugun okudugun veya izledigin seyden sonra tek bir merak sorusu yaz.',
      reflectionPrompt: 'Soruyu kurmak seni konuya daha cok bagladi mi?',
      rewardXp: 15,
    },
    {
      title: 'Kalemle oku',
      teaching: 'Isaretleme yapmak, okudugunu daha aktif hale getirir ve dikkat kaybini azaltir.',
      action: 'Bugun okurken en az iki cumleyi isaretle ya da altini ciz.',
      reflectionPrompt: 'Metni daha yavas ama daha derin mi okudun?',
      rewardXp: 20,
    },
    {
      title: 'Ozet sesli anlatim',
      teaching: 'Bir seyi anlatabilmek, onu gercekten anlayip anlamadiginin hizli testidir.',
      action: 'Bugun ogrendigini kendi kendine 3 cumlede sesli olarak anlat.',
      reflectionPrompt: 'Hangi noktada duraksadin ya da eksik hissettin?',
      rewardXp: 20,
    },
    {
      title: 'Dikkat alani temizligi',
      teaching: 'Okuma ve ogrenmede kalite, bilgi kadar dikkat ortamindan da dogar.',
      action: 'Bugunki ogrenme bolumunde masandaki veya ekrandaki tek bir dikkat dagiticiyi kaldir.',
      reflectionPrompt: 'Daha temiz ortam dikkatini etkiledi mi?',
      rewardXp: 20,
    },
    {
      title: 'Temel tekrar review',
      teaching: 'Bilgi birikiminin ilk katmani, neyi tekrar etmek istedigini secmekle kurulur.',
      action: 'Ilk unitten geri donmek istedigin iki fikir ve bir zayif nokta yaz.',
      reflectionPrompt: 'En cok hangi konuda daha derine gitmek istiyorsun?',
      rewardXp: 20,
    },
  ],
  [
    {
      title: 'Planli tekrar',
      teaching: 'Tek seferlik ogrenme hizli silinir; kisa tekrar, bilgiyi kalici hale getirir.',
      action: 'Dun veya gecen hafta ogrendiginden bir notu ac ve 5 dakikalik tekrar yap.',
      reflectionPrompt: 'Hatirlamak kolay mi geldi yoksa beklediginden zor mu?',
      rewardXp: 25,
    },
    {
      title: 'Kaynak secimi filtresi',
      teaching: 'Daha cok icerik degil, daha iyi secilmis kaynaklar kulturu hizli buyutur.',
      action: 'Bugun tuketecegin bir kaynagi sadece kalite kriteriyle sec ve nedenini not et.',
      reflectionPrompt: 'Kalite filtresi secimini degistirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Iki kaynagi bagla',
      teaching: 'Gercek kultur, ayri fikirler arasinda bag kurdugunda derinlesir.',
      action: 'Bu hafta ogrendiginden iki farkli fikir bul ve aralarindaki baglantiyi yaz.',
      reflectionPrompt: 'Bag kurmak konuyu daha canli hissettirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Tek tema haftasi',
      teaching: 'Daginik ogrenme yerine temali ogrenme, zihinde daha guclu aglar kurar.',
      action: 'Onumuzdeki 7 gun icin tek bir ogrenme temasi sec ve ona uygun bir kaynak belirle.',
      reflectionPrompt: 'Tema secmek seni daha odakli hissettirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Kisa arastirma notu',
      teaching: 'Bir konuyu sadece tuketmekle kalmayip arastirmak, pasif meraki aktif bilgiye cevirir.',
      action: 'Bugun ilgini ceken tek bir konuyu 10 dakikalik arastir ve 3 maddelik not cikar.',
      reflectionPrompt: 'Arastirma yapmak sahiplik hissini artirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Karsit gorus deneyi',
      teaching: 'Kulturel derinlik sadece onayladigini degil, farkli bakisi da inceleyebildiginde buyur.',
      action: 'Bugun bir konuda kendi gorusunden farkli tek bir bakis acisi oku ya da dinle.',
      reflectionPrompt: 'Karsit bakis seni savunmaya mi, dusunmeye mi itti?',
      rewardXp: 25,
    },
    {
      title: 'Ikinci unit kapanisi',
      teaching: 'Derinlik kurmak, artik neyi ogrendigini degil neyi daha bilincli sececegini gormektir.',
      action: 'Sana en cok deger veren kaynak tipi, tema ve not alma bicimini yaz.',
      reflectionPrompt: 'Hangi ogrenme bicimi sende daha cok enerji aciyor?',
      rewardXp: 30,
    },
  ],
  [
    {
      title: 'Haftalik okuma omurgasi',
      teaching: 'Kalici kultur birikimi, ilham geldikce degil ritim kuruldugunda buyur.',
      action: 'Haftalik 3 ogrenme blogu belirle ve her biri icin ne tuketecegini yaz.',
      reflectionPrompt: 'Ritim kurmak bilgiye bakisini degistirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Ogrenilenle uret',
      teaching: 'Bir bilgiyi kullanmak, onu sahiplenmenin en hizli yoludur.',
      action: 'Bugun ogrendiginden ilhamla kisa bir paragraf, mesaj veya yorum uret.',
      reflectionPrompt: 'Uretmek bilgiyi sende daha canli kildi mi?',
      rewardXp: 30,
    },
    {
      title: 'Kultur listesi kur',
      teaching: 'Rastgele tuketim yerine secilmis bir liste, meraki daginikliktan kurtarir.',
      action: 'Okumak, izlemek veya arastirmak istedigin 5 seylik bir liste olustur.',
      reflectionPrompt: 'Liste kurmak karar yorgunlugunu azaltti mi?',
      rewardXp: 30,
    },
    {
      title: 'Bilgiyi baskasina aktar',
      teaching: 'Kalici kultur, kendine biriktirdiginden fazlasini paylasabildiginde guclenir.',
      action: 'Bugun ogrendiginden tek bir fikri birine ya da bir not alanina aktar.',
      reflectionPrompt: 'Aktarmak zihnindeki aciklari ortaya cikardi mi?',
      rewardXp: 30,
    },
    {
      title: 'Kaynak diyeti',
      teaching: 'Her kaliteli sey faydali olsa da ayni anda cok kaynak odagi bozar.',
      action: 'Bu hafta tuketmeyecegin iki daginik kaynak tipini bilincli olarak ele.',
      reflectionPrompt: 'Azaltmak daha net hissettirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Kendi kultur tanimin',
      teaching: 'Basarili sistemler disaridan gelen tavsiyeleri kopyalamaz; kendine uygun standart kurar.',
      action: 'Senin icin iyi bir kultur rutininin 3 ilkesini yaz.',
      reflectionPrompt: 'Bu ilkeler seni daha sahipli hissettirdi mi?',
      rewardXp: 35,
    },
    {
      title: '30 gunluk ogrenme sistemi',
      teaching: 'Gercek deger, tek tek derslerden cok seni tasiyan 30 gunluk omurgada dogar.',
      action: 'Gelecek ay icin koruyacagin 3 davranisi sec: tuketim, not alma, tekrar.',
      reflectionPrompt: 'Bu omurga sana daha uzun vadeli bir kimlik veriyor mu?',
      rewardXp: 35,
    },
  ],
]);

const socialTrack = buildTrack('social', [
  [
    {
      title: 'Acik uc sorusu',
      teaching: 'Iyi sohbet, karsi tarafi konusturan acik uc sorularla derinlesir.',
      action: 'Bugun birine evet-hayir yerine acik uc bir soru sor.',
      variantActions: {
        support: 'Bugun sadece tek bir kisiden kisa da olsa acik uc cevap alacak soru sor.',
        stretch: 'Bugun bir sohbette art arda iki acik uc soru sorup sohbeti biraz derinlestir.',
      },
      reflectionPrompt: 'Sohbetin tonu degisti mi? Karsi taraf nasil tepki verdi?',
      rewardXp: 15,
    },
    {
      title: 'Telefonsuz dinleme',
      teaching: 'Dikkat, sosyal guven ve baglantinin en gorunur para birimidir.',
      action: 'Bugun 5 dakikalik bir konusmada telefonu eline alma ve goz temasi kur.',
      variantActions: {
        support: 'Bugun 3 dakikalik bir konusmada telefonu eline alma ve goz temasi kur.',
        stretch: 'Bugun bir konusma boyunca telefonu hic eline alma ve duydugun bir seyi yansit.',
      },
      reflectionPrompt: 'Tam dikkat verince ne fark ettin?',
      rewardXp: 15,
    },
    {
      title: 'Kisa temas kur',
      teaching: 'Ozguvenin buyuk kismi kusursuzluk degil, kisa ama bilincli tekrarlarla gelir.',
      action: 'Bugun kisa da olsa yeni birine selam ver veya bir soru sor.',
      variantActions: {
        support: 'Bugun sadece yeni birine kisa bir selam ver ya da cok kucuk bir soru sor.',
        stretch: 'Bugun yeni biriyle kisa temas kur ve sohbeti bir soru daha sorarak uzat.',
      },
      reflectionPrompt: 'Beklediginden daha kolay mi, daha zor mu geldi?',
      rewardXp: 15,
    },
    {
      title: 'Isimle hitap et',
      teaching: 'Insanlar duyulduklarini sadece cevaplarla degil, ozel olarak fark edildiklerinde hisseder.',
      action: 'Bugun bir konusmada karsi tarafin adini kullanarak hitap et.',
      reflectionPrompt: 'Isim kullanmak sohbeti farkli hissettirdi mi?',
      rewardXp: 20,
    },
    {
      title: 'Konusma topunu geri at',
      teaching: 'Sohbeti surduren sey sadece konusmak degil, topu bilincli bicimde geri atmaktir.',
      action: 'Bugun bir cevap verdikten sonra karsi tarafa ek bir soru sor.',
      reflectionPrompt: 'Sohbetin suresi veya derinligi degisti mi?',
      rewardXp: 20,
    },
    {
      title: 'Kucuk iltifat',
      teaching: 'Dogru zamanda verilen kisa ve samimi bir olumlu gozlem bag kurmayi kolaylastirir.',
      action: 'Bugun birine samimi ama kisa bir olumlu gozlemini soyle.',
      reflectionPrompt: 'Bunu soylemek sende nasil hissettirdi?',
      rewardXp: 20,
    },
    {
      title: 'Ilk unit review',
      teaching: 'Sosyal gelisim, hangi davranisin sende dogal aktigini gormekle hizlanir.',
      action: 'Selam, soru ve dinleme arasinda sende en rahat akan iki davranisi yaz.',
      reflectionPrompt: 'Hangisi sende daha cok direnc yaratti?',
      rewardXp: 20,
    },
  ],
  [
    {
      title: 'Yansitmali dinleme',
      teaching: 'Insanlar en cok duyulduklarini hissettiklerinde bag kurar.',
      action: 'Bugun biri konusurken cevap vermeden once onun dedigini bir cumleyle ozetle.',
      reflectionPrompt: 'Bu teknik karsilikli guveni etkiledi mi?',
      rewardXp: 25,
    },
    {
      title: 'Merakla derinlestir',
      teaching: 'Yuzeysel sohbetten derine gecis, iyi ikinci sorularla olur.',
      action: 'Bugun biri bir sey anlattiginda neden veya nasil sorusuyla bir katman daha ac.',
      reflectionPrompt: 'Ikinci soru sohbetin kalitesini degistirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Sessizlikten kacma',
      teaching: 'Kisa sessizlikler sosyal tehdit degil, dusunme alani olabilir.',
      action: 'Bir sohbette sessizlik oldugunda hemen konu degistirme; 3 saniye bekle.',
      reflectionPrompt: 'Sessizlige dayanmak sandigindan daha kolay miydi?',
      rewardXp: 25,
    },
    {
      title: 'Gonullu aciklik',
      teaching: 'Sadece soru sormak degil, kucuk bir aciklik gostermek de yakinlik kurar.',
      action: 'Bugun bir sohbette kendinden kucuk ama gercek bir detay paylas.',
      reflectionPrompt: 'Aciklik gostermek sende ne hissettirdi?',
      rewardXp: 25,
    },
    {
      title: 'Takip sorusu',
      teaching: 'Insanlar en cok hatirlandiklarini hissettiklerinde bag kurar.',
      action: 'Daha once duydugun bir konuyu birine tekrar sor ya da follow-up yap.',
      reflectionPrompt: 'Hatirlamak karsi tarafta nasil bir etki yaratti?',
      rewardXp: 25,
    },
    {
      title: 'Mini bulusma cesareti',
      teaching: 'Sosyal gelisim sadece anlik sohbet degil, baglari takibe cevirebilmektir.',
      action: 'Bugun birine kahve, yuruyus veya kisa bir bulusma onerisi gonder.',
      reflectionPrompt: 'Teklif etmek beklendiginden daha mi zor geldi?',
      rewardXp: 25,
    },
    {
      title: 'Ikinci unit review',
      teaching: 'Bag kurmak, artik sadece sohbet acmak degil sosyal ritim kurabilmek demektir.',
      action: 'Sende en iyi calisan bag kurma davranisini ve en zor gelen noktayi yaz.',
      reflectionPrompt: 'Bir sonraki unitede neyi daha cok pratik etmek istiyorsun?',
      rewardXp: 30,
    },
  ],
  [
    {
      title: 'Planli sosyal tekrar',
      teaching: 'Sosyal gelisim tesadufe birakildiginda yavaslar; planli temas guvenli tekrar yaratir.',
      action: 'Onumuzdeki 3 gun icinde kurmak istedigin tek bir sosyal temasi planla.',
      reflectionPrompt: 'Planli olmak kaygiyi azaltip hareketi kolaylastirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Karsi tarafi rahatlat',
      teaching: 'Guclu sosyal insanlar sadece kendini degil karsi tarafin rahatligini da tasir.',
      action: 'Bugun bir sohbette karsi tarafin anlattigini kolaylastiran kisa bir kabul cumlesi kullan.',
      reflectionPrompt: 'Bu kabul sohbeti daha yumusak hale getirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Topluluga adim at',
      teaching: 'Bire bir rahatlik guzel, ama gelisim bir topluluk ortaminda sinandiginda derinlesir.',
      action: 'Bugun kucuk bir grup ortaminda en az bir kez gorunur sekilde soz al.',
      reflectionPrompt: 'Grup ortami enerjini nasil etkiledi?',
      rewardXp: 30,
    },
    {
      title: 'Sinir ve nezaket dengesi',
      teaching: 'Saglam sosyal beceri sadece uyum degil, gerektiginde net sinir da kurabilmektir.',
      action: 'Bugun istemedigin bir seye nazik ama net bir sinir cumlesi hazirla ya da kullan.',
      reflectionPrompt: 'Net olmak senden ne aldi, ne verdi?',
      rewardXp: 30,
    },
    {
      title: 'Sosyal enerji yonetimi',
      teaching: 'Iyi iliskiler, kendini tuketmeden bag kurabildiginde surdurulebilir olur.',
      action: 'Seni besleyen ve yoran sosyal durumlari iki ayri listeye yaz.',
      reflectionPrompt: 'Enerji haritasi sende hangi farkindaligi yaratti?',
      rewardXp: 30,
    },
    {
      title: 'Kendi sosyal ilkelerin',
      teaching: 'Gercek guven, baskalarinin tarziyla degil kendi ilkelerinle hareket ettiginde gelir.',
      action: 'Senin icin iyi bir sohbetin 3 ilkesini yaz.',
      reflectionPrompt: 'Bu ilkeler seni daha sahipli hissettirdi mi?',
      rewardXp: 35,
    },
    {
      title: '30 gunluk iliski omurgasi',
      teaching: 'Kalici sosyal guc, arada bir cesur anlardan degil tekrar eden iliski omurgasindan gelir.',
      action: 'Gelecek ay icin koruyacagin 3 sosyal davranisi sec: temas, dinleme, takip.',
      reflectionPrompt: 'Bu omurga seni daha guvenli birine donusturuyor mu?',
      rewardXp: 35,
    },
  ],
]);

const entertainmentTrack = buildTrack('entertainment', [
  [
    {
      title: 'Bilincli secim',
      teaching: 'Kaliteli tuketim, ne izlediginden once neden izledigini bilmekle baslar.',
      action: 'Bugun acmadan once izleyecegin tek icerigi bilincli olarak sec.',
      variantTeaching: {
        support: 'Bugun amac kusursuz secim degil, algoritmaya kapilmadan tek bir bilincli secim yapabilmek.',
        stretch: 'Bugun sadece secim yapmakla kalma; neden o icerigi sectigini da netlestir.',
      },
      reflectionPrompt: 'Secimi sen mi yaptin yoksa algoritma mi?',
      rewardXp: 15,
    },
    {
      title: 'Tek ekran, tek niyet',
      teaching: 'Daginik tuketim deneyimi yogunlastirmaz; tek ekrana ve tek niyete ihtiyac duyar.',
      action: 'Bugun tuketime baslamadan once tum diger sekmeleri veya ekranlari kapat.',
      reflectionPrompt: 'Tek kanala dusmek deneyimi daha farkli kildi mi?',
      rewardXp: 15,
    },
    {
      title: 'Sonrasi notu',
      teaching: 'Pasif tuketim yerine kisa not, izledigin seyi deneyime cevirir.',
      action: 'Izledigin veya dinledigin seyden sonra tek bir cikarim yaz.',
      variantActions: {
        support: 'Izledigin veya dinledigin seyden sonra sadece tek bir cumlelik cikarim yaz.',
        stretch: 'Izledigin veya dinledigin seyden sonra iki cikarim ve bir elestiri notu yaz.',
      },
      reflectionPrompt: 'Bu icerik sende hangi dusunceyi tetikledi?',
      rewardXp: 15,
    },
    {
      title: 'Bitis saatini sec',
      teaching: 'Kaliteyi korumanin bir yolu da bitis anini bilincli secmektir.',
      action: 'Bugun tuketimine baslamadan once bitis saatini belirle.',
      reflectionPrompt: 'Sinir koymak deneyimi bozdu mu, daha bilincli mi yapti?',
      rewardXp: 20,
    },
    {
      title: 'Skrolldan cikis noktasi',
      teaching: 'Zevki bozan sey her zaman icerik degil, cikis noktasinin belirsiz olmasidir.',
      action: 'Bugun tuketimi bir sinyal ile bitir: bolum sonu, saat, ya da tek liste elemani.',
      reflectionPrompt: 'Cikis noktasini bilmek kontrol hissini artirdi mi?',
      rewardXp: 20,
    },
    {
      title: 'Tuketim ortamini sec',
      teaching: 'Nerede tuktettigin, ne kadar odakli ve zevkli tuketecegini belirler.',
      action: 'Bugun tuketimi bilincli bir ortamda yap: kulaklik, isik, dikkat dagitici olmadan.',
      reflectionPrompt: 'Ortami degistirmek deneyimi kalitelestirdi mi?',
      rewardXp: 20,
    },
    {
      title: 'Ilk unit review',
      teaching: 'Bilincli tuketim, artik algoritmadan kacinmayi degil kendi secim ritmini gormeyi gerektirir.',
      action: 'Secim, bitis ve not alma arasinda sende en iyi calisan iki davranisi yaz.',
      reflectionPrompt: 'Seni en cok dagitan nokta ne oldu?',
      rewardXp: 20,
    },
  ],
  [
    {
      title: 'Tema sec',
      teaching: 'Rastgele tuketim yerine temali tuketim, zevkini ve yorum gucunu derinlestirir.',
      action: 'Bu hafta tek bir tur veya yonelim secip buna gore icerik sec.',
      reflectionPrompt: 'Tema secmek tercihlerini netlestirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Karsilastirmali bakis',
      teaching: 'Ayni tur icinde farkli isleri karsilastirmak, zevkini daha keskin hale getirir.',
      action: 'Bugun tukettigin seyi benzer bir is ile tek fark uzerinden karsilastir.',
      reflectionPrompt: 'Karsilastirma zevkini daha net yapti mi?',
      rewardXp: 25,
    },
    {
      title: 'Neden hoslandin?',
      teaching: 'Gercek zevk, sadece begendim demekten cok neden begendigini gorebilmektir.',
      action: 'Bugun hosuna giden bir sahne, fikir veya detay icin nedenini yaz.',
      reflectionPrompt: 'Nedeni bulmak deneyimi derinlestirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Neden olmadi?',
      teaching: 'Kulturel zevk sadece hoslandigini degil, neden kopabildigini da gormekle gelisir.',
      action: 'Bugun zayif buldugun bir icerik detayini tek cumleyle acikla.',
      reflectionPrompt: 'Elestiri yapmak secim gucunu artiriyor mu?',
      rewardXp: 25,
    },
    {
      title: 'Algoritma diyeti',
      teaching: 'Kendi zevkini duyabilmek icin ara sira platformun ritminden cikman gerekir.',
      action: 'Bugun onerilenlerden degil, kendi sectigin bir kaynaktan icerik ac.',
      reflectionPrompt: 'Bu secim daha ozgur hissettirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Tuketimi paylas',
      teaching: 'Bir icerigi birine anlatmak veya onermek, onu pasif deneyimden aktif secime cevirir.',
      action: 'Bugun tukettigin bir seyi neden sevdigini birine kisa bir mesajla anlat.',
      reflectionPrompt: 'Paylasmak secimini daha sahipli hissettirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Ikinci unit review',
      teaching: 'Secim disiplini, artik neyi tuktettigini degil neye neden evet dedigini bilmektir.',
      action: 'Seni tasiyan tema, ortam ve secim filtresini birer cumleyle yaz.',
      reflectionPrompt: 'Bundan sonra hangi icerikleri daha rahat eleyeceksin?',
      rewardXp: 30,
    },
  ],
  [
    {
      title: 'Haftalik kultur listesi',
      teaching: 'Iyi zevk, anlik kaprislerden cok bilincli secilmis bir haftalik listeden beslenir.',
      action: 'Onumuzdeki hafta icin izleyecegin, dinleyecegin veya okuyacagin 3 seylik mini liste yap.',
      reflectionPrompt: 'Liste kurmak karar yorgunlugunu azaltti mi?',
      rewardXp: 30,
    },
    {
      title: 'Yavas tuketim gecesi',
      teaching: 'Bazen daha az sey, daha derin deneyim yaratir.',
      action: 'Bugun sadece tek bir kultur icerigi tuket ve ardindan 10 dakika sessizce sindir.',
      reflectionPrompt: 'Yavaslamak keyfini azaltti mi, artirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Kendi puanlama sistemin',
      teaching: 'Kendi kriterlerin olmadan zevk baskalarinin listelerine bagimli kalir.',
      action: 'Bir icerigi degerlendirmek icin kullanacagin 3 kisisel kriter yaz.',
      reflectionPrompt: 'Bu kriterler secimlerini daha netlestirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Zevk ve enerji haritasi',
      teaching: 'Her keyif veren sey ayni zamanda seni beslemez; farki gormek daha olgun secim getirir.',
      action: 'Tukettigin seyleri iki sutuna ayir: sadece oyalayanlar ve seni besleyenler.',
      reflectionPrompt: 'Bu ayrim beklediginden farkli mi cikti?',
      rewardXp: 30,
    },
    {
      title: 'Kisa yaratici cevap',
      teaching: 'Kalici zevk, sadece tuketmek degil bazen cevap uretebilmekle de derinlesir.',
      action: 'Bugun tukettigin bir seye ilham veren 4-5 cumlelik kisa bir yorum veya taslak yaz.',
      reflectionPrompt: 'Uretmek seyri degistirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Kendi kultur ilkelerin',
      teaching: 'Saglam zevk, disarinin gundemini takip etmekten cok kendi ilkelerinle secim yapmaktir.',
      action: 'Senin icin iyi kultur tuketiminin 3 ilkesini yaz.',
      reflectionPrompt: 'Bu ilkeler seni daha sahipli hissettirdi mi?',
      rewardXp: 35,
    },
    {
      title: '30 gunluk secim omurgasi',
      teaching: 'Uzun vadeli kalite, tek tek iyi secimlerden degil tekrar eden secim omurgasindan dogar.',
      action: 'Gelecek ay koruyacagin 3 davranisi sec: secim filtresi, tuketim siniri, review.',
      reflectionPrompt: 'Bu omurga zevkini daha olgun hale getiriyor mu?',
      rewardXp: 35,
    },
  ],
]);

const careerTrack = buildTrack('career', [
  [
    {
      title: 'Tek kritik is',
      teaching: 'Verimlilik ayni anda cok sey yapmak degil, bugunun en kritik isini netlestirmektir.',
      action: 'Bugun yapman gereken tek kritik isi yaz ve ona 25 dakikalik blok ayir.',
      variantActions: {
        support: 'Bugun yapman gereken tek kritik isi yaz ve ona sadece 15 dakikalik net bir baslangic ver.',
        stretch: 'Bugun tek kritik isi yaz, 25 dakikalik blok ac ve blok sonunda ciktiyi gorunur hale getir.',
      },
      reflectionPrompt: 'Dikkatini en cok ne dagitti?',
      rewardXp: 15,
    },
    {
      title: 'Mikro beceri gelisimi',
      teaching: 'Kariyer ilerlemesi buyuk sicrama ile degil, tekrar eden mikroyetenek insasi ile olur.',
      action: 'Bugun seni ileri tasiyacak tek bir beceri icin 15 dakika egzersiz yap.',
      reflectionPrompt: 'Bu becerideki en zayif noktan ne gibi gorunuyor?',
      rewardXp: 15,
    },
    {
      title: 'Cikis tanimi yaz',
      teaching: 'Baslamak zor geldiginde sorun cogu zaman isin buyuklugu degil, bitmis halin belirsizligidir.',
      action: 'Bugun yapacagin isin bitmis halini tek cumleyle tanimla.',
      reflectionPrompt: 'Bitmis hali gormek baslamayi kolaylastirdi mi?',
      rewardXp: 15,
    },
    {
      title: 'Ertelemeyi kir',
      teaching: 'Erteleme genelde tembellik degil, belirsizliktir. Net ilk adim belirsizligi azaltir.',
      action: 'Ertelenen bir is sec ve onu sadece ilk 10 dakikalik parcaya bol.',
      variantActions: {
        support: 'Ertelenen bir is sec ve sadece ilk 5 dakikada ne yapacagini netlestir.',
        stretch: 'Ertelenen bir is sec, ilk 10 dakikayi netlestir ve hemen o ilk parcayi baslat.',
      },
      reflectionPrompt: 'Baslangici netlestirince direnc azaldi mi?',
      rewardXp: 20,
    },
    {
      title: 'Odak blogu savun',
      teaching: 'Odak yalnizca baslatilmaz, korunur da. Korunmayan zaman kolayca erir.',
      action: 'Bugunku 25 dakikalik blok boyunca bildirimleri kapat ve tek sekme ile calis.',
      reflectionPrompt: 'Korunan zaman ile normal zaman arasinda ne fark hissettin?',
      rewardXp: 20,
    },
    {
      title: 'Kisa gun sonu notu',
      teaching: 'Iyi calisan insanlar sadece baslamayi degil, gunu bilincli kapatmayi da bilir.',
      action: 'Gun sonunda neyi bitirdigini ve neyin kaldigini iki satirla yaz.',
      reflectionPrompt: 'Kapanis yapmak yarini rahatlatti mi?',
      rewardXp: 20,
    },
    {
      title: 'Ilk unit review',
      teaching: 'Odak temeli, hangi baslangic davranisinin seni en iyi tasidigini gormekle kurulur.',
      action: 'Sende en iyi calisan iki davranisi yaz: kritik is, blok, kapanis veya parcalama.',
      reflectionPrompt: 'Hangisi sende hala fazla direnc uretiyor?',
      rewardXp: 20,
    },
  ],
  [
    {
      title: 'Gorunur cikti odagi',
      teaching: 'Kariyerde momentum, soyut cabadan cok gorunur cikti ile hissedilir.',
      action: 'Bugun sadece biten ve gosterilebilir tek bir cikti uretmeye odaklan.',
      reflectionPrompt: 'Bitmis cikti almak motivasyonunu etkiledi mi?',
      rewardXp: 25,
    },
    {
      title: 'Toplantisiz pencere',
      teaching: 'Derin is, acik bir koruma alani olmadan kendiliginden olusmaz.',
      action: 'Bugun 30 dakikalik toplantisiz veya mesajsiz bir pencere yarat.',
      reflectionPrompt: 'Korunan pencere fark yaratti mi?',
      rewardXp: 25,
    },
    {
      title: 'Geri bildirim yakala',
      premiumPlanTag: 'support',
      teaching: 'Profesyonel buyume kendi ic sesin kadar dis geri bildirimle de hizlanir.',
      action: 'Bitirdigin veya ilerlettigin bir is icin tek bir kisiden kisa yorum iste.',
      reflectionPrompt: 'Geri bildirim istemek sandigindan daha zor muydu?',
      rewardXp: 25,
    },
    {
      title: 'Iletisim netligi',
      premiumPlanTag: 'stretch',
      teaching: 'Kariyerde guc sadece iyi is degil, anlasilir iletisimle de artar.',
      action: 'Bugun bir mesajini veya mailini gondermeden once yari uzunluga indirip netlestir.',
      reflectionPrompt: 'Kisaltmak anlatimi guclendirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Sorun degil sonraki adim',
      teaching: 'Profesyonel guven, sorunlari sadece tarif etmek degil bir sonraki adimi da soyleyebilmektir.',
      action: 'Bugun bir blokaj yasarsan, yanina bir sonraki adim onerisi de yaz.',
      reflectionPrompt: 'Cozum dili kurmak guveni etkiledi mi?',
      rewardXp: 25,
    },
    {
      title: 'Haftalik cikti listesi',
      teaching: 'Icra disiplini, cabayi degil ciktilari duzenli gorebildiginde guclenir.',
      action: 'Bu haftaki 3 gorunur ciktini listele ve eksik kalani isaretle.',
      reflectionPrompt: 'Ciktilari gormek haftani daha netlestirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Ikinci unit review',
      teaching: 'Icra disiplini, artik ne kadar calistigini degil hangi ortamda iyi urettigini gormek demektir.',
      action: 'Sana en cok guc veren 3 calisma kosulunu yaz.',
      reflectionPrompt: 'Hangi kosul bozuldugunda performansin ilk dusuyor?',
      rewardXp: 30,
    },
  ],
  [
    {
      title: 'Haftalik kariyer review',
      teaching: 'Buyume, yaptiklarini sadece uygulamakla degil duzenli degerlendirmekle hizlanir.',
      action: 'Bu haftaki bir gelisim alanini ve tek bir zayif noktanı yaz.',
      reflectionPrompt: 'Net bir zayiflik gorunce sonraki adim kolaylasti mi?',
      rewardXp: 30,
    },
    {
      title: 'Portfoy parcasi dusun',
      teaching: 'Profesyonel ilerleme, yaptigin isin bir kismini gorunur hale getirebildiginde hizlanir.',
      action: 'Bugun gelecekte gosterebilecegin bir is parcasi veya sonuc dusun ve not al.',
      reflectionPrompt: 'Gorunur dusunmek motivasyonunu etkiledi mi?',
      rewardXp: 30,
    },
    {
      title: 'Yetkinlik haritasi',
      teaching: 'Ilerleme hissi, neyi bildigini ve sira olarak neyi gelistirecegini gorebildiginde artar.',
      action: 'Alaninda guclu oldugun 2 ve gelistirecegin 2 yetkinligi yaz.',
      reflectionPrompt: 'Bu harita sana yon verdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Networke mini adim',
      teaching: 'Kariyer yalnizca bireysel performans degil, iliski ve gorunurluk oyunu da ister.',
      action: 'Bugun birine kisa bir tesekkur, update veya temas mesaji gonder.',
      reflectionPrompt: 'Kucuk temas atmak sandigindan daha mi kolaydi?',
      rewardXp: 30,
    },
    {
      title: 'Stresli gun protokolu',
      teaching: 'Guclu profesyoneller sadece ideal gunlerde degil yogunlukte de sistemle hareket eder.',
      action: 'Yogun gunlerde uygulayacagin minimum is protokolunu yaz: tek blok, tek cikti, tek kapanis.',
      reflectionPrompt: 'Minimum protokol seni rahatlatti mi?',
      rewardXp: 30,
    },
    {
      title: 'Kendi profesyonel ilkelerin',
      teaching: 'Kalici kariyer gucu, baskalarinin temposuna gore degil kendi ilkelerine gore hareket ettiginde kurulur.',
      action: 'Iyi calisan bir profesyonel olarak korumak istedigin 3 ilkeyi yaz.',
      reflectionPrompt: 'Bu ilkeler sana daha net bir kimlik verdi mi?',
      rewardXp: 35,
    },
    {
      title: '30 gunluk is omurgasi',
      teaching: 'Uzun vadeli basari, gecici gazdan degil tekrar eden is omurgasindan gelir.',
      action: 'Gelecek ay koruyacagin 3 davranisi sec: odak, cikti, review.',
      reflectionPrompt: 'Bu omurga seni daha profesyonel hissettiriyor mu?',
      rewardXp: 35,
    },
  ],
]);

const generalTrack = buildTrack('general', [
  [
    {
      title: 'Tek odak',
      teaching: 'Gelisim ayni anda her seye saldirmakla degil, tek bir etkili adimla ilerler.',
      action: 'Bugun duzenini ileri tasiyacak tek bir adimi sec ve 15 dakika ayir.',
      variantActions: {
        support: 'Bugun duzenini toparlayacak tek bir adimi sec ve sadece 10 dakika basla.',
        stretch: 'Bugun duzenini ileri tasiyacak tek bir adimi sec ve 25 dakikalik odak blogunda tamamla.',
      },
      reflectionPrompt: 'Tek odak secmek zor mu geldi, rahatlatici mi oldu?',
      rewardXp: 15,
    },
    {
      title: 'Gun sonu degerlendirmesi',
      teaching: 'Kucuk bir kapanis degerlendirmesi, davranis degisiminin en ucuz ama etkili araclarindandir.',
      action: 'Bugun neyi iyi yaptigini ve neyi yarin daha iyi yapabilecegini yaz.',
      variantActions: {
        support: 'Bugun sadece iyi yaptigin tek bir seyi ve yarin iyilestirmek istedigin tek noktayi yaz.',
        stretch: 'Bugun iyi yaptigin iki seyi, yarin iyilestirecegin tek noktayi ve ilk adimini yaz.',
      },
      reflectionPrompt: 'Kendine karsi gereksiz sert miydin, yoksa net miydin?',
      rewardXp: 15,
    },
    {
      title: 'Surtunme avcisi',
      teaching: 'Ilerlemeyi durduran sey cogu zaman karakter degil, ortam ve surtunmedir.',
      action: 'Bugun seni yavaslatan tek bir surtunmeyi yaz ve onu azaltacak mini hamleyi yap.',
      variantTeaching: {
        support: 'Bugun amac tum sistemi duzeltmek degil, seni yavaslatan tek bir surtunmeyi fark etmek.',
        stretch: 'Bugun sadece surtunmeyi bulma; ayni anda onu azaltacak somut hamleyi de uygula.',
      },
      reflectionPrompt: 'Surtunmeyi fark etmek seni rahatlatti mi?',
      rewardXp: 15,
    },
    {
      title: 'Sabah baslangic sinyali',
      teaching: 'Gunler tesadufen iyi gitmez; kucuk bir baslangic sinyali davranisi yonlendirir.',
      action: 'Yarin sabah gunu baslatmak icin 3 dakikalik tek bir acilis davranisi sec.',
      reflectionPrompt: 'Baslangic sinyali fikri sende ne uyandirdi?',
      rewardXp: 20,
    },
    {
      title: 'Aksam kapanis alani',
      teaching: 'Dinlenme rastgele kalirsa ertesi gun enerji daginik olur.',
      action: 'Bu aksam gunu kapatmak icin kullanacagin 10 dakikalik sakin bir alan yarat.',
      reflectionPrompt: 'Kapanis ortami seni yavaslatti mi?',
      rewardXp: 20,
    },
    {
      title: 'Dikkat koruma',
      teaching: 'Gunluk gelisim, zaman kadar dikkati de koruyabildiginde hizlanir.',
      action: 'Bugun seni en cok bolen tek bir dikkat kaynagini 20 dakikaligina kapat.',
      reflectionPrompt: 'Kisa dikkat korumasi fark yaratabildi mi?',
      rewardXp: 20,
    },
    {
      title: 'Ilk unit review',
      teaching: 'Temel unitin amaci kusursuz duzen degil, hangi davranislarin seni toparladigini gormektir.',
      action: 'Bu unitte sende en iyi calisan 3 davranisi yaz.',
      reflectionPrompt: 'Hangi davranisi korursan en cok kazanirsin?',
      rewardXp: 20,
    },
  ],
  [
    {
      title: 'Haftalik yon secimi',
      teaching: 'Daginik ilerleme yerine haftalik yon secimi, enerjiyi toplar.',
      action: 'Onumuzdeki hafta icin tek ana odak alani sec ve nedenini bir cumleyle yaz.',
      reflectionPrompt: 'Yon secmek karar yorgunlugunu azaltti mi?',
      rewardXp: 25,
    },
    {
      title: 'Enerji haritasi',
      teaching: 'Her saat ayni degildir; verimli sistem enerji gercegine gore kurulur.',
      action: 'Gun icinde en enerjik ve en daginik saatlerini not et.',
      reflectionPrompt: 'Bu harita gununu yeniden dusundurdu mu?',
      rewardXp: 25,
    },
    {
      title: 'Mini aliskanlik zinciri',
      teaching: 'Davranislar tek basina degil birbirini takip ettiginde daha kolay kalici olur.',
      action: 'Bir davranisi var olan bir rutinin arkasina ekle: kahve, dus, masa, yuruyus gibi.',
      reflectionPrompt: 'Baglamak yeni davranisi kolaylastirdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Bosu kucult',
      premiumPlanTag: 'support',
      teaching: 'Sistemlerin bozuldugu yer genelde buyuk bosluklardir; kucuk boslar daha kolay korunur.',
      action: 'Bugun erteledigin bir seyi sadece 8 dakikalik versiyonuna indir.',
      reflectionPrompt: 'Kucultmek harekete gecmeni sagladi mi?',
      rewardXp: 25,
    },
    {
      title: 'Birakma tetikleyicisi',
      premiumPlanTag: 'stretch',
      teaching: 'Iyi sistem sadece neyi yapacagini degil neyi ne zaman birakacagini da bilir.',
      action: 'Seni yoran tek bir davranisi ne zaman durduracagini belirleyen bir sinyal sec.',
      reflectionPrompt: 'Birakma sinyali kontrol hissi verdi mi?',
      rewardXp: 25,
    },
    {
      title: 'Destek cemberi',
      teaching: 'Gelisim, sadece yalniz disiplin degil dogru destek kaynaklarini bilmekle de kolaylasir.',
      action: 'Seni yukselten 2 kisi veya 2 ortam yaz ve onlara nasil daha cok yaklasacagini not et.',
      reflectionPrompt: 'Destegi gormek motivasyonu etkiledi mi?',
      rewardXp: 25,
    },
    {
      title: 'Ikinci unit review',
      teaching: 'Sistem kurmak, artik ne yaptigini degil ne zaman ve hangi kosulda iyi calistigini bilmektir.',
      action: 'Sana en cok guc veren zaman, ortam ve davranis kombinasyonunu yaz.',
      reflectionPrompt: 'Bu kombinasyon seni daha net hissettirdi mi?',
      rewardXp: 30,
    },
  ],
  [
    {
      title: 'Aylik yon cizimi',
      teaching: 'Daha buyuk gelisim, haftalik niyetlerin aylik yone baglandigi yerde olur.',
      action: 'Onumuzdeki ay ilerlemek istedigin tek ana alan ve tek olcu belirle.',
      reflectionPrompt: 'Aylik bakis seni sakinlestirdi mi, baskiladi mi?',
      rewardXp: 30,
    },
    {
      title: 'Minimum gun protokolu',
      teaching: 'Kotu gunlerde bile seni tutan minimum davranislar, gercek sistemi ayakta tutar.',
      action: 'Dusuk enerji gunlerinde uygulayacagin 3 satirlik mini protokol yaz.',
      reflectionPrompt: 'Minimum plan seni guvende hissettirdi mi?',
      rewardXp: 30,
    },
    {
      title: 'Basari tanimin',
      teaching: 'Belirsiz basari, surekli yetersizlik hissi dogurur. Kendi tanimin net olmalidir.',
      action: 'Senin icin iyi bir gunun 3 net isaretini yaz.',
      reflectionPrompt: 'Bu tanim senden baski mi aldi, netlik mi verdi?',
      rewardXp: 30,
    },
    {
      title: 'Kendine geri bildirim',
      teaching: 'Kalici gelisim, sadece kendini elestirmek degil kendine iyi geri bildirim verebilmektir.',
      action: 'Bugun kendine, ilerleme gosterdigin bir alan icin kisa bir takdir notu yaz.',
      reflectionPrompt: 'Takdir etmek yapay mi geldi, gercek mi?',
      rewardXp: 30,
    },
    {
      title: 'Fazlalik temizligi',
      teaching: 'Yuksek kalite hayat bazen daha fazlasini eklemekle degil, gereksizi cikarmakla ilerler.',
      action: 'Gununu veya masani gereksiz kalabaliklastiran tek bir seyi kaldir.',
      reflectionPrompt: 'Azaltmak seni hafifletti mi?',
      rewardXp: 30,
    },
    {
      title: 'Kendi ilkelerin',
      teaching: 'Disiplinin en olgun hali, baskalarinin sistemi degil kendi ilkelerinle hareket etmektir.',
      action: 'Kararlarini yonetecek 3 kisisel ilkeyi yaz.',
      reflectionPrompt: 'Bu ilkeler sana daha net bir omurga verdi mi?',
      rewardXp: 35,
    },
    {
      title: '30 gunluk yasam omurgasi',
      teaching: 'Uzun vadeli gelisim, motivasyon degil tekrar eden yasam omurgasi ister.',
      action: 'Gelecek ay koruyacagin 3 temel davranisi sec: odak, kapanis, review.',
      reflectionPrompt: 'Bu omurga seni daha kararli biri gibi hissettiriyor mu?',
      rewardXp: 35,
    },
  ],
]);

export const curriculum: Record<Path, MissionDefinition[]> = {
  fitness: attachUnitMeta('fitness', fitnessTrack),
  culture: attachUnitMeta('culture', cultureTrack),
  social: attachUnitMeta('social', socialTrack),
  entertainment: attachUnitMeta('entertainment', entertainmentTrack),
  career: attachUnitMeta('career', careerTrack),
  general: attachUnitMeta('general', generalTrack),
};

export const getCurriculumForPath = (path: Path | null) => curriculum[path ?? 'general'];

export const getLessonById = (lessonId: string) =>
  Object.values(curriculum)
    .flat()
    .find((lesson) => lesson.id === lessonId) ?? null;
