import React from 'react'
import useManageLane from "@/hooks/useManageLane";
import ChamberStockForm from '../../components/forms/EditChamberStockForm';

const ChamberStockEdit = () => {
    const { id, form, isLoading, handleSubmit, handleExit } = useManageLane();

    return (
      <div className="col-md-11">
        <ChamberStockForm
          id={id}
          form={form}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleExit={handleExit}
        />
      </div>
    );
}

export default ChamberStockEdit