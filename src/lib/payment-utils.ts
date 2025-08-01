// src/lib/payment-utils.ts
import type { Language, PaymentType } from "@/types/payment";
import { servicesPrices, membershipPrice } from "@/lib/club-prices";
import translations from "@/lib/translations";

export function validateSpanishPhone(phone: string): boolean {
  // Spanish mobile numbers: 9 digits starting with 6, 7, or 9
  const spanishMobileRegex = /^[679]\d{8}$/;
  return spanishMobileRegex.test(phone);
}

export function getAmount(paymentType: PaymentType, customAmount: string, selectedService: string, isMember: boolean): number {
  if (paymentType === "membership") return membershipPrice;
  if (paymentType === "custom") return Number.parseFloat(customAmount) || 0;
  if (selectedService && servicesPrices[selectedService as keyof typeof servicesPrices]) {
    return servicesPrices[selectedService as keyof typeof servicesPrices][isMember ? "member" : "nonMember"];
  }
  return 0;
}

export function getDescription(paymentType: PaymentType, customDescription: string, selectedService: string, language: Language): string {
  if (paymentType === "membership") return language === "es" ? "Membresía Anual" : "Annual Membership";
  if (paymentType === "custom") return customDescription;
  if (selectedService) {
    return translations[language].services[selectedService as keyof typeof translations[Language]["services"]];
  }
  return "";
}
