import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "../pages/HomePage";
import ConferenceBookingRoutes from "./ConferenceRoomBookingRoutes";
import { AuthProvider } from "../conference-and-visitors-booking/contexts/AuthContext";

const ParentRoute = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing page - shows project selection */}
          <Route path="/" element={<HomePage />} />
          
          {/* Conference booking app (Smartspace) */}
          <Route
            path="/conference-booking/*"
            element={<ConferenceBookingRoutes />}
          />
          
          {/* HM Clockr - Coming Soon */}
          {/* 
          <Route
            path="/hm-clockr/*"
            element={<HMClockrRoutes />}
          />
          */}
          
          {/* Complaints & Feedback - Coming Soon */}
          {/* 
          <Route
            path="/complaints-feedback/*"
            element={<ComplaintFeedbackRoutes />}
          />
          */}
        </Routes>
        <Toaster position="bottom-right" reverseOrder={false} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default ParentRoute;
