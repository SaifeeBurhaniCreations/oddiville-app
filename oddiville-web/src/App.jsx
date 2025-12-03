
import AllRoutes from "@/router/AllRoutes.jsx";
import { useChambers } from "./hooks/chamberStock";

const App = () => {
  useChambers();

  return (
    <>
      <AllRoutes />
    </>
  );
};

export default App;
