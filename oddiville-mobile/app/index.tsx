import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import LoaderScreen from "@/src/components/ui/LoaderScreen";

export default function IndexGate() {
  const { role, policies, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (
      role === "admin" ||
      role === "superadmin" 
    ) {
      router.replace("/(tabs)/home");
    } else if (
      role === "supervisor"  && policies && policies.length > 0
    ) {
       if(policies[0] === "purchase") {
         router.replace("/policies/purchase");
       } else if(policies[0] === "production") {
         router.replace("/policies/production");
       } else if(policies[0] === "package") {
         router.replace("/policies/package");
       } else if(policies[0] === "sales") {
         router.replace("/policies/sales");
       }
    } else {
      router.replace("/");
    }
  }, [role, isAuthenticated, loading]);

  return <LoaderScreen />;
}
