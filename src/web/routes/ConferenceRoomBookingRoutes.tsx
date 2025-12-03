import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@web/components/ProtectedRoute";
import AccountSettings from "@web/components/Settings/AccountSettings";
import Layout from "@web/components/Settings/Layout";
import Notification from "@web/components/Settings/Notification";
import PrivacySecurity from "@web/components/Settings/PrivacySecurity";
import Settings from "@web/components/Settings/Settings";
import SupportAbout from "@web/components/Settings/SupportAbout";
import DashboardLayout from "../conference-and-visitors-booking/pages/dashboardLayout";
import BookingsCalendar from "../conference-and-visitors-booking/pages/employees/bookings-calendar";
import Dashboard from "../conference-and-visitors-booking/pages/employees/dashboard";
import RoomsBooking from "../conference-and-visitors-booking/pages/employees/rooms";
import VisitorsManagement from "../conference-and-visitors-booking/pages/employees/visitors-management";
import ForgotPasword from "../conference-and-visitors-booking/pages/forgot-password";
import LoginPage from "../conference-and-visitors-booking/pages/login";
import ResetPassword from "../conference-and-visitors-booking/pages/reset-password";
import SignUp from "../conference-and-visitors-booking/pages/sign-up";

const ConferenceRoomBookingRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPasword />} />

      <Route
        path="/visitors-management"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <VisitorsManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/room-booking"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RoomsBooking />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings-calendar"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BookingsCalendar />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Layout
                routeName="Notifications"
                detail="Control email, push, and activity notifications"
              >
                <Notification />
              </Layout>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account-settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Layout
                routeName="Account Setting"
                detail="Manage your profile, password"
              >
                <AccountSettings />
              </Layout>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy-security"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Layout
                routeName="Privacy & Security"
                detail="Manage permissions, data, and privacy settings "
              >
                <PrivacySecurity />
              </Layout>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/support-about"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Layout
                routeName="Support & About"
                detail="Get help, view app info, and contact support"
              >
                <SupportAbout />
              </Layout>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default ConferenceRoomBookingRoutes;
