import { UserProfile, DailyTask } from '../types';
import { generateEvolutionAnalysis as generateAIAnalysis, generateDailyInsight } from './aiService';

export async function generateEvolutionInsight(profile: UserProfile, tasks: DailyTask[]) {
  return generateAIAnalysis(profile, tasks);
}

export async function fetchDailyWisdom(profile?: UserProfile, tasks?: DailyTask[]) {
  try {
    if (profile && tasks) {
      return await generateDailyInsight(profile, tasks);
    }

    const response = await fetch('https://api.adviceslip.com/advice');
    const data = await response.json();
    return data.slip.advice;
  } catch (error) {
    return 'Bugun sadece kendin ol, bu yeterli.';
  }
}
