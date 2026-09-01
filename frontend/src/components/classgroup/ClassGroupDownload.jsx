import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

// Shared GUI components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import PrintLayout from "../GUI/PrintLayout";
import AppCard from "../GUI/AppCard";

// 20 Mock/Fake Students Data
const MOCK_STUDENTS = [
  { _id: "s1", rollNo: "STU-2026-001", name: "Aayan Ahmed", email: "aayan.ahmed@academy.edu" },
  { _id: "s2", rollNo: "STU-2026-002", name: "Zoya Khan", email: "zoya.khan@academy.edu" },
  { _id: "s3", rollNo: "STU-2026-003", name: "Muhammad Ali", email: "m.ali@academy.edu" },
  { _id: "s4", rollNo: "STU-2026-004", name: "Fatima Sana", email: "fatima.sana@academy.edu" },
  { _id: "s5", rollNo: "STU-2026-005", name: "Zainab Fatima", email: "zainab.f@academy.edu" },
  { _id: "s6", rollNo: "STU-2026-006", name: "Hamza Imran", email: "hamza.i@academy.edu" },
  { _id: "s7", rollNo: "STU-2026-007", name: "Ayesha Siddiqua", email: "ayesha.s@academy.edu" },
  { _id: "s8", rollNo: "STU-2026-008", name: "Bilal Hassan", email: "bilal.h@academy.edu" },
  { _id: "s9", rollNo: "STU-2026-009", name: "Eshal Noor", email: "eshal.noor@academy.edu" },
  { _id: "s10", rollNo: "STU-2026-010", name: "Mustafa Qureshi", email: "mustafa.q@academy.edu" },
  { _id: "s11", rollNo: "STU-2026-011", name: "Haniya Rehman", email: "haniya.r@academy.edu" },
  { _id: "s12", rollNo: "STU-2026-012", name: "Omar Farooq", email: "omar.f@academy.edu" },
  { _id: "s13", rollNo: "STU-2026-013", name: "Maryam Jameel", email: "maryam.j@academy.edu" },
  { _id: "s14", rollNo: "STU-2026-014", name: "Saad Rizwan", email: "saad.r@academy.edu" },
  { _id: "s15", rollNo: "STU-2026-015", name: "Anaya Malik", email: "anaya.malik@academy.edu" },
  { _id: "s16", rollNo: "STU-2026-016", name: "Abdullah Tariq", email: "abdullah.t@academy.edu" },
  { _id: "s17", rollNo: "STU-2026-017", name: "Sara Ahmed", email: "sara.a@academy.edu" },
  { _id: "s18", rollNo: "STU-2026-018", name: "Usman Yousaf", email: "usman.y@academy.edu" },
  { _id: "s19", rollNo: "STU-2026-019", name: "Rania Lodhi", email: "rania.l@academy.edu" },
  { _id: "s20", rollNo: "STU-2026-020", name: "Yahya Khan", email: "yahya.k@academy.edu" },
];

// Mock Assigned Courses Data
const MOCK_COURSES = [
  { _id: "c1", courseName: "Mathematics", code: "MATH-101", teacher: { name: "Dr. Kamran Bilal" } },
  { _id: "c2", courseName: "General Science", code: "SCI-102", teacher: { name: "Miss Sarah Khan" } },
  { _id: "c3", courseName: "English Literature", code: "ENG-103", teacher: { name: "Prof. Asif Raza" } },
  { _id: "c4", courseName: "Computer Studies", code: "CS-104", teacher: { name: "Sir Zaryab Khan" } },
  { _id: "c5", courseName: "Social Studies", code: "SST-105", teacher: { name: "Miss Hina Zainab" } },
  { _id: "c6", courseName: "Mathematics", code: "MATH-101", teacher: { name: "Dr. Kamran Bilal" } },
  { _id: "c7", courseName: "General Science", code: "SCI-102", teacher: { name: "Miss Sarah Khan" } },
  { _id: "c8", courseName: "English Literature", code: "ENG-103", teacher: { name: "Prof. Asif Raza" } },
  { _id: "c9", courseName: "Computer Studies", code: "CS-104", teacher: { name: "Sir Zaryab Khan" } },
  { _id: "c10", courseName: "Social Studies", code: "SST-105", teacher: { name: "Miss Hina Zainab" } },
  { _id: "c11", courseName: "Computer Studies", code: "CS-104", teacher: { name: "Sir Zaryab Khan" } },
  { _id: "c12", courseName: "Social Studies", code: "SST-105", teacher: { name: "Miss Hina Zainab" } },
];

const ClassGroupDownload = () => {
  const { t } = useTranslation();
  const contentRef = useRef(null);

  // Direct Fake State Data without backend dependency
  const classGroup = {
    displayName: "1 A",
    academicLevelName: "Primary",
    gradeName: "1",
    section: "A",
    year: "2023-2024",
    status: "Active",
    createdAt: "July 7, 2026",
    updatedAt: "July 7, 2026",
    courses: MOCK_COURSES,
    students: MOCK_STUDENTS,
  };

  const teacherNames = [...new Set(classGroup.courses.map(c => c.teacher?.name).filter(Boolean))];

  return (
    <AdminLayout>
      <MetaData title={t("Class Group Report")} />

      <PrintLayout
        title={t("Class Group Report")}
        subtitle={t("Official Academic Record")}
        backUrl="/admin/class-groups"
        documentName={classGroup.displayName}
        contentRef={contentRef}
      >
        <AppCard className="bg-white p-6 border border-gray-300 shadow-sm print:shadow-none print:border-none">
          <div ref={contentRef} style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            
            {/* 1. Official Letterhead */}
            <div className="flex justify-between items-start border-b border-gray-400 pb-3 mb-4">
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none">
                  Academy Management System
                </h1>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-semibold">
                  Official Academic Record – Class Group Report
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter italic">
                  Ref No: CLG-E536C6
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">
                  {new Date().toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            {/* 2. Unified Compact Header Panel (No Blue Text, No Gray Background) */}
            <div className="border border-gray-300 rounded px-3.5 py-2.5 mb-5 text-xs">
              <div className="border-b border-gray-200 pb-1.5 mb-2 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">
                  {t("Class Group")}: <span className="font-extrabold text-gray-900">{classGroup.displayName}</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border bg-green-50 text-green-700 border-green-200">
                  {classGroup.status}
                </span>
              </div>
              
              {/* Grid Layout containing metadata and summary parameters */}
              <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                <div>
                  <span className="block text-[9px] uppercase text-gray-400 font-bold tracking-wider">{t("Academic Level")}</span>
                  <span className="font-semibold text-gray-800">{classGroup.academicLevelName}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-gray-400 font-bold tracking-wider">{t("Grade")}</span>
                  <span className="font-semibold text-gray-800">{classGroup.gradeName}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-gray-400 font-bold tracking-wider">{t("Section")}</span>
                  <span className="font-semibold text-gray-800">{classGroup.section}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-gray-400 font-bold tracking-wider">{t("Academic Year")}</span>
                  <span className="font-semibold text-gray-800">{classGroup.year}</span>
                </div>
              </div>
            </div>

            {/* 3. Tables Section Wrapper */}
            <div className="space-y-4">
              {/* Courses Table Layout */}
              <section className="print:break-inside-avoid">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-800 mb-1.5 border-b border-gray-200 pb-0.5">
                  {t("Assigned Courses")}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200">
                    <thead>
                      <tr className="border-b border-gray-300 bg-gray-50 text-[9px] uppercase text-gray-600 font-bold">
                        <th className="py-1 px-2 w-10 text-center border-r border-gray-200">#</th>
                        <th className="py-1 px-2 border-r border-gray-200">{t("Course Name")}</th>
                        <th className="py-1 px-2 w-28 border-r border-gray-200">{t("Code")}</th>
                        <th className="py-1 px-2">{t("Teacher")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {classGroup.courses.map((course, idx) => (
                        <tr key={course._id || idx} className="border-b border-gray-200 hover:bg-gray-50 print:break-inside-avoid">
                          <td className="py-1 px-2 text-gray-500 text-center border-r border-gray-200">{idx + 1}</td>
                          <td className="py-1 px-2 font-semibold text-gray-800 border-r border-gray-200">{course.courseName}</td>
                          <td className="py-1 px-2 text-gray-600 font-mono text-[11px] border-r border-gray-200">{course.code}</td>
                          <td className="py-1 px-2 text-gray-700">{course.teacher?.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 20 Fake Enrolled Students Table */}
              <section className="print:break-inside-auto">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-800 mb-1.5 border-b border-gray-200 pb-0.5">
                  {t("Enrolled Students")}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200">
                    <thead>
                      <tr className="border-b border-gray-300 bg-gray-50 text-[9px] uppercase text-gray-600 font-bold">
                        <th className="py-1 px-2 w-10 text-center border-r border-gray-200">#</th>
                        <th className="py-1 px-2 w-36 border-r border-gray-200">{t("Roll No / ID")}</th>
                        <th className="py-1 px-2 border-r border-gray-200">{t("Student Name")}</th>
                        <th className="py-1 px-2">{"Email Address"}</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {classGroup.students.map((student, idx) => (
                        <tr key={student._id || idx} className="border-b border-gray-200 hover:bg-gray-50 print:break-inside-avoid">
                          <td className="py-0.5 px-2 text-gray-500 text-center border-r border-gray-200">{idx + 1}</td>
                          <td className="py-0.5 px-2 font-mono text-gray-700 text-[11px] border-r border-gray-200">{student.rollNo}</td>
                          <td className="py-0.5 px-2 font-medium text-gray-900 border-r border-gray-200">{student.name}</td>
                          <td className="py-0.5 px-2 text-gray-600 text-[11px]">{student.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* 4. Document Footer Signature Module */}
            <div className="mt-8 pt-4 border-t border-gray-300 print:break-inside-avoid">
              <div className="flex justify-between items-end text-xs">
                <div>
                  <p className="text-[8px] text-gray-400 uppercase font-bold tracking-tight">System Generated On</p>
                  <p className="font-medium text-gray-500">{new Date().toLocaleString()}</p>
                </div>
                <div className="text-center w-48">
                  <div className="h-px bg-gray-400 w-full mb-1"></div>
                  <p className="text-[9px] font-bold text-gray-800 uppercase tracking-wider">Authorized Signature</p>
                  <p className="text-[8px] text-gray-400 italic">Administrative Stamp Required</p>
                </div>
              </div>
            </div>

          </div>
        </AppCard>

        <p className="text-center text-[8px] text-gray-400 mt-3 hidden print:block">
          Confidential Document. Any unauthorized duplication is strictly prohibited.
        </p>
      </PrintLayout>
    </AdminLayout>
  );
};

export default ClassGroupDownload;