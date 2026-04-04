import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTaskRefreshPlan } from './taskRefresh';
import { DailyTask, TaskDraft } from '../types';

test('task refresh keeps existing tasks when no new tasks are generated', () => {
  const existingTasks: DailyTask[] = [
    {
      id: 'existing-1',
      title: 'Korunacak görev',
      description: '',
      category: 'general',
      priority: 'medium',
      completed: false,
      createdAt: '2026-04-04T07:00:00.000Z',
      source: 'generated',
    },
  ];

  const plan = buildTaskRefreshPlan(existingTasks, []);

  assert.deepEqual(plan.tasksToDelete, []);
  assert.deepEqual(plan.tasksToCreate, []);
});

test('task refresh replaces only incomplete generated tasks and preserves custom/completed work', () => {
  const existingTasks: DailyTask[] = [
    {
      id: 'generated-open',
      title: 'Eski plan',
      description: '',
      category: 'general',
      priority: 'medium',
      completed: false,
      createdAt: '2026-04-04T07:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'custom-open',
      title: 'Benim görevim',
      description: '',
      category: 'career',
      priority: 'high',
      completed: false,
      createdAt: '2026-04-04T07:30:00.000Z',
      source: 'custom',
    },
    {
      id: 'legacy-open',
      title: 'Eski kalan görev',
      description: '',
      category: 'career',
      priority: 'medium',
      completed: false,
      source: 'migrated',
    },
    {
      id: 'generated-completed',
      title: 'Tamamlanan görev',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-04T08:00:00.000Z',
      completedAt: '2026-04-04T09:00:00.000Z',
      source: 'generated',
    },
  ];

  const generatedTasks: TaskDraft[] = [
    {
      title: 'Yeni plan',
      description: '',
      category: 'general',
      priority: 'medium',
      source: 'generated',
    },
    {
      title: 'Benim görevim',
      description: '',
      category: 'career',
      priority: 'high',
      source: 'generated',
    },
  ];

  const plan = buildTaskRefreshPlan(existingTasks, generatedTasks);

  assert.deepEqual(plan.tasksToDelete.map((task) => task.id), ['generated-open']);
  assert.deepEqual(plan.tasksToCreate.map((task) => task.title), ['Yeni plan']);
});
