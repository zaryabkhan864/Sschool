import { Button, Modal } from "flowbite-react";
import { useTranslation } from 'react-i18next';


const ConfirmationModal = ({ show, onClose, onConfirm, message, loading }) => {
    const {t} =useTranslation()
    return (
        <Modal show={show} onClose={onClose}>
            <Modal.Header>{t('confirm')}</Modal.Header>
            <Modal.Body>
                <div className="space-y-6">
                    <p className="text-base leading-relaxed text-gray-500">
                        {message}
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={loading} color="blue" onClick={onConfirm}>{t('confirmYes')}</Button>
                <Button disabled={loading} color="gray" onClick={onClose}>
                    {t('cancel')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal; 