import { useNavigate } from "react-router-dom";

const MultiData = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="container-fluid p-5">
        <div className="row g-4">
          <div className="col-md-12">
            <div className="flex-cs header p-3">
              <h3>Dashboard</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div
              onClick={() => navigate("/items-list")}
              className="card cursor-pointer"
            >
              <div className="card-header justify-content-center flex-cs pt-4 pb-2">
                <h5>Manage Dry Warehouse</h5>
              </div>
              <div className="card-body flex-cs pt-2">
                <img src="./assets/img/svg/warehouse.svg" alt="" />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              onClick={() => navigate("/frozen-warehouse/chamber-list")}
              className="card cursor-pointer"
            >
              <div className="card-header justify-content-center flex-cs pt-4 pb-2">
                <h5>Manage Frozen Chamber</h5>
              </div>
              <div className="card-body flex-cs pt-2">
                <img
                  src="./assets/img/illustrations/frozen-chamber.png"
                  className="illustration"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              onClick={() => navigate("/lane")}
              className="card cursor-pointer"
            >
              <div className="card-header justify-content-center flex-cs pt-4 pb-2">
                <h5>Manage Production Lines</h5>
              </div>
              <div className="card-body flex-cs pt-2">
                <img src="./assets/img/svg/machine.svg" alt="" />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              onClick={() => navigate("/work-location")}
              className="card cursor-pointer"
            >
              <div className="card-header justify-content-center flex-cs pt-4 pb-2">
                <h5>Manage Labour Locations</h5>
              </div>
              <div className="card-body flex-cs pt-2">
                <img
                  src="./assets/img/illustrations/labour-location.png"
                  className="illustration"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              onClick={() => navigate("/raw-material")}
              className="card cursor-pointer"
            >
              <div className="card-header justify-content-center flex-cs pt-4 pb-2">
                <h5>Manage Raw material</h5>
              </div>
              <div className="card-body flex-cs pt-2">
                <img src="./assets/img/svg/raw-material.svg" alt="" />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              onClick={() => navigate("/old-inventory")}
              className="card cursor-pointer"
            >
              <div className="card-header justify-content-center flex-cs pt-4 pb-2">
                <h5>Manage Old Inventory</h5>
              </div>
              <div className="card-body flex-cs pt-2">
                <img
                  src="./assets/img/png/old-inventory.png"
                  className="illustration"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiData;
