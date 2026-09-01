import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppButton from "./AppButton";

const EnrollButton = ({ studentId, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEnroll = () => {
    // Ab create enrollment page par studentId query param ke saath
    navigate(`/admin/student-enrollments/new?studentId=${studentId}`);
  };

  return (
    <AppButton
      onClick={handleEnroll}
      size="small"
      variant="primary"
      icon="user-check"
      label={t("Enroll")}
    />
  );
};

export default EnrollButton;
