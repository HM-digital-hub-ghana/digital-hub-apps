import { routes } from "../conference-and-visitors-booking/constants/routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "../conference-and-visitors-booking/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "../conference-and-visitors-booking/pages/login";
import ForgotPasword from "../conference-and-visitors-booking/pages/forgot-password";
import SignUp from "../conference-and-visitors-booking/pages/sign-up";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "../conference-and-visitors-booking/pages/dashboardLayout";
import BookingsCalendar from "../conference-and-visitors-booking/pages/employees/bookings-calendar";
import VisitorsManagement from "../conference-and-visitors-booking/pages/employees/visitors-management";
import Dashboard from "../conference-and-visitors-booking/pages/employees/dashboard";
import RoomsBooking from "../conference-and-visitors-booking/pages/employees/rooms";
import Settings from "@/components/Settings/Settings";
import Layout from "@/components/Settings/Layout";
import Notification from "@/components/Settings/Notification";
import AccountSettings from "@/components/Settings/AccountSettings";
import PrivacySecurity from "@/components/Settings/PrivacySecurity";
import SupportAbout from "@/components/Settings/SupportAbout";
import ResetPassword from "../conference-and-visitors-booking/pages/reset-password";

const ComplaintFeedbackRoutes = () => {
  const router = createBrowserRouter([
    {
      path: routes.login,
      element: <LoginPage />,
    },
    {
      path: routes.signUp,
      element: <SignUp />,
    },
    {
      path: routes.resetPassword,
      element: <ResetPassword />,
    },
    {
      path: routes.forgotPassword,
      element: <ForgotPasword />,
    },

    {
      path: routes.VisitorsManagement,
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <VisitorsManagement />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },

    {
      path: routes.roomBooking,
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <RoomsBooking />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: routes.bookingsCalendar,
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <BookingsCalendar />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },

    {
      path: routes.dashboard,
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },

    {
      path: routes.roomBooking,
      element: (
        <DashboardLayout>
          <RoomsBooking />
        </DashboardLayout>
      ),
    },

    {
      path: routes.settings,
      element: (
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      ),
    },
    {
      path: routes.notification,
      element: (
        <DashboardLayout>
          <Layout
            routeName="Notifications"
            detail="Control email, push, and activity notifications"
          >
            <Notification />
          </Layout>
        </DashboardLayout>
      ),
    },
    {
      path: routes.accountsettings,
      element: (
        <DashboardLayout>
          <Layout
            routeName="Account Setting"
            detail="Manage your profile, password"
          >
            <AccountSettings />
          </Layout>
        </DashboardLayout>
      ),
    },
    {
      path: routes.privacysecurity,
      element: (
        <DashboardLayout>
          <Layout
            routeName="Privacy & Security"
            detail="Manage permissions, data, and privacy settings "
          >
            <PrivacySecurity />
          </Layout>
        </DashboardLayout>
      ),
    },
    {
      path: routes.supportabout,
      element: (
        <DashboardLayout>
          <Layout
            routeName="Support & About"
            detail="Get help, view app info, and contact support"
          >
            <SupportAbout />
          </Layout>
        </DashboardLayout>
      ),
    },
  ]);
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
    // <Routes>
    //   <Route path="/">
    //     {/* <Route path="" element={<SplashScreen />} /> */}
    //     <Route path="general-dashboard" element={<GeneralDashboard />} />
    //     <Route path="splash" element={<SplashScreen />} />
    //     <Route path="sign-up" element={<SignInScreen />} />
    //     <Route path="create-password" element={<PasswordScreen />} />
    //     <Route path="unauthorized" element={<UnAuthorizedPage />} />
    //     <Route path="reset-password" element={<ResetPasswordPage />} />
    //     <Route path="login" element={<LoginPage />} />
    //     <Route path="user" element={<UserBoard />}>
    //       <Route path="dashboard" element={<UserDashboard />} />
    //       <Route path="notifications" element={<UserNotifications />} />
    //       <Route path="profile" element={<ProfilePage />} />
    //       <Route path="make-complaint" element={<ComplaintForm />} />
    //     </Route>
    //     <Route path="/admin" element={<AdminBoard />}>
    //       <Route path="dashboard" element={<AdminAnalyticsPage />} />
    //       <Route path="complaints" element={<AdminBoardComplaintsPage />} />
    //       <Route path="make-complaint" element={<ComplaintForm />} />
    //       <Route
    //         path="anonymous-complaints"
    //         element={<AdminAnonymousComplaintDetails />}
    //       />

    //       <Route path="complaints-detail" element={<AdminComplaintDetails />} />
    //       <Route path="notifications" element={<AdminNotifications />} />
    //     </Route>
    //   </Route>
    // </Routes>
  );
};

export default ComplaintFeedbackRoutes;
