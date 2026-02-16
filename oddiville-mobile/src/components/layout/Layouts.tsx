import { View } from "react-native";
import React from "react";
import { RootState } from "@/src/redux/store";
import { useSelector } from "react-redux";
import { useRoute } from "@react-navigation/native";
import { isFabRoute } from "@/src/utils/userUtils";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/src/components/ui/ToastConfig";
import { StyleSheet } from "react-native";
import { getColor } from "@/src/constants/colors";
import { AuthGuard } from "../authentication/AuthGuard";
import Fab from "@/src/components/ui/Fab";
import MenuSheet from "@/src/components/ui/MenuSheet";

export function AdminTabLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSelector((state: RootState) => state.fab);
  const route = useRoute();
  const shouldShowFab = isFabRoute(route.name);
  return (
    <AuthGuard roles={["admin", "superadmin"]}>
      <View style={styles.layout}>
        {children}

        {/* Overlay */}
        {shouldShowFab && isOpen && (
          <View style={styles.overlay} pointerEvents="none" />
        )}

        {/* FAB */}
        {shouldShowFab && (
          <View style={styles.fabContainer} pointerEvents="box-none">
            <Fab position="right" color="green" />
          </View>
        )}

        <MenuSheet />
        <Toast config={toastConfig} />
      </View>
    </AuthGuard>
  );
}

export function SupervisorTabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard roles={["supervisor"]}>
      <View style={styles.layout}>
        {children}
        <MenuSheet />
        <Toast config={toastConfig} />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.1),
    zIndex: 2,
  },
  fabContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
});
