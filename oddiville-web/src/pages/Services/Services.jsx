
import { NavLink } from "react-router-dom";

import useManageServices from "@/hooks/useManageServices";
import ServiceTable from "@/components/tables/ServiceTable"; 
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal"; 

const Services = () => {
 
    const {
        isLoading,
        filteredData,
        chambers,
        showModal,
        selectedService,
        handleFilter,
        handleDeleteClick,
        handleDelete,
        setShowModal,
    } = useManageServices();

    return (
        <div className="container-fluid">
            <div className="row min-vh-100">
                <div className="col-md-12">
                    <div className="card mb-4">
                        <div className="card-header pb-0 d-flex justify-content-between align-items-center">
                            <h5>Dry Chamber Item List</h5>
                            <NavLink
                                to="/add-items"
                                className="btn bg-gradient-info"
                            >
                                <i className="fa-solid fa-plus" /> &nbsp; Add Item
                            </NavLink>
                        </div>
                        <div className="card-body">
                           
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleFilter("All")}
                                >
                                    All
                                </button>
                                {chambers
                                    ?.filter((ch) => ch.tag === "dry")
                                    .map((chamber, idx) => (
                                        <button
                                            key={idx}
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleFilter(chamber.chamber_name)}
                                        >
                                            {chamber.chamber_name}
                                        </button>
                                    ))}
                            </div>

                            <div className="table-responsive p-0">
                                <ServiceTable
                                    filteredData={filteredData}
                                    isLoading={isLoading}
                                    handleDeleteClick={handleDeleteClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           
            <DeleteConfirmationModal
                showModal={showModal}
                setShowModal={setShowModal}
                selectedService={selectedService}
                handleDelete={handleDelete}
                isLoading={isLoading} 
            />
        </div>
    );
};

export default Services;