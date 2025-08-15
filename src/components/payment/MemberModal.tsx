import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface MemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  t: Record<string, any>;
}

export default function MemberModal ({ open, onOpenChange, onConfirm, onCancel, t }: MemberModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            {t.memberPrices}
          </DialogTitle>
          <DialogDescription className="text-base">{t.memberPricesWarning}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            {t.cancel}
          </Button>
          <Button onClick={onConfirm}>{t.understand}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
