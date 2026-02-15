import "@/global.css";
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider, useSelector } from "react-redux";
import { RootState, store } from "@/src/redux/store";
import { MultiToggleProvider } from "@/src/hooks/useToggleGlobal";
import { QueryClient } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { getColor } from "@/src/constants/colors";
import LoaderScreen from "@/src/components/ui/LoaderScreen";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import { Platform, View, StatusBar as RNStatusBar } from "react-native";
import { Slot } from "expo-router";
import { isFabRoute } from "@/src/utils/userUtils";
import Fab from "@/src/components/ui/Fab";
import MenuSheet from "@/src/components/ui/MenuSheet";
import Toast from 'react-native-toast-message';
import { toastConfig } from "@/src/components/ui/ToastConfig";
import { StyleSheet } from "react-native";
import { setupQueryPersistence } from "@/src/lib/react-query/persist";
import BottomSheet from "@/src/components/ui/BottomSheet";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { SocketProvider } from "@/src/context/SocketProvider";
import Constants from "expo-constants";
import { ToastProvider } from "@/src/context/ToastContext";
import { usePathname } from "expo-router";
import { OverlayLoaderProvider } from "@/src/context/OverlayLoaderContext";

function InnerLayout() {
  const { role } = useAuth();

  const { isOpen } = useSelector((state: RootState) => state.fab);
  const pathname = usePathname();
  const shouldShowFab = isFabRoute(pathname);

  const isAdminLike = role === "admin" || role === "superadmin";

  return (
    <View style={styles.layout}>
      <Slot />

      {isAdminLike && shouldShowFab && isOpen && (
        <View style={styles.overlay} pointerEvents="none" />
      )}

      {isAdminLike && shouldShowFab && (
        <View style={styles.fabContainer} pointerEvents="box-none">
          <Fab position="right" color="green" />
        </View>
      )}
    </View>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "rn:reactquery:persist",
});

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const apiUrl = Constants.expoConfig?.extra?.API_URL;

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          "FunnelSans-Regular": require("@/src/assets/fonts/FunnelSans-Regular.ttf"),
          "FunnelSans-SemiBold": require("@/src/assets/fonts/FunnelSans-SemiBold.ttf"),
          "FunnelSans-Bold": require("@/src/assets/fonts/FunnelSans-Bold.ttf"),
        });
        setIsAppReady(true);
      } catch (e) {
        console.error("App load error", e);
      }
    }
    loadResources();
    // setupQueryPersistence();
  }, []);

  if (!isAppReady) {
    return <LoaderScreen />;
  }

  const statusBarHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight : 44;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => Boolean(query.meta?.persist),
          },
        }}
        onSuccess={() => {
          /* actions after rehydration */
        }}
      >
        <Provider store={store}>
          <MultiToggleProvider>
            <OverlayLoaderProvider>
            <ToastProvider>
            <SocketProvider url={apiUrl}>
                <AuthProvider>
                  <View style={{ flex: 1, backgroundColor: getColor("light", 200) }}>
                    <View style={{ height: statusBarHeight, backgroundColor: getColor("green", 500) }} />
                    <StatusBar style="light" translucent />
                    
                    <InnerLayout />

                    <MenuSheet />
                    <Toast config={toastConfig} />
                    <BottomSheet color="green" />
                  </View>
                </AuthProvider>
            </SocketProvider>
            </ToastProvider>
            </OverlayLoaderProvider>
          </MultiToggleProvider>
        </Provider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor('green', 500, 0.1),
    zIndex: 2,
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
});