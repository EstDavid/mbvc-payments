// src/lib/payment-utils.ts
import type { Language, PaymentType } from "@/types/payment";
import { servicesPrices, membershipPrice } from "@/lib/club-prices";
import translations from "@/lib/copy/translations";

export function validateSpanishPhone (phone: string): boolean {
  // Spanish mobile numbers: 9 digits starting with 6, 7, or 9
  const spanishMobileRegex = /^[679]\d{8}$/;
  return spanishMobileRegex.test(phone);
}

export function validateInternationalPhone (phone: string, countryCode: string): boolean {
  // If Spanish, use specific validation
  if (countryCode === '+34') {
    return validateSpanishPhone(phone);
  }
  // For other countries, check if it's digits only and reasonable length
  const internationalPhoneRegex = /^\d{4,15}$/;
  return internationalPhoneRegex.test(phone);
}

export function getAmount (paymentType: PaymentType, customAmount: string, selectedService: string, isMember: boolean): number {
  if (paymentType === "membership") return membershipPrice;
  if (paymentType === "custom") return Number.parseFloat(customAmount) || 0;
  if (paymentType === "drop-in-class") return servicesPrices.dropIn[isMember ? "member" : "nonMember"];
  if (selectedService && servicesPrices[selectedService as keyof typeof servicesPrices]) {
    return servicesPrices[selectedService as keyof typeof servicesPrices][isMember ? "member" : "nonMember"];
  }
  return 0;
}

export function getDescription (paymentType: PaymentType, customDescription: string, selectedService: string, language: Language): string {
  if (paymentType === "membership") {
    return `${translations[language].membership}. ${customDescription}`;
  }
  if (paymentType === "custom") {
    return customDescription;
  }
  if (paymentType === "drop-in-class") {
    return `${translations[language].services['dropIn' as keyof typeof translations[Language]["services"]]}. ${customDescription}`;
  }
  if (selectedService) {
    return `${translations[language].services[selectedService as keyof typeof translations[Language]["services"]]}. ${customDescription}`;
  }
  return "";
}
