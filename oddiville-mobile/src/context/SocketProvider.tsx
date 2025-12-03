import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";

type SocketContextShape = {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, handler: (...args: any[]) => void) => () => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  disconnect: () => void;
};

const SocketContext = createContext<SocketContextShape | undefined>(undefined);

// Accept `url` prop (optional)
export function SocketProvider({
  children,
  url,
}: {
  children: React.ReactNode;
  url?: string | undefined;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const apiUrl = url ?? Constants.expoConfig?.extra?.API_URL;

  useEffect(() => {
    if (!apiUrl) {
      console.warn(
        "[SocketProvider] no API URL provided; socket will not be created"
      );
      return;
    }

    const s = io(apiUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    const onConnect = () => {
      console.log("✅ Socket connected (provider):", s.id, Date.now());
      setConnected(true);
    };
    const onDisconnect = (reason: any) => {
      console.log(
        "⚠️ Socket disconnected (provider):",
        s.id,
        reason,
        Date.now()
      );
      setConnected(false);
    };
    const onConnectError = (err: any) => {
      console.warn("❌ connect_error (provider):", err, Date.now());
    };

    s.on("connect", onConnect);
    s.onAny((event: string, ...args: any[]) => {
      console.debug(
        "[socket:onAny] event:",
        event,
        "args:",
        args,
        "socketId:",
        s.id,
        "time:",
        Date.now()
      );
    });

    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);

    setSocket(s);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [apiUrl]);

  const emit = (event: string, ...args: any[]) => socket?.emit(event, ...args);
  const on = (event: string, handler: (...args: any[]) => void) => {
    socket?.on(event, handler);
    return () => socket?.off(event, handler);
  };
  const off = (event: string, handler?: (...args: any[]) => void) => {
    if (!socket) return;
    if (handler) socket.off(event, handler);
    else socket.removeAllListeners(event);
  };
  const disconnect = () => socket?.disconnect();

  const value = { socket, connected, emit, on, off, disconnect };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx)
    throw new Error("useSocketContext must be used inside SocketProvider");
  return ctx;
};
