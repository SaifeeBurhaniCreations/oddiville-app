import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { formatDate } from "@/util/formatDate";
import {
  fetchRawMaterial,
  removeRawMaterial,
} from "@/services/RawMaterialService";
import {
  handleFetchData,
  handleRemoveData,
} from "@/redux/RawMaterialDataSlice";
import Spinner from "@/components/Spinner/Spinner";
// import AddRawMaterial from "./AddRawMaterial";

const RawMaterial = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const rmData = useSelector((state) => state.rm.data);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const response = await fetchRawMaterial();
        
        dispatch(handleFetchData(response));
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    rmData?.length === 0 ? fetchAll() : setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(rmData);
  }, [rmData]);

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedService?.id) return;
    setIsLoading(true);
    try {
      const response = await removeRawMaterial(selectedService.id);
      if (response.status === 200) {
        dispatch(handleRemoveData(selectedService.id));
        toast.success("Item deleted successfully!");
        setShowModal(false);
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsLoading(false);
    }
  };

  const TableWrapper = ({ children }) => (
    <table className="table align-items-center mb-0">
      <thead>
        <tr>
          <th>Image</th>
          <th>Item Name</th>
          <th className="text-center">Created Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );

  const renderRows = () =>
    filteredData.map((item, index) => (
      <tr key={index}>
        <td>
          <div className="d-flex px-2 py-1">
            <div
              style={{
                backgroundColor: "#9BC698",
                borderRadius: 8,
                padding: 4,
                width: 64, // Set your desired width
                height: 64, // Set your desired height
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={
                  item?.sample_image?.url || "./assets/img/png/fallback_img.png"
                }
                alt="sample"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
        </td>
        <td>
          <p className="text-xl font-weight-bold mb-0">{item.name}</p>
        </td>
        <td className="text-center">
          <span className="text-secondary text-xs font-weight-bold">
            {formatDate(item?.createdAt)}
          </span>
        </td>
        <td>
          <div className="d-flex">
            <NavLink
              to={`/add-raw-material/${item.id}`}
              className="btn m-0 btn-link text-secondary font-weight-bold text-xs"
            >
              Edit
            </NavLink>
            <button
              className="btn btn-link text-danger text-gradient px-3 mb-0"
              onClick={() => handleDeleteClick(item)}
            >
              <i className="far fa-trash-alt me-2"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="container-fluid">
      <div className="row reverse">
        <div className="col-md-6 offset-md-2">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <h5>Raw Material Item List</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive p-0">
                {isLoading ? (
                  <TableWrapper>
                    <tr>
                      <td>
                        <div className="d-flex px-2 py-1">
                          <div>
                            <img
                              src={"./assets/img/png/fallback_img.png"}
                              className="avatar avatar-lg"
                              alt="banner"
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <Spinner />
                      </td>
                      <td className="align-middle text-center">
                        <span className="text-secondary text-xs font-weight-bold">
                          .....
                        </span>
                      </td>
                      <td className="align-middle text-center">
                        <span className="text-secondary text-xs font-weight-bold">
                          ....
                        </span>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex">
                          <button
                            disabled
                            className="btn btn-link m-0 text-secondary font-weight-bold text-xs"
                          >
                            Edit
                          </button>
                          <button
                            disabled
                            className="btn btn-link text-danger text-gradient px-3 mb-0"
                          >
                            <i className="far fa-trash-alt me-2"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </TableWrapper>
                ) : filteredData.length > 0 ? (
                  <TableWrapper>{renderRows()}</TableWrapper>
                ) : (
                  <TableWrapper>
                    <tr>
                      <td colSpan={4} className="text-center">
                        No data found
                      </td>
                    </tr>
                  </TableWrapper>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* <div className="col-md-4">
          <AddRawMaterial />
        </div> */}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
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
                Are you sure you want to delete "{selectedService?.name}"?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete {isLoading && <Spinner />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterial;
