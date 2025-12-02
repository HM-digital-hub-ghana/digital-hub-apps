import { Funnel, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import VisitorRequestForm from "@/components/VisitorRequestForm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { Visitor, TableHeader } from "@/components/visitor-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VisitorsTable } from "@/components/visitor-table";
import AdminVisitorsManagement from "../admin/admin-visitor-management";
import { useAuth } from "../../contexts/AuthContext";
import {
  apiGetAllVisitors,
  apiCheckIn,
  apiCheckOut,
  type VisitorWithVisits,
  type Visit,
} from "../../service/visitors";
import toast from "react-hot-toast";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { handleApiError } from "@/lib/utils";

type VisitorStatus = "Confirmed" | "Cancelled" | "No Show" | "Pending" | "All";

export default function VisitorsManagement() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <AdminVisitorsManagement />;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VisitorStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [filterMeeting, setFilterMeeting] = useState<"upcoming" | "history">(
    "upcoming"
  );
  const [visitorsData, setVisitorsData] = useState<VisitorWithVisits[]>([]);
  const [, setIsLoadingVisitors] = useState(false);
  const [checkingIn, setCheckingIn] = useState<Set<number>>(new Set());
  const [checkingOut, setCheckingOut] = useState<Set<number>>(new Set());
  const [visitLogIds, setVisitLogIds] = useState<Map<number, number>>(new Map());

  const itemsPerPage = 8;

  const fetchVisitors = useCallback(async () => {
    try {
      setIsLoadingVisitors(true);
      const data = await apiGetAllVisitors();
      setVisitorsData(data);
      
      const logIdsMap = new Map<number, number>();
      data.forEach((visitor) => {
        visitor.visits.forEach((visit) => {
          if (visit.check_in_time && visit.id) {
            logIdsMap.set(visit.id, visit.id);
          }
        });
      });
      setVisitLogIds(logIdsMap);
    } catch (error) {
      console.error("Failed to load visitors:", error);
      toast.error("Failed to load visitors. Please try again.");
    } finally {
      setIsLoadingVisitors(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMeeting, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) {
      return null;
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getHistoryStatus = (visit: Visit) => {
    const now = new Date();
    const scheduledDate = new Date(visit.scheduled_date);

    if (visit.status === "Rejected") {
      return "Cancelled" as const;
    }

    if (visit.check_in_time) {
      return "Confirmed" as const;
    }

    if (scheduledDate < now && !visit.check_in_time) {
      return "No Show" as const;
    }

    return null;
  };

  const approvedStatuses = useMemo(
    () => ["Approved", "Active", "Inactive", "Confirmed"],
    []
  );

  const transformedVisitors = useMemo<Visitor[]>(() => {
    const results: Visitor[] = [];
    const now = new Date();

    visitorsData.forEach((visitor) => {
      visitor.visits.forEach((visit) => {
        const scheduledDate = new Date(visit.scheduled_date);
        const formattedDate = formatDate(visit.scheduled_date);
        const formattedTime = formatTime(visit.scheduled_date);
        const baseVisitor = {
          id: visit.id,
          name: visitor.name,
          email: visitor.email || "",
          company: visitor.company || "",
          date: formattedDate,
          time: formattedTime || "—",
          host: visit.host_name,
          badge: visit.purpose_type,
          purpose: visit.purpose,
        };

        if (filterMeeting === "upcoming") {
          const isApproved =
            approvedStatuses.includes(visit.status) && scheduledDate >= now;
          const isPending = visit.status === "Pending" && scheduledDate >= now;

          if (isApproved) {
            results.push({
              ...baseVisitor,
              checkIn: visit.check_in_time ? formatTime(visit.check_in_time) : null,
              checkOut: visit.check_out_time ? formatTime(visit.check_out_time) : null,
              duration: null,
              status: "Confirmed",
              visitor_id: visitor.id,
              visit_id: visit.id,
              log_id: visitLogIds.get(visit.id),
              has_checked_in: !!visit.check_in_time,
            } as Visitor & { visitor_id: number; visit_id: number; log_id?: number; has_checked_in: boolean });
          } else if (isPending) {
            results.push({
              ...baseVisitor,
              checkIn: null,
              checkOut: null,
              duration: null,
              status: "Pending",
            });
          }
        } else {
          const derivedStatus = getHistoryStatus(visit);

          if (derivedStatus) {
            let duration: string | null = null;

            if (visit.check_in_time && visit.check_out_time) {
              const checkIn = new Date(visit.check_in_time);
              const checkOut = new Date(visit.check_out_time);
              const diffMs = checkOut.getTime() - checkIn.getTime();
              if (diffMs > 0) {
                const totalMinutes = Math.floor(diffMs / 60000);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                duration =
                  hours > 0
                    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim()
                    : `${minutes}m`;
              }
            }

            results.push({
              ...baseVisitor,
              checkIn: formatTime(visit.check_in_time),
              checkOut: formatTime(visit.check_out_time),
              duration,
              status: derivedStatus,
            });
          }
        }
      });
    });

    return results;
  }, [approvedStatuses, filterMeeting, visitorsData, visitLogIds]);

  // Filter visitors by search and status
  const filteredVisitors = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();

    return transformedVisitors.filter((visitor) => {
      const matchesSearch =
        visitor.name.toLowerCase().includes(searchLower) ||
        visitor.email.toLowerCase().includes(searchLower) ||
        visitor.company.toLowerCase().includes(searchLower) ||
        (visitor.host?.toLowerCase().includes(searchLower) ?? false) ||
        (visitor.purpose?.toLowerCase().includes(searchLower) ?? false);

      const matchesStatus =
        statusFilter === "All" || visitor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, transformedVisitors]);

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const totalResults = filteredVisitors.length;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const getTableTitle = () =>
    filterMeeting === "upcoming" ? "Upcoming Visitors" : "Visitor History";

  const getTableDescription = () =>
    filterMeeting === "upcoming"
      ? "Manage and track upcoming visitor appointments."
      : "View past visitor records and history.";

  const handleMeetingFilterChange = (value: "upcoming" | "history") => {
    setFilterMeeting(value);
    setStatusFilter("All");
  };

  const handleCheckIn = async (visitor: Visitor & { visitor_id: number; visit_id: number; purpose?: string; badge?: string }) => {
    const visitId = visitor.visit_id;
    setCheckingIn((prev) => new Set(prev).add(visitId));
    
    try {
      const checkInTime = new Date().toISOString();
      const response = await apiCheckIn({
        visitor_id: visitor.visitor_id,
        purpose: visitor.purpose || "",
        check_in_time: checkInTime,
        purpose_type: visitor.badge || "General",
      });
      
      setVisitLogIds((prev) => new Map(prev).set(visitId, response.id));
      toast.success("Visitor checked in successfully");
      
      await fetchVisitors();
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to check in visitor", "Check-in");
      toast.error(errorMessage);
    } finally {
      setCheckingIn((prev) => {
        const next = new Set(prev);
        next.delete(visitId);
        return next;
      });
    }
  };

  const handleCheckOut = async (visitor: Visitor & { visit_id: number; log_id?: number }) => {
    const visitId = visitor.visit_id;
    const logId = visitor.log_id || visitLogIds.get(visitId);
    
    if (!logId) {
      toast.error("Log ID not found. Please refresh the page.");
      return;
    }
    
    setCheckingOut((prev) => new Set(prev).add(visitId));
    
    try {
      await apiCheckOut(logId);
      toast.success("Visitor checked out successfully");
      
      await fetchVisitors();
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to check out visitor", "Check-out");
      toast.error(errorMessage);
    } finally {
      setCheckingOut((prev) => {
        const next = new Set(prev);
        next.delete(visitId);
        return next;
      });
    }
  };

  const visitorTableHeaders: TableHeader[] =
    filterMeeting === "upcoming"
      ? [
          { key: "name", label: "Visitor" },
          { key: "company", label: "Company" },
          { key: "date", label: "Date" },
          { key: "time", label: "Time" },
          { key: "host", label: "Host" },
          { key: "badge", label: "Badge" },
          { key: "status", label: "Status" },
          { key: "actions", label: "Actions" },
        ]
      : [
          { key: "name", label: "Visitor" },
          { key: "company", label: "Company" },
          { key: "date", label: "Date" },
          { key: "checkIn", label: "Check In" },
          { key: "checkOut", label: "Check Out" },
          { key: "duration", label: "Duration" },
          { key: "host", label: "Host" },
          { key: "status", label: "Status" },
        ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Tabs */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex w-1/3 rounded-2xl bg-white px-3 py-1">
            <button
              onClick={() => handleMeetingFilterChange("upcoming")}
              className={`flex-1 py-2 font-normal rounded-2xl px-6 transition-colors duration-200 ${
                filterMeeting === "upcoming"
                  ? "bg-primary text-white"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              Upcoming Visitors
            </button>

            <button
              onClick={() => handleMeetingFilterChange("history")}
              className={`flex-1 py-2 font-normal rounded-2xl px-6 transition-colors duration-200 ${
                filterMeeting === "history"
                  ? "bg-primary text-white"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              Visitor History
            </button>
          </div>

          <Dialog
            open={isRegisterDialogOpen}
            onOpenChange={setIsRegisterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                + Register Visitor
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[800px] max-h-[90vh] flex flex-col p-0">
              <DialogTitle className="sr-only">Visitor Request</DialogTitle>
              <DialogDescription className="sr-only">
                Submit a new visitor request
              </DialogDescription>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <VisitorRequestForm
                  onSubmit={() => {
                    setIsRegisterDialogOpen(false);
                    fetchVisitors();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table or Empty State */}
        <div className="bg-white rounded-xl shadow-xl p-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-xl font-bold mb-2">
                {getTableTitle()}
              </h1>
              <p className="text-gray-600 text-sm">{getTableDescription()}</p>
            </div>
          </div>
          {/* Search + Status Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex w-1/2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-white border border-gray-200 rounded-lg"
              />
            </div>

            <div className="relative">
              <Funnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as VisitorStatus)}
              >
                <SelectTrigger className="pl-10 py-3 border border-gray-200 rounded-lg bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="All">All</SelectItem>

                  {filterMeeting === "upcoming" && (
                    <SelectItem value="Pending">Pending</SelectItem>
                  )}

                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

          
          </div>

          {filteredVisitors.length === 0 ? (
            <EmptyState
              title={`No ${getTableTitle()}`}
              description="You don't have any visitors in this category at the moment."
              action={{
                label: "+ Register Visitor",
                onClick: () => setIsRegisterDialogOpen(true),
              }}
            />
          ) : (
            <VisitorsTable
              visitors={filteredVisitors}
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              tableHeaders={visitorTableHeaders}
              customActionRenderer={
                filterMeeting === "upcoming"
                  ? (visitor) => {
                      if (visitor.status === "Pending") {
                        return null;
                      }

                      const extendedVisitor = visitor as Visitor & {
                        visitor_id: number;
                        visit_id: number;
                        log_id?: number;
                        has_checked_in: boolean;
                      };
                      const visitId = extendedVisitor.visit_id;
                      const isCheckingIn = checkingIn.has(visitId);
                      const isCheckingOut = checkingOut.has(visitId);
                      const hasCheckedIn =
                        extendedVisitor.has_checked_in ||
                        !!extendedVisitor.checkIn;

                      if (hasCheckedIn && !extendedVisitor.checkOut) {
                        return (
                          <button
                            onClick={() => handleCheckOut(extendedVisitor)}
                            disabled={isCheckingOut}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-[#024d2c]/5 text-[#024d2c] text-xs font-normal rounded-[9px] h-[38px] w-[120px] border border-[#024d2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isCheckingOut ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#024d2c]" />
                                Checking Out...
                              </>
                            ) : (
                              <>
                                <LogOut className="w-4 h-4 text-[#024d2c]" />
                                Check Out
                              </>
                            )}
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={() => handleCheckIn(extendedVisitor)}
                          disabled={isCheckingIn}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-[#024d2c]/5 text-[#024d2c] text-xs font-normal rounded-[9px] h-[38px] w-[110px] border border-[#024d2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCheckingIn ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#024d2c]" />
                              Checking In...
                            </>
                          ) : (
                            <>
                              <LogIn className="w-4 h-4 text-[#024d2c]" />
                              Check In
                            </>
                          )}
                        </button>
                      );
                    }
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
