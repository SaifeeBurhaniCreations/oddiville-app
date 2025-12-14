import useManageLanes from "@/hooks/useManageLanes";
import LaneTable from "@/components/tables/LaneTable";
import DeleteLaneModal from "@/components/modals/DeleteLaneModal";

const Lane = () => {
  const {
    isInitialLoading,
    isDeleting,
    filteredData,
    showModal,
    selectedLane,
    handleDeleteClick,
    handleDelete, 
    setShowModal,
  } = useManageLanes();

  
  return (
    <div className="container-fluid">
      <div className="row reverse">
        <div className="col-md-11">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <h5>List Lane</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive p-0">
                <LaneTable
                  filteredData={filteredData}
                  isLoading={isInitialLoading}
                  handleDeleteClick={handleDeleteClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="col-md-4">
                    <AddLane />
                </div> */}
      </div>

      <DeleteLaneModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedLane={selectedLane}
        handleDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Lane;
