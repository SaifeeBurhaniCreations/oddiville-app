import React, { useState, useEffect, useRef } from "react";
import Spinner from "@/components/Spinner/Spinner";
import { omitArray } from "../../sbc/utils/arrayTransformer/arrayTransformer";
import { updateChamberStock } from "../../services/chamberstock.service";
import { useUpdateChamberstock } from "../../hooks/chamberStock";
import { useNavigate } from "react-router-dom";

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

const DropdownLikeSpan = ({
  children,
  onToggle,
  title,
  style = {},
  isOpen = false,
}) => {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    userSelect: "none",
    padding: "2px 6px",
    borderRadius: 6,
    border: "1px solid transparent",
    ...style,
  };

  const caretStyle = {
    fontSize: 12,
    opacity: 0.7,
    display: "inline-block",
    transition: "transform 180ms ease",
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    transformOrigin: "50% 50%",
  };

  return (
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
      style={baseStyle}
      className="text-secondary text-xs font-weight-bold"
    >
      <span>{children}</span>
      <span aria-hidden style={caretStyle}>
        ▾
      </span>
    </span>
  );
};

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
                {ch.chamber_name || ch.id?.slice?.(0, 12) || "N/A"}
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
      ? service.chamber.map((c) => ({
          ...c,
          __originalName: c.chamber_name ?? "",
        }))
      : [],
  });
}, [service]);

  const setChamberField = (index, field, value) => {
    setValues((prev) => {
      const clone = prev.chamber.map((c) => ({ ...c }));
      clone[index] = { ...clone[index], [field]: value };
      return { ...prev, chamber: clone };
    });
  };

  const setChamberQuantity = (index, newQty) => {
    setChamberField(index, "quantity", String(newQty));
  };

  const increment = (index) => {
    const current = Number(values.chamber[index].quantity || 0);
    setChamberQuantity(index, current + 1);
  };

  const decrement = (index) => {
    const current = Number(values.chamber[index].quantity || 0);
    const next = Math.max(0, current - 1);
    setChamberQuantity(index, next);
  };

  const onInputChange = (index, rawValue) => {
    const cleaned = rawValue.replace(/[^\d-]/g, "");
    let num = Number(cleaned);
    if (!Number.isFinite(num)) num = 0;
    if (num < 0) num = 0;
    setChamberQuantity(index, num);
  };

  const validate = () => {
    const e = {};
    values.chamber.forEach((c, i) => {
      const num = Number(c.quantity);
      if (!Number.isFinite(num) || num < 0) {
        e[`chamber_${i}_quantity`] = "Quantity must be a number >= 0";
      }
      if (c.rating && !["1", "2", "3", "4", "5"].includes(String(c.rating))) {
        e[`chamber_${i}_rating`] = "Invalid rating";
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    if (ev && typeof ev.preventDefault === "function") {
      ev.preventDefault();
      if (typeof ev.stopPropagation === "function") ev.stopPropagation();
    }

    if (!validate()) return;

    const payload = {
      product_name: values.product_name,
      chamber: values.chamber.map((c) => ({
        ...c,
        quantity: String(c.quantity),
      })),
    };

    onSave(payload);
  };

  const ratingOptions = ["", "1", "2", "3", "4", "5"];

  return (
    <div
      className="p-3"
      role="group"
      aria-label={`Edit ${service.product_name}`}
    >
      <div className="mb-3">
        <label className="form-label">Product</label>
        <input
          className="form-control"
          value={values.product_name}
    onChange={(e) =>
      setValues((prev) => ({
        ...prev,
        product_name: e.target.value,
      }))
    }
  />
</div>

      <div className="mb-3">
        <label className="form-label">Category</label>
        <input className="form-control" value={values.category} readOnly />
      </div>

      <div className="mb-3">
        <label className="form-label">Chambers (edit quantities only)</label>
        <div className="border rounded p-2">
          {values.chamber.length === 0 && (
            <div className="text-muted">No chambers</div>
          )}

          {values.chamber.map((ch, i) => (
            <div
              key={ch.id || i}
              className="d-flex gap-2 align-items-center mb-2"
            >
              <div style={{ minWidth: 200 }}>
                <small className="text-muted d-block">Name</small>
                <input
                  style={{ height: 32 }}
                  className="form-control form-control-sm"
                  value={ch.chamber_name || ch.id}
                  readOnly
                />
              </div>

              <div style={{ width: 180 }}>
                <small className="text-muted d-block">Quantity</small>
                <div className="input-group input-group-sm qty-group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary horizontal-rounded"
                    onClick={() => decrement(i)}
                    aria-label={`Decrease quantity for ${
                      ch.chamber_name || ch.id
                    }`}
                  >
                    −
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`form-control text-center ${
                      errors[`chamber_${i}_quantity`] ? "is-invalid" : ""
                    } input-flat`}
                    value={String(ch.quantity ?? "")}
                    onChange={(e) => onInputChange(i, e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary horizontal-rounded"
                    onClick={() => increment(i)}
                    aria-label={`Increase quantity for ${
                      ch.chamber_name || ch.id
                    }`}
                  >
                    +
                  </button>
                  {errors[`chamber_${i}_quantity`] && (
                    <div className="invalid-feedback d-block">
                      {errors[`chamber_${i}_quantity`]}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ width: 140 }}>
                <small className="text-muted d-block">Rating</small>
                <select
                  className="form-select form-select-sm"
                  style={{ height: 32 }}
                  aria-label={`Rating for ${ch.chamber_name || ch.id}`}
                  value={String(ch.rating ?? "")}
                  onChange={(e) => setChamberField(i, "rating", e.target.value)}
                >
                  <option value="">N/A</option>
                  {ratingOptions
                    .filter((r) => r !== "")
                    .map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                </select>
                {errors[`chamber_${i}_rating`] && (
                  <div className="invalid-feedback d-block">
                    {errors[`chamber_${i}_rating`]}
                  </div>
                )}
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

        {/* Save is now type="button" and calls submit directly */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={submit}
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
    </div>
  );
};

const ChamberStockTable = ({ chamberStock = [], isLoading = false }) => {
  const [openRowId, setOpenRowId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const containerRef = useRef(null);
  const updateChamberstock = useUpdateChamberstock();
  const navigate = useNavigate();

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
    const updatePayload = omitArray(payload.chamber, "chamber_name");

    const normalizedPayload = updatePayload.map((c) => ({
      id: c.id,
      quantity: String(c.quantity ?? "0"),
      rating: c.rating ? String(c.rating) : "",
    }));

        updateChamberstock.mutate(
          {
            id: serviceId,
            data: {
              product_name: payload.product_name,
              chamber: normalizedPayload,
            },
          },
      {
        onSuccess: (result) => {
          navigate("/chamberstock/edit");
        },
        onError: (error) => {
          showToast("error", "Failed to update chamberstock");
        },
      }
    );
    // updateChamberStock({id: serviceId, data: normalizedPayload});

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
                      service?.image?.trim()
                        ? service.image
                        : "/assets/img/png/fallback_img.png"
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
                      isOpen={isOpen}
                    >
                      {chambers[0].chamber_name || chambers[0].id}
                    </DropdownLikeSpan>
                  ) : (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chambers"
                      isOpen={isOpen}
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
                      isOpen={isOpen}
                    >
                      {chambers[0].quantity}
                    </DropdownLikeSpan>
                  ) : (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chambers quantity"
                      isOpen={isOpen}
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
                      isOpen={isOpen}
                    >
                      {chambers[0].rating || "N/A"}
                    </DropdownLikeSpan>
                  ) : (
                    <DropdownLikeSpan
                      onToggle={() => handleToggle(service.id)}
                      title="View chambers rating"
                      isOpen={isOpen}
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
