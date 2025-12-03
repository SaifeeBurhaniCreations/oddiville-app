  import UserScreen from '../screens/UserScreen';
  import UserDetailsScreen from '../screens/UserDetailsScreen';
  import EditUserScreen from '../screens/EditUserScreen';
  import RawMaterialScreen from '../screens/RawMaterialScreen';
  import RawMaterialDetailVariant from '../screens/RawMaterialDetailVariant';
  import RawMaterialOrderScreen from '../screens/RawMaterialOrderScreen';
  import SearchResultsScreen from '../screens/SearchResultsScreen';
  import ProductDetailsScreen from '../screens/supervisor/ProductDetailsScreen';
  import SupervisorRawMaterialDetailsScreen from '../screens/supervisor/SupervisorRawMaterialDetailsScreen';
  import SupervisorProductionDetailsScreen from '../screens/supervisor/SupervisorProductionDetailsScreen';
  import SupervisorWorkerDetailsScreen from '../screens/supervisor/SupervisorWorkerDetailsScreen';
  import HelpSupportScreen from '../screens/HelpSupportScreen';
  import PackagingScreen from '../screens/Packaging/PackagingScreen';
  import PackagingDetailsScreen from '../screens/Packaging/PackagingDetailsScreen';
  import CreateOrder from '../screens/DispatchOrder/CreateOrder';
  import VendorOrdersScreen from '../screens/Vendors/VendorOrdersScreen';
  import VendorsScreen from '../screens/Vendors/VendorsScreen';
  import VendorCreateScreen from '../screens/Vendors/VendorCreateScreen';
  import VendorOrderDetailsScreen from '../screens/Vendors/VendorOrderDetailsScreen';
  import CompletedOrderDetailScreen from '../screens/DispatchOrder/CompletedOrderDetailScreen';
  import ShippingDetailsForm from '../screens/DispatchOrder/ShippingDetailsForm';
  import OthersProductDetailsScreen from '../screens/OthersProductDetailsScreen';
  import CalendarScreen from '../screens/Calendar/CalendarScreen';
  import TrucksScreen from '../screens/Trucks/TrucksScreen';
  import TruckCreateScreen from '../screens/Trucks/TruckCreateScreen';
  import TruckDetailScreen from '../screens/Trucks/TruckDetailScreen';
  import CalendarDetailScreen from '../screens/Calendar/CalendarDetailScreen';

  export const protectedScreens = [
    { name: "User", component: UserScreen, roles: ["admin", "superadmin"] },
    { name: "UserDetails", component: UserDetailsScreen, roles: ["admin", "superadmin"] },
    { name: "EditUser", component: EditUserScreen, roles: ["admin", "superadmin"] },
    { name: "RawMaterial", component: RawMaterialScreen, roles: ["admin", "superadmin"] },
    { name: "RawMaterialDetail", component: RawMaterialDetailVariant, roles: ["admin", "superadmin"] },
    { name: "RawMaterialOrder", component: RawMaterialOrderScreen, roles: ["admin", "superadmin"] },
    { name: "SearchResults", component: SearchResultsScreen, roles: ["admin", "superadmin"] },
    { name: "ShippingDetails", component: ShippingDetailsForm, roles: ["admin", "superadmin"] },
    { name: "SupervisorProductDetails", component: ProductDetailsScreen, roles: ["supervisor"] },
    { name: "SupervisorRmDetails", component: SupervisorRawMaterialDetailsScreen, roles: ["supervisor"] },
    { name: "SupervisorProductionDetails", component: SupervisorProductionDetailsScreen, roles: ["supervisor"] },
    { name: "SupervisorWorkerDetails", component: SupervisorWorkerDetailsScreen, roles: ["supervisor"] },
    { name: "HelpSupport", component: HelpSupportScreen, roles: ["admin", "superadmin", "supervisor"] },
    { name: "Packaging", component: PackagingScreen, roles: ["admin", "superadmin", "supervisor"] },
    { name: "PackagingDetails", component: PackagingDetailsScreen, roles: ["admin", "superadmin", "supervisor"] },
    { name: "CreateOrders", component: CreateOrder, roles: ["admin", "superadmin"] },
    { name: "VendorOrders", component: VendorOrdersScreen, roles: ["admin", "superadmin"] },
    { name: "Vendors", component: VendorsScreen, roles: ["admin", "superadmin"] },
    { name: "VendorCreate", component: VendorCreateScreen, roles: ["admin", "superadmin"] },
    { name: "VendorOrderDetail", component: VendorOrderDetailsScreen, roles: ["admin", "superadmin"] },
    { name: "Trucks", component: TrucksScreen, roles: ["admin", "superadmin", "supervisor"] },
    { name: "TruckCreate", component: TruckCreateScreen, roles: ["admin", "superadmin", "supervisor"] },
    { name: "TruckDetail", component: TruckDetailScreen, roles: ["admin", "superadmin", "supervisor"] },
    { name: "Calendar", component: CalendarScreen, roles: ["admin", "superadmin"] },
    { name: "CalendarEvents", component: TruckDetailScreen, roles: ["admin", "superadmin", "supervisor"] },
    { name: "CalendarEventDetail", component: CalendarDetailScreen, roles: ["admin", "superadmin"] },
    { name: "DispatchSummary", component: CompletedOrderDetailScreen, roles: ["admin", "superadmin"] },
    { name: "OthersProductsDetail", component: OthersProductDetailsScreen, roles: ["admin", "superadmin"] },
  ];




//   <AuthProvider>
// <View style={{ flex: 1, backgroundColor: getColor("green", 500) }}>
//   <View style={{ height: statusBarHeight, backgroundColor: getColor("green", 500) }} />

//   <StatusBar style="light" translucent />

//   <Stack.Navigator initialRouteName="Calendar">

//     {/* authorized */}
//     <Stack.Screen name="Main" options={{ headerShown: false }} component={MainTabsWrapper} />

//     {protectedScreens.map(({ name, component: Component, roles }) => (
//       <Stack.Screen
//         key={name}
//         name={name}
//         options={{ headerShown: false }}
//       >
//         {() => (
//           <AppLayout>
//             <AuthGuard roles={roles}>
//               <Component />
//             </AuthGuard>
//           </AppLayout>
//         )}
//       </Stack.Screen>
//     ))}

//     {/* unauthorized */}
//     <Stack.Screen
//       name="Login"
//       options={{ headerShown: false }}
//     >
//       {() => (
//         <AntiAuthGuard>
//           <LoginScreen />
//         </AntiAuthGuard>
//       )}
//     </Stack.Screen>
//   </Stack.Navigator>
// </View>
// </AuthProvider>