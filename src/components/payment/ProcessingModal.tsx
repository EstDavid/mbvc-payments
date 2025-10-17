import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ErrorModalProps {
  isProcessing: boolean;
  followInstructions: boolean;
  t: Record<string, string>;
}

export default function ProcessingModal ({ isProcessing, followInstructions, t }: ErrorModalProps) {
  return (
    <Dialog open={isProcessing} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-3">
            {t.processing}
          </DialogTitle>
          <DialogDescription className={"text-center" + followInstructions ? 'flex flex-col' : ''}>
            {followInstructions
              ?
              <React.Fragment>
                <span>{t.followInstructions}</span>
                <span>{t.ifNoNotification}</span>
              </React.Fragment>

              : t.processingDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
