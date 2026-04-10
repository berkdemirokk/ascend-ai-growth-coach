import { DailyTask, Message, UserProfile } from '../types';

const backendUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_BACKEND_URL) ||
  'http://127.0.0.1:8787';

const requestJson = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(`${backendUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const requestCoachReply = async (
  profile: UserProfile,
  history: Message[],
  message: string,
  activeTask: DailyTask | null,
  tasks: DailyTask[],
) => {
  const data = await requestJson<{ reply: string }>('/api/coach', {
    profile,
    history,
    message,
    activeTask,
    tasks,
  });

  return data.reply;
};

export const requestDecision = async (options: string[]) => {
  const data = await requestJson<{ reply: string }>('/api/decision', { options });
  return data.reply;
};

export const getAiBackendUrl = () => backendUrl;
