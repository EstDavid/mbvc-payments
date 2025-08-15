import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  t: Record<string, any>;
  message: string | undefined;
}

export default function ErrorModal ({ open, onOpenChange, onConfirm, t, message }: ErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t.errorOccurred}
          </DialogTitle>
          <DialogDescription className="text-base">{message || t.errorProcessingPayment}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end">
          <Button onClick={onConfirm}>{t.understand}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
