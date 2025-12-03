
import useChamberManagement from "@/hooks/useChamberManagement";
import ChamberForm from "@/components/forms/ChamberForm";
import ChamberList from "@/components/lists/ChamberList";

import ConfirmationModal from "@/components/Dialogue_box/ConfirmationModal"; 

const Chamber = () => {
    const {
        addChamberForm,
        categories,
        chamberToDelete,
        isLoading,
        isInitialLoading,
        setChamberToDelete,
        handleSubmit,
        handleDelete,
    } = useChamberManagement();

    return (
        <>
            
            {/* {chamberToDelete && (
                <ConfirmationModal
                    title={`Delete Chamber "${chamberToDelete.chamber_name}"?`}
                    item={chamberToDelete}
                  
                    onConfirm={() => handleDelete(chamberToDelete.id)} 
                    onClose={() => setChamberToDelete(null)}
                />
            )} */}
<div className="col-md-6 offset-md-2">

            <div className="d-flex justify-content-center px-3">
                <div className="card my-4 w-100">
                    <div className="card-header pt-4 pb-2 bg-light">
                        <h5 className="m-0 text-center text-md-start">
                            Dry Chamber Management
                        </h5>
                    </div>

                    <div className="card-body">
                       
                        <ChamberForm
                            addChamberForm={addChamberForm}
                            handleSubmit={handleSubmit}
                            isLoading={isLoading}
                        />

                       
                        {/* <ChamberList
                            categories={categories}
                            setChamberToDelete={setChamberToDelete}
                            isInitialLoading={isInitialLoading}
                        /> */}
                    </div>
                </div>
            </div>
</div>
        </>
    );
};

export default Chamber;