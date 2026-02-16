import React from "react";
import NoAccess from "@/src/components/ui/NoAccess";
import Loader from "@/src/components/ui/Loader";
import { View, StyleSheet } from "react-native";
import { useAppCapabilities } from "@/src/hooks/useAppCapabilities";

export type AppModule =
  | "purchase"
  | "production"
  | "sales"
  | "package"
  | "trucks"
  | "labours";

type RequireProps = {
  view?: AppModule;
  edit?: AppModule;
  admin?: boolean;
  anyOf?: AppModule[];
  fallback?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
};

const Require = ({
  view,
  edit,
  admin,
  fallback,
  loading = false,
  children,
  anyOf,
}: RequireProps) => {
  const caps = useAppCapabilities();

  if (loading) {
    return (
      <View style={styles.loader}>
        <Loader />
      </View>
    );
  }

 let allowed = true;

// admin
if (admin) {
  allowed = allowed && caps.isAdmin;
}

// view
if (view) {
  allowed = allowed && !!caps[view]?.view;
}

// edit
if (edit) {
  allowed = allowed && !!caps[edit]?.edit;
}

// anyOf (OR rule)
if (anyOf) {
  allowed = allowed && anyOf.some((m) => caps[m]?.view);
}

  return <>{children}</>;
};

export default Require;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});