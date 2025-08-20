'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type TermsModalProps = {
  open: boolean;
  title: string;
  close: string;
  sections: {
    heading: string;
    content: string;
  }[];
  onOpenChange: (open: boolean) => void;
};

export default function TermsModal ({
  open,
  title,
  close,
  sections,
  onOpenChange
}: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-lg mb-2">{section.heading}</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>{close}</Button>
        </div>
      </DialogContent>
    </Dialog>

  );
}
