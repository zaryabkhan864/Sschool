// component 
// src/components/admin/UpdateStudentEnrollment.jsx
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux APIs
import { useGetUserByTypeQuery, useGetUserDetailsQuery } from "../../redux/api/authApi";
import { useGetAcademicYearsListQuery } from "../../redux/api/academicYearApi";
import { useGetClassGroupsQuery } from "../../redux/api/classGroupApi";
import {
  useCreateStudentEnrollmentMutation,
  useUpdateStudentEnrollmentMutation,
  useGetStudentEnrollmentDetailsQuery,
} from "../../redux/api/studentEnrollment";
import { useGetCampusQuery } from "../../redux/api/campusApi";
import {
  useGetScholarshipByStudentQuery,
  useCreateScholarshipMutation,
  useUpdateScholarshipMutation,
} from "../../redux/api/scholarshipApi";

// Core UI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import Loader from "../layout/Loader";
import AppInfoBox from "../layout/AppInfoBox";

// GUI form (same family as EmployeeContractForm)
import StudentEnrollmentForm from "../GUI/StudentEnrollmentForm";

const getFullName = (u) =>
  u ? `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim() : "";

// The full set of fee types the planner can plan for. A student who
// isn't taking transport simply leaves that line unchecked — nothing is
// planned or charged for it.
const FEE_TYPES = ["Admission", "Tuition", "Exam", "Transport", "Hostel"];

// Not every fee type makes sense on every payment schedule — Admission is
// a one-off charge (never Monthly/Quarterly/Half Yearly), Exam is only
// ever billed once a term (Quarterly) or once a year. Kept in sync with
// the same map on the backend (utils/feePlanGenerator.js /
// models/studentEnrollment.js) so the dropdown options and the server
// validation never disagree.
export const FEE_TYPE_FREQUENCIES = {
  Admission: ["Annually"],
  Tuition: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
  Exam: ["Quarterly", "Annually"],
  Transport: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
  Hostel: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
};

const makeEmptyFeeLine = (feeType) => ({
  enabled: false,
  amount: "",
  currency: "USD",
  // Default to the first (most common) allowed frequency for this fee
  // type — e.g. Admission always starts on "Annually" since that's its
  // only valid option, Exam starts on "Quarterly".
  paymentFrequency: FEE_TYPE_FREQUENCIES[feeType]?.[0] || "Monthly",
  dueDate: "",
  paymentMethod: "",
});

// feePlan is now keyed by fee type, one line per type, each independently
// toggle-able — the "planner" the admin fills in at enrollment time
// (Admission fee? Tuition fee? Exam fee? Transport? Hostel?).
const buildDefaultFeePlan = () =>
  FEE_TYPES.reduce((acc, type) => {
    acc[type] = makeEmptyFeeLine(type);
    return acc;
  }, {});

// scholarship is entirely optional per student — `enabled: false`
// by default means "no scholarship for this student", nothing is sent to
// the backend unless the admin turns it on. Scholarships only ever
// discount the Tuition line (see discountedAmountPreview below).
const DEFAULT_SCHOLARSHIP = {
  enabled: false,
  type: "Percentage",
  percentage: "",
  amount: "",
  criteria: "",
  status: "Pending",
};

const UpdateStudentEnrollment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const studentIdFromUrl = searchParams.get("studentId");
  const enrollmentIdFromUrl = searchParams.get("enrollmentId");

  const isEditMode = Boolean(enrollmentIdFromUrl);

  const [enrollment, setEnrollment] = useState({
    student: studentIdFromUrl || "",
    academicYear: "",
    classGroup: "",
    campus: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  // Multi-line fee planner — one entry per fee type, only the ones the
  // admin ticks "enabled" get sent to the backend / charged to the
  // student. Direct expansion of what used to be a single feePlan object.
  const [feePlan, setFeePlan] = useState(buildDefaultFeePlan());

  // scholarship state — off by default, admin opts in per student.
  const [scholarship, setScholarship] = useState(DEFAULT_SCHOLARSHIP);
  const [existingScholarshipId, setExistingScholarshipId] = useState(null);

  const [studentSearch, setStudentSearch] = useState("");
  const [academicYearSearch, setAcademicYearSearch] = useState("");
  const [classGroupSearch, setClassGroupSearch] = useState("");
  const [campusSearch, setCampusSearch] = useState("");

  // 👇 NEW: covers the WHOLE submit flow — enrollment save, then the
  // optional scholarship save, then navigate away. `isCreating`/
  // `isUpdating` below only reflect the enrollment mutation itself, so
  // there was a gap after that mutation settled but before the
  // scholarship call (and the navigate) finished, during which the
  // button re-enabled and the form was editable again. This stays true
  // for the entire flow instead.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { student, academicYear, classGroup, campus, startDate, endDate, status } = enrollment;

  // ================== MUTATIONS ==================
  const [createEnrollment, { isLoading: isCreating }] = useCreateStudentEnrollmentMutation();
  const [updateEnrollment, { isLoading: isUpdating }] = useUpdateStudentEnrollmentMutation();
  const [createScholarship] = useCreateScholarshipMutation();
  const [updateScholarship] = useUpdateScholarshipMutation();

  // ================== QUERIES ==================
  const { data: enrollmentDetails, isLoading: enrollmentLoading, error: fetchError } =
    useGetStudentEnrollmentDetailsQuery(enrollmentIdFromUrl, {
      skip: !isEditMode,
    });

  const { data: studentDetailsData } = useGetUserDetailsQuery(studentIdFromUrl, {
    skip: !studentIdFromUrl,
  });

  // Name shown in the read-only field: from the populated enrollment (edit mode)
  // or from the pre-selected student fetched via URL (create mode).
  const preselectedStudentName = isEditMode
    ? getFullName(enrollmentDetails?.enrollment?.student)
    : getFullName(studentDetailsData?.user);

  const studentReadOnly = !!studentIdFromUrl || isEditMode;

  const { data: studentsData, isFetching: studentsLoading } = useGetUserByTypeQuery(
    { type: "student", status: "active", limit: 0, keyword: studentSearch },
    { skip: studentReadOnly }
  );

  const { data: academicYearsData, isFetching: academicYearsLoading } =
    useGetAcademicYearsListQuery({
      limit: 0,
      sort: "-createdAt",
      keyword: academicYearSearch,
    });

  const { data: classGroupsData, isFetching: classGroupsLoading } = useGetClassGroupsQuery({
    status: "active",
    paginate: "false",
    keyword: classGroupSearch,
  });

  const { data: campusesData, isFetching: campusesLoading } = useGetCampusQuery({
    limit: 0,
    keyword: campusSearch,
  });

  // Once we know which student + academic year we're dealing with,
  // check if a scholarship already exists for them so we can pre-fill the
  // form (and update it instead of creating a duplicate on submit).
  const { data: scholarshipData } = useGetScholarshipByStudentQuery(
    { studentId: student, academicYear },
    { skip: !student || !academicYear }
  );

  useEffect(() => {
    const existing = scholarshipData?.scholarship || scholarshipData?.scholarships?.[0] || null;
    if (existing) {
      setExistingScholarshipId(existing._id);
      setScholarship({
        enabled: true,
        type: existing.type || "Percentage",
        percentage: existing.percentage != null ? existing.percentage : "",
        amount: existing.amount != null ? existing.amount : "",
        criteria: existing.criteria || "",
        status: existing.status || "Pending",
      });
    } else {
      setExistingScholarshipId(null);
    }
  }, [scholarshipData]);

  // ================== POPULATE FORM IN EDIT MODE ==================
  useEffect(() => {
    if (isEditMode && enrollmentDetails?.enrollment) {
      const en = enrollmentDetails.enrollment;
      const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");
      setEnrollment({
        student: en.student?._id || en.student,
        academicYear: en.academicYear?._id || en.academicYear,
        classGroup: en.classGroup?._id || en.classGroup,
        campus: en.campus?._id || en.campus || "",
        startDate: formatDate(en.startDate),
        endDate: formatDate(en.endDate),
        status: en.status || "active",
      });

      // en.feePlan is now an array of lines (one per fee type the admin
      // picked) — fold it back into the per-type object the planner UI
      // works with, leaving unpicked types disabled/blank.
      const nextFeePlan = buildDefaultFeePlan();
      (en.feePlan || []).forEach((line) => {
        if (!FEE_TYPES.includes(line.feeType)) return;
        nextFeePlan[line.feeType] = {
          enabled: true,
          amount: line.amount != null ? line.amount : "",
          currency: line.currency || "USD",
          paymentFrequency:
            line.paymentFrequency || FEE_TYPE_FREQUENCIES[line.feeType]?.[0] || "Monthly",
          dueDate: formatDate(line.dueDate),
          paymentMethod: line.paymentMethod || "",
        };
      });
      setFeePlan(nextFeePlan);
    }
  }, [enrollmentDetails, isEditMode]);

  // The actual seeded Fees installments for this enrollment (read-only
  // history — payment status lives here, not on feePlan). Each fee plan
  // line can produce several of these (one per installment).
  const linkedFees = isEditMode ? enrollmentDetails?.fees || [] : [];

  // ================== HANDLERS ==================
  const onChange = (field, value) => {
    setEnrollment((prev) => ({ ...prev, [field]: value }));
  };

  // generic updater for a single fee-type line in the planner
  const onFeeLineChange = (feeType, field, value) => {
    setFeePlan((prev) => ({
      ...prev,
      [feeType]: { ...prev[feeType], [field]: value },
    }));
  };

  // generic updater for the scholarship sub-form
  const onScholarshipChange = (field, value) => {
    setScholarship((prev) => ({ ...prev, [field]: value }));
  };

  // Fee types the admin has actually ticked "enabled" — this is the real
  // plan that gets validated and sent to the backend.
  const enabledFeeLines = useMemo(
    () => FEE_TYPES.filter((type) => feePlan[type]?.enabled),
    [feePlan]
  );

  // live preview of what the student actually owes on Tuition once the
  // scholarship is applied — scholarship only ever applies to Tuition.
  // This is purely a frontend estimate; the real discount + installment
  // split is computed server-side once status = Approved.
  const discountedAmountPreview = useMemo(() => {
    const tuitionLine = feePlan.Tuition;
    if (!tuitionLine?.enabled) return null;
    const base = Number(tuitionLine.amount);
    if (!scholarship.enabled || !base || scholarship.status !== "Approved") return null;
    if (scholarship.type === "Percentage") {
      const pct = Number(scholarship.percentage);
      if (!pct && pct !== 0) return null;
      return Math.max(0, base - (base * pct) / 100).toFixed(2);
    }
    const amt = Number(scholarship.amount);
    if (!amt && amt !== 0) return null;
    return Math.max(0, base - amt).toFixed(2);
  }, [feePlan, scholarship]);

  // ================== GRADE (derived, read-only) ==================
  // Grade is NOT a field we store on the enrollment or the student.
  // ClassGroup already points at exactly one Grade (ClassGroup.grade),
  // so once an admin picks a class group, the grade is fully determined —
  // we just look it up from the already-loaded classGroups list and show
  // it as a read-only confirmation. This avoids keeping "grade" as a
  // second, independently-editable fact that could drift out of sync with
  // whatever classGroup is actually selected (the same kind of bug the
  // // ✅ FIX comments in classGroupControllers.js are guarding against
  // for the courses field).
  const selectedClassGroupObj = useMemo(
    () => (classGroupsData?.classGroups || []).find((g) => g._id === classGroup),
    [classGroupsData, classGroup]
  );

  const derivedGradeName =
    selectedClassGroupObj?.grade?.gradeName ||
    selectedClassGroupObj?.grade?.name ||
    "";

  const derivedAcademicLevelName =
    selectedClassGroupObj?.academicLevel?.name || "";

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!student || !academicYear || !classGroup || !startDate) {
      return toast.error(t("Please fill all required fields"));
    }
    if (status !== "active" && !endDate) {
      return toast.error(t("Non-active enrollments must have an end date"));
    }
    if (endDate && startDate >= endDate) {
      return toast.error(t("Start date must be earlier than end date"));
    }

    // At least one fee type must be selected in the planner.
    if (enabledFeeLines.length === 0) {
      return toast.error(
        t("Please select at least one fee type (e.g. Tuition) and fill in its details")
      );
    }
    for (const type of enabledFeeLines) {
      const line = feePlan[type];
      if (!line.amount || !line.dueDate || !line.paymentFrequency) {
        return toast.error(
          t("Please fill in amount, due date, and payment frequency for {{type}} fee", { type })
        );
      }
      if (Number(line.amount) <= 0) {
        return toast.error(t("{{type}} amount must be greater than 0", { type }));
      }
    }

    // scholarship validation — only runs if the admin turned it on.
    if (scholarship.enabled) {
      if (!feePlan.Tuition?.enabled) {
        return toast.error(
          t("A scholarship needs a Tuition fee line — please enable Tuition in the fee plan")
        );
      }
      if (!scholarship.criteria.trim()) {
        return toast.error(t("Please describe the scholarship criteria"));
      }
      if (scholarship.type === "Percentage") {
        const pct = Number(scholarship.percentage);
        if (scholarship.percentage === "" || pct < 0 || pct > 100) {
          return toast.error(t("Scholarship percentage must be between 0 and 100"));
        }
      } else if (scholarship.type === "Fixed") {
        if (scholarship.amount === "" || Number(scholarship.amount) < 0) {
          return toast.error(t("Scholarship amount must be 0 or greater"));
        }
      }
    }

    // 👇 NEW: block the form from here until we either navigate away or
    // hit an error — covers the enrollment save AND the scholarship save
    // AND the toast/navigate, not just the enrollment mutation.
    setIsSubmitting(true);

    const payload = { ...enrollment };
    if (payload.campus === "") delete payload.campus;
    // Active enrollments may legitimately have no end date yet — send null
    // instead of "" so Mongoose doesn't try (and fail) to cast an empty
    // string to a Date.
    payload.endDate = payload.endDate === "" ? null : payload.endDate;

    // Only the fee types the admin actually ticked go into the plan —
    // a student who isn't taking transport won't have a Transport line,
    // and so won't be charged for it.
    payload.feePlan = enabledFeeLines.map((type) => {
      const line = feePlan[type];
      return {
        feeType: type,
        amount: Number(line.amount),
        currency: line.currency,
        paymentFrequency: line.paymentFrequency,
        dueDate: line.dueDate,
        ...(line.paymentMethod ? { paymentMethod: line.paymentMethod } : {}),
      };
    });

    try {
      // 1) Save the enrollment first (student & academicYear are protected
      // on update — backend strips them anyway). The backend splits each
      // fee plan line into installments (Fees, Pending) based on its
      // payment frequency.
      const result = isEditMode
        ? await updateEnrollment({ id: enrollmentIdFromUrl, ...payload }).unwrap()
        : await createEnrollment(payload).unwrap();

      const savedEnrollmentId = result?.enrollment?._id || enrollmentIdFromUrl;

      // 2) Optionally save the scholarship, linked to this enrollment.
      // Saving it here (after the enrollment) triggers the backend to
      // recompute the Tuition installments with the discount applied.
      if (scholarship.enabled) {
        const scholarshipPayload = {
          studentId: student,
          academicYear,
          enrollment: savedEnrollmentId,
          campus: payload.campus || undefined,
          type: scholarship.type,
          criteria: scholarship.criteria.trim(),
          status: scholarship.status,
          ...(scholarship.type === "Percentage"
            ? { percentage: Number(scholarship.percentage) }
            : { amount: Number(scholarship.amount) }),
        };

        if (existingScholarshipId) {
          await updateScholarship({ id: existingScholarshipId, ...scholarshipPayload }).unwrap();
        } else {
          await createScholarship(scholarshipPayload).unwrap();
        }
      }

      toast.success(t("Enrollment saved successfully"));
      navigate("/admin/studentenrollements");
      // Deliberately NOT resetting isSubmitting here — navigate() unmounts
      // this component on success, so there's nothing left to re-enable.
    } catch (err) {
      toast.error(err?.data?.message || t("Error saving enrollment"));
      // 👇 On failure we DO need to give control back so the admin can
      // fix whatever was wrong and try again.
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (fetchError) toast.error(fetchError?.data?.message || t("Could not load enrollment"));
  }, [fetchError, t]);

  // ================== DROPDOWN OPTIONS ==================
  const studentOptions = useMemo(
    () =>
      (studentsData?.users || []).map((user) => ({
        value: user._id,
        label: getFullName(user) || user.email,
        subtitle: user.email,
      })),
    [studentsData]
  );

  const academicYearOptions = useMemo(
    () =>
      (academicYearsData?.academicYears || []).map((year) => ({
        value: year._id,
        label: year.name,
        subtitle: year.description,
      })),
    [academicYearsData]
  );

  const classGroupOptions = useMemo(
    () =>
      (classGroupsData?.classGroups || []).map((group) => ({
        value: group._id,
        label: group.displayName || `${group.grade?.gradeName || ""} ${group.section || ""}`,
        // shown as a subtitle in the dropdown itself so the grade is
        // visible even before selecting — purely a display hint, not
        // stored anywhere.
        subtitle: group.grade?.gradeName || group.grade?.name || "",
      })),
    [classGroupsData]
  );

  const campusOptions = useMemo(
    () =>
      (campusesData?.campuses || []).map((c) => ({
        value: c._id,
        label: c.name,
        subtitle: c.address,
      })),
    [campusesData]
  );

  // 👇 previously just `isCreating`/`isUpdating` — now also covers the
  // gap after those mutations settle but before the scholarship
  // save/navigate finishes.
  const isSaving = (isEditMode ? isUpdating : isCreating) || isSubmitting;

  if (enrollmentLoading && isEditMode) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={isEditMode ? t("Edit Enrollment") : t("New Student Enrollment")} />

      {/* 👇 NEW: relative wrapper so the loading overlay below can cover
          exactly this form area (header + info box + form), nothing else
          on the page. */}
      <div className="max-w-6xl mx-auto space-y-6 relative">
        <AppPageHeader
          title={isEditMode ? t("Edit Enrollment") : t("New Student Enrollment")}
          subtitle={
            isEditMode
              ? t("Update enrollment details, dates, class group, or fee plan")
              : t("Enroll a student for an academic year and plan their fees")
          }
          backUrl="/admin/studentenrollements"
        />

        {/* Derived Grade confirmation — read-only, appears once a class
            group is picked. Nothing here is saved as its own field; it's
            purely reflecting classGroup.grade back to the admin. */}
        {classGroup && derivedGradeName && (
          <AppInfoBox icon="fa-graduation-cap">
            <strong>{t("Grade")}:</strong> {derivedGradeName}
            {derivedAcademicLevelName ? ` (${derivedAcademicLevelName})` : ""} —{" "}
            {t("automatically determined by the selected class group")}.
          </AppInfoBox>
        )}

        <StudentEnrollmentForm
          isEditMode={isEditMode}
          enrollment={enrollment}
          onChange={onChange}
          onSubmit={submitHandler}
          isSubmitting={isSaving}
          // Student
          studentSearch={studentSearch}
          onStudentSearch={setStudentSearch}
          studentOptions={studentOptions}
          studentsLoading={studentsLoading}
          preselectedStudentName={preselectedStudentName}
          studentReadOnly={studentReadOnly}
          studentValue={student}
          // Academic Year
          academicYearSearch={academicYearSearch}
          onAcademicYearSearch={setAcademicYearSearch}
          academicYearOptions={academicYearOptions}
          academicYearsLoading={academicYearsLoading}
          academicYearValue={academicYear}
          onAcademicYearChange={(val) => onChange("academicYear", val)}
          academicYearDisabled={isEditMode}
          // Class Group
          classGroupSearch={classGroupSearch}
          onClassGroupSearch={setClassGroupSearch}
          classGroupOptions={classGroupOptions}
          classGroupsLoading={classGroupsLoading}
          classGroupValue={classGroup}
          onClassGroupChange={(val) => onChange("classGroup", val)}
          // Derived grade info, passed through in case StudentEnrollmentForm
          // wants to render it inline near the class group field instead of
          // (or in addition to) the AppInfoBox above.
          selectedGradeName={derivedGradeName}
          selectedAcademicLevelName={derivedAcademicLevelName}
          // Campus
          campusSearch={campusSearch}
          onCampusSearch={setCampusSearch}
          campusOptions={campusOptions}
          campusesLoading={campusesLoading}
          campusValue={campus}
          onCampusChange={(val) => onChange("campus", val)}
          // Fee plan (multi-line planner)
          feeTypes={FEE_TYPES}
          feeTypeFrequencies={FEE_TYPE_FREQUENCIES}
          feePlan={feePlan}
          onFeeLineChange={onFeeLineChange}
          linkedFees={linkedFees}
          // Scholarship
          scholarship={scholarship}
          onScholarshipChange={onScholarshipChange}
          discountedAmountPreview={discountedAmountPreview}
        />

        {/* 👇 NEW: blocking overlay — covers the whole form (not just the
            submit button) for the entire submit flow, including the gap
            between the enrollment mutation settling and the scholarship
            save + navigate finishing, so nothing here can be edited or
            re-submitted while a save is genuinely still in flight. Solid
            background (no blur) with the same branded Loader used
            everywhere else in the app. */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center rounded-xl">
            <Loader />
            <p className="text-sm-custom text-dark-light font-medium -mt-6">
              {t("Saving enrollment...")}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UpdateStudentEnrollment;