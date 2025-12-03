import {
  Bell,
  ChevronDown,
  CircleQuestionMark,
  Loader2,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "./Notification";
import { useAuth } from "@web/conference-and-visitors-booking/contexts/AuthContext";

export default function Settings() {
  const navigate = useNavigate();
  const { logout, isLoggingOut } = useAuth();

  const pageDetails = [
    {
      id: 1,
      title: "Account Settings",
      description: "Manage your profile, password, and authentication",
      icon: <User className="text-[#ABABAB]" />,
      route: <></>,
      to: "/account-settings",
    },
    {
      id: 2,
      title: "Privacy & Security",
      description: "Manage permissions, data and privacy settings",
      icon: <Shield className="text-[#ABABAB]" />,
      route:<></>,
      to: "/privacy-security",
    },
    {
      id: 3,
      title: "Notifications",
      description: "Control email, push and activity notifications",
      icon: <Bell className="text-[#ABABAB]" />,
      route:<Notification/>,
      to: "/notifications",
    },
    {
      id: 4,
      title: "Support & About",
      description: "Get help, view app info",
      icon: <CircleQuestionMark className="text-[#ABABAB]" />,
      route: <></>,
      to: "/support-about",
    },
  ];
  return (
    <div>
      <div className="flex flex-col gap-[24px] h-full mt-10">
        <div className="flex flex-col gap-[3.5px] h-[56px]">
          {/* Settings Page */}
          <h1 className="text-[24px] font-semibold">Settings</h1>
          <p className="text-[#717182]">
            Manage your account and application preferences
          </p>
        </div>

        {pageDetails.map((route) => {
          return (
            <div key={route.id} className="cursor-pointer">
              <Link to={route.to} >
                <div className="flex items-center justify-between border w-full bg-white p-[16px] rounded-[8.75px]">
                  <div className="flex justify-between items-center gap-5">
                    <div className="w-[42px] h-[42px] bg-[#E5E7EB] flex items-center justify-center rounded-[8.75px]">
                      {route.icon}
                    </div>
                    <div className="flex flex-col gap-[3.5px]">
                      <h2 className="font-400 ">{route.title}</h2>
                      <p className="text-[14px] text-[#717182]">
                        {route.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center rotate-270 w-[17.5px] h-[17.5px]">
                    <ChevronDown />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => {
            if (!isLoggingOut) {
              logout({ redirectTo: "/login", navigate });
            }
          }}
          disabled={isLoggingOut}
          className={`flex items-center justify-between border w-full bg-white p-[16px] rounded-[8.75px] transition-opacity ${
            isLoggingOut ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col gap-[3.5px]">
            <h2 className="font-400 ">Sign Out</h2>
            <p className="text-[14px] text-[#717182]">
              Log out of your account{" "}
            </p>
          </div>
          <div className="bg-[#FFC9C9] text-[#E7000B] w-[111.75px] gap-[7px] flex items-center justify-center h-[43.33px] rounded-[8.75px] border border-[#E7000B]">
            <div>
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut />
              )}
            </div>
            <p className="text-[]14px">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
