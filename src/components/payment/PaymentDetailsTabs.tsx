import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { membershipPrice, servicesPrices } from "@/lib/club-prices";
import type { PaymentType } from "@/types/payment";

interface PaymentDetailsTabsProps {
  paymentType: PaymentType;
  isMember: boolean;
  selectedService: string;
  customAmount: string;
  customDescription: string;
  setPaymentType: (type: PaymentType) => void;
  handleMemberToggle: (checked: boolean) => void;
  setSelectedService: (service: string) => void;
  setCustomAmount: (amount: string) => void;
  setCustomDescription: (desc: string) => void;
  t: Record<string, any>;
}

export default function PaymentDetailsTabs ({
  paymentType,
  isMember,
  selectedService,
  customAmount,
  customDescription,
  setPaymentType,
  handleMemberToggle,
  setSelectedService,
  setCustomAmount,
  setCustomDescription,
  t,
}: PaymentDetailsTabsProps) {
  return (
    <Tabs
      value={paymentType}
      onValueChange={value => setPaymentType(value as PaymentType)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="predefined">{t.predefinedServices}</TabsTrigger>
        <TabsTrigger value="membership">{t.membership}</TabsTrigger>
        <TabsTrigger value="custom">{t.customAmount}</TabsTrigger>
      </TabsList>

      {/* Predefined Services Tab */}
      <TabsContent value="predefined" className="space-y-4 mt-6">
        {/* Member Toggle */}
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
          <Switch id="member-toggle" checked={isMember} onCheckedChange={handleMemberToggle} />
          <Label htmlFor="member-toggle" className="text-sm font-medium">
            {t.memberPrices}
          </Label>
        </div>

        {/* Service Selection */}
        <div className="space-y-4">
          <Label>{t.selectService} *</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder={t.selectService} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly1">
                {t.services.monthly1} - {servicesPrices.monthly1[isMember ? "member" : "nonMember"]}€
              </SelectItem>
              <SelectItem value="monthly2">
                {t.services.monthly2} - {servicesPrices.monthly2[isMember ? "member" : "nonMember"]}€
              </SelectItem>
              <SelectItem value="monthly3">
                {t.services.monthly3} - {servicesPrices.monthly3[isMember ? "member" : "nonMember"]}€
              </SelectItem>
              <SelectItem value="dropIn">
                {t.services.dropIn} - {servicesPrices.dropIn[isMember ? "member" : "nonMember"]}€
              </SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="custom-description">{t.description}</Label>
          <Textarea
            id="custom-description"
            value={customDescription}
            onChange={e => setCustomDescription(e.target.value)}
            placeholder={t.enterDescription}
          />
        </div>
      </TabsContent>

      {/* Membership Tab */}
      <TabsContent value="membership" className="space-y-4 mt-6">
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-orange-800 mb-2">
            {t.membership}
          </h4>
          <p className="text-sm text-orange-700 mb-3">
            {t.membershipDescription}
          </p>
          <div className="text-2xl font-bold text-orange-800">{membershipPrice}€</div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-description">{t.description}</Label>
          <Textarea
            id="custom-description"
            value={customDescription}
            onChange={e => setCustomDescription(e.target.value)}
            placeholder={t.enterDescription}
          />
        </div>
      </TabsContent>

      {/* Custom Amount Tab */}
      <TabsContent value="custom" className="space-y-4 mt-6">
        <div className="space-y-2">
          <Label htmlFor="custom-amount">{t.amount} (€) *</Label>
          <Input
            id="custom-amount"
            type="number"
            step="0.01"
            min="0"
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            placeholder={t.enterAmount}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-description">{t.description} *</Label>
          <Textarea
            id="custom-description"
            value={customDescription}
            onChange={e => setCustomDescription(e.target.value)}
            placeholder={t.enterDescription}
            required
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
