import React from "react";
import { ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react";

type VisitorStatus = "Confirmed" | "Cancelled" | "No Show" | "Pending";

export interface Visitor {
  id: number;
  name: string;
  email: string;
  company: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  duration?: string | null;
  status: VisitorStatus;
  badge?: string;
  time?: string;
  host?: string;
  purpose?: string;
}

export interface TableHeader {
  key: keyof Visitor | "actions";
  label: string;
}

interface VisitorsTableProps {
  visitors: Visitor[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  tableHeaders?: TableHeader[]; // 👈 now configurable
  customActionRenderer?: (visitor: Visitor) => React.ReactNode; // 👈 custom actions
}

function StatusBadge({ status }: { status: VisitorStatus }) {
  const styles = {
    Confirmed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-600",
    "No Show": "bg-gray-200 text-gray-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`px-3 py-1 rounded-md text-sm ${styles[status]}`}>
      {status}
    </span>
  );
}

export function VisitorsTable({
  visitors,
  currentPage,
  totalPages,
  totalResults,
  itemsPerPage,
  onPageChange,
  tableHeaders,
  customActionRenderer,
}: VisitorsTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVisitors = visitors.slice(startIndex, endIndex);

  // Default table headers (used if no prop is passed)
  const defaultHeaders: TableHeader[] = [
    { key: "name", label: "Visitor" },
    { key: "company", label: "Company" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "host", label: "Host" },
    { key: "badge", label: "Badge" },
    { key: "checkIn", label: "Check In" },
    { key: "checkOut", label: "Check Out" },
    { key: "duration", label: "Duration" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const headers = tableHeaders || defaultHeaders;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {headers.map((head) => (
                <th
                  key={head.key}
                  className="px-6 py-4 text-left text-gray-600 text-xs uppercase tracking-wider"
                >
                  {head.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-x divide-gray-200">
            {currentVisitors.map((visitor) => (
              <tr
                key={visitor.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {headers.map((head) => {
                  if (head.key === "actions") {
                    return (
                      <td key="actions" className="px-6 py-4">
                        {customActionRenderer ? (
                          customActionRenderer(visitor)
                        ) : (
                          <div className="flex">
                            <button className="text-gray-600 mr-4 hover:text-blue-500 flex items-center gap-1">
                              <Edit size={16} />
                            </button>
                            <button className="text-gray-600 hover:text-red-500 flex items-center gap-1">
                              <Trash size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  }

                  if (head.key === "status") {
                    return (
                      <td key="status" className="px-6 py-4">
                        <StatusBadge status={visitor.status} />
                      </td>
                    );
                  }

                  if (head.key === "name") {
                    return (
                      <td key="name" className="px-6 py-4">
                        <div>
                          <div className="text-gray-900">{visitor.name}</div>
                          <div className="text-gray-500 text-sm">
                            {visitor.email}
                          </div>
                        </div>
                      </td>
                    );
                  }

                  // Generic fallback for all other fields
                  const value = visitor[head.key as keyof Visitor] ?? "—";

                  return (
                    <td key={head.key} className="px-6 py-4 text-gray-900">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {currentVisitors.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-gray-600 text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, totalResults)} of{" "}
            {totalResults} visits
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded transition-colors ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
