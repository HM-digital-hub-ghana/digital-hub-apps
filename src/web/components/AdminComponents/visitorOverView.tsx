import { useEffect, useState } from "react";
import { Card } from "@web/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@web/components/ui/table";
import { Badge } from "@web/components/ui/badge";
import { apiGetAllVisitors } from "../../conference-and-visitors-booking/service/visitors";
import { getVisitorOverview } from "@/lib/dashboard-utils";
import { Loader2 } from "lucide-react";

export function VisitorOverview() {
  const [visitors, setVisitors] = useState<
    Array<{
      visitor: string;
      host: string;
      checkIn: string;
      status: string;
      statusColor: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setIsLoading(true);
        const allVisitors = await apiGetAllVisitors();
        const overview = getVisitorOverview(allVisitors);
        setVisitors(overview);
      } catch (error) {
        console.error("Failed to fetch visitor overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-gray-900">Visitor Overview</h3>
          <p className="text-gray-600 text-sm">Current and recent visitors</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (visitors.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-gray-900">Visitor Overview</h3>
          <p className="text-gray-600 text-sm">Current and recent visitors</p>
        </div>
        <p className="text-gray-500 text-sm text-center py-8">No visitors today</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-gray-900">Visitor Overview</h3>
        <p className="text-gray-600 text-sm">Current and recent visitors</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>VISITOR</TableHead>
            <TableHead>HOST</TableHead>
            <TableHead>CHECK-IN</TableHead>
            <TableHead>STATUS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map((visitor, index) => (
            <TableRow key={index}>
              <TableCell>{visitor.visitor}</TableCell>
              <TableCell>{visitor.host}</TableCell>
              <TableCell>{visitor.checkIn}</TableCell>
              <TableCell>
                <Badge
                  className={`${visitor.statusColor} hover:${visitor.statusColor} border-0`}
                >
                  {visitor.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
