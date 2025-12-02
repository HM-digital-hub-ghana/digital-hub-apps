import { Search, Funnel, CircleCheckBig, CircleX } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import VisitorRequestForm from "@/components/VisitorRequestForm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { Visitor, TableHeader } from "@/components/visitor-table";
import { VisitorsTable } from "@/components/visitor-table";
import { 
  apiGetPendingVisits, 
  apiApproveVisit, 
  apiRejectVisit, 
  apiGetAllVisitors,
  apiCheckIn,
  apiCheckOut,
  type PendingVisit,
  type VisitorWithVisits,
  type Visit
} from "@/service/visitors";
import toast from "react-hot-toast";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { handleApiError } from "@/lib/utils";


export default function AdminVisitorsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [filterMeeting, setFilterMeeting] = useState<
    "upcoming" | "history" | "pending"
  >("upcoming");
  const [pendingVisits, setPendingVisits] = useState<PendingVisit[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [visitors, setVisitors] = useState<VisitorWithVisits[]>([]);
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);
  const [checkingIn, setCheckingIn] = useState<Set<number>>(new Set());
  const [checkingOut, setCheckingOut] = useState<Set<number>>(new Set());
  const [visitLogIds, setVisitLogIds] = useState<Map<number, number>>(new Map());
  const [approving, setApproving] = useState<Set<number>>(new Set());
  const [rejecting, setRejecting] = useState<Set<number>>(new Set());

  const itemsPerPage = 8;

  //fetch pending account on mount
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const visits = await apiGetPendingVisits();
        setPendingCount(visits.length);
      } catch (error) {
        console.error("Failed to fetch pending count:", error);
      }
    };

    fetchPendingCount();
  }, []);

  //fetch pending visits when pending tab is selected
  useEffect(() => {
    const fetchPendingVisits = async () => {
      if (filterMeeting === "pending") {
        try {
          setIsLoadingPending(true);
          const visits = await apiGetPendingVisits();
          setPendingVisits(visits);
          setPendingCount(visits.length);
        } catch (error) {
          console.error("Failed to fetch pending visits:", error);
          toast.error("Failed to load pending visits");
        } finally {
          setIsLoadingPending(false);
        }
      }
    };

    fetchPendingVisits();
  }, [filterMeeting]);

  //fetch visitors when upcoming or history tab is selected
  useEffect(() => {
    const fetchVisitors = async () => {
      if (filterMeeting === "upcoming" || filterMeeting === "history") {
        try {
          setIsLoadingVisitors(true);
          const data = await apiGetAllVisitors();
          setVisitors(data);
          
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
          console.error("Failed to fetch visitors:", error);
          toast.error("Failed to load visitors");
        } finally {
          setIsLoadingVisitors(false);
        }
      }
    };

    fetchVisitors();
  }, [filterMeeting]);

  const handleApprove = async (visitId: number) => {
    setApproving((prev) => new Set(prev).add(visitId));
    try {
      await apiApproveVisit(visitId);
      toast.success("Visit approved successfully");
      //refresh pending visits
      const visits = await apiGetPendingVisits();
      setPendingVisits(visits);
      setPendingCount(visits.length);
    } catch (error) {
      console.error("Failed to approve visit:", error);
      toast.error("Failed to approve visit");
    } finally {
      setApproving((prev) => {
        const next = new Set(prev);
        next.delete(visitId);
        return next;
      });
    }
  };

  const handleReject = async (visitId: number) => {
    setRejecting((prev) => new Set(prev).add(visitId));
    try {
      await apiRejectVisit(visitId);
      toast.success("Visit rejected successfully");
      //refresh pending visits
      const visits = await apiGetPendingVisits();
      setPendingVisits(visits);
      setPendingCount(visits.length);
    } catch (error) {
      console.error("Failed to reject visit:", error);
      toast.error("Failed to reject visit");
    } finally {
      setRejecting((prev) => {
        const next = new Set(prev);
        next.delete(visitId);
        return next;
      });
    }
  };

  //helper function to determine visit status
  const getVisitStatus = (visit: Visit): string => {
    const now = new Date();
    const scheduledDate = new Date(visit.scheduled_date);
    const isPast = scheduledDate < now;

    //Cancelled, status is rejected
    if (visit.status === "Rejected") {
      return "Cancelled";
    }

    //Confirmed: status is "Active" with check_in_time
    if (visit.status === "Active" && visit.check_in_time) {
      return "Confirmed";
    }

    // No Show: status is "Pending" or "Active" but no check_in_time and scheduled_date is in the past
    if ((visit.status === "Pending" || visit.status === "Active") && !visit.check_in_time && isPast) {
      return "No Show";
    }

    // For upcoming visitors, return the original status
    return visit.status;
  };

  //helper function to format date - make this is component
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  //helper function to format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  //transform visitors data to table format
  const transformVisitorsToTableFormat = (): Visitor[] => {
    const tableVisitors: Visitor[] = [];
    const now = new Date();

    visitors.forEach((visitor) => {
      visitor.visits.forEach((visit) => {
        const scheduledDate = new Date(visit.scheduled_date);
        const status = getVisitStatus(visit);
        const isApproved = visit.status !== "Pending" && visit.status !== "Rejected";

        // For upcoming: show approved visits where scheduled_date hasn't been reached
        // Approved means status is not "Pending" and not "Rejected"
        if (filterMeeting === "upcoming") {
          if (isApproved && scheduledDate >= now) {
            tableVisitors.push({
              id: visit.id,
              name: visitor.name,
              email: visitor.email || "",
              company: visitor.company || "",
              date: formatDate(visit.scheduled_date),
              time: formatTime(visit.scheduled_date),
              host: visit.host_name,
              badge: visit.purpose_type,
              status: "Confirmed" as const,
              checkIn: visit.check_in_time ? formatTime(visit.check_in_time) : null,
              checkOut: visit.check_out_time ? formatTime(visit.check_out_time) : null,
              duration: null,
              purpose: visit.purpose,
              visitor_id: visitor.id,
              visit_id: visit.id,
              log_id: visitLogIds.get(visit.id),
              has_checked_in: !!visit.check_in_time,
            } as Visitor & { visitor_id: number; visit_id: number; log_id?: number; has_checked_in: boolean });
          }
        }
        // For history: show visits with statuses No Show, Confirmed, or Cancelled
        else if (filterMeeting === "history") {
          if (status === "No Show" || status === "Confirmed" || status === "Cancelled") {
            let duration = null;
            if (visit.check_in_time && visit.check_out_time) {
              const checkIn = new Date(visit.check_in_time);
              const checkOut = new Date(visit.check_out_time);
              const diffMs = checkOut.getTime() - checkIn.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const hours = Math.floor(diffMins / 60);
              const mins = diffMins % 60;
              duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            }

            tableVisitors.push({
              id: visit.id,
              name: visitor.name,
              email: visitor.email || "",
              company: visitor.company || "",
              date: formatDate(visit.scheduled_date),
              time: formatTime(visit.scheduled_date),
              host: visit.host_name,
              badge: visit.purpose_type,
              status: status as "No Show" | "Confirmed" | "Cancelled",
              checkIn: visit.check_in_time ? formatTime(visit.check_in_time) : null,
              checkOut: visit.check_out_time ? formatTime(visit.check_out_time) : null,
              duration: duration,
            });
          }
        }
      });
    });

    return tableVisitors;
  };

  //filtering logic
  const tableVisitors = transformVisitorsToTableFormat();
  const filteredVisitors = tableVisitors.filter((visitor) => {
    const matchesSearch =
      visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visitor.company && visitor.company.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const totalResults = filteredVisitors.length;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  //reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
  }, [filterMeeting]);


  const getTableTitle = () => {
    switch (filterMeeting) {
      case "upcoming":
        return "Upcoming Visitors";
      case "history":
        return "Visitor History";
      case "pending":
        return "Pending Visitors";
      default:
        return "Visitors";
    }
  };

  const getTableDescription = () => {
    switch (filterMeeting) {
      case "upcoming":
        return "Manage and track upcoming visitor appointments.";
      case "history":
        return "View past visitor records and history.";
      case "pending":
        return "Review and approve visitor requests.";
      default:
        return "";
    }
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
      
      const data = await apiGetAllVisitors();
      setVisitors(data);
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
      
      const data = await apiGetAllVisitors();
      setVisitors(data);
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

  // Dynamic table headers
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-[1200px] mx-auto">
        {/* Header Tabs */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex bg-white rounded-2xl p-1 w-fit">
            <button
              onClick={() => setFilterMeeting("upcoming")}
              className={`px-4 py-2 rounded-xl text-sm font-normal transition-colors duration-200 whitespace-nowrap ${
                filterMeeting === "upcoming"
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Upcoming Visitors
            </button>
            <button
              onClick={() => setFilterMeeting("pending")}
              className={`px-4 py-2 rounded-xl text-sm font-normal transition-colors duration-200 whitespace-nowrap ${
                filterMeeting === "pending"
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2">
                Pending Requests
                {pendingCount > 0 && filterMeeting !== "pending" && (
                  <span 
                    className="text-xs font-normal rounded-full h-[21px] min-w-[24px] px-2 flex items-center justify-center"
                    style={{ 
                      color: 'rgba(251, 44, 54, 1)', 
                      backgroundColor: 'rgba(251, 44, 54, 0.1)' 
                    }}
                  >
                    {pendingCount}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setFilterMeeting("history")}
              className={`px-4 py-2 rounded-xl text-sm font-normal transition-colors duration-200 whitespace-nowrap ${
                filterMeeting === "history"
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Visitor History
            </button>
          </div>

          {(filterMeeting === "pending" || filterMeeting === "upcoming" || filterMeeting === "history") && (
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-[448px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, company, or host..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 h-[38px] bg-white border border-gray-200 rounded-lg text-sm"
                />
              </div>

              {/* Filter Button - only for pending */}
              {filterMeeting === "pending" && (
                <button className="flex items-center gap-2 px-4 h-[36px] border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50">
                  <Funnel className="w-4 h-4" />
                  Filter
                </button>
              )}
            </div>
          )}

          {/* Register Visitor Button */}
          <Dialog
            open={isRegisterDialogOpen}
            onOpenChange={setIsRegisterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg h-[36px] px-4 text-sm font-medium">
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
                  onSubmit={(data) => {
                    console.log("New visitor registered:", data);
                    setIsRegisterDialogOpen(false);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 w-full">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-gray-900 text-xl font-semibold">
                {getTableTitle()}
              </h1>
              {filterMeeting === "pending" && pendingCount > 0 && (
                <span 
                  className="text-xs font-normal rounded-full h-[21px] min-w-[24px] px-2 flex items-center justify-center"
                  style={{ 
                    color: 'rgba(251, 44, 54, 1)', 
                    backgroundColor: 'rgba(251, 44, 54, 0.1)' 
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm">{getTableDescription()}</p>
          </div>

          {filterMeeting === "pending" ? (
            isLoadingPending ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">Loading pending visits...</p>
              </div>
            ) : (() => {
              //filter pending visits by search query
              const filteredPendingVisits = pendingVisits.filter((visit) => {
                if (!searchQuery.trim()) return true;
                const searchLower = searchQuery.toLowerCase();
                return (
                  visit.visitor_name?.toLowerCase().includes(searchLower) ||
                  visit.visitor_company?.toLowerCase().includes(searchLower) ||
                  visit.host_name?.toLowerCase().includes(searchLower) ||
                  visit.purpose?.toLowerCase().includes(searchLower) ||
                  visit.purpose_type?.toLowerCase().includes(searchLower)
                );
              });

              const convertedVisitors = convertPendingVisitsToVisitors(
                filteredPendingVisits,
                handleApprove,
                handleReject
              );

              const pendingTableHeaders: TableHeader[] = [
                { key: "name", label: "VISITOR NAME" },
                { key: "date", label: "DATE OF VISIT" },
                { key: "time", label: "TIME" },
                { key: "host", label: "HOST" },
                { key: "purpose", label: "PURPOSE" },
                { key: "badge", label: "BADGE" },
                { key: "actions", label: "ACTIONS" },
              ];

              const customActionRenderer = (visitor: Visitor & { visitId?: number; onApprove?: () => void; onReject?: () => void }) => {
                const visitId = visitor.visitId || visitor.id;
                const isApproving = approving.has(visitId);
                const isRejecting = rejecting.has(visitId);
                
                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={visitor.onApprove}
                      disabled={isApproving || isRejecting}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#024d2c] hover:bg-[#024d2c]/90 text-white text-[15px] font-normal rounded-[9px] h-[38px] w-[96px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApproving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CircleCheckBig style={{ 
                          width: '16.22px', 
                          height: '16.22px', 
                          minWidth: '16.22px', 
                          minHeight: '16.22px',
                          flexShrink: 0,
                          objectFit: 'contain'
                        }} />
                      )}
                      {isApproving ? "Approving..." : "Accept"}
                    </button>
                    <button
                      onClick={visitor.onReject}
                      disabled={isApproving || isRejecting}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#364153] text-[15px] font-normal rounded-[9px] h-[38px] w-[87px] border border-[#d1d5dc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRejecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CircleX style={{ 
                          width: '16.22px', 
                          height: '16.22px', 
                          minWidth: '16.22px', 
                          minHeight: '16.22px',
                          flexShrink: 0,
                          objectFit: 'contain'
                        }} />
                      )}
                      {isRejecting ? "Denying..." : "Deny"}
                    </button>
                  </div>
                );
              };

              return filteredPendingVisits.length === 0 ? (
                <EmptyState
                  title="No Pending Visitors"
                  description="You don't have any pending visitor requests at the moment."
                  action={{
                    label: "+ Register Visitor",
                    onClick: () => setIsRegisterDialogOpen(true),
                  }}
                />
              ) : (
                <VisitorsTable
                  visitors={convertedVisitors}
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredPendingVisits.length / itemsPerPage)}
                  totalResults={filteredPendingVisits.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  tableHeaders={pendingTableHeaders}
                  customActionRenderer={customActionRenderer}
                />
              );
            })()
          ) : isLoadingVisitors ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">Loading visitors...</p>
            </div>
          ) : filteredVisitors.length === 0 ? (
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
                      const extendedVisitor = visitor as Visitor & {
                        visitor_id: number;
                        visit_id: number;
                        log_id?: number;
                        has_checked_in: boolean;
                      };
                      const visitId = extendedVisitor.visit_id;
                      const isCheckingIn = checkingIn.has(visitId);
                      const isCheckingOut = checkingOut.has(visitId);
                      const hasCheckedIn = extendedVisitor.has_checked_in || !!extendedVisitor.checkIn;

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

//convert PendingVisit to Visitor format for table compatibility
function convertPendingVisitsToVisitors(
  pendingVisits: PendingVisit[],
  onApprove: (visitId: number) => void,
  onReject: (visitId: number) => void
): (Visitor & { visitId: number; onApprove: () => void; onReject: () => void })[] {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return pendingVisits.map((visit) => ({
    id: visit.id,
    visitId: visit.id,
    name: visit.visitor_name,
    email: visit.visitor_email,
    company: visit.visitor_company,
    date: formatDate(visit.scheduled_date),
    time: formatTime(visit.scheduled_date),
    host: visit.host_name,
    badge: visit.purpose_type,
    status: "Pending" as const,
    checkIn: null,
    checkOut: null,
    duration: null,
    purpose: visit.purpose,
    onApprove: () => onApprove(visit.id),
    onReject: () => onReject(visit.id),
  }));
}
