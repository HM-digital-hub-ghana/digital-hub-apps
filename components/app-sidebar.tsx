import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DoorOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard",
    path: "/dashboard",
  },
  {
    title: "Calendar and Booking",
    icon: Calendar,
    id: "calendar",
    path: "/bookings-calendar",
  },
  {
    title: "Visitor Management",
    icon: Users,
    id: "visitor",
    path: "/visitors-management",
  },
  {
    title: "Rooms",
    icon: DoorOpen,
    id: "rooms",
    path: "/room-booking",
  },
];

const footerItems = [
  {
    title: "Settings",
    icon: Settings,
    id: "settings",
    path: "/settings",
  },
  {
    title: "Logout",
    icon: LogOut,
    id: "logout",
    path: "/",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const { logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();

  const renderNavItem = (
    item: { title: string; icon: React.ComponentType<{ className?: string }>; id: string; path: string }
  ) => {
    let isActive = location.pathname === item.path;
    
    // For settings, also check if we're on any settings sub-pages
    if (item.id === "settings") {
      const settingsSubPages = [
        "/settings",
        "/account-settings",
        "/notifications",
        "/privacy-security",
        "/support-about",
      ];
      isActive = settingsSubPages.includes(location.pathname);
    }
    
    const isLogout = item.id === "logout";
    const linkContent = isLogout ? (
      <a
        href={item.path}
        onClick={(e) => {
          e.preventDefault();
          if (!isLoggingOut) {
            console.log("[Sidebar] Logout button clicked");
            logout({ redirectTo: "/login", navigate });
          }
        }}
        className={`h-12 flex items-center rounded-md transition-all duration-200 ease-in-out font-medium overflow-hidden ${
          isCollapsed ? "justify-center px-0" : "justify-start px-4"
        } ${
          isLoggingOut
            ? "opacity-50 cursor-not-allowed"
            : isActive
            ? "bg-white text-[#024d2c]"
            : "text-white hover:bg-white/10"
        }`}
        style={{ pointerEvents: isLoggingOut ? "none" : "auto" }}
      >
        <div className={`flex items-center justify-center w-12 h-12 shrink-0 ${
          isActive ? "text-[#024d2c]" : "text-white"
        }`}>
          {isLoggingOut ? (
            <Loader2 className="size-5 animate-spin transition-colors duration-200" />
          ) : (
            <item.icon className="size-5 transition-colors duration-200" />
          )}
        </div>
        <span
          className={`whitespace-nowrap transition-all duration-200 ease-in-out ${
            isCollapsed
              ? "opacity-0 w-0 max-w-0 overflow-hidden ml-0"
              : "opacity-100 w-auto max-w-xs ml-2"
          }`}
        >
          {isLoggingOut ? "Logging out..." : item.title}
        </span>
      </a>
    ) : (
      <NavLink
        to={item.path}
        end
        className={`h-12 flex items-center rounded-md transition-all duration-200 ease-in-out font-medium overflow-hidden ${
          isCollapsed ? "justify-center px-0" : "justify-start px-4"
        } ${
          isActive
            ? "bg-white text-[#024d2c]"
            : "text-white hover:bg-white/10"
        }`}
      >
        <div className={`flex items-center justify-center w-12 h-12 shrink-0 ${
          isActive ? "text-[#024d2c]" : "text-white"
        }`}>
          <item.icon className="size-5 transition-colors duration-200" />
        </div>
        <span
          className={`whitespace-nowrap transition-all duration-200 ease-in-out ${
            isCollapsed
              ? "opacity-0 w-0 max-w-0 overflow-hidden ml-0"
              : "opacity-100 w-auto max-w-xs ml-2"
          }`}
        >
          {item.title}
        </span>
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarContent className="bg-primary pt-16 gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  {renderNavItem(item)}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-primary mt-auto pb-8">
        <SidebarSeparator className="bg-white/20 mb-6" />
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              {renderNavItem(item)}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
