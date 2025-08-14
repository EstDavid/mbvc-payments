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
  isCustomAmount: boolean;
  setPaymentType: (type: PaymentType) => void;
  handleMemberToggle: (checked: boolean) => void;
  setSelectedService: (service: string) => void;
  setCustomAmount: (amount: string) => void;
  setCustomDescription: (desc: string) => void;
  setIsCustomAmount: (isCustom: boolean) => void;
  t: Record<string, any>;
}

export default function PaymentDetailsTabs ({
  paymentType,
  isMember,
  selectedService,
  customAmount,
  customDescription,
  isCustomAmount,
  setPaymentType,
  handleMemberToggle,
  setSelectedService,
  setCustomAmount,
  setCustomDescription,
  setIsCustomAmount,
  t,
}: PaymentDetailsTabsProps) {
  return (
    <div className="w-full space-y-4">
      {/* Custom Amount Toggle */}
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <Switch
          id="custom-amount-toggle"
          checked={isCustomAmount}
          onCheckedChange={(checked) => {
            setIsCustomAmount(checked);
            if (checked) {
              setPaymentType("custom");
            } else {
              setPaymentType("drop-in-class");
            }
          }}
        />
        <Label htmlFor="custom-amount-toggle" className="text-sm font-medium">
          {t.customAmount}
        </Label>
      </div>

      {isCustomAmount ? (
        /* Custom Amount Form */
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="custom-amount">{t.amount} (€) *</Label>
            <Input
              id="custom-amount"
              type="number"
              step="0.01"
              min="1"
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
        </div>
      ) : (
        /* Regular Tabs */
        <Tabs
          value={paymentType}
          onValueChange={value => setPaymentType(value as PaymentType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drop-in-class">{t.dropInClasses}</TabsTrigger>
            <TabsTrigger value="monthly-plans">{t.monthlyPlans}</TabsTrigger>
            <TabsTrigger value="membership">{t.membership}</TabsTrigger>
          </TabsList>

          {/* Drop-in classes Tab */}
          <TabsContent value="drop-in-class" className="space-y-4 mt-6">
            {/* Member Toggle */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Switch id="member-toggle" checked={isMember} onCheckedChange={handleMemberToggle} />
              <Label htmlFor="member-toggle" className="text-sm font-medium">
                {t.memberPrices}
              </Label>
            </div>
            <div className="p-4 bg-[#e6f0f5] rounded-lg border border-[#b3d1e0]">
              <h4 className="font-semibold text-[#156082] mb-2 text-center text-2xl">
                {t.services.dropIn}
              </h4>

              <div className="text-2xl font-bold text-[#156082] text-center">{servicesPrices.dropIn[isMember ? "member" : "nonMember"]}€</div>
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

          {/* Monthly Plans Tab */}
          <TabsContent value="monthly-plans" className="space-y-4 mt-6">
            {/* Member Toggle */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Switch id="member-toggle" checked={isMember} onCheckedChange={handleMemberToggle} />
              <Label htmlFor="member-toggle" className="text-sm font-medium">
                {t.memberPrices}
              </Label>
            </div>

            {/* Monthly Plans Selection */}
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
            <div className="p-4 bg-[#e6f0f5] rounded-lg border border-[#b3d1e0]">
              <h4 className="font-semibold text-[#156082] mb-2 text-center text-2xl">
                {t.membership}
              </h4>
              <p className="text-sm text-[#156082] mb-3 text-center">
                {t.membershipDescription}
              </p>
              <div className="text-2xl font-bold text-[#156082] text-center">{membershipPrice}€</div>
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
        </Tabs>
      )}
    </div>
  );
}
