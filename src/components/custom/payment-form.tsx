"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

type Language = "es" | "en";
type PaymentType = "predefined" | "custom" | "membership";

const translations = {
  es: {
    title: "Montgó Beach Volley Club - Pagos Bizum",
    description: "Complete sus datos para procesar el pago",
    personalInfo: "Información Personal",
    name: "Nombre",
    surname: "Apellidos",
    phone: "Teléfono",
    email: "Correo Electrónico",
    paymentDetails: "Detalles del Pago",
    paymentType: "Tipo de Pago",
    predefinedServices: "Servicios Predefinidos",
    customAmount: "Cantidad Personalizada",
    membership: "Membresía Anual",
    memberPrices: "Precios de Miembro",
    memberPricesWarning: "Selecciona precios de miembro solo si tienes una membresía anual activa",
    understand: "Entiendo",
    services: {
      monthly1: "Suscripción mensual, 1 entrenamiento por semana",
      monthly2: "Suscripción mensual, 2 entrenamientos por semana",
      monthly3: "Suscripción mensual, 3 entrenamientos por semana",
      dropIn: "Clases sueltas",
    },
    amount: "Cantidad",
    paymentDescription: "Descripción del Pago",
    saveData: "Guardar mis datos para futuros pagos",
    processPayment: "Procesar Pago",
    required: "Campo requerido",
    selectService: "Selecciona un servicio",
    enterAmount: "Ingresa la cantidad",
    enterDescription: "Ingresa la descripción",
    phoneValidation: "Número de móvil español no válido (debe empezar por 6, 7 o 9 y tener 9 dígitos)",
    phoneFormat: "Formato: 6XX XXX XXX",
  },
  en: {
    title: "Montgó Beach Volley Club - Bizum payments",
    description: "Complete your details to process the payment",
    personalInfo: "Personal Information",
    name: "Name",
    surname: "Surname",
    phone: "Phone Number",
    email: "Email Address",
    paymentDetails: "Payment Details",
    paymentType: "Payment Type",
    predefinedServices: "Predefined Services",
    customAmount: "Custom Amount",
    membership: "Annual Membership",
    memberPrices: "Member Prices",
    memberPricesWarning: "Select member prices only if you have an active yearly membership",
    understand: "I Understand",
    services: {
      monthly1: "Monthly subscription, 1 training per week",
      monthly2: "Monthly subscription, 2 trainings per week",
      monthly3: "Monthly subscription, 3 trainings per week",
      dropIn: "Drop-in classes",
    },
    amount: "Amount",
    paymentDescription: "Payment Description",
    saveData: "Save my data for future payments",
    processPayment: "Process Payment",
    required: "Required field",
    selectService: "Select a service",
    enterAmount: "Enter amount",
    enterDescription: "Enter description",
    phoneValidation: "Invalid Spanish mobile number (must start with 6, 7, or 9 and have 9 digits)",
    phoneFormat: "Format: 6XX XXX XXX",
  },
};

const servicesPrices = {
  monthly1: { nonMember: 42, member: 33 },
  monthly2: { nonMember: 68, member: 54 },
  monthly3: { nonMember: 90, member: 72 },
  dropIn: { nonMember: 12, member: 10 }
};

const membershipPrice = 36;

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

  const getAmount = () => {
    if (paymentType === "membership") return membershipPrice;
    if (paymentType === "custom") return Number.parseFloat(customAmount) || 0;
    if (selectedService && servicesPrices[selectedService as keyof typeof servicesPrices]) {
      return servicesPrices[selectedService as keyof typeof servicesPrices][isMember ? "member" : "nonMember"];
    }
    return 0;
  };

  const getDescription = () => {
    if (paymentType === "membership") return language === "es" ? "Membresía Anual" : "Annual Membership";
    if (paymentType === "custom") return customDescription;
    if (selectedService) {
      return t.services[selectedService as keyof typeof t.services];
    }
    return "";
  };

  const validateSpanishPhone = (phone: string): boolean => {
    // Spanish mobile numbers: 9 digits starting with 6, 7, or 9
    const spanishMobileRegex = /^[679]\d{8}$/;
    return spanishMobileRegex.test(phone);
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
          setPhoneError(
            language === "es"
              ? "Número de móvil español no válido (debe empezar por 6, 7 o 9 y tener 9 dígitos)"
              : "Invalid Spanish mobile number (must start with 6, 7, or 9 and have 9 digits)",
          );
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
        language === "es"
          ? "Por favor, introduce un número de móvil español válido"
          : "Please enter a valid Spanish mobile number",
      );
      return;
    }

    // Handle form submission here
    console.log("Form submitted:", {
      ...formData,
      phone: `+34${formData.phone}`, // Include country code in submission
      paymentType,
      amount: getAmount(),
      description: getDescription(),
      isMember,
      saveData,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
            <SelectTrigger className="w-32">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t.personalInfo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.name} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname">{t.surname} *</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.phone} *</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm font-medium text-gray-700">
                        +34
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="612345678"
                        className="rounded-l-none"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">{t.phoneFormat}</p>
                    {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.email} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t.paymentDetails}</h3>

                {/* Payment Type Tabs */}
                <Tabs
                  value={paymentType}
                  onValueChange={(value) => setPaymentType(value as PaymentType)}
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
                    <div className="space-y-2">
                      <Label>{language === "es" ? "Selecciona un servicio" : "Select a service"} *</Label>
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
                    </div>
                  </TabsContent>

                  {/* Membership Tab */}
                  <TabsContent value="membership" className="space-y-4 mt-6">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">
                        {language === "es" ? "Membresía Anual" : "Annual Membership"}
                      </h4>
                      <p className="text-sm text-orange-700 mb-3">
                        {language === "es"
                          ? "La membresía anual te da acceso a precios reducidos en todos nuestros servicios durante un año completo."
                          : "Annual membership gives you access to reduced prices on all our services for a full year."}
                      </p>
                      <div className="text-2xl font-bold text-orange-800">36€</div>
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
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder={t.enterAmount}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-description">{t.description} *</Label>
                      <Textarea
                        id="custom-description"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder={t.enterDescription}
                        required
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Amount Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{t.amount}:</span>
                    <span className="text-2xl font-bold text-blue-600">{getAmount()}€</span>
                  </div>
                  {getDescription() && <div className="mt-2 text-sm text-gray-600">{getDescription()}</div>}
                </div>

                {/* Save Data Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="save-data" checked={saveData} onCheckedChange={checked => setSaveData(checked === true)} />
                  <Label htmlFor="save-data" className="text-sm">
                    {t.saveData}
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {t.processPayment} - {getAmount()}€
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Member Prices Modal */}
        <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                {t.memberPrices}
              </DialogTitle>
              <DialogDescription className="text-base">{t.memberPricesWarning}</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowMemberModal(false)}>
                {language === "es" ? "Cancelar" : "Cancel"}
              </Button>
              <Button onClick={confirmMemberPrices}>{t.understand}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
