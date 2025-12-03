import { useEffect, useState } from "react";
import { apiGetAllVisitors } from "../../conference-and-visitors-booking/service/visitors";
import { getEmployeeVisitorCounts } from "@/lib/dashboard-utils";
import { Loader2 } from "lucide-react";

export function EmployeesChart() {
  const [employees, setEmployees] = useState<
    Array<{ name: string; value: number; percentage: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const visitors = await apiGetAllVisitors();
        const employeeCounts = getEmployeeVisitorCounts(visitors);
        setEmployees(employeeCounts);
      } catch (error) {
        console.error("Failed to fetch employee visitor counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const maxValue = employees[0]?.value || 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-gray-900 mb-6">Employees With Most Visitors</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-gray-900 mb-6">Employees With Most Visitors</h3>
        <p className="text-gray-500 text-sm text-center py-8">No visitor data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-gray-900 mb-6">Employees With Most Visitors</h3>
      <div className="space-y-4">
        {employees.map((employee, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-gray-600 text-sm w-20 text-left truncate">
              {employee.name}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${employee.percentage}%` }}
              />
            </div>
            <span className="text-gray-600 text-sm w-8 text-left">{employee.value}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-gray-500 text-xs px-20">
        <span>0</span>
        <span>{Math.round(maxValue * 0.25)}</span>
        <span>{Math.round(maxValue * 0.5)}</span>
        <span>{Math.round(maxValue * 0.75)}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}
