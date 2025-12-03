import DWMchanges from "./DWMchanges";
import SearchBar from "@web/components/SearchBar";
import AdminFilter, { type FilterState } from "./AdminFilter";

interface AdminNavigationProps {
  isListView: boolean;
  onViewChange: (isListView: boolean) => void;
  onCalendarViewChange?: (view: 'day' | 'week' | 'month') => void;
  currentCalendarView?: 'day' | 'week' | 'month';
  onFilterChange?: (filters: FilterState) => void;
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
}

export default function AdminNavigation({ isListView, onViewChange, onCalendarViewChange, currentCalendarView, onFilterChange, searchTerm = '', onSearchChange }: AdminNavigationProps) {
  const AdminCalendarAndList = [
    {
      id: 1,
      text: "Calendar View",
    },
    {
      id: 2,
      text: "List View",
    },
  ];
  function switchBetweenCalendarAndList(e: number) {
    if (e == 1) {
      onViewChange(false);
    } else {
      onViewChange(true);
    }
  }

  return (
    <div className="flex items-center gap-36  w-full">
      <div
        className={`flex w-[245px] h-[43px] p-1 border items-center justify-between rounded-[14px] border-gray-200 bg-white`}
      >
        {AdminCalendarAndList.map((each) => {
          return (
            <div
              key={each.id}
              className={`w-[122.5px] h-full flex items-center justify-center rounded-[10px] cursor-pointer
                ${
                  !isListView && each.id == 1
                    ? "bg-primary text-white"
                    : isListView && each.id == 2
                    ? "bg-primary text-white"
                    : " "
                }
                `}
              onClick={() => {
                switchBetweenCalendarAndList(each.id);
              }}
            >
              {each.text}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 items-center">
        <div>
          <DWMchanges onViewChange={onCalendarViewChange} currentView={currentCalendarView} />
        </div>
        {isListView && (
          <div>
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange || (() => {})}
              placeholder="Search by meeting title, room, or host"
              className="w-[320px]"
            />
          </div>
        )}
        <div>
          <AdminFilter isListView={isListView} onFilterChange={onFilterChange} />
        </div>
      </div>
    </div>
  );
}
