// component
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

// Redux
import {
  useCreateCounselingMutation,
  useGetCounselingsQuery,
} from "../../redux/api/counselingApi";
import {
  useGetClassGroupsForDropdownQuery,
  useGetClassGroupStudentsQuery,
} from "../../redux/api/classGroupApi";
import { useGetUserByTypeQuery } from "../../redux/api/authApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";

const getFullName = (user) => {
  if (!user) return "";
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  return parts.join(" ");
};

// Small pill toggle switch (same style as scholarship toggle)
const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    <span
      onClick={() => onChange(!checked)}
      className={
        "rounded-full p-0.5 transition-colors flex items-center " +
        (checked ? "bg-red-600 justify-end" : "bg-gray-300 justify-start")
      }
      style={{ width: 40, height: 22 }}
    >
      <span className="bg-white rounded-full shadow" style={{ width: 18, height: 18 }} />
    </span>
  </label>
);

const StudentCounseling = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetCounselingsQuery();

  const { user } = useSelector((state) => state.auth);

  // ------------------ Class Group dropdown ------------------
  const { data: classGroupsData, isFetching: classGroupsLoading } =
    useGetClassGroupsForDropdownQuery({ status: "active" });

  const classGroupOptions = useMemo(
    () =>
      (classGroupsData || []).map((cg) => ({
        value: cg._id,
        label:
          cg.displayName ||
          `${cg?.grade?.gradeName || ""} - ${cg?.section || ""}`,
      })),
    [classGroupsData]
  );

  const [selectedClassGroup, setSelectedClassGroup] = useState("");
  const [classGroupSearchTerm, setClassGroupSearchTerm] = useState("");

  const filteredClassGroupOptions = useMemo(() => {
    if (!classGroupSearchTerm.trim()) return classGroupOptions;
    return classGroupOptions.filter((opt) =>
      opt.label.toLowerCase().includes(classGroupSearchTerm.toLowerCase())
    );
  }, [classGroupOptions, classGroupSearchTerm]);

  // ------------------ Students of the selected Class Group ------------------
  const {
    data: classGroupStudentsData,
    isFetching: studentsLoading,
  } = useGetClassGroupStudentsQuery(selectedClassGroup, {
    skip: !selectedClassGroup,
  });

  const studentOptions = useMemo(
    () =>
      (classGroupStudentsData?.students || []).map((s) => ({
        value: s._id,
        label: [s.firstName, s.middleName, s.lastName]
          .filter(Boolean)
          .join(" "),
      })),
    [classGroupStudentsData]
  );

  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const filteredStudentOptions = useMemo(() => {
    if (!studentSearchTerm.trim()) return studentOptions;
    return studentOptions.filter((opt) =>
      opt.label.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );
  }, [studentOptions, studentSearchTerm]);

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

  const [issueTypeSearchTerm, setIssueTypeSearchTerm] = useState("");

  const filteredIssueTypeOptions = useMemo(() => {
    if (!issueTypeSearchTerm.trim()) return issueTypeOptions;
    return issueTypeOptions.filter((opt) =>
      opt.label.toLowerCase().includes(issueTypeSearchTerm.toLowerCase())
    );
  }, [issueTypeOptions, issueTypeSearchTerm]);

  // ------------------ Form state ------------------
  const [counseling, setCounseling] = useState({
    student: "",
    issueType: "",
    complainDescription: "",
    incidentDate: "",
  });
  const { student, issueType, complainDescription, incidentDate } = counseling;

  // ------------------ Teacher involvement state ------------------
  const [involveTeacher, setInvolveTeacher] = useState(false);
  const [teacher, setTeacher] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  // Fetch teachers only if involveTeacher is true
  const {
    data: teachersData,
    isFetching: teachersLoading,
  } = useGetUserByTypeQuery(
    {
      type: "teacher",
      contracted: true,
      status: "active",
      limit: 0,
      keyword: teacherSearchTerm,
    },
    { skip: !involveTeacher }
  );

  const teacherOptions = useMemo(() => {
    if (!teachersData?.users) return [];
    return teachersData.users.map((user) => ({
      value: user._id,
      label: getFullName(user) || user.email,
    }));
  }, [teachersData]);

  const handleClassGroupChange = (value) => {
    setSelectedClassGroup(value);
    setCounseling((prev) => ({ ...prev, student: "" }));
    setStudentSearchTerm("");
  };

  const handleStudentChange = (value) => {
    setCounseling((prev) => ({ ...prev, student: value }));
  };

  const handleIssueTypeChange = (value) => {
    setCounseling((prev) => ({ ...prev, issueType: value }));
  };

  const handleTeacherChange = (value) => {
    setTeacher(value);
  };

  // ------------------ Toggle teacher involvement ------------------
  const toggleTeacherInvolvement = (nextValue) => {
    setInvolveTeacher(nextValue);
    if (!nextValue) {
      setTeacher("");
      setTeacherSearchTerm("");
    }
  };

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setCounseling((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!selectedClassGroup) {
      toast.error(t("Please select a class group"));
      return;
    }
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
    if (involveTeacher && !teacher) {
      toast.error(t("Please select a teacher to involve"));
      return;
    }

    const formattedIssueType = issueType
      ? issueType.charAt(0).toUpperCase() + issueType.slice(1)
      : issueType;

    const payload = {
      student,
      issueType: formattedIssueType,
      complainDescription,
    };

    if (incidentDate) {
      payload.incidentDate = incidentDate;
    }

    if (involveTeacher && teacher) {
      payload.teacher = teacher;
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
            {/* Row: Class Group and Student */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SearchableDropdown
                label={t("Class Group")}
                placeholder={t("Select Class Group")}
                value={selectedClassGroup}
                onChange={handleClassGroupChange}
                onSearch={(searchValue) => setClassGroupSearchTerm(searchValue)}
                options={filteredClassGroupOptions}
                isLoading={classGroupsLoading}
                hasMore={false}
                emptyMessage={t("No class group found")}
                loadingMessage={t("Loading...")}
              />

              <SearchableDropdown
                label={t("Student Name")}
                placeholder={
                  !selectedClassGroup
                    ? t("Select a class group first")
                    : t("Select Student")
                }
                value={student}
                onChange={handleStudentChange}
                onSearch={(searchValue) => setStudentSearchTerm(searchValue)}
                options={filteredStudentOptions}
                isLoading={studentsLoading}
                hasMore={false}
                emptyMessage={t("No students found")}
                loadingMessage={t("Loading...")}
                disabled={!selectedClassGroup}
              />
            </div>

            {/* Row: Issue Type and Incident Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SearchableDropdown
                label={t("Issue Type")}
                placeholder={t("Select Issue Type")}
                value={issueType}
                onChange={handleIssueTypeChange}
                onSearch={(searchValue) => setIssueTypeSearchTerm(searchValue)}
                options={filteredIssueTypeOptions}
                isLoading={false}
                hasMore={false}
                emptyMessage={t("No issue type found")}
                loadingMessage=""
              />

              <AppInput
                label={t("Incident Date")}
                type="date"
                name="incidentDate"
                value={incidentDate}
                onChange={onChange}
                helperText={t("If not provided, today's date will be used")}
              />
            </div>

            {/* Complain Description */}
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

            {/* Teacher Involvement Section with Toggle */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("Teacher Involvement")}
                </span>
                <Toggle
                  checked={involveTeacher}
                  onChange={toggleTeacherInvolvement}
                  label={involveTeacher ? t("Remove Teacher") : t("Involve Teacher")}
                />
              </div>

              {involveTeacher && (
                <div className="mt-3">
                  <SearchableDropdown
                    label={t("Select Teacher")}
                    placeholder={t("Search and select teacher")}
                    value={teacher}
                    onChange={handleTeacherChange}
                    onSearch={setTeacherSearchTerm}
                    options={teacherOptions}
                    isLoading={teachersLoading}
                    hasMore={false}
                    emptyMessage={t("No teachers found")}
                    loadingMessage={t("Loading...")}
                    required
                  />
                </div>
              )}
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default StudentCounseling;