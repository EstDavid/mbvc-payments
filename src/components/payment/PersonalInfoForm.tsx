import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCodes, CountryCode } from "@/lib/country-codes";
import React from "react";

export interface PersonalInfoFormProps {
  formData: {
    name: string;
    surname: string;
    phone: string;
    email: string;
    countryCode: string;
  };
  phoneError: string;
  fieldErrors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onPhoneChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  translations: {
    personalInfo: string;
    name: string;
    surname: string;
    phone: string;
    email: string;
    phoneFormat: string;
    countryCode: string;
  };
  includeEmail: boolean;
}

export default function PersonalInfoForm ({
  formData,
  phoneError,
  fieldErrors,
  onChange,
  onPhoneChange,
  onCountryCodeChange,
  translations,
  includeEmail,
}: PersonalInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{translations.personalInfo}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">{translations.phone} *</Label>
          <div className="flex gap-2">
            <Select value={formData.countryCode} onValueChange={onCountryCodeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {countryCodes.map((country: CountryCode) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.dialCode}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={e => onPhoneChange(e.target.value)}
              placeholder={formData.countryCode === '+34' ? "612345678" : "123456789"}
              className={`flex-1 ${phoneError || fieldErrors.phoneNumber ? "border-red-500" : ""}`}
              required
            />
          </div>
          <p className="text-xs text-gray-500">{translations.phoneFormat}</p>
          {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
          {fieldErrors.phoneNumber && <p className="text-xs text-red-500">{fieldErrors.phoneNumber}</p>}
        </div>
        {includeEmail &&
          <div className="space-y-2">
            <Label htmlFor="email">{translations.email} *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => onChange("email", e.target.value)}
              className={fieldErrors.email ? "border-red-500" : ""}
              required
            />
            {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
          </div>
        }
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{translations.name} *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => onChange("name", e.target.value)}
            required
            className={fieldErrors.name ? "border-red-500" : ""}
          />
          {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">{translations.surname} *</Label>
          <Input
            id="surname"
            value={formData.surname}
            onChange={e => onChange("surname", e.target.value)}
            required
            className={fieldErrors.surname ? "border-red-500" : ""}
          />
          {fieldErrors.surname && <p className="text-xs text-red-500">{fieldErrors.surname}</p>}
        </div>
      </div>
    </div>
  );
}
