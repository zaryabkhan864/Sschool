import React from 'react'
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AdminLayout from '../../layout/AdminLayout';
import MetaData from '../../layout/MetaData';

const QuizReport = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
  return (
    <AdminLayout>
      <MetaData title={t("Quiz Reports")} />
    <div>QuizReport</div>
    </AdminLayout>
  )
}

export default QuizReport