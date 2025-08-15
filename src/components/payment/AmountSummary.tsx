import React from "react";

interface AmountSummaryProps {
  amount: number;
  description: string;
  t: Record<string, string>;
}

export default function AmountSummary ({ amount, description, t }: AmountSummaryProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">{t.amount}:</span>
        <span className="text-2xl font-bold text-[#156082]">{amount}€</span>
      </div>
      {description && <div className="mt-2 text-sm text-gray-600">{description}</div>}
    </div>
  );
}
