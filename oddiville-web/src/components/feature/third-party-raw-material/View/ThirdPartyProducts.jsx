import React, { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

import Spinner from "@/components/Spinner/Spinner";
import { formatDate } from "@/util/formatDate";

import {
  handleFetchData,
  handleRemoveData,
} from "@/redux/OtherProductSlice";

import {
  fetchAllOrders,
  removeThirdPartyProduct,
} from "@/services/ThirdPartyProductService";

import { useChambers, useChamberstock } from "../../../../hooks/chamberStock";
import { useOtherItems } from "../../../../hooks/thirdPartyProduct";

const getProductImage = (stock, otherItem) =>
  otherItem?.sample_image ||
  stock?.image ||
  "/assets/img/png/fallback_img.png";

const ExpandedChambersRow = ({ data, chamberMap }) => {

  if (!data || data.length === 0) {
    return (
      <div className="p-3 text-center text-secondary">No Product data</div>
    );
  }

  return (
    <div className="p-2">
      <table className="table mb-0">
        <thead>
          <tr>
            <th className="text-center">Image</th>
            <th className="text-center">Product</th>
            <th className="text-center">Quantity</th>
            <th className="text-center">Chamber</th>
            <th className="text-center">Dispatch Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ch) => (
            <tr key={ch.id}>
              <td className="d-flex justify-content-center">
              <img
                src={ch.sample_image}
                className="avatar avatar-lg"
                alt="item image"
              />
            </td>
              <td className="text-center">{ch.product_name || ch.id.slice(0, 10)}</td>
              <td className="text-center">{ch?.chamber?.length > 0 && ch?.chamber?.reduce((acc, cur) => acc + Number(cur.quantity), 0)}</td>
          <td className="text-center">
              {ch?.chamber?.length > 0
                ? ch.chamber
                    .map((c) => chamberMap[c.id] || c.id.slice(0, 6))
                    .join(", ")
                : "N/A"}
            </td>
           <td className="text-center">
  {ch.est_dispatch_date
    ? formatDate(ch.est_dispatch_date)
    : "N/A"}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ThirdPartyProduct = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const otherProduct = useSelector((state) => state.otherProduct.data);
const { data: otherItems = [], refetch: refetchOtherItems } = useOtherItems();

  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [openRowId, setOpenRowId] = useState(null);

  const { data: chamberStockList = [], refetch: refetchChamberStock  } = useChamberstock();

  const chamberStockMap = useMemo(() => {
    const map = {};
    chamberStockList.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [chamberStockList]);

const { data: chamberList = [] } = useChambers();

const chamberMap = useMemo(() => {
  const map = {};
  chamberList.forEach((c) => {
    map[c.id] = c.chamber_name;
  });
  return map;
}, [chamberList]);

const otherItemMap = useMemo(() => {
  const map = {};
  otherItems.forEach((o) => {
    map[`${o.client_id}_${o.product_id}`] = o;
  });
  return map;
}, [otherItems]);

useEffect(() => {
  refetchOtherItems?.();
  refetchChamberStock?.();
}, [location.key]);

useEffect(() => {
  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const res = await fetchAllOrders();
      dispatch(handleFetchData(res.data));
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  fetchAll();
}, [dispatch, location.key]);

  useEffect(() => {
    setFilteredData(otherProduct || []);
  }, [otherProduct]);

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedItem?.id) return;

    setIsLoading(true);
    try {
      const res = await removeThirdPartyProduct(selectedItem.id);
      if (res.status === 200) {
        dispatch(handleRemoveData(selectedItem.id));
        toast.success("Deleted successfully");
        setShowModal(false);
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (id) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  };
    
  const TableWrapper = ({ children }) => (
    <table className="table align-items-center mb-0">
      <thead>
        <tr className="text-center">
          <th>Client</th>
          <th>Products</th>
          <th>Warehoused date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );

  
  const renderRows = () =>
    filteredData.map((item) => {
     const chambers = (item.products || [])
  .map((productId) => {
    const stock = chamberStockMap[productId];
    if (!stock) return null;

    const key = `${item.id}_${productId}`;
    const otherItem = otherItemMap[key];
 
    return {
      ...stock,
      sample_image: getProductImage(stock, otherItem),
      est_dispatch_date: otherItem?.est_dispatch_date || null,
    };
  })
  .filter(Boolean);

      const isSingle = chambers.length === 1;
      const isMultiple = chambers.length > 1;
      const isOpen = openRowId === item.id;

      // const imageUrl = resolveImage(item.id, item.products);

      return (
        <React.Fragment key={item.id}>
          <tr className="text-center">
            <td>
              <p className="fw-bold mb-0">{item.name}</p>
              <p className="text-xs text-secondary mb-0">{item.company}</p>
            </td>

            <td>
              {chambers.length === 0 && (
                <span className="text-secondary text-xs">N/A</span>
              )}

              {isSingle && (
                <span
                  className="text-primary text-xs cursor-pointer"
                  onClick={() => toggleRow(item.id)}
                >
                  {chambers[0].product_name} ▾
                </span>
              )}

              {isMultiple && (
                <span
                  className="text-primary text-xs cursor-pointer"
                  onClick={() => toggleRow(item.id)}
                >
                  Multiple ▾
                </span>
              )}
            </td>

            <td>{formatDate(item.createdAt)}</td>

            <td>
              <NavLink
                to={`/raw-material-other/update/${item.id}?product=0`}
                className="btn btn-link text-secondary text-xs"
              >
                Edit
              </NavLink>
              <button
                className="btn btn-link text-danger text-xs"
                onClick={() => handleDeleteClick(item)}
              >
                Delete
              </button>
            </td>
          </tr>

          {isOpen && (
            <tr>
              <td colSpan={5} className="p-0">
                <ExpandedChambersRow data={chambers} chamberMap={chamberMap} />
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    });

  return (
    <div className="container-fluid overflow-y-auto" style={{maxHeight: "92vh"}}>
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between">
          <h5>Third Party Products</h5>
          <NavLink to="/raw-material-other/add" className="btn bg-gradient-info">
            + Add Product
          </NavLink>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            {isLoading ? (
              <Spinner />
            ) : filteredData.length > 0 ? (
              <TableWrapper>{renderRows()}</TableWrapper>
            ) : (
              <TableWrapper>
                <tr>
                  <td colSpan={5} className="text-center">
                    No data available
                  </td>
                </tr>
              </TableWrapper>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                Are you sure you want to delete{" "}
                <b>{selectedItem?.name}</b>?
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
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