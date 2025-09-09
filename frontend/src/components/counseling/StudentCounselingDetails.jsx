import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetCounselingDetailsQuery } from "../../redux/api/counselingApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const StudentCounselingDetails = () => {
  const params = useParams();
  const { data, isLoading, error } = useGetCounselingDetailsQuery(params?.id);
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

  // PDF download function
  const downloadPDF = () => {
    const input = contentRef.current;
    html2canvas(input, { scale: 2, useCORS: true, logging: false }).then(
      (canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${counseling?.student?.name || 'counseling'}_report.pdf`);
      }
    );
  };

  // PNG download function
  const downloadPNG = () => {
    const input = contentRef.current;
    html2canvas(input, { scale: 2, useCORS: true, logging: false }).then(
      (canvas) => {
        const link = document.createElement("a");
        link.download = `${counseling?.student?.name || 'counseling'}_report.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    );
  };

  // Print function
  const printDocument = () => {
    const originalContents = document.body.innerHTML;
    const printContents = contentRef.current.innerHTML;
    
    // Create a print-specific stylesheet
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body {
          font-family: 'Times New Roman', serif;
          color: #000;
          background: #fff;
        }
        .no-print {
          display: none !important;
        }
        .print-container {
          box-shadow: none !important;
          border: none !important;
        }
        .print-section {
          page-break-inside: avoid;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

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
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <MetaData title={"Counseling Details"} />
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-6 px-6 no-print">
        <button
          onClick={printDocument}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm font-medium"
        >
          Print
        </button>
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-sm font-medium"
        >
          PDF
        </button>
        <button
          onClick={downloadPNG}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm font-medium"
        >
          PNG
        </button>
      </div>

      <div className="flex justify-center items-start py-6 px-4">
        <div 
          ref={contentRef}
          className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden print-container"
          style={{ 
            fontFamily: "'Times New Roman', serif",
            backgroundImage: "url('/images/Logo.png')", 
            backgroundSize: "300px", 
            backgroundPosition: "center", 
            backgroundRepeat: "no-repeat", 
            backgroundBlendMode: "soft-light", 
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            opacity: "0.97"
          }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="text-center rotate-45">
              <h1 className="text-6xl font-bold text-gray-400">GLOBAL ACADEMY</h1>
              <p className="text-3xl mt-2 text-gray-400">OFFICIAL DOCUMENT</p>
            </div>
          </div>

          {/* School Header */}
          <div className="text-center mb-6 border-b border-gray-300 pb-4 pt-6">
            <div className="flex justify-center items-center mb-2">
              <img 
                src="/images/Logo.png"
                alt="School Logo" 
                className="h-16 w-16 mr-3 object-contain"
              />
              <div>
                <h1 className="text-2xl font-serif font-bold text-blue-900">GLOBAL ACADEMY</h1>
                <p className="text-xs text-gray-600 italic">Empowering Minds, Building Futures</p>
                <p className="text-xs text-gray-500 mt-1">123 Education Street, Knowledge City • Phone: (123) 456-7890</p>
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
                  <p className="text-base text-gray-900 font-medium mt-1">{counseling.student?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Grade</p>
                  <p className="text-base text-gray-900 font-medium mt-1">
                    {counseling.student?.grade?.[0]?.gradeId?.gradeName || "No grade assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Campus</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{counseling.campus?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Academic Year</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{counseling.year || "N/A"}</p>
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
                    {counseling.status?.charAt(0).toUpperCase() + counseling.status?.slice(1) || "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created At</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{formatDate(counseling.createdAt) || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Last Updated</p>
                  <p className="text-base text-gray-900 font-medium mt-1">{formatDate(counseling.updatedAt) || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Complain Section */}
            <div className="mb-6 pb-4 border-b border-gray-200 print-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 uppercase tracking-wider">Complain/Problem</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 leading-relaxed text-justify">{counseling.complain || "No complain details available."}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="print-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 uppercase tracking-wider">Suggestion/Comment</h2>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-800 leading-relaxed text-justify">{counseling.comment || "No comments available."}</p>
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
                day: 'numeric' 
              })} • Global Academy Counseling Department
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentCounselingDetails;