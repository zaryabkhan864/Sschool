// component
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetUserByTypeQuery, useGetUserDetailsQuery } from "../../redux/api/authApi";
import { useGetAcademicYearsListQuery } from "../../redux/api/academicYearApi";
import { useGetCampusQuery } from "../../redux/api/campusApi";
import {
  useCreateEmployeeContractMutation,
  useUpdateEmployeeContractMutation,
  useUpdateLeaveAllowanceMutation,
  useGetEmployeeContractDetailsQuery,
} from "../../redux/api/employeeContractApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import Loader from "../layout/Loader";
import EmployeeContractForm from "../GUI/EmployeeContractForm";

const STAFF_ROLES = [
  "student",
  "teacher",
  "coordinator",
  "principle",
  "vice_principal",
  "finance",
  "admin",
  "registrar",
  "manager",
  "assistant",
  "librarian",
  "counselor",
  "it_support",
  "security",
  "maintenance",
  "superadmin",
  "parent",
  "receptionist",
  "transport_manager",
  "driver",
  "cleaner",
];

const UpdateEmployeeContract = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const employeeIdFromUrl = searchParams.get("employeeId");
  const contractIdFromUrl = searchParams.get("contractId");
  const isEditMode = Boolean(contractIdFromUrl);

  const [contract, setContract] = useState({
    employee: employeeIdFromUrl || "",
    role: "",
    campus: "",
    academicYear: "",
    startDate: "",
    endDate: "",
    baseSalary: "",
    paymentType: "monthly",
    currency: "USD",
    allowances: { houseRent: "", medical: "" },
    annualLeaveAllowance: "",
    status: "active",
    note: "",
  });

  // Tracks the allowance value as it was when the contract was loaded,
  // so we only fire the dedicated leave-allowance update when it actually changed.
  const [initialLeaveAllowance, setInitialLeaveAllowance] = useState(null);

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [academicYearSearch, setAcademicYearSearch] = useState("");
  const [campusSearch, setCampusSearch] = useState("");

  const [createContract, { isLoading: isCreating, error: createError, isSuccess: createSuccess }] =
    useCreateEmployeeContractMutation();
  const [updateContract, { isLoading: isUpdating, error: updateError, isSuccess: updateSuccess }] =
    useUpdateEmployeeContractMutation();
  const [updateLeaveAllowance, { isLoading: isUpdatingAllowance, error: allowanceError }] =
    useUpdateLeaveAllowanceMutation();

  const { data: contractDetails, isLoading: contractLoading, error: fetchError } =
    useGetEmployeeContractDetailsQuery(contractIdFromUrl, {
      skip: !isEditMode,
    });

  const { data: employeeDetailsData } = useGetUserDetailsQuery(employeeIdFromUrl, {
    skip: !employeeIdFromUrl,
  });

  const preselectedEmployeeName = employeeDetailsData?.user
    ? `${employeeDetailsData.user.firstName || ""} ${employeeDetailsData.user.middleName || ""} ${employeeDetailsData.user.lastName || ""}`.trim()
    : "";

  const { data: employeesData, isFetching: employeesLoading } = useGetUserByTypeQuery(
    { type: "employee", contracted: false, limit: 0, keyword: employeeSearch },
    { skip: isEditMode || !!employeeIdFromUrl }
  );

  const { data: academicYearsData, isFetching: academicYearsLoading } =
    useGetAcademicYearsListQuery({
      limit: 0,
      sort: "-createdAt",
      keyword: academicYearSearch,
    });

  const { data: campusesData, isFetching: campusesLoading } = useGetCampusQuery({
    limit: 0,
    keyword: campusSearch,
  });

  useEffect(() => {
    if (isEditMode && contractDetails?.contract) {
      const c = contractDetails.contract;
      const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");
      const leaveAllowance = c.salary?.annualLeaveAllowance ?? 0;
      setContract({
        employee: c.employee?._id || c.employee,
        role: c.role || "",
        campus: c.campus?._id || c.campus,
        academicYear: c.academicYear?._id || c.academicYear,
        startDate: formatDate(c.startDate),
        endDate: formatDate(c.endDate),
        baseSalary: c.salary?.baseSalary != null ? c.salary.baseSalary : "",
        paymentType: c.salary?.paymentType || "monthly",
        currency: c.salary?.currency || "USD",
        allowances: {
          houseRent: c.salary?.allowances?.houseRent ?? "",
          medical: c.salary?.allowances?.medical ?? "",
        },
        annualLeaveAllowance: leaveAllowance,
        status: c.status || "active",
        note: c.note || "",
      });
      setInitialLeaveAllowance(leaveAllowance);
    }
  }, [contractDetails, isEditMode]);

  useEffect(() => {
    if (createError) toast.error(createError?.data?.message || t("Error creating contract"));
    if (updateError) toast.error(updateError?.data?.message || t("Error updating contract"));
    if (allowanceError) toast.error(allowanceError?.data?.message || t("Error updating leave allowance"));
    if (createSuccess || updateSuccess) {
      toast.success(t("Contract saved successfully"));
      navigate("/admin/employee-contracts");
    }
  }, [createError, updateError, allowanceError, createSuccess, updateSuccess, navigate, t]);

  useEffect(() => {
    if (fetchError) toast.error(fetchError?.data?.message || t("Could not load contract"));
  }, [fetchError, t]);

  useEffect(() => {
    if (!isEditMode && contract.employee && !employeeIdFromUrl) {
      const selectedEmployee = employeesData?.users?.find((u) => u._id === contract.employee);
      if (selectedEmployee?.role) {
        setContract((prev) => ({ ...prev, role: selectedEmployee.role }));
      }
    }
  }, [contract.employee, employeesData, isEditMode, employeeIdFromUrl]);

  // Generic field updater (field, value) style — StatusSelect direct value ke saath bhi kaam karega
  const onChange = (field, value) => {
    setContract((prev) => ({ ...prev, [field]: value }));
  };

  const onAllowanceChange = (field, value) => {
    setContract((prev) => ({
      ...prev,
      allowances: { ...prev.allowances, [field]: value },
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!contract.employee || !contract.role || !contract.academicYear || !contract.startDate) {
      return toast.error(t("Please fill all required fields"));
    }
    if (!contract.baseSalary) {
      return toast.error(t("Please enter a base salary"));
    }

    const annualLeaveAllowanceNum = Number(contract.annualLeaveAllowance) || 0;
    if (annualLeaveAllowanceNum < 0) {
      return toast.error(t("Annual leave allowance cannot be negative"));
    }

    const payload = {
      employee: contract.employee,
      role: contract.role,
      campus: contract.campus || undefined,
      academicYear: contract.academicYear,
      startDate: contract.startDate,
      endDate: contract.endDate || null,
      salary: {
        baseSalary: Number(contract.baseSalary),
        paymentType: contract.paymentType || "monthly",
        currency: contract.currency || "USD",
        allowances: {
          houseRent: Number(contract.allowances.houseRent) || 0,
          medical: Number(contract.allowances.medical) || 0,
        },
        annualLeaveAllowance: annualLeaveAllowanceNum,
      },
      status: contract.status,
      note: contract.note || undefined,
    };

    if (!payload.note) delete payload.note;

    if (isEditMode) {
      // The generic update endpoint intentionally locks the whole salary
      // block (including annualLeaveAllowance) — so if it changed, apply it
      // through the dedicated leave-allowance endpoint as well.
      try {
        await updateContract({ id: contractIdFromUrl, ...payload }).unwrap();
        if (annualLeaveAllowanceNum !== initialLeaveAllowance) {
          await updateLeaveAllowance({
            id: contractIdFromUrl,
            annualLeaveAllowance: annualLeaveAllowanceNum,
          }).unwrap();
        }
        toast.success(t("Contract saved successfully"));
        navigate("/admin/employee-contracts");
      } catch (err) {
        // errors are already surfaced via the error effects above
      }
    } else {
      createContract(payload);
    }
  };

  const employeeOptions = useMemo(
    () =>
      (employeesData?.users || []).map((user) => ({
        value: user._id,
        label: `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`.trim() || user.email,
        subtitle: user.role || user.email,
      })),
    [employeesData]
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

  const campusOptions = useMemo(
    () =>
      (campusesData?.campuses || []).map((c) => ({
        value: c._id,
        label: c.name,
        subtitle: c.address,
      })),
    [campusesData]
  );

  const roleOptions = useMemo(
    () =>
      STAFF_ROLES.map((r) => ({
        value: r,
        label: t(r.charAt(0).toUpperCase() + r.slice(1).replace("_", " ")),
      })),
    [t]
  );

  if (contractLoading && isEditMode) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={isEditMode ? t("Edit Contract") : t("New Employee Contract")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={isEditMode ? t("Edit Contract") : t("New Employee Contract")}
          subtitle={
            isEditMode
              ? t("Update contract details, dates, salary, or allowances")
              : t("Create a new employment contract for a staff member")
          }
          backUrl="/admin/employee-contracts"
        />

        {/* Main contract form (Status field ab isi ke andar StatusSelect use karta hai) */}
        <EmployeeContractForm
          isEditMode={isEditMode}
          contract={contract}
          onChange={onChange}
          onAllowanceChange={onAllowanceChange}
          onSubmit={submitHandler}
          isSubmitting={isEditMode ? (isUpdating || isUpdatingAllowance) : isCreating}
          // Employee
          employeeSearch={employeeSearch}
          onEmployeeSearch={setEmployeeSearch}
          employeeOptions={employeeOptions}
          employeesLoading={employeesLoading}
          preselectedEmployeeName={preselectedEmployeeName}
          employeeReadOnly={!!employeeIdFromUrl || isEditMode}
          employeeValue={contract.employee}
          // Role
          roleOptions={roleOptions}
          roleValue={contract.role}
          onRoleChange={(val) => onChange("role", val)}
          // Campus
          campusSearch={campusSearch}
          onCampusSearch={setCampusSearch}
          campusOptions={campusOptions}
          campusesLoading={campusesLoading}
          campusValue={contract.campus}
          onCampusChange={(val) => onChange("campus", val)}
          // Academic Year
          academicYearSearch={academicYearSearch}
          onAcademicYearSearch={setAcademicYearSearch}
          academicYearOptions={academicYearOptions}
          academicYearsLoading={academicYearsLoading}
          academicYearValue={contract.academicYear}
          onAcademicYearChange={(val) => onChange("academicYear", val)}
          academicYearDisabled={isEditMode}
          // Salary
          paymentType={contract.paymentType}
          onPaymentTypeChange={(val) => onChange("paymentType", val)}
          currency={contract.currency}
          onCurrencyChange={(val) => onChange("currency", val)}
        />
      </div>
    </AdminLayout>
  );
};

export default UpdateEmployeeContract;
