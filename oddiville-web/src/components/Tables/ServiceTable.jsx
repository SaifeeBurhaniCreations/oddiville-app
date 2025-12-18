
import { NavLink } from "react-router-dom";
import Spinner from "@/components/Spinner/Spinner"; 
import { formatDate } from "@/util/formatDate"; 

const TableWrapper = ({ children }) => (
    <table className="table align-items-center mb-0">
        <thead>
            <tr>
                <th>Image</th>
                <th>Item Name</th>
                <th className="text-center">Chamber</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">Created Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>{children}</tbody>
    </table>
);

const renderTableRows = (filteredData, handleDeleteClick) => {
    return filteredData.map((service, ind) => (
        <tr key={ind}>
            <td>
                <img
                    src={service?.sample_image?.url || "/assets/img/png/fallback_img.png"}
                    className="avatar avatar-lg"
                    alt="banner"
                />
            </td>
            <td>
                <p className="text-xl font-weight-bold mb-0">{service.item_name.split(":")[0]}</p>
                <p className="text-xs text-secondary mb-0">{service.description}</p>
            </td>
            <td className="text-center">
                <span className="text-secondary text-xs font-weight-bold">
                    {service?.chamber_name || "N/A"}
                </span>
            </td>
            <td className="text-center">
                <span className="text-secondary text-xs font-weight-bold">
                    {`${service.item_name.split(":")[1] ?? service?.quantity_unit} Kg` || "N/A"}
                </span>
            </td>
            <td className="text-center">
                <span className="text-secondary text-xs font-weight-bold">
                    {formatDate(service?.warehoused_date)}
                </span>
            </td>
            <td>
                <div className="d-flex">
                    <NavLink
                        to={`/update-item/${service?.id}`}
                        className="btn m-0 btn-link text-info font-weight-bold text-xs"
                    >
                        Edit
                    </NavLink>
                    <button
                        className="btn btn-link text-danger text-gradient px-3 mb-0"
                        onClick={() => handleDeleteClick(service)}
                    >
                        <i className="far fa-trash-alt me-2" /> Delete
                    </button>
                </div>
            </td>
        </tr>
    ));
};

const ServiceTable = ({ filteredData, isLoading, handleDeleteClick }) => {
    
    // Loading State
    if (isLoading) {
        return (
            <TableWrapper>
                <tr>
                    <td colSpan={5} className="text-center py-5">
                        <Spinner />
                        <p className="mt-2 text-secondary">Fetching data...</p>
                    </td>
                </tr>
            </TableWrapper>
        );
    }
    
    // No Data State
    if (filteredData.length === 0) {
        return (
            <TableWrapper>
                <tr>
                    <td colSpan={5} className="text-center py-5">
                        No data available
                    </td>
                </tr>
            </TableWrapper>
        );
    }

    return (
        <TableWrapper>
            {renderTableRows(filteredData, handleDeleteClick)}
        </TableWrapper>
    );
};

export default ServiceTable;