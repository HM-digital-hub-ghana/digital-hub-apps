import { Route, Routes } from "react-router-dom";
import AdminBoard from "../components/AdminBoard";
import UserBoard from "../components/UserBoard";
import AdminAnalyticsPage from "../Pages/AdminAnalyticsPage";
import AdminAnonymousComplaintDetails from "../Pages/AdminAnonymousComplaintDetails";
import AdminBoardComplaintsPage from "../Pages/AdminBoardComplaintsPage";
import AdminComplaintDetails from "../Pages/AdminComplaintDetails";
import AdminNotifications from "../Pages/AdminNotifications";
import ComplaintForm from "../Pages/ComplaintForm";
import GeneralDashboard from "../Pages/GeneralDashboard";
import LoginPage from "../Pages/LoginPage";
import PasswordScreen from "../Pages/PasswordScreen";
import ProfilePage from "../Pages/ProfilePage";
import ResetPasswordPage from "../Pages/ResetPasswordPage";
import SignInScreen from "../Pages/SignInScreen";
import SplashScreen from "../Pages/SplashScreen";
import UnAuthorizedPage from "../Pages/UnAuthorizedPage";
import UserDashboard from "../Pages/UserDashboard";
import UserNotifications from "../Pages/UserNotifications";

const ComplaintFeedbackRoutes = () => {
  return (
    <Routes>
      <Route path="/">
        {/* <Route path="" element={<SplashScreen />} /> */}
        <Route path="general-dashboard" element={<GeneralDashboard />} />
        <Route path="splash" element={<SplashScreen />} />
        <Route path="sign-up" element={<SignInScreen />} />
        <Route path="create-password" element={<PasswordScreen />} />
        <Route path="unauthorized" element={<UnAuthorizedPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="user" element={<UserBoard />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="make-complaint" element={<ComplaintForm />} />
        </Route>
        <Route path="/admin" element={<AdminBoard />}>
          <Route path="dashboard" element={<AdminAnalyticsPage />} />
          <Route path="complaints" element={<AdminBoardComplaintsPage />} />
          <Route path="make-complaint" element={<ComplaintForm />} />
          <Route
            path="anonymous-complaints"
            element={<AdminAnonymousComplaintDetails />}
          />

          <Route path="complaints-detail" element={<AdminComplaintDetails />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ComplaintFeedbackRoutes;
