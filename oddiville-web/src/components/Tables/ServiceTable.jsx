
import { NavLink } from "react-router-dom";
import Spinner from "@/components/Spinner/Spinner"; 
import { formatDate } from "@/util/formatDate"; 
import { useState } from "react";

const formatKg = (val) => Number(Number(val || 0).toFixed(2));

const TableWrapper = ({ children }) => (
    <table className="table align-items-center mb-0">
        <thead>
            <tr>
                <th>Image</th>
                <th>Item Name</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">SKU</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>{children}</tbody>
    </table>
);


const PackagingRow = ({ group, handleDeleteClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr>
        <td>
          <img
            src={group.image || "/assets/img/png/fallback_img.png"}
            className="avatar avatar-lg"
            alt="item"
          />
        </td>

        <td>
          <p className="text-sm font-weight-bold mb-0">
            {group.product}
          </p>
        </td>

        <td className="text-center">—</td>

        <td className="text-center">
          {group.skus.length} SKUs
        </td>

        <div className="d-flex, align-items-center">
          <button
            className="btn btn-link text-info text-gradient px-3 mb-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Hide" : "View"}
          </button>
                        <button
                            className="btn btn-link text-danger text-gradient px-3 mb-0"
                            onClick={() => handleDeleteClick(rating)}
                        >
                            <i className="far fa-trash-alt me-2" />
                            Delete
                        </button>
        </div>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={6} className="p-0">
            <ExpandedSKUList skus={group.skus} />
          </td>
        </tr>
      )}
    </>
  );
};

const ExpandedSKUList = ({ skus }) => {
  return (
    <div className="p-3 border">
      <table className="table mb-0">
        <thead>
          <tr>
            <th>SKU</th>
            <th className="text-center">Quantity</th>
            <th className="text-center">Chambers</th>
          </tr>
        </thead>
        <tbody>
          {skus.map((sku) => {
            const totalQty = sku.ratings.reduce(
              (sum, r) => sum + Number(r.quantity || 0),
              0
            );

            const chambers = sku.ratings
              .map((r) => r.chamber_name)
              .join(", ");

            return (
              <tr key={sku.skuKey}>
                <td>{sku.size} {sku.unit}</td>
                <td className="text-center">
                  {formatKg(totalQty)} Kg
                </td>
                <td className="text-center">
                  {chambers || "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const renderTableRows = (structuredData, handleDeleteClick) => {
    const rows = [];

structuredData.forEach((group) => {

    if (group.type === "dry") {

        group.ratings.forEach((rating) => {
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
                            {group.item_name}
                        </p>
                    </td>

                    <td className="text-center">
                        {rating.chamber_name || "N/A"}
                    </td>

                    <td className="text-center">
                        {formatKg(rating.quantity)} Kg
                    </td>
                </tr>
            );
        });

    } else if (group.type === "packaging") {

  rows.push(
  <PackagingRow
    key={group.product}
    group={group}
    handleDeleteClick={handleDeleteClick}
  />
);
    }
});
    return rows;
};


const ServiceTable = ({ filteredData, structuredData, isLoading, handleDeleteClick }) => {
    
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
    if (structuredData.length === 0) {
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
            {renderTableRows(structuredData, handleDeleteClick)}
        </TableWrapper>
    );
};

export default ServiceTable;