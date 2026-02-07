import React from "react";
import Spinner from "@/components/Spinner/Spinner";
import useChamberManagement from "@/hooks/useChamberManagement";
import ConfirmationModal from "@/components/Dialogue_box/ConfirmationModal";

const ChamberList = () => {
  // const ChamberList = ({ categories, setChamberToDelete, isInitialLoading }) => {
  const {
    categories,
    chamberToDelete,
    isInitialLoading,
    setChamberToDelete,
    handleDelete,
  } = useChamberManagement();
  if (isInitialLoading && !categories.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner />
        <p className="mt-2 text-secondary">Loading existing chambers...</p>
      </div>
    );
    
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center text-secondary py-4">No chamber found</div>
    );
  }

  return (
    <>
      {chamberToDelete && (
        <ConfirmationModal
          title={`Delete Chamber "${chamberToDelete.chamber_name}"?`}
          item={chamberToDelete}
          onConfirm={() => handleDelete(chamberToDelete.id)}
          onClose={() => setChamberToDelete(null)}
        />
      )}
      <div className="col-md-6 offset-md-2 col-sm-12 offset-sm-0 card">
        <div className="card-header">
          <h5 className="mb-3">Existing Chambers</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="">Name</th>
                  <th className="">Capacity (in kgs)</th>
                  <th className="">No. of Items</th>
                  <th className="">Type</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {!categories[0].tag
                  ? window.location.reload()
                  : categories.map((chamber, idx) => (
                      <tr key={idx} className={`text-dark`}>
                        <td>{chamber.chamber_name}</td>
                        <td>{chamber.capacity} Kgs</td>
                        <td>
                          {chamber?.items?.length === null || 0 || "0"
                            ? "No item"
                            : chamber?.items?.length}
                        </td>
                        <td className="text-capitalize">{chamber.tag}</td>
                        <td className="text-center p-1">
                          <button
                            className="btn btn-link text-dark p-1"
                            type="button"
                            onClick={() => setChamberToDelete(chamber)}
                          >
                            <i className="fas fa-trash fs-6"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChamberList;
