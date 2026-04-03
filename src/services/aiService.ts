
import { HUGGINGFACE_API_KEY } from '../env';

export interface AIResponse {
  text: string;
  isMock?: boolean;
}

const FALLBACK_ADVICES = [
  "Küçük adımlar büyük değişimler yaratır. Bugün sadece bir tanesini at.",
  "Konfor alanın bittiği yerde hayat başlar. Sınırlarını zorla.",
  "Disiplin, ne istediğinle neyi en çok istediğin arasındaki seçimdir.",
  "Hata yapmaktan korkma, denememekten kork.",
  "Bugünkü çaban, yarınki gücün olacak."
];

const FALLBACK_TASKS = [
  "15 dakika boyunca sadece nefesine odaklan ve meditasyon yap.",
  "Bugün daha önce hiç okumadığın bir konuda bir makale oku.",
  "En az 2 litre su içmeyi hedefle ve bunu takip et.",
  "Bugün birine karşılık beklemeden yardım et.",
  "Yarın için en önemli 3 hedefini şimdiden belirle."
];

export async function generateAIResponse(prompt: string, context?: string): Promise<AIResponse> {
  // Try Hugging Face if key is available
  const hfKey = HUGGINGFACE_API_KEY;
  
  if (hfKey) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          headers: { Authorization: `Bearer ${hfKey}`, "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ inputs: `<s>[INST] ${context ? context + "\n" : ""} ${prompt} [/INST]` }),
        }
      );
      const result = await response.json();
      if (result && result[0] && result[0].generated_text) {
        // Mistral returns the prompt + response, so we need to extract the response
        const fullText = result[0].generated_text;
        const responseText = fullText.split('[/INST]').pop()?.trim() || fullText;
        return { text: responseText };
      }
    } catch (error) {
      console.error("Hugging Face Error:", error);
    }
  }

  // Fallback to Rule-Based / Free specialized APIs
  try {
    // If it's a "task" request
    if (prompt.toLowerCase().includes("görev") || prompt.toLowerCase().includes("ne yapmalıyım")) {
      const res = await fetch('https://www.boredapi.com/api/activity');
      const data = await res.json();
      if (data.activity) {
        return { text: `Bugünkü özel görevin: ${data.activity}. Bu görev seni konfor alanından çıkaracak!`, isMock: true };
      }
    }

    // If it's a "decision" request
    if (prompt.toLowerCase().includes("karar") || prompt.toLowerCase().includes("seçenek")) {
      const randomAdvice = FALLBACK_ADVICES[Math.floor(Math.random() * FALLBACK_ADVICES.length)];
      return { text: `Analizlerime göre en mantıklı yol bu görünüyor. Unutma: ${randomAdvice}`, isMock: true };
    }
  } catch (e) {
    console.error("Fallback API Error:", e);
  }

  // Final fallback
  const randomText = FALLBACK_ADVICES[Math.floor(Math.random() * FALLBACK_ADVICES.length)];
  return { text: randomText, isMock: true };
}

export async function generateEvolutionAnalysis(profile: any, tasks: any[]): Promise<any> {
  const hfKey = HUGGINGFACE_API_KEY;
  
  if (hfKey) {
    const prompt = `Kullanıcı Profili: ${profile.name}, Seviye: ${profile.level}. Tamamlanan görevler: ${tasks.filter(t => t.completed).length}. Bu verilere göre kısa bir gelişim analizi, bir gizli görev ve bir motivasyon sözü içeren bir JSON döndür.`;
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          headers: { Authorization: `Bearer ${hfKey}`, "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ inputs: `<s>[INST] Return ONLY a JSON object with keys "analysis", "secretMission", and "quote". Context: ${prompt} [/INST]` }),
        }
      );
      const result = await response.json();
      if (result && result[0] && result[0].generated_text) {
        const jsonStr = result[0].generated_text.split('[/INST]').pop()?.trim() || "";
        const match = jsonStr.match(/\{.*\}/s);
        if (match) return JSON.parse(match[0]);
      }
    } catch (e) {
      console.error("HF Evolution Error:", e);
    }
  }

  // Rule-based fallback for evolution
  const completedCount = tasks.filter(t => t.completed).length;
  return {
    analysis: `${profile.name}, şu ana kadar ${completedCount} görev tamamladın. Gelişim hızın %${Math.min(100, profile.level * 10)}. Odak noktanı koruyorsun.`,
    secretMission: FALLBACK_TASKS[Math.floor(Math.random() * FALLBACK_TASKS.length)],
    quote: FALLBACK_ADVICES[Math.floor(Math.random() * FALLBACK_ADVICES.length)]
  };
}
