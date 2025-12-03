import { useAuth } from "@/src/context/AuthContext";
import React, { useEffect } from "react";
import Loader from "../ui/Loader";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { StyleSheet, View } from "react-native";
import { getColor } from "@/src/constants/colors";

export const AuthGuard: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const { resetTo } = useAppNavigation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        resetTo("Login");
      } else if (roles && !roles.includes(role!)) {
        resetTo("Main");
      }
    }
  }, [isAuthenticated, role, loading]);

  if (loading || !isAuthenticated || (roles && !roles.includes(role!))) {
    return <View style={styles.overlay}>
      <View style={styles.loaderContainer}>
        <Loader />
      </View>
    </View>;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor('green', 500, 0.05),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})