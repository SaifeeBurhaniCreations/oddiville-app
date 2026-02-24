
import { NavLink } from "react-router-dom";
import Spinner from "@/components/Spinner/Spinner"; 
import { formatDate } from "@/util/formatDate"; 

const formatKg = (val) => Number(Number(val || 0).toFixed(2));

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
    const rows = [];

    filteredData.forEach((group, groupIndex) => {

        // rows.push(
        //     <tr key={`group-${groupIndex}`} className="table-secondary">
        //         <td colSpan={6}>
        //             <strong>
        //                 {group.product_name} ({group.size} {group.unit})
        //             </strong>
        //         </td>
        //     </tr>
        // );

        // RATING ROWS
        group.ratings.forEach((rating, ratingIndex) => {
            rows.push(
                <tr key={rating.id}>
                    <td>
                        <img
                            src={"/assets/img/png/fallback_img.png"}
                            className="avatar avatar-lg"
                            alt="item"
                        />
                    </td>

                    <td>
                        <p className="text-sm font-weight-bold mb-0">
                            {group.product_name} ({group.size} {group.unit})
                        </p>
                        {/* <p className="text-sm font-weight-bold mb-0">
                            ⭐ Rating {rating.rating}
                        </p> */}
                    </td>

                    <td className="text-center">
                        {rating.chamber_name || "N/A"}
                    </td>

                    <td className="text-center">
                        {formatKg(rating.quantity)} Kg
                    </td>

                    <td className="text-center">
                        {formatDate(group.warehouse_date) ?? "—"}
                    </td>

                    <td>
                        <button
                            className="btn btn-link text-danger text-gradient px-3 mb-0"
                            onClick={() => handleDeleteClick(rating)}
                        >
                            <i className="far fa-trash-alt me-2" />
                            Delete
                        </button>
                    </td>
                </tr>
            );
        });
    });

    return rows;
};


const ServiceTable = ({ filteredData, isLoading, handleDeleteClick }) => {
    
    // Loading State
    if (isLoading) {
        return (
            <TableWrapper>
                <tr>
                    <td colSpan={6} className="text-center py-5">
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
                    <td colSpan={6} className="text-center py-5">
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