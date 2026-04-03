import { UserProfile, DailyTask } from "../types";
import { generateEvolutionAnalysis as generateAIAnalysis } from "./aiService";

export async function generateEvolutionInsight(profile: UserProfile, tasks: DailyTask[]) {
  try {
    return await generateAIAnalysis(profile, tasks);
  } catch (error) {
    console.error("Evolution Error:", error);
    return null;
  }
}

export async function fetchDailyWisdom() {
  try {
    const response = await fetch('https://api.adviceslip.com/advice');
    const data = await response.json();
    return data.slip.advice;
  } catch (error) {
    return "Bugün sadece kendin ol, bu yeterli.";
  }
}
