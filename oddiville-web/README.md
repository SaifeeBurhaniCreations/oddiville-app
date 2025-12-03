import React, { useState, useEffect, useRef } from "react";
import Spinner from "@/components/Spinner/Spinner";

const ChamberStockTableWrapper = ({ children }) => (
  <table className="table align-items-center mb-0">
    <thead>
      <tr>
        <th>Image</th>
        <th>Product Name</th>
        <th className="text-center">Chambers Name</th>
        <th className="text-center">Chambers Quantity</th>
        <th className="text-center">Rating</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

const DropdownLikeSpan = ({ children, onToggle, title }) => (
  <span
    role="button"
    tabIndex={0}
    onClick={(e) => {
      e.stopPropagation();
      onToggle && onToggle();
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle && onToggle();
      }
    }}
    title={title}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      userSelect: "none",
      padding: "2px 6px",
      borderRadius: 6,
      border: "1px solid transparent",
    }}
    className="text-secondary text-xs font-weight-bold"
  >
    <span>{children}</span>
    <span aria-hidden style={{ fontSize: 12, opacity: 0.7 }}>
      ▾
    </span>
  </span>
);

const ExpandedChambersRow = ({ chambers }) => {
  if (!Array.isArray(chambers) || chambers.length === 0) {
    return (
      <div className="p-3 text-center text-secondary">No chamber data</div>
    );
  }

  return (
    <div className="p-2">
      <table className="table mb-0">
        <thead>
          <tr>
            <th className="text-start">Name</th>
            <th className="text-center">Quantity</th>
            <th className="text-center">Rating</th>
          </tr>
        </thead>
        <tbody>
          {chambers.map((ch) => (
            <tr key={ch.id}>
              <td className="text-start text-sm">
                {ch.chamberName || ch.id?.slice?.(0, 12) || "N/A"}
              </td>
              <td className="text-center text-sm">{ch.quantity || "0"}</td>
              <td className="text-center text-sm">{ch.rating || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EditForm = ({ service, onCancel, onSave, saving }) => {
  // Initialize local editable state from service
  const [values, setValues] = useState({
    product_name: service.product_name || "",
    category: service.category || "",
    chamber: Array.isArray(service.chamber)
      ? service.chamber.map((c) => ({ ...c }))
      : [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({
      product_name: service.product_name || "",
      category: service.category || "",
      chamber: Array.isArray(service.chamber)
        ? service.chamber.map((c) => ({ ...c }))
        : [],
    });
    setErrors({});
  }, [service]);

  const setField = (field, val) =>
    setValues((prev) => ({ ...prev, [field]: val }));

  const setChamberField = (index, key, value) => {
    setValues((prev) => {
      const clone = prev.chamber.map((c) => ({ ...c }));
      clone[index] = { ...clone[index], [key]: value };
      return { ...prev, chamber: clone };
    });
  };

  const validate = () => {
    const e = {};
    if (!values.product_name || values.product_name.trim() === "") {
      e.product_name = "Product name is required";
    }
    // check chamber quantities are numbers >= 0
    values.chamber.forEach((c, i) => {
      const num = Number(c.quantity);
      if (!Number.isFinite(num) || num < 0) {
        e[`chamber_${i}_quantity`] = "Quantity must be a number >= 0";
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Build payload - keep same shape (chamber.quantity stored as string to keep backward compatibility)
    const payload = {
      product_name: values.product_name,
      category: values.category,
      chamber: values.chamber.map((c) => ({
        ...c,
        quantity: String(c.quantity),
      })),
    };
    onSave(payload);
  };

  return (
    <div className="p-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Product Name</label>
          <input
            className={`form-control ${
              errors.product_name ? "is-invalid" : ""
            }`}
            value={values.product_name}
            onChange={(e) => setField("product_name", e.target.value)}
            placeholder="Product Name"
          />
          {errors.product_name && (
            <div className="invalid-feedback">{errors.product_name}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            className="form-control"
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            placeholder="Category"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Chambers</label>
          <div className="border rounded p-2">
            {values.chamber.length === 0 && (
              <div className="text-muted">No chambers</div>
            )}
            {values.chamber.map((ch, i) => (
              <div
                key={ch.id || i}
                className="d-flex gap-2 align-items-center mb-2"
              >
                <div style={{ minWidth: 160 }}>
                  <small className="text-muted d-block">Name</small>
                  <input
                    className="form-control form-control-sm"
                    value={ch.chamberName || ch.id}
                    readOnly
                  />
                </div>

                <div style={{ width: 140 }}>
                  <small className="text-muted d-block">Quantity</small>
                  <input
                    className={`form-control form-control-sm ${
                      errors[`chamber_${i}_quantity`] ? "is-invalid" : ""
                    }`}
                    value={ch.quantity}
                    onChange={(e) =>
                      setChamberField(i, "quantity", e.target.value)
                    }
                    placeholder="Quantity"
                  />
                  {errors[`chamber_${i}_quantity`] && (
                    <div className="invalid-feedback">
                      {errors[`chamber_${i}_quantity`]}
                    </div>
                  )}
                </div>

                <div style={{ width: 140 }}>
                  <small className="text-muted d-block">Rating</small>
                  <input
                    className="form-control form-control-sm"
                    value={ch.rating || ""}
                    onChange={(e) =>
                      setChamberField(i, "rating", e.target.value)
                    }
                    placeholder="Rating"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-end">
          <button
            type="button"
            className="btn btn-secondary btn-sm me-2"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={saving}
          >
            {saving ? (
              <>
                Saving...{" "}
                <span
                  className="spinner-border spinner-border-sm ms-2"
                  role="status"
                />
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const ChamberStockTable = ({ chamberStock = [], isLoading = false }) => {
  const [openRowId, setOpenRowId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const containerRef = useRef(null);

  // mutation removed — we'll just console.log the payload on save
  // const updateMutation = useUpdateChamberstock();

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenRowId(null);
        setEditingId(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenRowId(null);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleToggle = (serviceId) => {
    setOpenRowId((prev) => (prev === serviceId ? null : serviceId));
    // if toggling closed, also exit edit mode
    setEditingId((prev) => (prev === serviceId ? null : prev));
  };

  const handleEditClick = (service) => {
    setOpenRowId(service.id);
    setEditingId(service.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = (serviceId, payload) => {
    // just log for now
    console.log("SAVE payload for", serviceId, payload);
    // Optionally close the editor after "save"
    setEditingId(null);
    setOpenRowId(null);
  };

  if (isLoading) {
    return (
      <ChamberStockTableWrapper>
        <tr>
          <td colSpan={6} className="text-center py-5">
            <Spinner />
            <p className="mt-2 text-secondary">Fetching data...</p>
          </td>
        </tr>
      </ChamberStockTableWrapper>
    );
  }

  if (!Array.isArray(chamberStock) || chamberStock.length === 0) {
    return (
      <ChamberStockTableWrapper>
        <tr>
          <td colSpan={6} className="text-center py-5">
            No data available
          </td>
        </tr>
      </ChamberStockTableWrapper>
    );
  }

  return (
    <div ref={containerRef}>
      <ChamberStockTableWrapper>
        {chamberStock.map((service, index) => {
          const chambers = Array.isArray(service?.chamber)
            ? service.chamber
            : [];
          const single = chambers.length === 1;
          const nonEmptyRatings = chambers.filter(
            (c) => c.rating && c.rating !== ""
          );
          const isOpen = openRowId === service.id;
          const isEditing = editingId === service.id;

          return (
            <React.Fragment key={service.id || index}>
              <tr>
                <td>
                  <img
                    src={
                      service?.sample_image?.url ||
                      "/assets/img/png/fallback_img.png"
                    }
                    className="avatar avatar-lg"
                    alt={service.product_name || "banner"}
                  />
                </td>

                <td>
                  <p className="text-xl font-weight-bold mb-0">
                    {service.product_name}
                  </p>
                  <p className="text-xs text-secondary mb-0">
                    Click Name / Quantity / Rating to view chambers
                  </p>
                </td>

                {/* Chambers Name */}
                <td className="text-center">
                  {chambers.length === 0 ? (
                    <span className="text-secondary text-xs font-weight-bold">
                      N/A
                    </span>
                  ) : single ? (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chamber details"
                    >
                      {chambers[0].chamberName || chambers[0].id}
                    </DropdownLikeSpan>
                  ) : (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chambers"
                    >
                      Multiple
                    </DropdownLikeSpan>
                  )}
                </td>

                {/* Chambers Quantity */}
                <td className="text-center">
                  {chambers.length === 0 ? (
                    <span className="text-secondary text-xs font-weight-bold">
                      N/A
                    </span>
                  ) : single ? (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chamber quantity"
                    >
                      {chambers[0].quantity}
                    </DropdownLikeSpan>
                  ) : (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chambers quantity"
                    >
                      Multiple
                    </DropdownLikeSpan>
                  )}
                </td>

                {/* Rating */}
                <td className="text-center">
                  {nonEmptyRatings.length === 0 ? (
                    <span className="text-secondary text-xs font-weight-bold">
                      N/A
                    </span>
                  ) : single ? (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chamber rating"
                    >
                      {chambers[0].rating || "N/A"}
                    </DropdownLikeSpan>
                  ) : (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chambers rating"
                    >
                      Multiple
                    </DropdownLikeSpan>
                  )}
                </td>

                {/* Actions */}
                <td>
                  <div className="d-flex">
                    <button
                      className="btn btn-link text-info px-3 mb-0"
                      onClick={() => handleEditClick(service)}
                      type="button"
                    >
                      <i className="far fa-pencil me-2" />
                      Edit
                    </button>
                  </div>
                </td>
              </tr>

              {/* Expanded panel row */}
              {isOpen && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="border rounded bg-white m-2">
                      {isEditing ? (
                        <EditForm
                          service={service}
                          onCancel={handleCancelEdit}
                          onSave={(payload) => handleSave(service.id, payload)}
                          saving={false}
                        />
                      ) : (
                        <ExpandedChambersRow chambers={chambers} />
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </ChamberStockTableWrapper>
    </div>
  );
};

export default ChamberStockTable;
