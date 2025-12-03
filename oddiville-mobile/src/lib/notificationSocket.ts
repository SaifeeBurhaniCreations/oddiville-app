  import { io, Socket } from "socket.io-client";
  import Constants from "expo-constants";

  const apiUrl = Constants.expoConfig?.extra?.API_URL; 

  // @ts-ignore
  if (!globalThis.__NOTIF_SOCKET__) {
    const s: Socket = io(apiUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    s.on("connect", () => console.log("✅ Socket connected (singleton):", s.id));
    s.on("disconnect", (reason) => console.log("⚠️ disconnected:", reason));
    s.on("connect_error", (err) =>
      console.log("❌ connect_error:", err?.message, err)
    );
    // @ts-ignore
    // s.onAny((event, ...args) => console.log("SOCKET ▶", event, args?.[0]));

    // @ts-ignore
    globalThis.__NOTIF_SOCKET__ = s;
  }

  // @ts-ignore
  export const socket: Socket = globalThis.__NOTIF_SOCKET__;