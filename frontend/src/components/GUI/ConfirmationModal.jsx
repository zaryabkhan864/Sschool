import React from 'react'
import { Pagination, Table, Modal, Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
const ConfirmationModal = ({ showModal, setShowModal, confirmDelete, isDeleteLoading, message }) => {
    const { t } = useTranslation();
    return (
      <Modal
        show={showModal}
        size="md"
        popup={true}
        onClose={() => setShowModal(false)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-500">
                {message}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={confirmDelete}
                isProcessing={isDeleteLoading}
              >
                {t("Confirm")}
              </Button>
              <Button
                color="gray"
                onClick={() => setShowModal(false)}
              >
                {t("Cancel")}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  };
export default ConfirmationModal