/**
 * Pure calculation helper for a teacher's leave balance.
 * Kept dependency-free (no mongoose) so it can be unit tested in isolation
 * and reused by both the create-leave validation and the balance endpoint.
 *
 * @param {number} annualLeaveAllowance - total paid leave days granted by the active contract for the year
 * @param {number} usedDays - sum of totalDays from that teacher's Approved leave records for the year
 * @returns {{ annualLeaveAllowance: number, usedDays: number, remaining: number }}
 */
export function computeLeaveBalance(annualLeaveAllowance = 0, usedDays = 0) {
  const allowance = Math.max(Number(annualLeaveAllowance) || 0, 0);
  const used = Math.max(Number(usedDays) || 0, 0);
  const remaining = Math.max(allowance - used, 0);
  return { annualLeaveAllowance: allowance, usedDays: used, remaining };
}

/**
 * Decide whether a new leave request of `requestedDays` should be allowed.
 * Enforcement only kicks in when the contract actually has an allowance set
 * (> 0), so accounts without a configured allowance are not blocked.
 *
 * @param {{annualLeaveAllowance: number, usedDays: number, remaining: number}} balance
 * @param {number} requestedDays
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canTakeLeave(balance, requestedDays) {
  const requested = Number(requestedDays) || 0;

  if (!balance || balance.annualLeaveAllowance <= 0) {
    // No allowance configured on the contract yet — don't block, just allow.
    return { allowed: true };
  }

  if (requested > balance.remaining) {
    return {
      allowed: false,
      reason: `Insufficient leave balance. Remaining: ${balance.remaining} day(s), requested: ${requested} day(s)`,
    };
  }

  return { allowed: true };
}
