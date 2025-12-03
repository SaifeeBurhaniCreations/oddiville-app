import React, { useState } from "react";
export default function ModalAccordion({ isOpen, title = "Validation Errors", errors = [], onClose = () => {} }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{ width: "min(1000px, 96%)", maxHeight: "90vh", overflow: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h5 style={{ margin: 0 }}>{title}</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Close</button>
        </div>

        <div style={{ padding: 12 }}>
          <p style={{ marginTop: 0 }}>Validation errors are grouped by column — expand a column to inspect individual rows.</p>

          {errors.length === 0 ? (
            <div className="alert alert-success">No errors</div>
          ) : (
            <div>
              {errors.map((group, idx) => {
                const isOpen = idx === openIndex;
                return (
                  <div key={group.column} style={{ border: "1px solid #e6e6e6", borderRadius: 6, marginBottom: 8 }}>
                    <div
                      onClick={() => setOpenIndex((cur) => (cur === idx ? -1 : idx))}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}
                    >
                      <div style={{ fontWeight: 600 }}>{group.column}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>{group.issues.length} issue(s)</div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: 12, background: "#fff" }}>
                        <table className="table table-sm" style={{ marginBottom: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: 80 }}>Row</th>
                              <th>Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.issues.map((iss, i) => (
                              <tr key={i}>
                                <td>{iss.row}</td>
                                <td>{iss.message}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-secondary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
