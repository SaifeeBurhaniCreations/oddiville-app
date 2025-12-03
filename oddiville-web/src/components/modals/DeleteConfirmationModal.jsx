import { useState } from "react";
import Spinner from "@/components/Spinner/Spinner"; 

const DeleteConfirmationModal = ({
    showModal,
    setShowModal,
    selectedService,
    handleDelete,
    isLoading,
}) => {
    if (!showModal) return null;

   
    const [isDeleting, setIsDeleting] = useState(false); 

    const handleDeleteWrapper = async () => {
        setIsDeleting(true);
        await handleDelete();
      
        setIsDeleting(false);
    };
    
    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confirm Delete</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowModal(false)}
                        ></button>
                    </div>
                    <div className="modal-body">
                        Are you sure you want to delete service "
                        {selectedService?.item_name}"?
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowModal(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-danger" onClick={handleDeleteWrapper} disabled={isDeleting}>
                            Delete {isDeleting && <Spinner />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;