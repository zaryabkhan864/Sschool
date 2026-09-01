import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AppButton from './AppButton'; // adjust import path

const PrintLayout = ({
  title,
  subtitle,
  backUrl,
  editUrl,
  documentName,
  contentRef,
  children
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    <div className="max-w-4xl mx-auto my-8 print:m-0">
      {/* Header - hidden when printing */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-xl-custom font-bold text-ink-900">{title}</h1>
          {subtitle && <p className="text-xs-custom text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
        {/* ✅ FIX: each button previously carried a manual `className` with
            its own gradient (plain blue/gray/red/green) that fought with
            AppButton's own variant classes for the same properties — same
            element ending up with two different `bg-*` utilities depending
            on class order. Removed the overrides; AppButton's variants
            (already updated to the brand palette) now drive all of these
            consistently. */}
        <div className="flex gap-2 items-center">
          {/* Back button */}
          {backUrl && (
            <AppButton
              label="Back"
              icon="arrow-left"
              variant="secondary"
              onClick={() => navigate(backUrl)}
            />
          )}

          {/* Edit button */}
          {editUrl && (
            <AppButton
              label="Edit"
              icon="edit"
              variant="primary"
              to={editUrl}
            />
          )}

          {/* Print button */}
          <AppButton
            label="Print"
            icon="print"
            variant="secondary"
            onClick={printDocument}
          />

          {/* PDF button */}
          <AppButton
            label="PDF"
            icon="file-pdf"
            variant="danger"
            onClick={downloadPDF}
          />

          {/* PNG button */}
          <AppButton
            label="PNG"
            icon="file-image"
            variant="success"
            onClick={downloadPNG}
          />
        </div>
      </div>

      {/* Content to be captured - ref attached here */}
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default PrintLayout;
