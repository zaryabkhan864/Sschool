import React, { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

// Redux
import {
  useCreateCounselingMutation,
  useGetCounselingsQuery,
} from "../../redux/api/counselingApi";
import { useGetUserByTypeQuery } from "../../redux/api/authApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";

const StudentCounseling = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetCounselingsQuery();

  // Current logged-in user (Redux store se) – only used for role check, not sent to API
  const { user } = useSelector((state) => state.auth);

  // ------------------ Students (single select with search & infinite scroll) ------------------
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [studentsList, setStudentsList] = useState([]);
  const [hasMoreStudents, setHasMoreStudents] = useState(true);

  const {
    data: studentsData,
    isFetching: studentsLoading,
  } = useGetUserByTypeQuery({
    type: "student",
    page: studentPage,
    limit: 10,
    keyword: studentSearchTerm,
  });

  useEffect(() => {
    if (studentsData?.users) {
      const newStudents = studentsData.users;
      setStudentsList((prev) =>
        studentPage === 1 ? newStudents : [...prev, ...newStudents]
      );
      setHasMoreStudents(newStudents.length === 10);
    }
  }, [studentsData, studentPage]);

  const handleStudentSearch = useCallback((searchValue, page) => {
    setStudentSearchTerm(searchValue);
    setStudentPage(page);
    if (page === 1) setStudentsList([]);
  }, []);

  const studentOptions = useMemo(
    () =>
      studentsList.map((s) => ({
        value: s._id,
        label: `${s.name} – ${
          s.grade?.[0]?.gradeDetails?.gradeName || t("No Grade Assigned")
        }`,
      })),
    [studentsList, t]
  );

  // ------------------ Issue type options ------------------
  const issueTypeOptions = [
    { value: "Fighting", label: t("Fighting") },
    { value: "Misbehavior", label: t("Misbehavior") },
    { value: "Academic", label: t("Academic") },
    { value: "Attendance", label: t("Attendance") },
    { value: "Bullying", label: t("Bullying") },
    { value: "Personal issue", label: t("Personal Issue") },
    { value: "Other", label: t("Other") },
  ];

  // ------------------ Form state ------------------
  const [counseling, setCounseling] = useState({
    student: "",
    issueType: "",
    complainDescription: "",
    incidentDate: "",
  });
  const { student, issueType, complainDescription, incidentDate } = counseling;

  // ------------------ Create counseling mutation ------------------
  const [createCounseling, { isLoading, error, isSuccess }] =
    useCreateCounselingMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error creating counseling"));
    }
    if (isSuccess) {
      toast.success(t("Counseling created successfully"));
      navigate("/admin/counselings");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch, t]);

  // ------------------ Form change handler ------------------
  const onChange = (e) => {
    const { name, value } = e.target;
    setCounseling((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------ Submit handler with fix for issueType casing ------------------
  const submitHandler = (e) => {
    e.preventDefault();

    // Validation
    if (!student) {
      toast.error(t("Please select a student"));
      return;
    }
    if (!issueType) {
      toast.error(t("Please select an issue type"));
      return;
    }
    if (!complainDescription || complainDescription.trim() === "") {
      toast.error(t("Please describe the complaint"));
      return;
    }

    // Ensure issueType starts with a capital letter (e.g., "misbehavior" → "Misbehavior")
    const formattedIssueType = issueType
      ? issueType.charAt(0).toUpperCase() + issueType.slice(1)
      : issueType;

    // Prepare payload – only fields expected by the controller
    const payload = {
      student,
      issueType: formattedIssueType,
      complainDescription,
    };

    // Add incidentDate only if provided (controller will use default if not sent)
    if (incidentDate) {
      payload.incidentDate = incidentDate;
    }

    createCounseling(payload);
  };

  return (
    <AdminLayout>
      <MetaData title={t("Student Counseling")} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title={t("Student Counseling")}
          subtitle={t("Record a new counseling session")}
          backUrl="/admin/counselings"
        />

        <form onSubmit={submitHandler}>
          <AppCard
            title={t("Counseling Details")}
            icon="fa-comments"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/counselings" />
                <AppButton
                  type="submit"
                  label={t("Create Counseling")}
                  loadingLabel={t("Creating...")}
                  isLoading={isLoading}
                  icon="fa-save"
                />
              </div>
            }
          >
            {/* Student Select - Full Width */}
            <div className="mb-4">
              <SearchableDropdown
                label={t("Student Name")}
                placeholder={t("Search student...")}
                value={student}
                onChange={(selectedValue) =>
                  setCounseling({ ...counseling, student: selectedValue })
                }
                onSearch={handleStudentSearch}
                options={studentOptions}
                isLoading={studentsLoading}
                hasMore={hasMoreStudents}
                required
                emptyMessage={t("No results found")}
                loadingMessage={t("Loading...")}
              />
            </div>

            {/* Row 1: Issue Type and Incident Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Issue Type – dropdown */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase block mb-1.5">
                  {t("Issue Type")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="issueType"
                  value={issueType}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="" disabled>
                    {t("Select Issue Type")}
                  </option>
                  {issueTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Incident Date */}
              <AppInput
                label={t("Incident Date")}
                type="date"
                name="incidentDate"
                value={incidentDate}
                onChange={onChange}
                helperText={t("If not provided, today's date will be used")}
              />
            </div>

            {/* Row 2: Complain Description */}
            <div className="mb-4">
              <AppInput
                label={t("Complain / Problem")}
                name="complainDescription"
                value={complainDescription}
                onChange={onChange}
                type="textarea"
                rows={2}
                required
              />
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default StudentCounseling;