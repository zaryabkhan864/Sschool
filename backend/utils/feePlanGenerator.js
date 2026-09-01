// utils/feePlanGenerator.js
//
// Central place that turns a StudentEnrollment's `feePlan` (an array of
// selected fee lines — Admission / Tuition / Exam / Transport / Hostel,
// only the types the admin actually picked for this student) into the
// real Fees documents that the finance team works from.
//
// Responsibilities:
//  - Split each fee line into installments based on its paymentFrequency
//    (Monthly -> 12, Quarterly -> 4, Half Yearly -> 2, Annually -> 1).
//    A student paying Annually gets exactly 1 Fees doc per fee type; a
//    student paying Monthly gets 12, spaced a month apart from the fee
//    line's dueDate.
//  - Apply an Approved scholarship's discount to the Tuition line only
//    (never Admission/Exam/Transport/Hostel), splitting the *discounted*
//    total across the installments.
//  - Set a reminderDate on every installment (dueDate minus a lead time)
//    so finance can be notified before money is due and reach out to
//    parents, instead of only finding out once a payment is overdue.
//  - Never touch Fees that are already Paid or Overdue — those are real
//    financial history. Only ever regenerated: fees still Pending.
import mongoose from "mongoose";

export const FREQUENCY_INSTALLMENTS = {
  Monthly: 12,
  Quarterly: 4,
  "Half Yearly": 2,
  Annually: 1,
};

// Not every fee type makes sense on every payment schedule — Admission is
// a single one-off charge (never Monthly/Quarterly/Half Yearly), and Exam
// fees are only ever billed once a term (Quarterly) or once a year, never
// Monthly/Half Yearly. Tuition/Transport/Hostel are the recurring costs
// that can reasonably be spread across any frequency. This map is the
// single source of truth — both the model validation and the frontend
// planner read from the same list so they can never drift out of sync.
export const FEE_TYPE_FREQUENCIES = {
  Admission: ["Annually"],
  Tuition: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
  Exam: ["Quarterly", "Annually"],
  Transport: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
  Hostel: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
};

// Monthly payers need a shorter lead time (a week) since their next
// installment is always close by; less frequent payers get a month's
// notice since the gap between installments is much bigger.
export const REMINDER_OFFSET_DAYS = {
  Monthly: 7,
  Quarterly: 30,
  "Half Yearly": 30,
  Annually: 30,
};

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * (Re)generates the Fees documents for a given StudentEnrollment.
 * Deletes previously generated Pending fees for this enrollment first, so
 * editing the fee plan (or approving a scholarship) doesn't leave stale
 * or duplicate installments behind. Fees already Paid or Overdue are
 * left untouched — editing a plan must never erase payment history.
 */
export async function generateFeesForEnrollment(enrollment) {
  const Fees = mongoose.model("Fees");
  const Scholarship = mongoose.model("Scholarship");

  await Fees.deleteMany({ enrollment: enrollment._id, status: "Pending" });

  // Only an Approved scholarship actually discounts what's billed —
  // Pending/Rejected scholarships must not silently change the amount
  // (same rule as Scholarship.applyTo on the model itself).
  const scholarship = await Scholarship.findOne({
    student: enrollment.student,
    academicYear: enrollment.academicYear,
    status: "Approved",
  });

  const createdFees = [];

  for (const line of enrollment.feePlan) {
    const count = FREQUENCY_INSTALLMENTS[line.paymentFrequency] || 1;
    const offsetDays = REMINDER_OFFSET_DAYS[line.paymentFrequency] || 7;
    const intervalMonths = 12 / count;

    let totalAmount = Number(line.amount);
    let scholarshipApplied = false;

    // Scholarship rule: applies to Tuition only.
    if (line.feeType === "Tuition" && scholarship) {
      const discounted = scholarship.applyTo(totalAmount);
      scholarshipApplied = discounted !== totalAmount;
      totalAmount = discounted;
    }

    const perInstallment = Math.floor((totalAmount / count) * 100) / 100;
    let allocated = 0;

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      // Last installment absorbs any rounding remainder so the
      // installments always sum exactly to totalAmount.
      const amount = isLast
        ? Math.round((totalAmount - allocated) * 100) / 100
        : perInstallment;
      allocated += amount;

      const dueDate = addMonths(line.dueDate, i * intervalMonths);
      const reminderDate = new Date(
        dueDate.getTime() - offsetDays * 24 * 60 * 60 * 1000
      );

      const fee = await Fees.create({
        student: enrollment.student,
        amount,
        feeType: line.feeType,
        currency: line.currency,
        paymentFrequency: line.paymentFrequency,
        dueDate,
        status: "Pending",
        paymentMethod: line.paymentMethod || undefined,
        campus: enrollment.campus,
        academicYear: enrollment.academicYear,
        enrollment: enrollment._id,
        installmentNumber: i + 1,
        totalInstallments: count,
        reminderDate,
        reminderSent: false,
        scholarshipApplied,
      });
      createdFees.push(fee);
    }
  }

  return createdFees;
}

export async function regenerateFeesForScholarship(scholarship) {
  const StudentEnrollment = mongoose.model("StudentEnrollment");

  let enrollment = null;
  if (scholarship.enrollment) {
    enrollment = await StudentEnrollment.findOne({
      _id: scholarship.enrollment,
      isDeleted: false,
    });
  }
  if (!enrollment) {
    enrollment = await StudentEnrollment.findOne({
      student: scholarship.student,
      academicYear: scholarship.academicYear,
      status: "active",
      isDeleted: false,
    });
  }

  if (enrollment && enrollment.feePlan?.length) {
    await generateFeesForEnrollment(enrollment);
  }
}
