import { DailyTask, TaskDraft } from '../types';

export interface TaskRefreshPlan {
  tasksToDelete: DailyTask[];
  tasksToCreate: TaskDraft[];
}

function normalizeTitle(title: string) {
  return title.trim().toLocaleLowerCase('tr-TR');
}

export function buildTaskRefreshPlan(existingTasks: DailyTask[], generatedTasks: TaskDraft[]): TaskRefreshPlan {
  if (!generatedTasks.length) {
    return {
      tasksToDelete: [],
      tasksToCreate: [],
    };
  }

  const preservedTasks = existingTasks.filter((task) => !['generated', 'preview'].includes(task.source) || task.completed);
  const removableTasks = existingTasks.filter((task) => ['generated', 'preview'].includes(task.source) && !task.completed);
  const usedTitles = new Set(preservedTasks.map((task) => normalizeTitle(task.title)));

  const tasksToCreate = generatedTasks.filter((task) => {
    const normalizedTitle = normalizeTitle(task.title);
    if (usedTitles.has(normalizedTitle)) {
      return false;
    }

    usedTitles.add(normalizedTitle);
    return true;
  });

  if (!tasksToCreate.length) {
    return {
      tasksToDelete: [],
      tasksToCreate: [],
    };
  }

  return {
    tasksToDelete: removableTasks,
    tasksToCreate,
  };
}
