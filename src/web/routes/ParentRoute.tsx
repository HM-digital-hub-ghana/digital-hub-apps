import { Route, Routes } from "react-router-dom";
import ComplaintFeedbackRoutes from "./COmplaintFeedbackRoutes";
import ConferenceBookingRoutes from "./ConferenceRoomBookingRoutes";
import HMClockRRoutes from "./HMClockr";

const ParentRoute = () => {
  return (
    <>
      <Routes>
        <Route
          path="/complaint-feedback/*"
          element={<ComplaintFeedbackRoutes />}
        />
        <Route
          path="/conference-booking/*"
          element={<ConferenceBookingRoutes />}
        />
        <Route path="/hm/*" element={<HMClockRRoutes />} />
      </Routes>
    </>
  );
};

export default ParentRoute;
