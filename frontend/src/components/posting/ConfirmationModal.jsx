import { Button, Modal } from "flowbite-react";

const ConfirmationModal = ({ show, onClose, onConfirm, message, loading }) => {
    return (
        <Modal show={show} onClose={onClose}>
            <Modal.Header>Confirmation</Modal.Header>
            <Modal.Body>
                <div className="space-y-6">
                    <p className="text-base leading-relaxed text-gray-500">
                        {message}
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={loading} color="blue" onClick={onConfirm}>Confirm</Button>
                <Button disabled={loading} color="gray" onClick={onClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal; 