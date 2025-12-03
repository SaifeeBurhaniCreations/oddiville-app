// import Home from "../../component/feature/Home/Home";
// import Logout from "../../component/shared/Auth/Logout";
// import Services from "../../component/feature/Services/View/Services";
// import CreateService from "../../component/feature/Services/Create/CreateService";
// import WorkLocation from "../../component/feature/work-location/View/WorkLocation";
// import Lane from "../../component/feature/Lane/View/Lane";
// import RawMaterial from "../../component/feature/RawMaterial/RawMaterial";
// import ThirdPartyRM from "../../component/feature/third-party-raw-material/View/RawMaterial";
// import AddThirdPartyRM from "../../component/feature/third-party-raw-material/Create/AddRawMaterial";
// import Chamber from "../../component/feature/Services/Chamber/Chamber";
import Home from "@/pages/Home/Home";
import Logout from "@/pages/Auth/Logout";
import Services from "@/pages/Services/Services";
import CreateService from "@/pages/Services/CreateService";
import WorkLocation from "@/components/feature/work-location/View/WorkLocation";
import Lane from "@/components/feature/Lane/View/Lane";
import RawMaterial from "@/components/feature/RawMaterial/RawMaterial";
import ThirdPartyRM from "@/components/feature/third-party-raw-material/View/ThirdPartyProducts";
import AddThirdPartyRM from "@/components/feature/third-party-raw-material/Create/AddThirdPartyProducts";
import Chamber from "@/pages/Chamber/Chamber";
import ChamberList from "@/components/Lists/ChamberList";
import AddWorkLocation from "@/components/feature/work-location/Create/AddWorkLocation";
import AddLane from "@/components/feature/Lane/Create/AddLane";
import AddRawMaterial from "@/components/feature/RawMaterial/AddRawMaterial";
import OldInventory from "@/components/feature/old-inventory/OldInventory"
import ChamberStockEdit from "../../pages/ChamberStock/ChamberStockEdit";


const rootRoutes = [
  {
    path: "",
    element: <Home />,
  },
  {
    path: "work-location",
    element: <WorkLocation />,
  },
  {
    path: "add-location",
    element: <AddWorkLocation />,
  },
  {
    path: "edit-location/:id",
    element: <AddWorkLocation />,
  },
  {
    path: "lane",
    element: <Lane />,
  },
  {
    path: "add-lane",
    element: <AddLane />,
  },
  {
    path: "edit-lane/:id",
    element: <AddLane />,
  },
  {
    path: "items-list",
    element: <Services />,
  },
  {
    path: "add-items",
    element: <CreateService />,
  },
  {
    path: "update-item/:id",
    element: <CreateService />,
  },
  {
    path: "frozen-warehouse/create-chamber",
    element: <Chamber />,
  },
  {
    path: "frozen-warehouse/chamber-list",
    element: <ChamberList />,
  },
  {
    path: "raw-material",
    element: <RawMaterial />,
  },
  {
    path: "add-raw-material",
    element: <AddRawMaterial />,
  },
  {
    path: "add-raw-material/:id",
    element: <AddRawMaterial />,
  },
  {
    path: "raw-material-other",
    element: <ThirdPartyRM />,
  },
  {
    path: "raw-material-other/add",
    element: <AddThirdPartyRM />,
  },
  {
    path: "raw-material-other/update/:id",
    element: <AddThirdPartyRM />,
  },
  {
    path: "old-inventory",
    element: <OldInventory />,
  },
  {
    path: "chamberstock/edit",
    element: <ChamberStockEdit />,
  },
  {
    path: "logout",
    element: <Logout />,
  },
];

export default rootRoutes;
