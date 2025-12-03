// src/components/tables/LaneTable.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import Spinner from "@/components/Spinner/Spinner";
import { formatDate } from "@/util/formatDate";

const TableWrapper = ({ children }) => (
  <table className="table align-items-center mb-0">
    <thead>
      <tr>
        <th>Image</th>
        <th>Lane Name</th>
        <th className="text-center">Last Updated</th>
        <th className="text-center">Created At</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

const renderTableRows = (data, handleDeleteClick) => {
  return data.map((lane, ind) => {
    const record = lane?.data ?? lane;
    const imageUrl =
      record?.sample_image?.url ||
      record?.sample_image ||
      "/assets/img/png/fallback_img.png";

    return (
      <tr key={record?.id ?? ind}>
        <td style={{ width: 120 }}>
          <img
            src={imageUrl}
            className="avatar avatar-lg"
            alt="lane"
            style={{ objectFit: "cover" }}
          />
        </td>
        <td>
          <p className="text-xl font-weight-bold mb-0">
            {record?.lane_name ?? record?.name ?? "--"}
          </p>
          <p className="text-xs text-secondary mb-0">
            {record?.description ?? ""}
          </p>
        </td>
        <td className="text-center">
          <span className="text-secondary text-xs font-weight-bold">
            {formatDate(record?.updatedAt)}
          </span>
        </td>
        <td className="text-center">
          <span className="text-secondary text-xs font-weight-bold">
            {formatDate(record?.createdAt)}
          </span>
        </td>
        <td>
          <div className="d-flex">
            <NavLink
              to={`/edit-lane/${record?.id}`}
              className="btn btn-link m-0 text-secondary font-weight-bold text-xs"
            >
              Edit
            </NavLink>
            <button
              className="btn btn-link text-danger text-gradient px-3 mb-0"
              onClick={() => handleDeleteClick(record)}
            >
              <i className="far fa-trash-alt me-2" /> Delete
            </button>
          </div>
        </td>
        
      </tr>
    );
  });
};

const LaneTable = ({ filteredData = [], isLoading, handleDeleteClick }) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
        <p className="mt-2 text-secondary">Fetching lanes...</p>
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <TableWrapper>
        <tr>
          <td colSpan={5} className="text-center py-5">
            No lane available
          </td>
        </tr>
      </TableWrapper>
    );
  }

  return <TableWrapper>{renderTableRows(filteredData, handleDeleteClick)}</TableWrapper>;
};

export default LaneTable;