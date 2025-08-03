"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Language, PaymentType } from "@/types/payment";
import translations from "@/lib/translations";
import { getAmount, getDescription, validateSpanishPhone } from "@/lib/payment-utils";
import PersonalInfoForm from "@/components/payment/PersonalInfoForm";
import PaymentDetailsTabs from "@/components/payment/PaymentDetailsTabs";
import MemberModal from "@/components/payment/MemberModal";
import AmountSummary from "@/components/payment/AmountSummary";
import LanguageSelector from "@/components/payment/LanguageSelector";
import Image from "next/image";



export default function PaymentForm () {
  const [language, setLanguage] = useState<Language>("es");
  const [paymentType, setPaymentType] = useState<PaymentType>("predefined");
  const [isMember, setIsMember] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [saveData, setSaveData] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const t = translations[language];

  const handleMemberToggle = (checked: boolean) => {
    if (checked) {
      setShowMemberModal(true);
    } else {
      setIsMember(false);
    }
  };

  const confirmMemberPrices = () => {
    setIsMember(true);
    setShowMemberModal(false);
  };



  const handlePhoneChange = (value: string) => {
    // Remove any non-digit characters
    const cleanPhone = value.replace(/\D/g, "");

    // Limit to 9 digits
    if (cleanPhone.length <= 9) {
      setFormData({ ...formData, phone: cleanPhone });

      // Validate if phone has content
      if (cleanPhone.length > 0) {
        if (validateSpanishPhone(cleanPhone)) {
          setPhoneError("");
        } else {
          setPhoneError(t.phoneValidation);
        }
      } else {
        setPhoneError("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone before submission
    if (!validateSpanishPhone(formData.phone)) {
      setPhoneError(
        formData.phone.trim() === ""
          ? t.phoneRequired
          : t.phoneValidation
      );
      return;
    }

    // Handle form submission here
    console.log("Form submitted:", {
      ...formData,
      phone: `+34${formData.phone}`, // Include country code in submission
      paymentType,
      amount: getAmount(paymentType, customAmount, selectedService, isMember),
      description: getDescription(paymentType, customDescription, selectedService, language),
      isMember,
      saveData,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <LanguageSelector language={language} setLanguage={setLanguage} />
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Image src="/logo.png" alt="Montgó Beach Volley Club Logo" width={200} height={100} className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-900">{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PersonalInfoForm
                formData={formData}
                phoneError={phoneError}
                onChange={(field, value) => setFormData({ ...formData, [field]: value })}
                onPhoneChange={handlePhoneChange}
                translations={{
                  personalInfo: t.personalInfo,
                  name: t.name,
                  surname: t.surname,
                  phone: t.phone,
                  email: t.email,
                  phoneFormat: t.phoneFormat,
                }}
              />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t.paymentDetails}</h3>
                <PaymentDetailsTabs
                  paymentType={paymentType}
                  setPaymentType={setPaymentType}
                  isMember={isMember}
                  handleMemberToggle={handleMemberToggle}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  customAmount={customAmount}
                  setCustomAmount={setCustomAmount}
                  customDescription={customDescription}
                  setCustomDescription={setCustomDescription}
                  t={t}
                />
                <AmountSummary
                  amount={getAmount(paymentType, customAmount, selectedService, isMember)}
                  description={getDescription(paymentType, customDescription, selectedService, language)}
                  t={t}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox id="save-data" checked={saveData} onCheckedChange={checked => setSaveData(checked === true)} />
                  <Label htmlFor="save-data" className="text-sm">
                    {t.saveData}
                  </Label>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {t.processPayment} - {getAmount(paymentType, customAmount, selectedService, isMember)}€
              </Button>
            </form>
          </CardContent>
        </Card>
        <MemberModal
          open={showMemberModal}
          onOpenChange={setShowMemberModal}
          onConfirm={confirmMemberPrices}
          onCancel={() => setShowMemberModal(false)}
          t={t}
        />
      </div>
    </div>
  );
}
