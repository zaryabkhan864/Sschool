import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useParams, Link } from "react-router-dom";
import { useGetStudentDetailsQuery } from "../../redux/api/studentsApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import AdminLayout from "../GUI/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import PrintLayout from "../GUI/PrintLayout";

const StudentDetails = () => {
  const { id } = useParams();
  const contentRef = useRef(null);
  const { data, isLoading, error } = useGetStudentDetailsQuery(id);
  const { data: gradesData } = useGetGradesQuery();
  const grades = gradesData?.grades || [];

  const [student, setStudent] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (data?.student) {
      const studentData = {
        ...data.student,
        campus: data.campus,
        currentGrade: data.currentGrade,
        courses: data.courses || [],
        gradesHistory: data.gradesHistory || [],
      };
      setStudent(studentData);
      setAvatarPreview(data.student.avatar?.url || "");
    }
    if (error) {
      toast.error(error?.data?.message || "Failed to load student");
    }
  }, [data, error]);

  const getGradeName = (gradeArray) => {
    if (!gradeArray || gradeArray.length === 0) return "N/A";
    const gradeId = gradeArray[0]?.gradeId;
    return grades.find((g) => g._id === gradeId)?.gradeName || "N/A";
  };

  if (isLoading) return <Loader />;
  if (!student) return <p className="text-center mt-10 italic">No Student Found</p>;

  return (
    <AdminLayout>
      <MetaData title={`${student.name} - Official Report`} />

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header with Actions - Restored to your original style */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Student Academic Record
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Official transcript and certificate for {student.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PrintLayout 
              contentRef={contentRef} 
              documentName={`${student.name}_Academic_Record`} 
            />
            <Link
              to="/admin/students"
              className="px-5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm rounded-lg flex items-center gap-2 transition-all"
            >
              <i className="fa fa-arrow-left text-xs"></i>
              Back to Students
            </Link>
          </div>
        </div>

        {/* PRINTABLE AREA (Optimized A4) */}
        <div className="flex justify-center overflow-x-auto pb-10">
          <div
            ref={contentRef}
            className="w-[210mm] min-h-[297mm] bg-white shadow-lg p-10 relative flex flex-col border-t-[8px] border-blue-900"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Professional Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] z-0">
              <div className="text-center -rotate-45">
                <h1 className="text-8xl font-bold text-gray-800 tracking-widest">GLOBAL ACADEMY</h1>
              </div>
            </div>

            {/* School Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-5 mb-6 relative z-10">
              <div className="flex items-center">
                <img src="/images/Logo.png" alt="Logo" className="h-16 w-16 mr-4 object-contain" />
                <div>
                  <h1 className="text-2xl font-bold text-blue-900 tracking-tight">GLOBAL ACADEMY</h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">International School System</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-gray-800 uppercase">Academic Transcript</h2>
                <p className="text-[10px] text-gray-400 font-mono">DOC-ID: {id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            {/* Student Info Section - More Compact */}
            <div className="grid grid-cols-12 gap-6 mb-8 relative z-10">
              <div className="col-span-3">
                <div className="w-28 h-28 border p-1 bg-white shadow-sm rounded-sm">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-300">
                      {student.name?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-9 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                <div className="col-span-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-900 inline-block pb-0.5">{student.name}</h3>
                </div>
                <div className="flex border-b border-gray-50 pb-0.5"><span className="text-gray-500 w-28">Nationality:</span> <span className="font-semibold">{student.nationality || "N/A"}</span></div>
                <div className="flex border-b border-gray-50 pb-0.5"><span className="text-gray-500 w-28">Current Campus:</span> <span className="font-semibold">{student.campus?.name || "Main Campus"}</span></div>
                <div className="flex border-b border-gray-50 pb-0.5"><span className="text-gray-500 w-28">Passport No:</span> <span className="font-semibold font-mono">{student.passportNumber || "N/A"}</span></div>
                <div className="flex border-b border-gray-50 pb-0.5"><span className="text-gray-500 w-28">Grade / Year:</span> <span className="font-semibold">{student.currentGrade?.gradeName} ({student.currentGrade?.year || "2026"})</span></div>
                <div className="flex border-b border-gray-50 pb-0.5"><span className="text-gray-500 w-28">Gender / Age:</span> <span className="font-semibold">{student.gender} / {student.age || "N/A"} Yrs</span></div>
                <div className="flex border-b border-gray-50 pb-0.5">
                  <span className="text-gray-500 w-28">Status:</span> 
                  <span className={`font-bold ${student.status ? 'text-green-700' : 'text-red-700'}`}>
                    {student.status ? "✓ Active" : "✗ Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Courses Table - Optimized for 10-12 courses */}
            <div className="mb-8 relative z-10 flex-grow">
              <div className="bg-blue-900 text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex justify-between">
                <span>Registered Courses & Academic Load</span>
                <span>{student.courses?.length || 0} Subjects</span>
              </div>
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-[11px] uppercase text-gray-600">
                    <th className="border border-gray-200 p-2 text-left w-28">Code</th>
                    <th className="border border-gray-200 p-2 text-left">Subject Description</th>
                    <th className="border border-gray-200 p-2 text-left">Instructor</th>
                    <th className="border border-gray-200 p-2 text-center w-20">Credits</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {student.courses?.length > 0 ? (
                    student.courses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 p-2 font-mono font-bold text-blue-800">{course.code || "REG-900"}</td>
                        <td className="border border-gray-200 p-2 font-medium text-gray-800">{course.courseName || course.name}</td>
                        <td className="border border-gray-200 p-2 text-gray-600">{course.teacher?.name || "Assigning..."}</td>
                        <td className="border border-gray-200 p-2 text-center font-bold">3.0</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="border border-gray-200 p-6 text-center text-gray-400 italic">No courses found.</td></tr>
                  )}
                  {/* Fill empty space if courses are few to maintain layout */}
                  {student.courses?.length < 8 && Array(2).fill(0).map((_, i) => (
                    <tr key={`blank-${i}`}><td colSpan="4" className="border border-gray-200 p-3"></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature & Seal Section */}
            <div className="mt-auto pt-10 relative z-10">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-32 border-b border-gray-800 mb-1"></div>
                  <p className="text-[10px] font-bold uppercase text-gray-600">School Registrar</p>
                  <p className="text-[9px] text-gray-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 border-2 border-double border-blue-900/30 rounded-full flex items-center justify-center opacity-40">
                    <span className="text-[8px] font-bold text-blue-900">OFFICIAL<br/>SEAL</span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-12 w-32 border-b border-gray-800 mb-1"></div>
                  <p className="text-[10px] font-bold uppercase text-gray-600">Principal Signature</p>
                  <p className="text-[9px] text-gray-400 mt-1">Global Academy</p>
                </div>
              </div>
            </div>

            {/* Official Footer */}
            <div className="mt-10 pt-4 border-t border-gray-100 text-center">
               <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-1">
                 This is a certified digital transcript and does not require a physical signature
               </p>
               <p className="text-[10px] text-gray-500">
                 123 Education Street, Knowledge City • registrar@globalacademy.edu • +1 (123) 456-7890
               </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentDetails;