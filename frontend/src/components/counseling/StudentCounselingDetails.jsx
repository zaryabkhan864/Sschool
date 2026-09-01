import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetCounselingDetailsQuery } from "../../redux/api/counselingApi";
import { useGetSchoolQuery } from "../../redux/api/schoolApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import PrintLayout from "../GUI/PrintLayout";

// Helper to get full name from user object
const getFullName = (user) => {
  if (!user) return "";
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  return parts.join(" ");
};

// Helper to safely display year (could be string, ObjectId, or populated object)
const getYearDisplay = (year) => {
  if (!year) return "N/A";
  if (typeof year === "string") return year;
  if (typeof year === "object") {
    return year.year ? year.year : year._id?.toString() || "N/A";
  }
  return String(year);
};

const StudentCounselingDetails = () => {
  const params = useParams();
  const { data, isLoading, error } = useGetCounselingDetailsQuery(params?.id);
  const { data: schoolData } = useGetSchoolQuery();

  const [counseling, setCounseling] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (data?.counseling) {
      setCounseling(data.counseling);
    }

    if (error) {
      toast.error(error?.data?.message);
    }
  }, [data, error]);

  if (isLoading) {
    return <Loader />;
  }

  if (!counseling) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-10">
          <div className="text-center">
            <p className="text-lg text-gray-600">No counseling data found.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Dynamic school details with fallback
  const schoolName = schoolData?.name || "GLOBAL ACADEMY";
  const schoolLogo = schoolData?.logo?.url || "/images/Logo.png";
  const schoolTagline = schoolData?.tagline || "Empowering Minds, Building Futures";
  const schoolAddress = schoolData?.address
    ? schoolData.address
    : "123 Education Street, Knowledge City • Phone: (123) 456-7890";

  return (
    <AdminLayout>
      <MetaData title={"Counseling Details"} />

      {/* Use PrintLayout component */}
      <PrintLayout
        contentRef={contentRef}
        documentName={`${getFullName(counseling?.student) || "counseling"}_report`}
      />

      <div className="flex justify-center items-start py-6 px-4">
        <div
          ref={contentRef}
          className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden print-container"
          style={{
            fontFamily: "'Times New Roman', serif",
            backgroundImage: `url('${schoolLogo}')`,
            backgroundSize: "300px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundBlendMode: "soft-light",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            opacity: "0.97",
          }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="text-center rotate-45">
              <h1 className="text-6xl font-bold text-gray-400">{schoolName.toUpperCase()}</h1>
              <p className="text-3xl mt-2 text-gray-400">OFFICIAL DOCUMENT</p>
            </div>
          </div>

          {/* School Header */}
          <div className="text-center mb-6 border-b border-gray-300 pb-4 pt-6">
            <div className="flex justify-center items-center mb-2">
              <img
                src={schoolLogo}
                alt={schoolName}
                className="h-16 w-16 mr-3 object-contain"
              />
              <div>
                <h1 className="text-2xl font-serif font-bold text-blue-900">{schoolName}</h1>
                <p className="text-xs text-gray-600 italic">{schoolTagline}</p>
                <p className="text-xs text-gray-500 mt-1">{schoolAddress}</p>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mt-3">
              Counseling Report
            </h2>
          </div>

          {/* Header Section */}
          <div className="bg-blue-600 px-6 py-3">
            <h1 className="text-xl font-bold text-white text-center tracking-wide">COUNSELING REPORT</h1>
          </div>

          {/* Report Content */}
          <div className="p-6 print-section">
            {/* Student Information Section */}
            <div className="mb-6 pb-4 border-b border-gray-200 print-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 uppercase tracking-wider">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Student Name</p>
                  <p className="text-base text-gray-900 font-medium mt-1">
                    {getFullName(counseling.student) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Campus</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{counseling.campus?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Academic Year</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{getYearDisplay(counseling.year)}</p>
                </div>
              </div>
            </div>

            {/* Counseling Details Section */}
            <div className="mb-6 pb-4 border-b border-gray-200 print-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 uppercase tracking-wider">Counseling Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(counseling.status)}`}>
                    {counseling.status ? counseling.status.charAt(0).toUpperCase() + counseling.status.slice(1).replace('_', ' ') : "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Issue Type</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{counseling.issueType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Incident Date</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{formatDate(counseling.incidentDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reported By</p>
                  <p className="text-base text-gray-900 font-medium mt-1">
                    {getFullName(counseling.reportedBy)} ({counseling.reporterRole || "N/A"})
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created At</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{formatDate(counseling.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Last Updated</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{formatDate(counseling.updatedAt)}</p>
                </div>
                {counseling.resolvedAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Resolved At</p>
                    <p className="text-base text-gray-900 font-medium mt-1">{formatDate(counseling.resolvedAt)}</p>
                  </div>
                )}
                {counseling.closedAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Closed At</p>
                    <p className="text-base text-gray-900 font-medium mt-1">{formatDate(counseling.closedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Complain Section */}
            <div className="mb-6 pb-4 border-b border-gray-200 print-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 uppercase tracking-wider">Complain/Problem</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 leading-relaxed text-justify">
                  {counseling.complainDescription || "No complain details available."}
                </p>
              </div>
            </div>

            {/* Action Taken Section */}
            {counseling.actionTaken && (
              <div className="mb-6 pb-4 border-b border-gray-200 print-section">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 uppercase tracking-wider">Action Taken</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 leading-relaxed text-justify">
                    {counseling.actionTaken}
                  </p>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mb-6 pb-4 border-b border-gray-200 print-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 uppercase tracking-wider">Comments / Suggestions</h2>
              <div className="space-y-4">
                {counseling.teacherComment?.text && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex flex-wrap justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-blue-800">Teacher Comment</p>
                      {counseling.teacherComment.author && (
                        <p className="text-xs text-gray-600">
                          {getFullName(counseling.teacherComment.author)} • {formatDate(counseling.teacherComment.date)}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{counseling.teacherComment.text}</p>
                  </div>
                )}

                {counseling.counselorComment?.text && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex flex-wrap justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-green-800">Counselor Comment</p>
                      {counseling.counselorComment.author && (
                        <p className="text-xs text-gray-600">
                          {getFullName(counseling.counselorComment.author)} • {formatDate(counseling.counselorComment.date)}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{counseling.counselorComment.text}</p>
                  </div>
                )}

                {counseling.principalComment?.text && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex flex-wrap justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-purple-800">Principle Comment</p>
                      {counseling.principalComment.author && (
                        <p className="text-xs text-gray-600">
                          {getFullName(counseling.principalComment.author)} • {formatDate(counseling.principalComment.date)}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{counseling.principalComment.text}</p>
                  </div>
                )}

                {!counseling.teacherComment?.text &&
                  !counseling.counselorComment?.text &&
                  !counseling.principalComment?.text && (
                    <p className="text-gray-600 italic">No comments available.</p>
                  )}
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="px-6 py-6 border-t border-gray-200 mt-6 print-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-b border-gray-400 pb-1 mb-2 inline-block">
                  <p className="text-sm text-gray-700">Counselor's Signature</p>
                </div>
                <p className="text-xs text-gray-500 mt-8">Date: ___________________</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 pb-1 mb-2 inline-block">
                  <p className="text-sm text-gray-700">Parent's/Guardian's Signature</p>
                </div>
                <p className="text-xs text-gray-500 mt-8">Date: ___________________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 text-center text-xs text-gray-600 border-t border-gray-200 print-section">
            <p>
              Report generated on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} • {schoolName} Counseling Department
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentCounselingDetails;