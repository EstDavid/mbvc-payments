"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countryCodes } from "@/lib/country-codes";

type CountryOption = {
  code: string;
  name: string;
  label: React.JSX.Element;
  labelMini: React.JSX.Element;
};

interface CountryCodeSelectorProps {
  messages: {
    setCountryCode: string;
    selectCountry: string;
    noCountryFound: string;
  };
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
}

const countryOptions: CountryOption[] = countryCodes.map(c => {
  return {
    code: c.code,
    name: c.name,
    label: (
      <span className="flex items-center gap-2">
        <span>{c.flag}</span>
        <span>{c.dialCode}</span>
        <span>{c.name}</span>
      </span>
    ),
    labelMini: (
      <span className="flex items-center gap-2">
        <span>{c.flag}</span>
        <span>{c.dialCode}</span>
      </span>
    )
  };
});

export function CountryCodeSelector (
  {
    messages,
    countryCode,
    onCountryCodeChange
  }: CountryCodeSelectorProps
): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  const selectedCountryOption = countryOptions.find(option => option.code === countryCode) || countryOptions[0];

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[90px] justify-start"
          >
            {selectedCountryOption ? <>{selectedCountryOption.labelMini}</> : <>{messages.selectCountry}</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder={messages.setCountryCode} />
            <CommandList>
              <CommandEmpty>{messages.noCountryFound}</CommandEmpty>
              <CommandGroup>
                {countryOptions.map((country, index) => (
                  <CommandItem
                    key={index}
                    value={country.name}
                    onSelect={(value) => {
                      onCountryCodeChange(
                        countryOptions.find((c) => c.name === value)?.code ||
                        countryOptions[0].code
                      );
                      setOpen(false);
                    }}
                  >
                    {country.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
