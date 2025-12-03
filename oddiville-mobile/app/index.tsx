import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import LoaderScreen from "@/src/components/ui/LoaderScreen";

export default function IndexGate() {
  const { role, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (
      role === "admin" ||
      role === "superadmin" ||
      role === "supervisor" 
    ) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/");
    }
  }, [role, isAuthenticated, loading]);

  return <LoaderScreen />;
}
