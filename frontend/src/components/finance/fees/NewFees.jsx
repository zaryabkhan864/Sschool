import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateFeeMutation } from "../../../redux/api/feesApi";
import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import { useGetUserByTypeQuery } from "../../../redux/api/userApi";
import { useTranslation } from "react-i18next";

const NewFees = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [createFees, { isLoading, error, isSuccess }] = useCreateFeeMutation();

  // 1 get student data
  const { data: studentsData, isLoading: studentLoading } = useGetUserByTypeQuery("student");
  console.log("studentsData", studentsData);

  // 2 ensure proper array handling like counseling component
  const students = studentsData?.users || studentsData?.students || [];

  const [feesData, setFeesData] = useState({
    student: "",
    amount: "",
    feeType: "",
    currency: "USD",
    dueDate: "",
    status: "Unpaid",
    paymentDate: "",
    paymentMethod: "",
  });

  const { student, amount, feeType, currency, dueDate, status, paymentDate, paymentMethod } = feesData;

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Something went wrong!");
    }

    if (isSuccess) {
      toast.success("Fees record created successfully");
      navigate("/finance/students/fees");
    }
  }, [error, isSuccess, navigate]);

  const onChange = (e) => {
    setFeesData({ ...feesData, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!student) {
      toast.error("Please select a student!");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }
    if (!feeType) {
      toast.error("Please select fee type!");
      return;
    }
    if (!dueDate) {
      toast.error("Please select due date!");
      return;
    }
    createFees(feesData);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Fees"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t("New Fees")}</h2>
          <form onSubmit={submitHandler}>
            {/* Student Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t("Student Name")}
              </label>
              <select
                id="student_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="student"
                value={student}
                onChange={onChange}
                required
              >
                <option value="" disabled>
                  {t("Select Student")}
                </option>
                {!studentLoading &&
                  students?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} -{" "}
                      {s.currentGrade?.gradeName ||
                        s.gradeDetails?.[0]?.gradeName ||
                        "No Grade Assigned"}
                    </option>
                  ))}
              </select>
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Amount")}
                </label>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={amount}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Currency")}
                </label>
                <select
                  name="currency"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currency}
                  onChange={onChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="TL">TL</option>
                  <option value="AUD">AUD</option>
                  <option value="CAD">CAD</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t("Due Date")}
              </label>
              <input
                type="date"
                name="dueDate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dueDate}
                onChange={onChange}
                required
              />
            </div>

            {/* Fee Type & Payment Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Fee Type")}
                </label>
                <select
                  name="feeType"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={feeType}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>
                    {t("Select Fee Type")}
                  </option>
                  <option value="Admission">{t("Admission")}</option>
                  <option value="Tuition">{t("Tuition")}</option>
                  <option value="Exam">{t("Exam")}</option>
                  <option value="Transport">{t("Transport")}</option>
                  <option value="Hostel">{t("Hostel")}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Payment Method")}
                </label>
                <select
                  name="paymentMethod"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={paymentMethod}
                  onChange={onChange}
                >
                  <option value="" disabled>
                    {t("Select Payment Method")}
                  </option>
                  <option value="Cash">{t("Cash")}</option>
                  <option value="Bank Transfer">{t("Bank Transfer")}</option>
                  <option value="Online">{t("Online")}</option>
                </select>
              </div>
            </div>

            {/* Status & Payment Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Status")}
                </label>
                <select
                  name="status"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={status}
                  onChange={onChange}
                >
                  <option value="Unpaid">{t("Unpaid")}</option>
                  <option value="Paid">{t("Paid")}</option>
                  <option value="Pending">{t("Pending")}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Payment Date")}
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={paymentDate}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "CREATE"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewFees;
