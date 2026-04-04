export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  AUTH = 'auth',
}

export interface AppError {
  title: string;
  message: string;
  operationType: OperationType;
  path?: string | null;
  code?: string;
}

function readErrorCode(error: unknown) {
  const code = (error as { code?: unknown })?.code;
  return typeof code === 'string' ? code : undefined;
}

export function normalizeFirebaseError(error: unknown, operationType: OperationType, path?: string | null): AppError {
  const code = readErrorCode(error);
  const fallbackMessage = error instanceof Error ? error.message : 'Beklenmeyen bir Firebase hatası oluştu.';

  const messageMap: Record<string, string> = {
    'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı. Yeniden deneyebilirsin.',
    'auth/popup-blocked': 'Tarayıcı giriş penceresini engelledi. Açılır pencere iznini verip tekrar dene.',
    'auth/network-request-failed': 'Ağ bağlantısı kurulamadı. İnternet bağlantını kontrol et.',
    'permission-denied': 'Bu işlem için yetkin yok. Verilerin korunması için işlem durduruldu.',
    'unavailable': 'Servis şu anda geçici olarak kullanılamıyor. Birazdan tekrar deneyebilirsin.',
    'not-found': 'İstenen kayıt bulunamadı.',
    'already-exists': 'Bu kayıt zaten mevcut.',
  };

  return {
    title: operationType === OperationType.AUTH ? 'Giriş Sorunu' : 'Veri İşlemi Başarısız',
    message: code ? messageMap[code] ?? fallbackMessage : fallbackMessage,
    operationType,
    path,
    code,
  };
}

export function normalizeUnknownError(error: unknown, title: string, fallbackMessage: string): AppError {
  return {
    title,
    message: error instanceof Error && error.message ? error.message : fallbackMessage,
    operationType: OperationType.GET,
  };
}
