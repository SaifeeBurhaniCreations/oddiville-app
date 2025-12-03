
import useManageWorkLocations from "@/hooks/useManageWorkLocations";
import WorkLocationTable from "@/components/tables/WorkLocationTable";
import DeleteLocationModal from "@/components/modals/DeleteLocationModal";

import AddWorkLocation from "@/components/feature/work-location/Create/AddWorkLocation";

const WorkLocation = () => {
    
    const {
        isLoading,
        isDeleting,
        filteredData,
        showModal,
        selectedLocation,
        handleDeleteClick,
        handleDelete,
        setShowModal,
    } = useManageWorkLocations();

    return (
        <div className="container-fluid">
            <div className="row reverse">
                <div className="col-md-11">
                    <div className="card mb-4">
                        <div className="card-header pb-0 d-flex justify-content-between align-items-center">
                            <h5>Work Locations</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive p-0">
                                <WorkLocationTable
                                    filteredData={filteredData}
                                    isLoading={isLoading}
                                    handleDeleteClick={handleDeleteClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="col-md-4">
                   
                    <AddWorkLocation />
                </div> */}
            </div>

    
            <DeleteLocationModal
                showModal={showModal}
                setShowModal={setShowModal}
                selectedLocation={selectedLocation}
                handleDelete={handleDelete}
                isDeleting={isDeleting} 
            />
        </div>
    );
};

export default WorkLocation;