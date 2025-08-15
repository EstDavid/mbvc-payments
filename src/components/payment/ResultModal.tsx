import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Volleyball } from "lucide-react";
import { Button } from "../ui/button";

interface ResultModalProps {
  open: boolean;
  success: boolean | undefined;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  t: Record<string, string>;
}

export default function ResultModal ({
  open,
  success,
  onOpenChange,
  onConfirm,
  t,
}: ResultModalProps) {
  return (
    <Dialog open={open && success !== undefined} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ?
              <Volleyball className="w-5 h-5 text-green-600" size={10} />
              :
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            }
          </DialogTitle>
          <DialogDescription className="text-base">{success ? t.paymentSuccess : t.paymentRejectedByUser}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end">
          <Button onClick={onConfirm}>{t.confirm}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
