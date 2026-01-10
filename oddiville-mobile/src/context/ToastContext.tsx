import React, { createContext, useContext, useState } from "react";
import DetailsToast from "../components/ui/DetailsToast";

type ToastType = "success" | "error" | "info";

type ToastContextType = {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<ToastType>("info");
  const [message, setMessage] = useState("");

  const show = (type: ToastType, msg: string) => {
    setType(type);
    setMessage(msg);
    setVisible(true);
  };

  return (
    <ToastContext.Provider
      value={{
        success: (msg) => show("success", msg),
        error: (msg) => show("error", msg),
        info: (msg) => show("info", msg),
      }}
    >
      {children}

      <DetailsToast
        type={type}
        message={message}
        visible={visible}
        onHide={() => setVisible(false)}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};