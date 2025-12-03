import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { formatDate } from "@/util/formatDate";

import {
  handleFetchData,
  handleRemoveData,
} from "@/redux/OtherProductSlice";
import Spinner from "@/components/Spinner/Spinner";
import { fetchAllOrders } from "@/services/ThirdPartyProductService";
import { useThirdPartyProducts } from "../../../../hooks/thirdPartyProduct";
import { removeThirdPartyProduct } from "@/services/ThirdPartyProductService";

const ThirdPartyProduct = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOtherItems, setSelectedOtherItems] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const otherProduct = useSelector((state) => state.otherProduct.data);
  const { data: loadTPP } = useThirdPartyProducts();
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const ordersRes = await fetchAllOrders();
        
        dispatch(handleFetchData(ordersRes.data));
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    otherProduct?.length === 0 ? fetchAll() :  setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(otherProduct);
  }, [otherProduct]);

  const handleDeleteClick = (otherItems) => {
    
    setSelectedOtherItems(otherItems);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedOtherItems?.id) return;
    setIsLoading(true);
    try {
      const response = await removeThirdPartyProduct(selectedOtherItems.id);
      if (response.status === 200) {
        dispatch(handleRemoveData(selectedOtherItems.id));
        toast.success("Other items deleted successfully!");
        setShowModal(false);
      } else {
        toast.error("Failed to delete other items");
      }
    } catch (error) {
      toast.error("Error deleting other items");
    } finally {
      setIsLoading(false);
    }
  };

  const TableWrapper = ({ children }) => (
    <table className="table align-items-center mb-0">
      <thead>
        <tr className="text-center">
          <th>Image</th>
          <th>Product Name</th>
          <th className="text-center">Client Name</th>
          <th className="text-center">Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );

  const renderTableRows = () => {
    // console.log("filteredData", JSON.stringify(filteredData, null, 2));
    
    return filteredData.map((otherItems) => (
      <tr key={otherItems.id} className="text-center">
        <td>
          <img
            src={otherItems?.banner?.s3Url || "/assets/img/png/fallback_img.png"}
            className="avatar avatar-lg"
            alt="banner"
          />
        </td>
        <td>
          <p className="text-xl font-weight-bold mb-0">{otherItems.name}</p>
          <p className="text-xs text-secondary mb-0">{otherItems.company}</p>
        </td>
        <td>
          <p className="text-xl font-weight-bold mb-0">{otherItems.name}</p>
          <p className="text-xs text-secondary mb-0">{otherItems.company}</p>
        </td>
        <td className="text-center">
          <span className="text-secondary text-xs font-weight-bold">{formatDate(otherItems?.createdAt)}</span>
        </td>
        <td>
          <div className="d-flex justify-content-center">
            <NavLink
              to={`/raw-material-other/update/${otherItems?.id}`}
              className="btn btn-link m-0  text-secondary font-weight-bold text-xs"
            >
              Edit
            </NavLink>
            <button
              className="btn btn-link text-danger text-gradient px-3 mb-0"
              onClick={() => handleDeleteClick(otherItems)}
            >
              <i className="far fa-trash-alt me-2" /> Delete
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="container-fluid">
      <div className="row reverse">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header pb-0 d-flex justify-content-between align-items-center">
              <h5>Third Party Products</h5>
              <NavLink to="/raw-material-other/add" className="btn bg-gradient-info">
                <i className="fa-solid fa-plus" /> &nbsp; Add Product
              </NavLink>
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
                          src={'./assets/img/png/fallback_img.png'}
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
                  <TableWrapper>{renderTableRows()}</TableWrapper>
                ) : (
                  <TableWrapper>
                    <tr><td colSpan={5} className="text-center">No data available</td></tr>
                  </TableWrapper>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
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
                  Are you sure you want to delete other items "{selectedOtherItems.name}"?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
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

export default ThirdPartyProduct;