import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import LoaderScreen from "@/src/components/ui/LoaderScreen";
import { Access, resolveAccess } from "@/src/utils/policiesUtils";
import { Href } from "expo-router";

type RedirectRule = {
  check: (a: Access) => boolean;
  path: Href;
};

const POLICY_REDIRECT_ORDER: RedirectRule[] = [
  { check: (a) => a.purchase, path: "/policies/purchase" },
  { check: (a) => a.production, path: "/policies/production" },
  { check: (a) => a.package, path: "/policies/package" },
  { check: (a) => a.sales.view || a.sales.edit, path: "/policies/sales" },
];

export default function IndexGate() {
  const { role, policies, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // 🔓 Full access roles
    if (role === "admin" || role === "superadmin") {
      router.replace("/(tabs)/home");
      return;
    }

    // 🔐 Policy-based roles
    if (role === "supervisor" || role === "manager") {
      const access = resolveAccess(role, policies ?? []);

      for (const rule of POLICY_REDIRECT_ORDER) {
        if (rule.check(access)) {
          router.replace(rule.path);
          return;
        }
      }

      router.replace("/");
      return;
    }

    router.replace("/");
  }, [role, policies, isAuthenticated, loading]);

  return <LoaderScreen />;
}
