
import { useCallback } from "react";
import { useSocketContext } from "../context/SocketProvider";

export default function useSocket() {
  const { socket, connected } = useSocketContext();

  const emit = useCallback((event: string, ...args: any[]) => {
    socket?.emit(event, ...args);
  }, [socket]);

  const on = useCallback((event: string, handler: (...a: any[]) => void) => {
    socket?.on(event, handler);
    return () => socket?.off(event, handler);
  }, [socket]);

  const off = useCallback((event: string, handler?: (...a: any[]) => void) => {
    if (!socket) return;
    if (handler) socket.off(event, handler);
    else socket.removeAllListeners(event);
  }, [socket]);

  return { socket, connected, emit, on, off };
}