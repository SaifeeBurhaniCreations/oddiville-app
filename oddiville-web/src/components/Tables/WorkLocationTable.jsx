

import React from "react";
import { NavLink } from "react-router-dom";
import Spinner from "@/components/Spinner/Spinner";
import { formatDate } from "@/util/formatDate"; 

const TableWrapper = ({ children }) => (
    <table className="table align-items-center mb-0">
        <thead>
            <tr>
                <th>Image</th>
                <th>Location Name</th>
                <th className="text-center">Last Updated</th>
                <th className="text-center">Created At</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>{children}</tbody>
    </table>
);

const renderTableRows = (data, handleDeleteClick) => {
    return data.map((location, ind) => (
        <tr key={ind}>
            <td>
                <img
                    src={location?.sample_image?.url || location?.data?.sample_image?.url || "/assets/img/png/fallback_img.png"}
                    className="avatar avatar-lg"
                    alt="banner"
                />
            </td>
            <td>
                <p className="text-xl font-weight-bold mb-0">{location?.location_name || location?.data?.location_name}</p>
                <p className="text-xs text-secondary mb-0">{location?.description || location?.data?.description}</p>
            </td>
            <td className="text-center">
                <span className="text-secondary text-xs font-weight-bold">
                    {formatDate(location?.updatedAt || location?.data?.updatedAt)}
                </span>
            </td>
            <td className="text-center">
                <span className="text-secondary text-xs font-weight-bold">
                    {formatDate(location?.createdAt||location?.data?.createdAt)}
                </span>
            </td>
            <td>
                <div className="d-flex">
                    <NavLink
                        to={`/edit-location/${location?.id||location?.data?.id}`}
                        className="btn btn-link m-0 text-secondary font-weight-bold text-xs"
                    >
                        Edit
                    </NavLink>
                    <button
                        className="btn btn-link text-danger text-gradient px-3 mb-0"
                        onClick={() => handleDeleteClick(location||location?.data)}
                    >
                        <i className="far fa-trash-alt me-2" /> Delete
                    </button>
                </div>
            </td>
        </tr>
    ));
};

const WorkLocationTable = ({ filteredData, isLoading, handleDeleteClick }) => {
    
    
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <Spinner />
                <p className="mt-2 text-secondary">Fetching work locations...</p>
            </div>
        );
    }
  
    if (filteredData.length === 0) {
        return (
            <TableWrapper>
                <tr><td colSpan={5} className="text-center py-5">No data available</td></tr>
            </TableWrapper>
        );
    }

    return (
        <TableWrapper>
            {renderTableRows(filteredData, handleDeleteClick)}
        </TableWrapper>
    );
};

export default WorkLocationTable;