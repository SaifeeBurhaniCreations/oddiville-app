import React from "react";

const Modal = ({
    isOpen,
    title,
    children,
    onClose,
    actions = null // Array of {label, onClick, className}
}) => {
    if (!isOpen) return null;
    return (
        <div
            className="modal-backdrop"
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.25)",
                zIndex: 1050,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <div
                className="modal-content"
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    minWidth: 400,
                    minHeight: 80,
                    maxWidth: 600,
                    boxShadow: "0 6px 32px rgba(0,0,0,0.17)",
                    position: "relative"
                }}
            >
                <div
                    className="modal-header"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 16px 0 16px"
                    }}
                >
                    <h5 style={{ margin: 0 }}>{title}</h5>
                    <button
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "none",
                            fontSize: 20,
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        ×
                    </button>
                </div>
                <div
                    className="modal-body"
                    style={{ padding: "16px" }}
                >
                    {children}
                </div>
                {actions && (
                    <div
                        className="modal-footer"
                        style={{
                            padding: "8px 16px 16px 16px",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8
                        }}
                    >
                        {actions.map((a, idx) => (
                            <button
                                key={idx}
                                className={a.className ?? "btn btn-primary"}
                                onClick={a.onClick}
                            >
                                {a.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;