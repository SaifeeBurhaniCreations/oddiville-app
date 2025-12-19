import { useEffect } from "react";
import LoaderScreen from "@/src/components/ui/LoaderScreen";
import { useAuth } from "@/src/context/AuthContext";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { resolveAccess, resolveEntryRoute } from "@/src/utils/policiesUtils";

export default function IndexGate() {
  const { role, policies, isAuthenticated, loading } = useAuth();
  const { replaceWith } = useAppNavigation();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      replaceWith("login");
      return;
    }

    const access = resolveAccess(role ?? "guest", policies ?? []);

    const entryRoute = resolveEntryRoute(access);

    if (!entryRoute) {
      console.warn("No entry route found");
      return;
    }

    replaceWith(entryRoute);
  }, [role, policies, isAuthenticated, loading]);

  return <LoaderScreen />;
}