const assert = require('assert');
const { calculateBreakDuration } = require('../services/timeService');

console.log('--- Running Time Service Unit Tests ---');

// Test 1: Preset break duration
const res1 = calculateBreakDuration(15, null);
assert.strictEqual(res1.availableBreakMins, 15, 'Preset break duration should be 15');
assert.strictEqual(res1.timeSource, 'duration', 'Source should be duration');
console.log('✓ Test 1 Passed: Preset duration calculation');

// Test 2: Next class time calculation
const futureTime = new Date(Date.now() + 25 * 60000);
const hh = String(futureTime.getHours()).padStart(2, '0');
const mm = String(futureTime.getMinutes()).padStart(2, '0');
const res2 = calculateBreakDuration(15, `${hh}:${mm}`);
assert.strictEqual(res2.availableBreakMins, 25, 'Calculated break duration should match 25 mins');
assert.strictEqual(res2.timeSource, 'classTime', 'Source should be classTime');
console.log('✓ Test 2 Passed: Class time remaining calculation');

// Test 3: Expired class time fallback
const pastTime = new Date(Date.now() - 10 * 60000);
const pastHh = String(pastTime.getHours()).padStart(2, '0');
const pastMm = String(pastTime.getMinutes()).padStart(2, '0');
const res3 = calculateBreakDuration(20, `${pastHh}:${pastMm}`);
assert.strictEqual(res3.availableBreakMins, 20, 'Expired class time should fallback to selected 20 mins');
assert.notStrictEqual(res3.warningMessage, null, 'Warning message should be present for expired class time');
console.log('✓ Test 3 Passed: Expired class time fallback');

console.log('--- All Time Service Unit Tests Passed Successfully ---');
