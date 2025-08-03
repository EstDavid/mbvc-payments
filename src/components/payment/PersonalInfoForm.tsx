import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

export interface PersonalInfoFormProps {
  formData: {
    name: string;
    surname: string;
    phone: string;
    email: string;
  };
  phoneError: string;
  onChange: (field: string, value: string) => void;
  onPhoneChange: (value: string) => void;
  translations: {
    personalInfo: string;
    name: string;
    surname: string;
    phone: string;
    email: string;
    phoneFormat: string;
  };
}

export default function PersonalInfoForm({ formData, phoneError, onChange, onPhoneChange, translations }: PersonalInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{translations.personalInfo}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{translations.name} *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => onChange("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">{translations.surname} *</Label>
          <Input
            id="surname"
            value={formData.surname}
            onChange={e => onChange("surname", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">{translations.phone} *</Label>
          <div className="flex">
            <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm font-medium text-gray-700">
              +34
            </div>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={e => onPhoneChange(e.target.value)}
              placeholder="612345678"
              className="rounded-l-none"
              required
            />
          </div>
          <p className="text-xs text-gray-500">{translations.phoneFormat}</p>
          {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{translations.email} *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => onChange("email", e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}
