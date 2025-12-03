
import Spinner from "@/components/Spinner/Spinner";

const DeleteLaneModal = ({
    showModal,
    setShowModal,
    selectedLane,
    handleDelete,
    isDeleting,
}) => {
    if (!showModal) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
                        Are you sure you want to delete lane "{selectedLane?.name || selectedLane?.data?.name}"?
                    </div>
                    <div className="modal-footer">
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => setShowModal(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn btn-danger" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            Delete {isDeleting && <Spinner />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteLaneModal;