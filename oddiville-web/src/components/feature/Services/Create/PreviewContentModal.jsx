
const PreviewContentModal = ({ img }) => {
  return (
        <div
            className="modal fade"
            id="modal-content"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="modal-content"
            aria-hidden="true"
        >
            <div
            className="modal-dialog cs-modal-width modal-danger modal-dialog-centered modal-"
            role="document"
            >
            <div className="modal-content">
                <div className="modal-header">
                <button
                    type="button"
                    className="btn-close text-dark"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                >
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                    <div className="preview-img">
                        <img src={img} alt="" />
                    </div>
                </div>
            </div>
            </div>
        </div>
  )
}

export default PreviewContentModal