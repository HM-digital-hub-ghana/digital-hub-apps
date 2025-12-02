import { Route, Routes } from "react-router-dom";
import ConferenceBookingRoutes from "./ConferenceRoomBookingRoutes";


const ParentRoute = () => {
  return (
    <>
      <Routes>
       
        <Route
          path="/conference-booking/*"
          element={<ConferenceBookingRoutes />}
        />
      
      </Routes>
    </>
  );
};

export default ParentRoute;
