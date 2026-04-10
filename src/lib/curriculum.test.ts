import assert from 'node:assert/strict';
import test from 'node:test';
import { curriculum } from './curriculum';

test('each path now exposes a 21-lesson curriculum across 3 units', () => {
  for (const [path, lessons] of Object.entries(curriculum)) {
    assert.equal(lessons.length, 21, `${path} should expose 21 lessons`);

    const uniqueUnits = [...new Set(lessons.map((lesson) => lesson.unitId))];
    assert.equal(uniqueUnits.length, 3, `${path} should span 3 units`);

    const unitSizes = uniqueUnits.map((unitId) => lessons.filter((lesson) => lesson.unitId === unitId).length);
    assert.deepEqual(unitSizes, [7, 7, 7], `${path} should distribute lessons evenly by unit`);
  }
});
