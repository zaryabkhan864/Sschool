// src/constants/salaryConstants.js
//
// Single source for the salary module's fixed option lists — every
// component in src/components/finance/salary/ imports from here instead
// of redefining its own copy.
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online"];

export const currentMonthName = () => MONTH_NAMES[new Date().getMonth()];
