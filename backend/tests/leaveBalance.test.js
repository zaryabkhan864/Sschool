import assert from "node:assert/strict";
import { test } from "node:test";
import { computeLeaveBalance, canTakeLeave } from "../utils/leaveBalance.js";

test("computeLeaveBalance: fresh contract, no leave used yet", () => {
  const balance = computeLeaveBalance(15, 0);
  assert.deepEqual(balance, { annualLeaveAllowance: 15, usedDays: 0, remaining: 15 });
});

test("computeLeaveBalance: some leave already used", () => {
  const balance = computeLeaveBalance(15, 6);
  assert.deepEqual(balance, { annualLeaveAllowance: 15, usedDays: 6, remaining: 9 });
});

test("computeLeaveBalance: used more than allowance never goes negative", () => {
  const balance = computeLeaveBalance(10, 14);
  assert.equal(balance.remaining, 0);
});

test("computeLeaveBalance: handles missing/undefined inputs as zero", () => {
  const balance = computeLeaveBalance(undefined, undefined);
  assert.deepEqual(balance, { annualLeaveAllowance: 0, usedDays: 0, remaining: 0 });
});

test("computeLeaveBalance: negative inputs are clamped to zero", () => {
  const balance = computeLeaveBalance(-5, -3);
  assert.deepEqual(balance, { annualLeaveAllowance: 0, usedDays: 0, remaining: 0 });
});

test("canTakeLeave: allows request within remaining balance", () => {
  const balance = computeLeaveBalance(15, 6); // remaining = 9
  const decision = canTakeLeave(balance, 5);
  assert.equal(decision.allowed, true);
});

test("canTakeLeave: blocks request exceeding remaining balance", () => {
  const balance = computeLeaveBalance(15, 6); // remaining = 9
  const decision = canTakeLeave(balance, 12);
  assert.equal(decision.allowed, false);
  assert.match(decision.reason, /Insufficient leave balance/);
  assert.match(decision.reason, /Remaining: 9/);
  assert.match(decision.reason, /requested: 12/);
});

test("canTakeLeave: exact match on remaining balance is allowed", () => {
  const balance = computeLeaveBalance(15, 6); // remaining = 9
  const decision = canTakeLeave(balance, 9);
  assert.equal(decision.allowed, true);
});

test("canTakeLeave: contracts with no allowance configured (0) are never blocked", () => {
  const balance = computeLeaveBalance(0, 0);
  const decision = canTakeLeave(balance, 100);
  assert.equal(decision.allowed, true);
});

test("canTakeLeave: teacher with fully used balance is blocked from any further leave", () => {
  const balance = computeLeaveBalance(10, 10); // remaining = 0
  const decision = canTakeLeave(balance, 1);
  assert.equal(decision.allowed, false);
});

test("real-world scenario: 20-day allowance, teacher requests leave across the year", () => {
  let used = 0;
  const allowance = 20;

  // Teacher takes 5 days in Term 1 — should be allowed
  let balance = computeLeaveBalance(allowance, used);
  let decision = canTakeLeave(balance, 5);
  assert.equal(decision.allowed, true);
  used += 5;

  // Takes another 12 days in Term 2 — still allowed (17 used, 3 remaining)
  balance = computeLeaveBalance(allowance, used);
  decision = canTakeLeave(balance, 12);
  assert.equal(decision.allowed, true);
  used += 12;

  // Tries to take 5 more days — only 3 remaining, should be blocked
  balance = computeLeaveBalance(allowance, used);
  decision = canTakeLeave(balance, 5);
  assert.equal(decision.allowed, false);
  assert.equal(balance.remaining, 3);
});
