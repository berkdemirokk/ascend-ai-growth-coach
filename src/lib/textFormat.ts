const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bBugun\b/g, 'Bugün'],
  [/\bbugun\b/g, 'bugün'],
  [/\bYarin\b/g, 'Yarın'],
  [/\byarin\b/g, 'yarın'],
  [/\bGorev\b/g, 'Görev'],
  [/\bgorev\b/g, 'görev'],
  [/\bGorevi\b/g, 'Görevi'],
  [/\bgorevi\b/g, 'görevi'],
  [/\bGorevin\b/g, 'Görevin'],
  [/\bgorevin\b/g, 'görevin'],
  [/\bGorevler\b/g, 'Görevler'],
  [/\bgorevler\b/g, 'görevler'],
  [/\bKoc\b/g, 'Koç'],
  [/\bkoc\b/g, 'koç'],
  [/\bIlerleme\b/g, 'İlerleme'],
  [/\bilerleme\b/g, 'ilerleme'],
  [/\bGun\b/g, 'Gün'],
  [/\bgun\b/g, 'gün'],
  [/\bUnite\b/g, 'Ünite'],
  [/\bunite\b/g, 'ünite'],
  [/\bAcilacak\b/g, 'Açılacak'],
  [/\bacilacak\b/g, 'açılacak'],
  [/\bAcik\b/g, 'Açık'],
  [/\bacik\b/g, 'açık'],
  [/\bSure\b/g, 'Süre'],
  [/\bsure\b/g, 'süre'],
  [/\bDeger\b/g, 'Değer'],
  [/\bdeger\b/g, 'değer'],
];

export const formatUiText = (value: string) => {
  let nextValue = value;

  REPLACEMENTS.forEach(([pattern, replacement]) => {
    nextValue = nextValue.replace(pattern, replacement);
  });

  return nextValue;
};
