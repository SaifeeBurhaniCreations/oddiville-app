import { formatDate } from "date-fns";

const ProductListTable = ({ productList, handleEditProduct, handleDeleteProduct }) => {
    if (productList.length === 0) return null;

    console.log("productList", productList);
    
    return (    
        <div className="card mt-4">
            <div className="card-header"><h6>Products List</h6></div>
            <div className="card-body table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Dispatch Date</th>
                            <th>Rent/Kg</th>
                            <th>Chambers & Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productList.map((prod, i) => (
                            <tr key={prod._rowId}>
                                <td className="d-flex justify-content-center">
                                   <img
                                    src={prod.sample_image || "/assets/img/png/fallback_img.png"}
                                    alt="product"
                                    width={48}
                                    height={48}
                                    style={{ objectFit: "cover", borderRadius: "6px" }}
                                    />

                                </td>
                                <td>
                                    <span className="font-weight-bold">{prod.product_name}</span>
                                </td>
                                <td>{formatDate(prod.est_dispatch_date, "dd-MM-yy")}</td>
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
                                        onClick={() => handleEditProduct(prod._rowId)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger" 
                                        onClick={() => handleDeleteProduct(prod._rowId)}
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