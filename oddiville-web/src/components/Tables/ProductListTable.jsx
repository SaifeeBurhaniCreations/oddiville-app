// src/components/tables/ProductListTable.jsx

import React from "react";

const ProductListTable = ({ productList, handleEditProduct, handleDeleteProduct }) => {
    if (productList.length === 0) return null;

    return (
        <div className="card mt-4">
            <div className="card-header"><h6>Products List</h6></div>
            <div className="card-body table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Name</th>
                            <th>Dispatch Date</th>
                            <th>Rent/Kg</th>
                            <th>Chambers & Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productList.map((prod, i) => (
                            <tr key={i}>
                                <td>
                                    <span className="font-weight-bold">{prod.product_name}</span>
                                </td>
                                <td>{prod.est_dispatch_date}</td>
                                <td>₹{prod.rent}</td>
                                <td>
                                    {prod.selectedChambers.map((c, index) => (
                                        <div key={index} className="badge bg-primary me-2 mb-1">
                                            {c.name || `ID: ${c.id}`} - {c.quantity} Kg
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    <button 
                                        className="btn btn-sm btn-warning me-2" 
                                        onClick={() => handleEditProduct(i)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger" 
                                        onClick={() => handleDeleteProduct(i)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductListTable;