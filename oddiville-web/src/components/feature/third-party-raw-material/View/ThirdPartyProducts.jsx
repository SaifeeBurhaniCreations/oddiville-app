import React, { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

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

import { useChamberstock } from "../../../../hooks/chamberStock";

const getAverageRating = (chambers = []) => {
  const ratings = chambers.map(ch => ch.rating);

  const hasTextRating = ratings.some(r => isNaN(Number(r)));

  if (hasTextRating) {
    return ratings[0];
    // return ratings.join(", ");
  }

  const validRatings = ratings
    .map(r => Number(r))
    .filter(r => Number.isInteger(r) && r >= 1 && r <= 5);

  if (validRatings.length === 0) return null;

  const avg = validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
  return Math.round(avg * 10) / 10;
};

const StarRating = ({ value }) => {
  if (typeof value === "string" && isNaN(Number(value))) {
    return <span className="text-secondary">{value}</span>;
  }

  const num = Number(value);

  if (!isNaN(num) && num >= 1 && num <= 5) {
    const fullStars = Math.floor(num);
    const hasHalfStar = num % 1 >= 0.5;

    return (
      <span style={{ whiteSpace: "nowrap" }}>
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) return <span key={star} style={{ color: "#f4c150" }}>★</span>;
          if (star === fullStars + 1 && hasHalfStar) return <span key={star} style={{ color: "#f4c150" }}>☆</span>;
          return <span key={star} style={{ color: "#e0e0e0" }}>★</span>;
        })}
      </span>
    );
  }

  return <span className="text-secondary">No rating</span>;
};

const ExpandedChambersRow = ({ chambers }) => {

  if (!chambers || chambers.length === 0) {
    return (
      <div className="p-3 text-center text-secondary">No chamber data</div>
    );
  }

  return (
    <div className="p-2">
      <table className="table mb-0">
        <thead>
          <tr>
            <th className="text-center">Product</th>
            <th className="text-center">Quantity</th>
            <th className="text-center">Rating</th>
          </tr>
        </thead>
        <tbody>
          {chambers.map((ch) => (
            <tr key={ch.id}>
              <td className="text-center">{ch.product_name || ch.id.slice(0, 10)}</td>
              <td className="text-center">{ch?.chamber?.length > 0 && ch?.chamber?.reduce((acc, cur) => acc + Number(cur.quantity), 0)}</td>
           <td className="text-center">
              <StarRating value={getAverageRating(ch.chamber)} />
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ThirdPartyProduct = () => {
  const dispatch = useDispatch();
  const otherProduct = useSelector((state) => state.otherProduct.data);

  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [openRowId, setOpenRowId] = useState(null);
  /* =======================
     Fetch chamber stock ONCE
     ======================= */
  const { data: chamberStockList = [] } = useChamberstock();

  const chamberStockMap = useMemo(() => {
    const map = {};
    chamberStockList.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [chamberStockList]);

  /* =======================
     Fetch orders
     ======================= */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetchAllOrders();
        dispatch(handleFetchData(res.data));
      } catch {
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    if (!otherProduct || otherProduct.length === 0) {
      fetchAll();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, otherProduct]);

  useEffect(() => {
    setFilteredData(otherProduct || []);
  }, [otherProduct]);

  /* =======================
     Delete handlers
     ======================= */
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

  /* =======================
     Helpers
     ======================= */
  const toggleRow = (id) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  };

  /* =======================
     Table wrapper
     ======================= */
  const TableWrapper = ({ children }) => (
    <table className="table align-items-center mb-0">
      <thead>
        <tr className="text-center">
          <th>Image</th>
          <th>Client</th>
          <th>Products</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );

  /* =======================
     Render rows
     ======================= */
  const renderRows = () =>
    filteredData.map((item) => {
      const chambers = (item.products || [])
        .map((id) => chamberStockMap[id])
        .filter(Boolean);

      const isSingle = chambers.length === 1;
      const isMultiple = chambers.length > 1;
      const isOpen = openRowId === item.id;

      return (
        <React.Fragment key={item.id}>
          <tr className="text-center">
            <td>
              <img
                src={item?.banner?.s3Url || "/assets/img/png/fallback_img.png"}
                className="avatar avatar-lg"
                alt="banner"
              />
            </td>

            <td>
              <p className="fw-bold mb-0">{item.name}</p>
              <p className="text-xs text-secondary mb-0">{item.company}</p>
            </td>

            {/* ===== N/A / Single / Multiple LOGIC ===== */}
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
                <ExpandedChambersRow chambers={chambers} />
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    });

  return (
    <div className="container-fluid">
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