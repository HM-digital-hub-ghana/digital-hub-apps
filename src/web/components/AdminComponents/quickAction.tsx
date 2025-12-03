import { Card } from "@web/components/ui/card";
import { Plus, UserPlus, UserCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../conference-and-visitors-booking/constants/routes";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@web/components/ui/dialog";
import { useState } from "react";
import { BookingForm } from "@web/components/BookingForm";
import VisitorRequestForm from "@web/components/VisitorRequestForm";

const actions = [
  {
    id: "booking",
    icon: Plus,
    title: "New Booking",
    description: "Book a meeting room",
    bgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "visitor-request",
    icon: UserPlus,
    title: "Visitor Request",
    description: "Submit new request",
    bgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "check-visitor",
    icon: UserCheck,
    title: "Check Visitor In",
    description: "Register guests on arrival",
    bgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isVisitorRequestDialogOpen, setIsVisitorRequestDialogOpen] = useState(false);

  const handleActionClick = (actionId: string) => {
    if (actionId === "check-visitor") {
      navigate(routes.VisitorsManagement);
    } else if (actionId === "booking") {
      setIsBookingDialogOpen(true);
    } else if (actionId === "visitor-request") {
      setIsVisitorRequestDialogOpen(true);
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-gray-900">Quick Actions</h3>
          <p className="text-gray-600 text-sm">Fast access to common tasks</p>
        </div>
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className={`${action.bgColor} p-2.5 rounded-lg`}>
                <action.icon className={`h-5 w-5 ${action.iconColor}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900">{action.title}</p>
                <p className="text-gray-600 text-xs">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          ))}
        </div>
      </Card>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-[500px] p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Make a Booking</DialogTitle>
          <DialogDescription className="sr-only">
            Fill out the form to book a meeting room
          </DialogDescription>
          <BookingForm
            onCancel={() => setIsBookingDialogOpen(false)}
            onSubmit={() => {
              setIsBookingDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isVisitorRequestDialogOpen} onOpenChange={setIsVisitorRequestDialogOpen}>
        <DialogContent className="max-w-[700px] p-0 max-h-[90vh] flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">Visitor Request</DialogTitle>
          <DialogDescription className="sr-only">
            Submit a new visitor request
          </DialogDescription>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
            <VisitorRequestForm
              onSubmit={() => {
                setIsVisitorRequestDialogOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
