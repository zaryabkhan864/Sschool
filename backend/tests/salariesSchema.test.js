import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import salarySchema, { PAYMENT_TYPES, CURRENCIES } from "../models/salaryDetails.js";

// Wrap the sub-schema in a throwaway top-level model just so we can call
// .validate() on it directly, with no DB connection required.
const TestSalary = mongoose.model("TestSalary", new mongoose.Schema({ salary: salarySchema }));

test("frontend payment types are all accepted by the backend enum", async () => {
  // Mirrors PAYMENT_TYPE_OPTIONS values in EmployeeContractForm.jsx
  const frontendPaymentTypes = ["hourly", "daily", "weekly", "bi_weekly", "monthly", "quarterly", "yearly"];

  for (const paymentType of frontendPaymentTypes) {
    const doc = new TestSalary({ salary: { baseSalary: 1000, paymentType, currency: "USD" } });
    await assert.doesNotReject(() => doc.validate());
  }

  assert.deepEqual(frontendPaymentTypes.sort(), [...PAYMENT_TYPES].sort());
});

test("frontend currencies are all accepted by the backend enum", async () => {
  // Mirrors CURRENCY_OPTIONS values in EmployeeContractForm.jsx
  const frontendCurrencies = ["USD", "EUR", "GBP", "TRY", "PKR", "AED", "SAR"];

  for (const currency of frontendCurrencies) {
    const doc = new TestSalary({ salary: { baseSalary: 1000, paymentType: "monthly", currency } });
    await assert.doesNotReject(() => doc.validate());
  }

  assert.deepEqual(frontendCurrencies.sort(), [...CURRENCIES].sort());
});

test("unknown payment type is rejected", async () => {
  const doc = new TestSalary({ salary: { baseSalary: 1000, paymentType: "biweekly_typo", currency: "USD" } });
  await assert.rejects(() => doc.validate());
});

test("unknown currency is rejected", async () => {
  const doc = new TestSalary({ salary: { baseSalary: 1000, paymentType: "monthly", currency: "XYZ" } });
  await assert.rejects(() => doc.validate());
});

test("annualLeaveAllowance defaults to 0 when not provided", () => {
  const doc = new TestSalary({ salary: { baseSalary: 1000, paymentType: "monthly", currency: "USD" } });
  assert.equal(doc.salary.annualLeaveAllowance, 0);
});

test("annualLeaveAllowance accepts a positive number", async () => {
  const doc = new TestSalary({
    salary: { baseSalary: 1000, paymentType: "monthly", currency: "USD", annualLeaveAllowance: 18 },
  });
  await assert.doesNotReject(() => doc.validate());
  assert.equal(doc.salary.annualLeaveAllowance, 18);
});

test("negative annualLeaveAllowance is rejected", async () => {
  const doc = new TestSalary({
    salary: { baseSalary: 1000, paymentType: "monthly", currency: "USD", annualLeaveAllowance: -5 },
  });
  await assert.rejects(() => doc.validate());
});

test("negative baseSalary is still rejected (pre-existing rule preserved)", async () => {
  const doc = new TestSalary({
    salary: { baseSalary: -100, paymentType: "monthly", currency: "USD" },
  });
  await assert.rejects(() => doc.validate());
});
