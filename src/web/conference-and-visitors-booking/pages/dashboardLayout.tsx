import { AppSidebar } from "@/components/app-sidebar";
import ChatForm from "@/components/ChatForm";
import NotificationsPopover from "@/components/NotificationsPopover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronDown, Loader2, Menu, Search } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../constants/routes";
import { useAuth } from "../contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout, isLoggingOut, user } = useAuth();
  const navigate = useNavigate();

  const displayName = useMemo(() => {
    if (!user) return "";

    const safeString = (value: unknown): string => {
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
      return "";
    };

    const directName = safeString(user.name);
    if (directName) return directName;

    const userRecord = user as Record<string, unknown>;
    const firstName = safeString(userRecord.first_name);
    const lastName = safeString(userRecord.last_name);
    const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (combined) return combined;

    const employeeName = safeString(userRecord.employee_name);
    if (employeeName) return employeeName;

    const email = safeString(user.email);
    if (email) return email;

    return "";
  }, [user]);

  const userInitials = useMemo(() => {
    if (!displayName) {
      return "U";
    }

    const cleaned = displayName.trim();
    if (cleaned.includes("@")) {
      return cleaned.charAt(0).toUpperCase();
    }

    const words = cleaned.split(/\s+/);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }, [displayName]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen md:px-6 px-3 w-full overflow-x-hidden">
        <AppSidebar />

        <main className="flex-1 bg-gray-50 flex flex-col">
          {/* Top Navigation */}
          <div className="shrink-0 bg-white px-3 py-2 md:px-5 md:py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>

                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0A0A0A80]" />
                  <Input
                    placeholder="Search rooms, visitors, bookings..."
                    className="pl-12 bg-[#F8FAFC] border-[#025C1961] rounded-2xl h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <NotificationsPopover />

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-3 rounded-[14px] px-3"
                    >
                      <Avatar className="h-9 w-9">
                        {typeof user?.avatar === "string" &&
                          user.avatar.trim().length > 0 && (
                            <AvatarImage
                              src={user.avatar}
                              alt={displayName || "User avatar"}
                            />
                          )}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        navigate(routes.accountsettings);
                      }}
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        if (!isLoggingOut) {
                          console.log("[TopBar] Logout button clicked");
                          logout({ redirectTo: "/login", navigate });
                        }
                      }}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Logging out...
                        </>
                      ) : (
                        "Log out"
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-2 md:px-24 py-4">{children}</div>
        </main>
      </div>

      <ChatForm />
    </SidebarProvider>
  );
}
