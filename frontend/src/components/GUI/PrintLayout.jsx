import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PrintLayout = ({ contentRef, documentName, children }) => {
  // PDF download
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

        pdf.save(`${documentName}_details.pdf`);
      }
    );
  };

  // PNG download
  const downloadPNG = () => {
    const input = contentRef.current;
    html2canvas(input, { scale: 2, useCORS: true, logging: false }).then(
      (canvas) => {
        const link = document.createElement("a");
        link.download = `${documentName}_details.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    );
  };

  // Print
  const printDocument = () => {
    const originalContents = document.body.innerHTML;
    const printContents = contentRef.current.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="flex justify-end gap-4 mb-6 px-6">
      <button
        onClick={printDocument}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
      >
        Print
      </button>
      <button
        onClick={downloadPDF}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-sm"
      >
        PDF
      </button>
      <button
        onClick={downloadPNG}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
      >
        PNG
      </button>
    </div>
  );
};

export default PrintLayout;