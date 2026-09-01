import mongoose from "mongoose";

export const PAYMENT_FREQUENCIES = ["Monthly", "Quarterly", "Half Yearly", "Annually"];

export const FeesSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
            validator: async function (studentId) {
                const user = await mongoose.model("User").findById(studentId);
                return user && user.role === "student";
            },
            message: "The referenced user must be a student."
        }
    },
    amount: { type: Number, required: true },
    feeType: { type: String, enum: ["Admission", "Tuition", "Exam", "Transport", "Hostel"], required: true },

    paymentFrequency: {
        type: String,
        enum: {
            values: PAYMENT_FREQUENCIES,
            message: "paymentFrequency must be one of: " + PAYMENT_FREQUENCIES.join(", "),
        },
        default: "Monthly",
        required: [true, "Please specify how often this fee is paid (Monthly/Quarterly/Half Yearly/Annually)"],
    },

    currency: { type: String, enum: ["USD", "EUR", "GBP", "TL", "AUD", "CAD", "AED"], default: "USD" },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["Paid", "Unpaid", "Overdue", "Pending"], default: "Unpaid" },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ["Cash", "Bank Transfer", "Online"] },

    // 👇 NEW — needed by the Fees Payment System (PaymentFees.jsx +
    // FeeReceipt.jsx). A single payFees call can mark several installments
    // Paid at once (one physical payment covering multiple fee lines), so
    // they all share the same receiptNo — that's what ties them together
    // as "one receipt" on the printed slip and in PaidFeesStudentDetails.
    receiptNo: {
        type: String,
        default: null,
    },
    // Bank Transfer / Online only — the parent's transaction/slip reference.
    paymentReference: {
        type: String,
        default: null,
    },
    // Cash only — what the parent physically handed over and what was
    // handed back, for the receipt's "Cash Received" / "Change Returned"
    // lines. Only meaningful when a single currency was collected in a
    // given payFees batch (see payFees controller).
    amountTendered: {
        type: Number,
        default: null,
    },
    changeReturned: {
        type: Number,
        default: null,
    },

    campus:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campus",
      },
      // `year` was used by the old cookie-driven manual fee flow
      // (newFee/getFees read `selectedYear` from a cookie). Fees generated
      // automatically from a StudentEnrollment's feePlan don't have that
      // cookie to pull from, so this is now optional rather than required.
      year:{
        type: Number,
        default: null,
      },

    academicYear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicYear",
        default: null,
    },
    enrollment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentEnrollment",
        default: null,
    },

    // ── Installment tracking ──
    // Each feePlan line (e.g. Tuition, paid Monthly) is split into
    // several Fees documents — one per installment — instead of one lump
    // sum per fee type, so finance can see exactly what's due and when.
    installmentNumber: {
        type: Number,
        default: 1,
    },
    totalInstallments: {
        type: Number,
        default: 1,
    },

    // ── Reminder tracking ──
    // reminderDate = dueDate minus a lead time (7 days for Monthly
    // installments, 30 days for Quarterly/Half Yearly/Annually) so
    // finance can be notified ahead of time and reach out to parents.
    // reminderSent flips to true once that notification has gone out, so
    // the same installment isn't re-flagged every time the reminder
    // check runs. A student who pays Annually only ever has one
    // installment, so this "just works" for them without any special
    // casing — the same reminder pipeline covers everyone.
    reminderDate: {
        type: Date,
        default: null,
    },
    reminderSent: {
        type: Boolean,
        default: false,
    },

    // True if this installment's amount already reflects an Approved
    // scholarship discount (Tuition only). Purely informational — shown
    // to finance so a discounted amount isn't mistaken for a mistake.
    scholarshipApplied: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

FeesSchema.index({ enrollment: 1, status: 1 });
FeesSchema.index({ status: 1, reminderDate: 1, reminderSent: 1 });
FeesSchema.index({ receiptNo: 1 });

export default mongoose.model("Fees", FeesSchema);
