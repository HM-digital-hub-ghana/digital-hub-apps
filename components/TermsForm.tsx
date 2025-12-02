import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
 
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accepted: boolean;
  onAcceptChange: (val: boolean) => void;
}

export default function TermsFormDialog({
  open,
  onOpenChange,
 
  onAcceptChange,
}: TermsDialogProps) {
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-3xl">
            Terms and Conditions Policy
          </DialogTitle>
          <Separator />
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto text-sm">
          <p>
            Users must provide accurate booking and visitor details. Access to
            the system is restricted to authorized employees and administrators.
            Misuse of the system or unauthorized access is strictly prohibited.
          </p>
          <p>
            Data Collected: Names, contact details, booking information, and
            visitor logs. Usage: Data is used solely for scheduling,
            notifications, and analytics. Storage & Security: Data is stored
            securely using encryption and protected by authentication protocols.
            Sharing: No data is shared with third parties without explicit
            consent. Retention: Data is retained for compliance and reporting
            purposes.
          </p>
          <p>
            The system aligns with relevant data protection regulations such as
            GDPR. Role-based access control ensures users only access necessary
            data. Audit logs track all bookings, visitor registrations, and
            administrative actions.
          </p>
        </div>

        <div className=" items-center mt-4 space-x-2">
          <p>I have read and accept the terms</p>
          <Button
            className="pointer-cursor "
            onClick={() => {
              onAcceptChange(true); // set form checkbox to true
              onOpenChange(false); // close dialog
            }}
          >
            Accept
          </Button>{" "}
        </div>
      </DialogContent>
    </Dialog>
  );
}
